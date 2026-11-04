//! 포켓몬 키우기: 펫 창과 패널 창, 트레이, 저장소, 배회·드래그.
//! Electron 시절 electron/main.js 의 동작을 그대로 옮겼다. 화면(React)은 src/platform/tauri.js 가
//! 예전 window.electronAPI 와 같은 모양으로 이 명령들을 부른다.

use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering};
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

use serde_json::{Map, Value};
use tauri::menu::{MenuBuilder, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::webview::PageLoadEvent;
use tauri_plugin_updater::{Update, UpdaterExt};
use tauri::{
    AppHandle, Emitter, LogicalSize, Manager, Monitor, PhysicalPosition, RunEvent, State,
    WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

/// 진화 단계별 펫 창 크기(논리 px). stage1 = 100, stage2 = 120, stage3 = 160
const STAGE2: [&str; 6] = ["ivysaur", "charmeleon", "wartortle", "pidgeotto", "raichu", "haunter"];
const STAGE3: [&str; 6] = ["venusaur", "charizard", "blastoise", "pidgeot", "gengar", "snorlax"];
const VALID_WIN_SIZES: [u32; 3] = [100, 120, 160];
const PANEL_W: f64 = 380.0;
const PANEL_H: f64 = 580.0;
const WANDER_SPEED: f64 = 1.0;

/// 화면이 읽고 쓸 수 있는 저장 키 (그 밖의 키는 막는다)
const ALLOWED_STORE_KEYS: [&str; 15] = [
    "points", "totalPointsEarned", "purchasedItems",
    "pomodoroHistory", "petState", "lastActiveTime", "totalWorkMinutes",
    "petSpeciesId", "petStats", "petName", "petEVs", "ownedTMs", "equippedTool",
    "ballInventory", "caughtPokemon",
];

fn win_size_for(species: Option<&str>) -> u32 {
    match species {
        Some(s) if STAGE3.contains(&s) => 160,
        Some(s) if STAGE2.contains(&s) => 120,
        _ => 100,
    }
}

// ---------- 저장소 (electron-store 와 같은 config.json 한 파일) ----------

struct Store {
    path: PathBuf,
    data: Mutex<Map<String, Value>>,
}

impl Store {
    fn load(path: PathBuf, legacy: &[PathBuf]) -> Self {
        let read = |p: &PathBuf| -> Option<Map<String, Value>> {
            let text = std::fs::read_to_string(p).ok()?;
            match serde_json::from_str::<Value>(&text).ok()? {
                Value::Object(m) => Some(m),
                _ => None,
            }
        };
        let data = match read(&path) {
            Some(m) => m,
            None => {
                // 처음 실행: Electron 버전이 쓰던 저장 파일이 있으면 가져온다 (가장 최근에 바뀐 것)
                let newest = legacy
                    .iter()
                    .filter_map(|p| Some((std::fs::metadata(p).ok()?.modified().ok()?, p)))
                    .max_by_key(|(t, _)| *t)
                    .and_then(|(_, p)| read(p));
                newest.unwrap_or_default()
            }
        };
        let store = Store { path, data: Mutex::new(data) };
        store.save();
        store
    }

    fn save(&self) {
        let data = self.data.lock().unwrap();
        let Ok(text) = serde_json::to_string_pretty(&*data) else { return };
        if let Some(dir) = self.path.parent() {
            let _ = std::fs::create_dir_all(dir);
        }
        // 쓰는 도중 꺼져도 파일이 깨지지 않게 임시 파일에 쓰고 바꿔치기한다
        let tmp = self.path.with_extension("json.tmp");
        if std::fs::write(&tmp, text).is_ok() {
            let _ = std::fs::rename(&tmp, &self.path);
        }
    }

    fn get(&self, key: &str) -> Option<Value> {
        self.data.lock().unwrap().get(key).cloned()
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
}

impl Default for Wander {
    fn default() -> Self {
        let vx = if rand_unit() > 0.5 { 1.0 } else { -1.0 };
        Wander { vx, last_dir: if vx > 0.0 { 1 } else { -1 }, x: None, area: (0.0, 0.0, 0.0, 0.0, 1.0), last_pos: (i32::MIN, i32::MIN) }
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
            pet.wander.lock().unwrap().x = None;
            pet.wandering.store(true, Ordering::SeqCst);
        }
    });
}

/// 드래그(60fps)와 배회(30fps)를 맡는 반복 작업 하나
fn spawn_motion_loop(app: AppHandle) {
    thread::spawn(move || {
        loop {
            let pet = app.state::<Pet>();
            // 드래그 중에는 60fps, 아니면 30fps 로 돈다
            let dragging = pet.dragging.load(Ordering::SeqCst);
            thread::sleep(Duration::from_millis(if dragging { 16 } else { 33 }));
            let Some(w) = pet_window(&app) else { continue };

            if pet.dragging.load(Ordering::SeqCst) {
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
                continue;
            }
            wander_step(&app, &pet, &w);
        }
    });
}

/// 화면 오른쪽 1/3 구간의 바닥을 좌우로 돌아다닌다
fn wander_step(app: &AppHandle, pet: &Pet, w: &WebviewWindow) {
    let mut wd = pet.wander.lock().unwrap();
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
    if !ALLOWED_STORE_KEYS.contains(&key.as_str()) {
        return None;
    }
    store.get(&key)
}

#[tauri::command]
fn set_store(store: State<'_, Store>, key: String, value: Value) {
    if !ALLOWED_STORE_KEYS.contains(&key.as_str()) {
        return;
    }
    store.data.lock().unwrap().insert(key, value);
    store.save();
}

#[tauri::command]
fn get_all_store(store: State<'_, Store>) -> Map<String, Value> {
    store
        .data
        .lock()
        .unwrap()
        .iter()
        .filter(|(k, _)| ALLOWED_STORE_KEYS.contains(&k.as_str()))
        .map(|(k, v)| (k.clone(), v.clone()))
        .collect()
}

#[tauri::command]
fn clear_store(app: AppHandle, store: State<'_, Store>, pet: State<'_, Pet>) {
    store.data.lock().unwrap().clear();
    store.save();
    pet.resume_gen.fetch_add(1, Ordering::SeqCst); // 걸려 있던 배회 재시작 예약도 취소
    pet.wandering.store(false, Ordering::SeqCst);
    if let Some(w) = pet_window(&app) {
        let _ = w.hide();
    }
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
fn start_wandering(pet: State<'_, Pet>) {
    pet.wander_locked.store(false, Ordering::SeqCst);
    pet.wander.lock().unwrap().x = None;
    pet.wandering.store(true, Ordering::SeqCst);
}

#[tauri::command]
fn stop_wandering(pet: State<'_, Pet>) {
    pet.wander_locked.store(true, Ordering::SeqCst);
    pet.wandering.store(false, Ordering::SeqCst);
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
    let quit = MenuItem::with_id(app, "quit", "종료", true, None::<&str>)?;
    let mut builder = MenuBuilder::new(app);
    if let Some(v) = update_version {
        let label = format!("새 버전 v{v} 설치하고 다시 시작");
        let update = MenuItem::with_id(app, "update", label, true, None::<&str>)?;
        builder = builder.item(&update).separator();
    }
    builder.item(&toggle).separator().item(&quit).build()
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
                    let _ = tray.set_tooltip(Some(format!("포켓몬 키우기 · 새 버전 v{version}")));
                }
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
                let _ = tray.set_tooltip(Some("포켓몬 키우기"));
            }
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

pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let handle = app.handle().clone();
            let path = handle.path().app_data_dir()?.join("config.json");
            app.manage(Store::load(path, &legacy_store_paths(&handle)));
            app.manage(Pet::default());
            app.manage(PendingUpdate::default());
            build_tray(&handle)?;
            build_windows(&handle)?;
            spawn_update_checker(handle.clone());
            spawn_motion_loop(handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_panel,
            close_panel,
            get_store,
            set_store,
            get_all_store,
            clear_store,
            starter_selected,
            start_drag,
            stop_drag,
            start_wandering,
            stop_wandering,
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
