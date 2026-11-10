//! 포켓몬 키우기: 펫 창과 패널 창, 트레이, 저장소, 집중 타이머, 배회·드래그.
//! 화면(React)은 src/platform/tauri.js 가 window.electronAPI 모양으로 이 명령들을 부른다.

mod focus;
mod store;

use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering};
use std::sync::Mutex;
use std::thread;
use std::time::{Duration, Instant};

use serde_json::{json, Map, Value};
use store::Store;
use tauri_plugin_notification::NotificationExt;
use tauri::menu::{MenuBuilder, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::webview::PageLoadEvent;
use tauri_plugin_updater::{Update, UpdaterExt};
use tauri::{
    AppHandle, Emitter, LogicalSize, Manager, Monitor, PhysicalPosition, RunEvent, State,
    WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

/// 진화 단계별 펫 창 크기(논리 px). stage1 = 100, stage2 = 120, stage3 = 160
/// 종 목록은 src/components/Pet/PetCanvas.jsx 의 STAGE2·STAGE3 와 같게 둔다
const STAGE2: [&str; 6] = ["ivysaur", "charmeleon", "wartortle", "pidgeotto", "raichu", "haunter"];
const STAGE3: [&str; 6] = ["venusaur", "charizard", "blastoise", "pidgeot", "gengar", "snorlax"];
const VALID_WIN_SIZES: [u32; 3] = [100, 120, 160];
const PANEL_W: f64 = 380.0;
const PANEL_H: f64 = 580.0;
const WANDER_SPEED: f64 = 1.0;

/// 화면이 읽고 쓸 수 있는 저장 키 (그 밖의 키는 막는다)
const ALLOWED_STORE_KEYS: [&str; 16] = [
    "points", "totalPointsEarned", "purchasedItems",
    "petState", "lastActiveTime",
    "petSpeciesId", "petStats", "petName", "petEVs", "ownedTMs", "equippedTool",
    "ballInventory", "caughtPokemon",
    "focusXp", "encounterTickets", "seenSpecies",
];
/// 화면이 읽기만 하는 키. 집중 타이머(focus.rs)만 쓴다
const READ_ONLY_STORE_KEYS: [&str; 3] = ["ticketMinutes", "pomodoroHistory", "totalWorkMinutes"];

fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn win_size_for(species: Option<&str>) -> u32 {
    match species {
        Some(s) if STAGE3.contains(&s) => 160,
        Some(s) if STAGE2.contains(&s) => 120,
        _ => 100,
    }
}

// ---------- 펫 창 움직임 상태 ----------

#[derive(Default)]
struct Pet {
    /// 지금 펫 창 크기(논리 px)
    win_size: AtomicU32,
    wandering: AtomicBool,
    /// 집중 모드 중: 드래그가 끝나도 배회를 다시 시작하지 않는다
    wander_locked: AtomicBool,
    dragging: AtomicBool,
    /// 클릭한 지점의 창 안 위치(논리 px)
    drag_offset: Mutex<(f64, f64)>,
    /// 늦게 배회를 켜는 예약을 뒤에 온 호출이 무효로 만들기 위한 번호
    resume_gen: AtomicU64,
    wander: Mutex<Wander>,
    /// 패널을 처음 한 번 보여 줬는가 (페이지 로드 알림이 늦거나 빠질 때를 위한 대비)
    panel_shown: AtomicBool,
    /// 움직임 반복 작업의 스레드. 할 일이 없으면 자고 있으므로 일이 생기면 깨운다
    motion_thread: Mutex<Option<thread::Thread>>,
}

impl Pet {
    fn wake(&self) {
        if let Some(t) = self.motion_thread.lock().unwrap().as_ref() {
            t.unpark();
        }
    }
}

struct Wander {
    vx: f64,
    last_dir: i32,
    /// 소수점 이동을 쌓아 두는 x (물리 px). None 이면 다음 틱에 창 위치와 모니터를 다시 읽는다
    /// (드래그·크기 변경·배회 재시작 뒤). 매 틱 창 위치·모니터 목록을 묻지 않으려고 둔다
    x: Option<f64>,
    /// 지금 모니터의 작업 영역(물리 px)과 배율: (x, y, w, h, scale)
    area: (f64, f64, f64, f64, f64),
    /// 마지막으로 옮긴 창 위치. 반올림한 위치가 같으면 다시 옮기지 않는다
    last_pos: (i32, i32),
    /// 걷는 중인가. 아니면 제자리에 서 있다
    walking: bool,
    /// 지금 구간(걷기·서 있기)이 끝나는 때
    phase_until: Instant,
}

/// 걷기 5~15초, 서 있기 20~60초. r 은 0~1
fn phase_duration(walking: bool, r: f64) -> Duration {
    let r = r.clamp(0.0, 1.0);
    let secs = if walking { 5.0 + 10.0 * r } else { 20.0 + 40.0 * r };
    Duration::from_secs_f64(secs)
}

impl Default for Wander {
    fn default() -> Self {
        let vx = if rand_unit() > 0.5 { 1.0 } else { -1.0 };
        Wander {
            vx,
            last_dir: if vx > 0.0 { 1 } else { -1 },
            x: None,
            area: (0.0, 0.0, 0.0, 0.0, 1.0),
            last_pos: (i32::MIN, i32::MIN),
            walking: true,
            phase_until: Instant::now() + phase_duration(true, rand_unit()),
        }
    }
}

/// 0~1 사이 값. 배회 방향을 흔드는 데만 쓰므로 간단한 xorshift 면 충분하다
fn rand_unit() -> f64 {
    use std::cell::Cell;
    thread_local! {
        static SEED: Cell<u64> = Cell::new(
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos() as u64)
                .unwrap_or(0x9E37_79B9_7F4A_7C15)
                | 1,
        );
    }
    SEED.with(|s| {
        let mut x = s.get();
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        s.set(x);
        (x >> 11) as f64 / (1u64 << 53) as f64
    })
}

fn pet_window(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window("pet")
}

fn panel_window(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window("panel")
}

/// 물리 좌표 (x, y)가 들어 있는 모니터. 없으면 가장 가까운 모니터
fn monitor_at(app: &AppHandle, x: f64, y: f64) -> Option<Monitor> {
    let monitors = app.available_monitors().ok()?;
    let dist = |m: &Monitor| {
        let p = m.position();
        let s = m.size();
        let cx = x.clamp(p.x as f64, p.x as f64 + s.width as f64);
        let cy = y.clamp(p.y as f64, p.y as f64 + s.height as f64);
        (cx - x).powi(2) + (cy - y).powi(2)
    };
    monitors.into_iter().min_by(|a, b| dist(a).total_cmp(&dist(b)))
}

/// 모니터의 작업 영역(메뉴 막대·작업 표시줄을 뺀 곳), 물리 px: (x, y, w, h)
fn work_area(m: &Monitor) -> (f64, f64, f64, f64) {
    let r = m.work_area();
    (r.position.x as f64, r.position.y as f64, r.size.width as f64, r.size.height as f64)
}

/// macOS: 모든 데스크톱과 전체화면 앱 위에서도 펫이 보이게 한다
fn set_all_workspaces(w: &WebviewWindow, on: bool) {
    let _ = w.set_visible_on_all_workspaces(on);
    #[cfg(target_os = "macos")]
    if on {
        let w2 = w.clone();
        let _ = w.run_on_main_thread(move || {
            use objc2_app_kit::{NSWindow, NSWindowCollectionBehavior};
            if let Ok(ptr) = w2.ns_window() {
                // SAFETY: ns_window 는 이 창의 NSWindow 포인터이고, 메인 스레드에서 부른다
                let ns: &NSWindow = unsafe { &*(ptr as *const NSWindow) };
                #[allow(unused_unsafe)]
                unsafe {
                    let behavior = ns.collectionBehavior()
                        | NSWindowCollectionBehavior::CanJoinAllSpaces
                        | NSWindowCollectionBehavior::FullScreenAuxiliary;
                    ns.setCollectionBehavior(behavior);
                }
            }
        });
    }
}

/// 펫 창을 보여 주고 1초 뒤 배회를 켠다 (창이 다 그려지기 전에 움직이면 첫 위치가 틀어진다)
fn show_pet(app: &AppHandle) {
    let Some(w) = pet_window(app) else { return };
    let _ = w.show();
    set_all_workspaces(&w, true);
    resume_wandering_after(app, Duration::from_secs(1));
}

fn resume_wandering_after(app: &AppHandle, delay: Duration) {
    let pet = app.state::<Pet>();
    let gen = pet.resume_gen.fetch_add(1, Ordering::SeqCst) + 1;
    let app = app.clone();
    thread::spawn(move || {
        thread::sleep(delay);
        let pet = app.state::<Pet>();
        if pet.resume_gen.load(Ordering::SeqCst) != gen {
            return; // 그사이 다른 예약이 들어왔다
        }
        if !pet.wander_locked.load(Ordering::SeqCst) {
            restart_walk(&pet);
            pet.wandering.store(true, Ordering::SeqCst);
            pet.wake();
        }
    });
}

/// 배회를 다시 켤 때는 걷기 구간부터 시작한다 (깨어나자마자 한참 서 있지 않게)
fn restart_walk(pet: &Pet) {
    let mut wd = pet.wander.lock().unwrap();
    wd.x = None;
    wd.walking = true;
    wd.phase_until = Instant::now() + phase_duration(true, rand_unit());
}

/// 집중이 끝났거나 멈췄다: 다시 돌아다닌다
fn unlock_wandering(pet: &Pet) {
    pet.wander_locked.store(false, Ordering::SeqCst);
    restart_walk(pet);
    pet.wandering.store(true, Ordering::SeqCst);
    pet.wake();
}

/// 집중 중: 잠든 펫은 돌아다니지 않는다
fn lock_wandering(pet: &Pet) {
    pet.wander_locked.store(true, Ordering::SeqCst);
    pet.wandering.store(false, Ordering::SeqCst);
}

/// 드래그(60fps)와 배회(30fps)를 맡는 반복 작업 하나.
/// 배회가 꺼져 있거나 펫이 서 있는 동안에는 깨울 때까지 잔다
fn spawn_motion_loop(app: AppHandle) {
    let app2 = app.clone();
    let handle = thread::spawn(move || {
        loop {
            let pet = app.state::<Pet>();
            if pet.dragging.load(Ordering::SeqCst) {
                thread::sleep(Duration::from_millis(16));
                let Some(w) = pet_window(&app) else { continue };
                // 커서가 창 밖으로 나가도 따라가도록 커서 위치를 직접 읽는다
                let Ok(c) = app.cursor_position() else { continue };
                let scale = w.scale_factor().unwrap_or(1.0);
                let (ox, oy) = *pet.drag_offset.lock().unwrap();
                let _ = w.set_position(PhysicalPosition::new(
                    (c.x - ox * scale).round() as i32,
                    (c.y - oy * scale).round() as i32,
                ));
                continue;
            }

            if !pet.wandering.load(Ordering::SeqCst) {
                thread::park(); // 드래그 시작·배회 재개가 깨운다
                continue;
            }

            // 서 있는 구간이면 그 구간이 끝날 때까지 잔다
            let rest = {
                let mut wd = pet.wander.lock().unwrap();
                let now = Instant::now();
                if !wd.walking && now >= wd.phase_until {
                    wd.walking = true;
                    wd.phase_until = now + phase_duration(true, rand_unit());
                }
                (!wd.walking).then(|| wd.phase_until - now)
            };
            if let Some(rest) = rest {
                thread::park_timeout(rest);
                continue;
            }

            thread::sleep(Duration::from_millis(33));
            let Some(w) = pet_window(&app) else { continue };
            if pet.dragging.load(Ordering::SeqCst) || !pet.wandering.load(Ordering::SeqCst) {
                continue;
            }
            wander_step(&app, &pet, &w);
        }
    });
    *app2.state::<Pet>().motion_thread.lock().unwrap() = Some(handle.thread().clone());
}

/// 화면 오른쪽 1/3 구간의 바닥을 좌우로 돌아다닌다
fn wander_step(app: &AppHandle, pet: &Pet, w: &WebviewWindow) {
    let mut wd = pet.wander.lock().unwrap();
    if Instant::now() >= wd.phase_until {
        // 걷기 구간이 끝났다: 한동안 서 있는다
        wd.walking = false;
        wd.phase_until = Instant::now() + phase_duration(false, rand_unit());
        return;
    }
    if wd.x.is_none() {
        let Ok(pos) = w.outer_position() else { return };
        let Some(m) = monitor_at(app, pos.x as f64, pos.y as f64) else { return };
        let (ax, ay, aw, ah) = work_area(&m);
        wd.area = (ax, ay, aw, ah, m.scale_factor());
        wd.x = Some(pos.x as f64);
        wd.last_pos = (i32::MIN, i32::MIN);
    }
    let (dx, dy, width, height, scale) = wd.area;
    let size = pet.win_size.load(Ordering::SeqCst) as f64 * scale;

    // 바닥에서 작업 영역 높이의 2% 위에 고정
    let fixed_y = dy + height - size - (height * 0.02).round();

    // 3% 확률로 속도를 흔들어 자연스럽게 방향을 바꾼다
    if rand_unit() < 0.03 {
        wd.vx += (rand_unit() - 0.5) * 0.6;
    }
    wd.vx = wd.vx.clamp(-WANDER_SPEED, WANDER_SPEED);
    if wd.vx.abs() < 0.3 {
        wd.vx = if wd.vx < 0.0 { -0.3 } else { 0.3 };
    }

    let x = wd.x.unwrap_or(dx);
    let mut nx = x + wd.vx * scale;
    let min_x = dx + (width * 2.0 / 3.0).round();
    let max_x = dx + width - size;
    if nx <= min_x {
        wd.vx = wd.vx.abs();
        nx = min_x;
    } else if nx >= max_x {
        wd.vx = -wd.vx.abs();
        nx = max_x;
    }
    wd.x = Some(nx);
    let next = (nx.round() as i32, fixed_y.round() as i32);
    if next != wd.last_pos {
        wd.last_pos = next;
        let _ = w.set_position(PhysicalPosition::new(next.0, next.1));
    }

    // 방향이 바뀔 때만 화면에 알려 펫 그림을 좌우로 뒤집는다
    let dir = if wd.vx > 0.0 { 1 } else { -1 };
    if dir != wd.last_dir {
        wd.last_dir = dir;
        let _ = app.emit_to("pet", "wander-direction", dir);
    }
}

fn toggle_panel_window(app: &AppHandle, near_pet: bool) {
    let Some(panel) = panel_window(app) else { return };
    if panel.is_visible().unwrap_or(false) {
        let _ = panel.hide();
        return;
    }
    if near_pet {
        if let Some(pet) = pet_window(app) {
            if let Ok(p) = pet.outer_position() {
                if let Some(m) = monitor_at(app, p.x as f64, p.y as f64) {
                    let s = m.scale_factor();
                    let (dx, dy, width, height) = work_area(&m);
                    let size = app.state::<Pet>().win_size.load(Ordering::SeqCst) as f64 * s;
                    let (px, py) = (p.x as f64, p.y as f64);
                    let (pw, ph) = (PANEL_W * s, PANEL_H * s);
                    // 기본은 펫 왼쪽 위. 화면 밖으로 나가면 안쪽으로 당긴다
                    let mut x = px - 390.0 * s;
                    let mut y = py - 480.0 * s;
                    if x < dx {
                        x = px + size + 10.0 * s;
                    }
                    if x + pw > dx + width {
                        x = dx + width - pw - 10.0 * s;
                    }
                    if y < dy {
                        y = dy + 10.0 * s;
                    }
                    if y + ph > dy + height {
                        y = dy + height - ph - 10.0 * s;
                    }
                    let _ = panel.set_position(PhysicalPosition::new(x.round() as i32, y.round() as i32));
                }
            }
        }
    }
    let _ = panel.show();
    let _ = panel.set_focus();
}

// ---------- 화면에서 부르는 명령 ----------

#[tauri::command]
fn toggle_panel(app: AppHandle) {
    toggle_panel_window(&app, true);
}

#[tauri::command]
fn close_panel(app: AppHandle) {
    if let Some(p) = panel_window(&app) {
        let _ = p.hide();
    }
}

#[tauri::command]
fn get_store(store: State<'_, Store>, key: String) -> Option<Value> {
    if !ALLOWED_STORE_KEYS.contains(&key.as_str()) && !READ_ONLY_STORE_KEYS.contains(&key.as_str()) {
        return None;
    }
    store.get(&key)
}

#[tauri::command]
fn set_store(store: State<'_, Store>, key: String, value: Value) {
    if !ALLOWED_STORE_KEYS.contains(&key.as_str()) {
        return;
    }
    store.update(|data| {
        data.insert(key, value);
        (true, ())
    });
}

/// 여러 키를 한 번에 쓴다. 파트너 교체처럼 함께 바뀌어야 하는 값이 중간 상태로 남지 않는다
#[tauri::command]
fn set_store_many(store: State<'_, Store>, values: Map<String, Value>) {
    store.update(|data| {
        let mut changed = false;
        for (key, value) in values {
            if ALLOWED_STORE_KEYS.contains(&key.as_str()) {
                data.insert(key, value);
                changed = true;
            }
        }
        (changed, ())
    });
}

#[tauri::command]
fn get_all_store(store: State<'_, Store>) -> Map<String, Value> {
    store
        .data
        .lock()
        .unwrap()
        .iter()
        .filter(|(k, _)| ALLOWED_STORE_KEYS.contains(&k.as_str()) || READ_ONLY_STORE_KEYS.contains(&k.as_str()))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

#[tauri::command]
fn clear_store(app: AppHandle, store: State<'_, Store>, pet: State<'_, Pet>) {
    store.clear();
    pet.resume_gen.fetch_add(1, Ordering::SeqCst); // 걸려 있던 배회 재시작 예약도 취소
    pet.wandering.store(false, Ordering::SeqCst);
    pet.wander_locked.store(false, Ordering::SeqCst); // 집중 세션도 함께 지워졌다
    if let Some(w) = pet_window(&app) {
        let _ = w.hide();
    }
    refresh_tray_tooltip(&app);
}

/// 이번 실행을 시작할 때 남긴 사본이 있으면 그 시각(ms)
#[tauri::command]
fn backup_info(store: State<'_, Store>) -> Option<i64> {
    store.backup_time()
}

/// 저장 파일을 읽지 못해 복구했거나 저장이 안 되는 상태인지 (패널이 알림 줄로 보여 준다)
#[tauri::command]
fn store_status(store: State<'_, Store>) -> Value {
    store.status()
}

/// 이번 실행을 시작할 때의 사본으로 되돌린다. 화면은 store-reloaded 를 받고 다시 읽는다
#[tauri::command]
fn restore_backup(app: AppHandle, store: State<'_, Store>) -> bool {
    if !store.restore_backup(now_ms()) {
        return false;
    }
    sync_wander_lock(&app);
    if store.get("petSpeciesId").is_some_and(|v| v.is_string()) {
        show_pet(&app);
    } else if let Some(w) = pet_window(&app) {
        let _ = w.hide();
    }
    for label in ["pet", "panel"] {
        let _ = app.emit_to(label, "store-reloaded", ());
    }
    refresh_tray_tooltip(&app);
    true
}

// ---------- 집중 타이머 ----------
// 시간은 여기서 잰다. 세션은 종료 시각으로 config.json 에 있어서 앱을 껐다 켜도 이어지고,
// 패널이 닫혀 있어도 제때 끝난다. 규칙은 focus.rs.

#[derive(Default)]
struct FocusRuntime {
    thread: Mutex<Option<thread::Thread>>,
    /// 펫 화면이 이벤트를 받을 준비가 됐다. 그 전에 보상을 주면 화면이 레벨업을 놓친다
    ready: AtomicBool,
}

impl FocusRuntime {
    fn wake(&self) {
        if let Some(t) = self.thread.lock().unwrap().as_ref() {
            t.unpark();
        }
    }
}

/// 화면에 보내는 집중 상태. values 는 타이머가 바꾸는 숫자들이다
fn focus_payload(data: &Map<String, Value>, done: bool, prev_xp: Option<f64>) -> Value {
    let pick = |key: &str| data.get(key).cloned().unwrap_or(Value::Null);
    json!({
        "session": pick("focusSession"),
        "result": focus::result(data),
        "values": {
            "points": pick("points"),
            "focusXp": pick("focusXp"),
            "totalPointsEarned": pick("totalPointsEarned"),
            "totalWorkMinutes": pick("totalWorkMinutes"),
            "encounterTickets": pick("encounterTickets"),
            "ticketMinutes": pick("ticketMinutes"),
        },
        "history": if done { pick("pomodoroHistory") } else { Value::Null },
        "done": done,
        "prevXp": prev_xp,
    })
}

fn emit_focus(app: &AppHandle, payload: Value) {
    for label in ["pet", "panel"] {
        let _ = app.emit_to(label, "focus-update", payload.clone());
    }
}

/// 돌아가는 세션이 있으면 펫을 재우고(배회 잠금), 없으면 풀어 준다
fn sync_wander_lock(app: &AppHandle) {
    let running = app.state::<Store>().update(|data| (false, focus::session(data).is_some_and(|s| s.running())));
    let pet = app.state::<Pet>();
    if running {
        lock_wandering(&pet);
    } else if pet.wander_locked.load(Ordering::SeqCst) {
        unlock_wandering(&pet);
    }
}

fn notify_focus_done(app: &AppHandle, result: &Value) {
    let n = |key: &str| result.get(key).and_then(Value::as_i64).unwrap_or(0);
    let mut body = format!("{}분 집중 끝! +{}pt", n("minutes"), n("gained"));
    if n("tickets") > 0 {
        body.push_str(&format!(" · 조우권 +{}", n("tickets")));
    }
    if let Err(e) = app.notification().builder().title("포켓몬 키우기").body(body).show() {
        eprintln!("알림을 보내지 못했습니다: {e}");
    }
}

/// 지금까지 지난 만큼 보상을 주고 끝났으면 알린다. 다음에 깰 때까지의 시간을 돌려준다
fn focus_tick(app: &AppHandle) -> Option<Duration> {
    let now = now_ms();
    let (adv, next) = app.state::<Store>().update(|data| {
        let adv = focus::advance(data, now);
        if adv.changed {
            // 잠금을 잡은 채로 보낸다: 다른 스레드의 이벤트와 순서가 뒤집히지 않는다
            emit_focus(app, focus_payload(data, adv.done.is_some(), Some(adv.prev_xp)));
        }
        let next = focus::next_wake_ms(data, now);
        (adv.changed, (adv, next))
    });
    if adv.changed {
        refresh_tray_tooltip(app);
    }
    if let Some(result) = &adv.done {
        sync_wander_lock(app);
        notify_focus_done(app, result);
    }
    // 잠자기에서 깨어난 직후에도 늦지 않게 최대 1초마다 본다
    next.map(|ms| Duration::from_millis((ms.max(0) as u64 + 20).min(1000)))
}

fn spawn_focus_loop(app: AppHandle) {
    let app2 = app.clone();
    let handle = thread::spawn(move || {
        // 펫 화면이 준비됐다고 알릴 때까지 기다린다. 알림이 안 오면 10초 뒤 그냥 시작한다
        let started = Instant::now();
        while !app.state::<FocusRuntime>().ready.load(Ordering::SeqCst) && started.elapsed() < Duration::from_secs(10) {
            thread::park_timeout(Duration::from_millis(200));
        }
        app.state::<FocusRuntime>().ready.store(true, Ordering::SeqCst);
        loop {
            match focus_tick(&app) {
                Some(wait) => thread::park_timeout(wait),
                None => thread::park(), // 세션이 시작·재개되면 깨운다
            }
        }
    });
    *app2.state::<FocusRuntime>().thread.lock().unwrap() = Some(handle.thread().clone());
}

/// 지난 시간을 먼저 정산하고 세션을 바꾼 뒤 화면·펫·트레이에 알린다
fn focus_action(app: &AppHandle, f: impl FnOnce(&mut Map<String, Value>, i64) -> bool) -> bool {
    // 펫 화면이 준비되기 전에는 받지 않는다. 먼저 정산하면 그 화면이 레벨업을 놓친다
    if !app.state::<FocusRuntime>().ready.load(Ordering::SeqCst) {
        return false;
    }
    focus_tick(app);
    let now = now_ms();
    let ok = app.state::<Store>().update(|data| {
        let ok = f(data, now);
        // 바뀐 것이 없어도 지금 상태를 보낸다 (화면이 어긋나 있었다면 여기서 맞춰진다)
        emit_focus(app, focus_payload(data, false, None));
        (ok, ok)
    });
    if ok {
        sync_wander_lock(app);
        refresh_tray_tooltip(app);
        app.state::<FocusRuntime>().wake();
    }
    ok
}

fn start_focus_session(app: &AppHandle, minutes: i64) -> bool {
    // 스타터를 고르기 전에는 재울 펫이 없다
    if !app.state::<Store>().get("petSpeciesId").is_some_and(|v| v.is_string()) {
        return false;
    }
    focus_action(app, |data, now| focus::start(data, minutes, now))
}

#[tauri::command]
fn get_focus(store: State<'_, Store>) -> Value {
    store.update(|data| (false, focus_payload(data, false, None)))
}

#[tauri::command]
fn focus_ready(rt: State<'_, FocusRuntime>) {
    rt.ready.store(true, Ordering::SeqCst);
    rt.wake();
}

#[tauri::command]
fn start_focus(app: AppHandle, minutes: i64) -> bool {
    start_focus_session(&app, minutes)
}

#[tauri::command]
fn pause_focus(app: AppHandle) -> bool {
    focus_action(&app, |data, now| focus::pause(data, now))
}

#[tauri::command]
fn resume_focus(app: AppHandle) -> bool {
    focus_action(&app, |data, now| focus::resume(data, now))
}

#[tauri::command]
fn cancel_focus(app: AppHandle) -> bool {
    focus_action(&app, |data, _| focus::cancel(data))
}

/// 펫 창의 결과 말풍선을 눌러 닫았다
#[tauri::command]
fn dismiss_focus_result(app: AppHandle) -> bool {
    focus_action(&app, |data, _| data.remove("focusResult").is_some())
}

#[tauri::command]
fn starter_selected(app: AppHandle) {
    show_pet(&app);
}

#[tauri::command]
fn start_drag(app: AppHandle, pet: State<'_, Pet>, offset_x: f64, offset_y: f64) {
    if !offset_x.is_finite() || !offset_y.is_finite() {
        return;
    }
    if !(0.0..=10000.0).contains(&offset_x) || !(0.0..=10000.0).contains(&offset_y) {
        return;
    }
    *pet.drag_offset.lock().unwrap() = (offset_x, offset_y);
    pet.wandering.store(false, Ordering::SeqCst);
    pet.resume_gen.fetch_add(1, Ordering::SeqCst); // 걸려 있던 배회 재시작 예약을 취소
    // macOS: 모든 데스크톱 표시를 켜 둔 채로는 다른 모니터로 옮겨지지 않는다
    #[cfg(target_os = "macos")]
    if let Some(w) = pet_window(&app) {
        let _ = w.set_visible_on_all_workspaces(false);
    }
    #[cfg(not(target_os = "macos"))]
    let _ = &app;
    pet.dragging.store(true, Ordering::SeqCst);
    pet.wake();
}

#[tauri::command]
fn stop_drag(app: AppHandle, pet: State<'_, Pet>) {
    pet.dragging.store(false, Ordering::SeqCst);
    pet.wander.lock().unwrap().x = None;
    if let Some(w) = pet_window(&app) {
        set_all_workspaces(&w, true);
    }
    resume_wandering_after(&app, Duration::from_secs(2));
}

#[tauri::command]
fn resize_pet_window(app: AppHandle, pet: State<'_, Pet>, size: u32) {
    if !VALID_WIN_SIZES.contains(&size) || pet.win_size.load(Ordering::SeqCst) == size {
        return;
    }
    let Some(w) = pet_window(&app) else { return };
    pet.win_size.store(size, Ordering::SeqCst);
    let _ = w.set_size(LogicalSize::new(size as f64, size as f64));
    if let Ok(p) = w.outer_position() {
        if let Some(m) = monitor_at(&app, p.x as f64, p.y as f64) {
            let s = m.scale_factor();
            let (_, dy, _, height) = work_area(&m);
            let y = dy + height - size as f64 * s - (height * 0.02).round();
            let _ = w.set_position(PhysicalPosition::new(p.x, y.round() as i32));
        }
    }
    pet.wander.lock().unwrap().x = None;
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

// ---------- 시작 ----------

/// 창마다 어떤 화면을 그릴지 알려 준다 (src/App.jsx 가 window.__POKE_VIEW__ 를 읽는다)
fn view_script(view: &str) -> String {
    format!("window.__POKE_VIEW__ = '{view}';")
}

fn build_windows(app: &AppHandle) -> tauri::Result<()> {
    let store = app.state::<Store>();
    let species = store.get("petSpeciesId");
    let size = win_size_for(species.as_ref().and_then(|v| v.as_str()));
    app.state::<Pet>().win_size.store(size, Ordering::SeqCst);

    // 첫 위치는 주 모니터 오른쪽 아래 (논리 px)
    let (mw, mh) = app
        .primary_monitor()
        .ok()
        .flatten()
        .map(|m| {
            let s = m.scale_factor();
            let r = m.work_area();
            (r.size.width as f64 / s, r.size.height as f64 / s)
        })
        .unwrap_or((1440.0, 900.0));

    let has_pet = species.is_some_and(|v| !v.is_null());
    WebviewWindowBuilder::new(app, "pet", WebviewUrl::App("index.html".into()))
        .title("포켓몬 키우기")
        .initialization_script(view_script("pet"))
        .inner_size(size as f64, size as f64)
        .position(mw - size as f64 - 20.0, mh - size as f64 - 20.0)
        .transparent(true)
        .decorations(false)
        .shadow(false)
        .always_on_top(true)
        .resizable(false)
        .skip_taskbar(true)
        .focused(false)
        .visible(false)
        .on_page_load(move |w, payload| {
            if payload.event() == PageLoadEvent::Finished && has_pet {
                show_pet(w.app_handle());
            }
        })
        .build()?;

    WebviewWindowBuilder::new(app, "panel", WebviewUrl::App("index.html".into()))
        .title("포켓몬 키우기")
        .initialization_script(view_script("panel"))
        .inner_size(PANEL_W, PANEL_H)
        .position(mw - 400.0, mh - 620.0)
        .decorations(false)
        .resizable(false)
        .skip_taskbar(true)
        .visible(false)
        .on_page_load(|w, payload| {
            // 다 그려진 뒤에 보여 줘서 흰 화면이 번쩍이지 않게 한다
            if payload.event() == PageLoadEvent::Finished {
                show_panel_first(w.app_handle());
            }
        })
        .build()?;

    // 처음 실행할 때 페이지 로드 알림을 못 받아 패널이 안 뜬 적이 있어서, 3초 뒤에도 안 떴으면 띄운다
    let app2 = app.clone();
    thread::spawn(move || {
        thread::sleep(Duration::from_secs(3));
        show_panel_first(&app2);
    });
    Ok(())
}

fn show_panel_first(app: &AppHandle) {
    if app.state::<Pet>().panel_shown.swap(true, Ordering::SeqCst) {
        return;
    }
    if let Some(w) = panel_window(app) {
        let _ = w.show();
        let _ = w.set_focus();
    }
}

/// 트레이 메뉴. 받아 둔 업데이트가 있으면 맨 위에 설치 항목을 둔다
fn tray_menu(app: &AppHandle, update_version: Option<&str>) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let toggle = MenuItem::with_id(app, "toggle", "패널 열기/닫기", true, None::<&str>)?;
    let focus_start = MenuItem::with_id(app, "focus_start", "25분 집중 시작", true, None::<&str>)?;
    let focus_stop = MenuItem::with_id(app, "focus_stop", "집중 중단", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "종료", true, None::<&str>)?;
    let mut builder = MenuBuilder::new(app);
    if let Some(v) = update_version {
        let label = format!("새 버전 v{v} 설치하고 다시 시작");
        let update = MenuItem::with_id(app, "update", label, true, None::<&str>)?;
        builder = builder.item(&update).separator();
    }
    builder.item(&toggle).separator().item(&focus_start).item(&focus_stop).separator().item(&quit).build()
}

/// 트레이 툴팁: 받아 둔 업데이트와 집중 남은 시간을 함께 보여 준다
fn refresh_tray_tooltip(app: &AppHandle) {
    let mut text = String::from("포켓몬 키우기");
    if let Some((update, _)) = app.state::<PendingUpdate>().0.lock().unwrap().as_ref() {
        text.push_str(&format!(" · 새 버전 v{}", update.version));
    }
    let session = app.state::<Store>().update(|data| (false, focus::session(data)));
    if let Some(s) = session {
        if s.running() {
            let minutes = (s.remaining(now_ms()) + 59_999) / 60_000;
            text.push_str(&format!(" · 집중 {minutes}분 남음"));
        } else {
            text.push_str(" · 집중 멈춤");
        }
    }
    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_tooltip(Some(text));
    }
}

fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let menu = tray_menu(app, None)?;
    let icon = tauri::image::Image::from_bytes(include_bytes!("../icons/tray.png"))?;

    TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip("포켓몬 키우기")
        .menu(&menu)
        // macOS 는 왼쪽 클릭에 메뉴, Windows 는 왼쪽 클릭에 패널 토글 (Electron 때와 같게)
        .show_menu_on_left_click(cfg!(target_os = "macos"))
        .on_menu_event(|app, event| match event.id().as_ref() {
            "toggle" => toggle_panel_window(app, false),
            "focus_start" => {
                // 멈춰 둔 세션이 있으면 그것을 이어서 한다
                if !focus_action(app, |data, now| focus::resume(data, now)) {
                    start_focus_session(app, 25);
                }
            }
            "focus_stop" => {
                focus_action(app, |data, _| focus::cancel(data));
            }
            "update" => install_update(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if cfg!(target_os = "macos") {
                return;
            }
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                toggle_panel_window(tray.app_handle(), false);
            }
        })
        .build(app)?;
    Ok(())
}

// ── 자동 업데이트 ────────────────────────────────────────────────
// GitHub 릴리스의 latest.json 을 보고 새 버전이 있으면 미리 받아 둔다.
// 설치는 사용자가 트레이 메뉴에서 고를 때만 한다 (집중 타이머 도중에 앱이 꺼지지 않게).

/// 받아 두고 아직 설치하지 않은 업데이트
#[derive(Default)]
struct PendingUpdate(Mutex<Option<(Update, Vec<u8>)>>);

const UPDATE_FIRST_CHECK: Duration = Duration::from_secs(15);
const UPDATE_INTERVAL: Duration = Duration::from_secs(6 * 60 * 60);

fn spawn_update_checker(app: AppHandle) {
    thread::spawn(move || {
        thread::sleep(UPDATE_FIRST_CHECK);
        loop {
            if let Err(e) = tauri::async_runtime::block_on(check_update(&app)) {
                eprintln!("업데이트 확인 실패: {e}");
            }
            thread::sleep(UPDATE_INTERVAL);
        }
    });
}

async fn check_update(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    if app.state::<PendingUpdate>().0.lock().unwrap().is_some() {
        return Ok(()); // 이미 받아 둔 것이 있으면 설치를 기다린다
    }
    let Some(update) = app.updater()?.check().await? else { return Ok(()) };
    let bytes = update.download(|_, _| {}, || {}).await?;
    let version = update.version.clone();
    *app.state::<PendingUpdate>().0.lock().unwrap() = Some((update, bytes));

    // 메뉴는 메인 스레드에서 바꾼다
    let handle = app.clone();
    app.run_on_main_thread(move || {
        match tray_menu(&handle, Some(&version)) {
            Ok(menu) => {
                if let Some(tray) = handle.tray_by_id("main") {
                    let _ = tray.set_menu(Some(menu));
                }
                refresh_tray_tooltip(&handle);
            }
            Err(e) => eprintln!("트레이 메뉴를 바꾸지 못했습니다: {e}"),
        }
    })?;
    Ok(())
}

fn install_update(app: &AppHandle) {
    let Some((update, bytes)) = app.state::<PendingUpdate>().0.lock().unwrap().take() else { return };
    match update.install(bytes) {
        // Windows 는 설치 프로그램이 앱을 닫고 새 버전을 띄운다. macOS 는 앱 묶음을 바꾼 뒤 다시 시작한다
        Ok(()) => app.restart(),
        Err(e) => {
            eprintln!("업데이트 설치 실패: {e}");
            // 받아 둔 것을 버렸으니 메뉴를 되돌리고, 다음 확인 때 다시 받는다
            if let (Some(tray), Ok(menu)) = (app.tray_by_id("main"), tray_menu(app, None)) {
                let _ = tray.set_menu(Some(menu));
            }
            refresh_tray_tooltip(app);
        }
    }
}

/// Electron 버전이 저장하던 config.json 후보 (userData 폴더 이름이 package.json 이름 또는 제품 이름)
fn legacy_store_paths(app: &AppHandle) -> Vec<PathBuf> {
    let Ok(base) = app.path().data_dir() else { return vec![] };
    ["poketmon-idle", "포켓몬키우기"]
        .iter()
        .map(|name| base.join(name).join("config.json"))
        .collect()
}

/// 저장 폴더. 개발 빌드에서는 POKETMON_IDLE_DATA_DIR 로 다른 폴더를 쓸 수 있다
/// (실제 데이터를 건드리지 않고 시험하려는 용도). 돌려 쓰는 중이면 true
fn data_dir(app: &AppHandle) -> tauri::Result<(PathBuf, bool)> {
    #[cfg(debug_assertions)]
    if let Some(dir) = std::env::var_os("POKETMON_IDLE_DATA_DIR").filter(|d| !d.is_empty()) {
        return Ok((PathBuf::from(dir), true));
    }
    Ok((app.path().app_data_dir()?, false))
}

pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let handle = app.handle().clone();
            let (dir, sandbox) = data_dir(&handle)?;
            // 시험용 폴더를 쓸 때는 Electron 시절 파일을 가져오지 않고 업데이트도 받지 않는다
            let legacy = if sandbox { vec![] } else { legacy_store_paths(&handle) };
            app.manage(Store::load(dir.join("config.json"), &legacy, now_ms()));
            app.manage(Pet::default());
            app.manage(PendingUpdate::default());
            app.manage(FocusRuntime::default());
            // 집중 중에 꺼졌다 켜졌으면 펫은 계속 잔다
            sync_wander_lock(&handle);
            build_tray(&handle)?;
            build_windows(&handle)?;
            refresh_tray_tooltip(&handle);
            if !sandbox {
                spawn_update_checker(handle.clone());
            }
            spawn_focus_loop(handle.clone());
            spawn_motion_loop(handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_panel,
            close_panel,
            get_store,
            set_store,
            set_store_many,
            get_all_store,
            clear_store,
            backup_info,
            store_status,
            restore_backup,
            get_focus,
            focus_ready,
            start_focus,
            pause_focus,
            resume_focus,
            cancel_focus,
            dismiss_focus_result,
            starter_selected,
            start_drag,
            stop_drag,
            resize_pet_window,
            quit_app,
        ])
        .build(tauri::generate_context!())
        .expect("앱을 시작하지 못했습니다");

    app.run(|_app, event| {
        // 창을 다 닫아도 트레이에 남는다. 종료는 트레이 메뉴나 설정의 종료 버튼(app.exit)으로만
        if let RunEvent::ExitRequested { api, code: None, .. } = event {
            api.prevent_exit();
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn walk_and_stand_durations_stay_in_range() {
        for i in 0..=10 {
            let r = i as f64 / 10.0;
            let walk = phase_duration(true, r).as_secs_f64();
            let stand = phase_duration(false, r).as_secs_f64();
            assert!((5.0..=15.0).contains(&walk), "걷기 {walk}");
            assert!((20.0..=60.0).contains(&stand), "서 있기 {stand}");
        }
        assert_eq!(phase_duration(true, 7.0), phase_duration(true, 1.0));
    }

    #[test]
    fn window_size_follows_stage() {
        assert_eq!(win_size_for(Some("pidgey")), 100);
        assert_eq!(win_size_for(Some("raichu")), 120);
        assert_eq!(win_size_for(Some("snorlax")), 160);
        assert_eq!(win_size_for(None), 100);
    }

    #[test]
    fn timer_keys_are_not_writable_from_the_screen() {
        for key in ["focusSession", "focusResult", "ticketMinutes", "schemaVersion"] {
            assert!(!ALLOWED_STORE_KEYS.contains(&key), "{key}");
        }
    }
}
