//! 저장소: config.json 한 파일.
//! 깨진 파일은 덮어쓰지 않고 옮겨 두며, 쓰기는 임시 파일에 쓴 뒤 바꿔치기한다.

use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;

use serde_json::{json, Map, Value};

/// 저장 구조 버전. 구조를 바꾸면 올리고 `migrate` 에 단계를 더한다
pub const SCHEMA_VERSION: u64 = 2;
/// 깨진 원본을 몇 개까지 남길지
const KEEP_CORRUPT: usize = 5;
/// 조우권 보관 상한 (화면의 src/data/balance.js 와 같은 값)
pub const MAX_TICKETS: i64 = 5;

pub struct Store {
    path: PathBuf,
    pub data: Mutex<Map<String, Value>>,
    /// 깨진 원본을 옮겨 두지 못했으면 false. 이때는 원본을 지키려고 저장하지 않는다
    writable: AtomicBool,
    /// 읽을 때 있었던 일 (화면에 알린다). 평소에는 None
    load_notice: Option<LoadNotice>,
    /// 저장에 실패한 적이 있다
    save_failed: AtomicBool,
}

/// 저장 파일을 읽지 못했을 때 어떻게 시작했는지
#[derive(Clone, Debug, PartialEq)]
pub enum LoadNotice {
    /// 사본에서 되살렸다. 깨진 원본의 파일 이름(남겼으면)
    Recovered(Option<String>),
    /// 사본이 없어 새로 시작했다. 깨진 원본의 파일 이름
    Reset(String),
    /// 깨진 원본을 옮기지 못해 이번 실행은 저장하지 않는다
    ReadOnly,
}

enum Read {
    Missing,
    Ok(Map<String, Value>),
    /// 파일은 있는데 읽지 못했거나 JSON 객체가 아니다 (빈 파일·쓰다 만 파일 포함)
    Corrupt,
}

fn read_file(p: &Path) -> Read {
    match std::fs::read_to_string(p) {
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Read::Missing,
        Err(_) => Read::Corrupt,
        Ok(text) => match serde_json::from_str::<Value>(&text) {
            Ok(Value::Object(m)) => Read::Ok(m),
            _ => Read::Corrupt,
        },
    }
}

fn with_suffix(path: &Path, suffix: &str) -> PathBuf {
    let mut name = path.file_name().map(|n| n.to_os_string()).unwrap_or_default();
    name.push(suffix);
    path.with_file_name(name)
}

/// 실행을 시작할 때 정상으로 읽힌 파일의 사본 (그 실행에서 바뀌기 전 상태)
pub fn backup_path(path: &Path) -> PathBuf {
    with_suffix(path, ".bak")
}

/// 원본을 `<이름>.<label>-<초>.bak` 으로 남긴다.
/// keep_original 이 false 면 옮기고(못 옮기면 복사), true 면 원본을 제자리에 둔 채 복사만 한다
fn set_aside(path: &Path, label: &str, now_ms: i64, keep_original: bool) -> Option<PathBuf> {
    let secs = now_ms / 1000;
    let mut dest = with_suffix(path, &format!(".{label}-{secs}.bak"));
    let mut n = 1;
    while dest.exists() {
        dest = with_suffix(path, &format!(".{label}-{secs}-{n}.bak"));
        n += 1;
    }
    if (!keep_original && std::fs::rename(path, &dest).is_ok()) || std::fs::copy(path, &dest).is_ok() {
        prune(path, label);
        Some(dest)
    } else {
        None
    }
}

/// 옮겨 둔 파일이 쌓이지 않게 최근 것만 남긴다
fn prune(path: &Path, label: &str) {
    let (Some(dir), Some(name)) = (path.parent(), path.file_name().and_then(|n| n.to_str())) else { return };
    let prefix = format!("{name}.{label}-");
    let Ok(entries) = std::fs::read_dir(dir) else { return };
    let mut found: Vec<(std::time::SystemTime, PathBuf)> = entries
        .flatten()
        .filter(|e| e.file_name().to_str().is_some_and(|n| n.starts_with(&prefix) && n.ends_with(".bak")))
        .filter_map(|e| Some((e.metadata().ok()?.modified().ok()?, e.path())))
        .collect();
    found.sort();
    let extra = found.len().saturating_sub(KEEP_CORRUPT);
    for (_, p) in found.into_iter().take(extra) {
        let _ = std::fs::remove_file(p);
    }
}

fn finite_number(v: Option<&Value>) -> Option<f64> {
    v.and_then(Value::as_f64).filter(|n| n.is_finite())
}

/// 옛 구조의 데이터를 지금 구조로 올린다. 바꾼 것이 있으면 true.
/// 레벨·포인트·보유물은 건드리지 않고 새 키만 채운다.
pub fn migrate(data: &mut Map<String, Value>) -> bool {
    let version = data.get("schemaVersion").and_then(Value::as_u64).unwrap_or(0);
    if version >= SCHEMA_VERSION {
        return false;
    }
    let existing_user = data.get("petSpeciesId").is_some_and(Value::is_string);

    // v2: 레벨 경험치를 집중 포인트(focusXp)로만 올린다. 지금까지의 레벨은 그대로 물려준다
    if finite_number(data.get("focusXp")).is_none() {
        let earned = finite_number(data.get("totalPointsEarned")).unwrap_or(0.0).max(0.0);
        // 정수면 정수로 적는다
        let value = if earned.fract() == 0.0 && earned < 9e15 { json!(earned as i64) } else { json!(earned) };
        data.insert("focusXp".into(), value);
    }
    // v2: 조우는 조우권으로. 쓰던 사람은 가득 채워 주고, 처음이면 한 장
    if data.get("encounterTickets").and_then(Value::as_i64).is_none() {
        data.insert("encounterTickets".into(), json!(if existing_user { MAX_TICKETS } else { 1 }));
    }
    if data.get("ticketMinutes").and_then(Value::as_i64).is_none() {
        data.insert("ticketMinutes".into(), json!(0));
    }
    // v2: 도감. 지금 가진 종은 이미 본 것으로 친다
    if !data.get("seenSpecies").is_some_and(Value::is_array) {
        let mut seen: Vec<String> = Vec::new();
        let mut add = |v: Option<&Value>| {
            if let Some(s) = v.and_then(Value::as_str) {
                if !seen.iter().any(|x| x == s) {
                    seen.push(s.to_string());
                }
            }
        };
        add(data.get("petSpeciesId"));
        if let Some(list) = data.get("caughtPokemon").and_then(Value::as_array) {
            for p in list {
                add(p.get("speciesId"));
            }
        }
        data.insert("seenSpecies".into(), json!(seen));
    }
    data.insert("schemaVersion".into(), json!(SCHEMA_VERSION));
    true
}

/// 백업에서 되살릴 때는 그때 걸려 있던 집중 세션을 버린다 (끝난 세션을 다시 보상하지 않게)
fn drop_session(data: &mut Map<String, Value>) {
    data.remove("focusSession");
    data.remove("focusResult");
}

impl Store {
    pub fn load(path: PathBuf, legacy: &[PathBuf], now_ms: i64) -> Self {
        let bak = backup_path(&path);
        let mut writable = true;
        let mut dirty = false;
        let mut notice = None;
        // 사본에서 되살린다. 그때 걸려 있던 집중 세션은 버린다
        let from_backup = || match read_file(&bak) {
            Read::Ok(mut m) => {
                drop_session(&mut m);
                Some(m)
            }
            _ => None,
        };
        let mut data = match read_file(&path) {
            Read::Ok(m) => {
                // 정상으로 읽힌 파일을 사본으로 남긴다 (마이그레이션 전 원본)
                let _ = std::fs::copy(&path, &bak);
                m
            }
            Read::Missing => {
                if let Some(m) = from_backup() {
                    // 파일은 없는데 사본이 있다: 깨진 파일을 치운 직후나 쓰는 도중에 꺼진 경우다.
                    // 처음 실행으로 보고 빈 상태를 쓰면 다음 실행에서 사본까지 덮인다
                    dirty = true;
                    notice = Some(LoadNotice::Recovered(None));
                    m
                } else {
                    // 처음 실행: Electron 버전이 쓰던 저장 파일이 있으면 가져온다 (가장 최근에 바뀐 것)
                    let newest = legacy
                        .iter()
                        .filter_map(|p| Some((std::fs::metadata(p).ok()?.modified().ok()?, p)))
                        .max_by_key(|(t, _)| *t)
                        .and_then(|(_, p)| match read_file(p) {
                            Read::Ok(m) => Some(m),
                            _ => None,
                        });
                    dirty = newest.is_some();
                    newest.unwrap_or_default()
                }
            }
            Read::Corrupt => {
                let kept = set_aside(&path, "corrupt", now_ms, false);
                let kept_name = kept.as_ref().and_then(|p| p.file_name()).map(|n| n.to_string_lossy().into_owned());
                match &kept {
                    Some(p) => eprintln!("저장 파일을 읽지 못해 옮겨 두었습니다: {}", p.display()),
                    None => {
                        eprintln!("저장 파일을 읽지 못했고 옮기지도 못했습니다. 이번 실행은 저장하지 않습니다");
                        writable = false;
                    }
                }
                let recovered = from_backup();
                notice = Some(match (&recovered, kept_name) {
                    (_, None) => LoadNotice::ReadOnly,
                    (Some(_), name) => LoadNotice::Recovered(name),
                    (None, Some(name)) => LoadNotice::Reset(name),
                });
                dirty = recovered.is_some();
                recovered.unwrap_or_default()
            }
        };
        if migrate(&mut data) {
            dirty = true;
        }
        let store = Store {
            path,
            data: Mutex::new(data),
            writable: AtomicBool::new(writable),
            load_notice: notice,
            save_failed: AtomicBool::new(false),
        };
        if dirty {
            store.save();
        }
        store
    }

    /// 잠금을 잡은 채로 부른다. 임시 파일에 다 쓰고 디스크에 내린 뒤 바꿔치기한다
    pub fn save_locked(&self, data: &Map<String, Value>) -> bool {
        if !self.writable.load(Ordering::SeqCst) {
            return false;
        }
        let Ok(text) = serde_json::to_string_pretty(data) else { return false };
        if let Some(dir) = self.path.parent() {
            let _ = std::fs::create_dir_all(dir);
        }
        let tmp = with_suffix(&self.path, ".tmp");
        let written = std::fs::File::create(&tmp).and_then(|mut f| {
            f.write_all(text.as_bytes())?;
            f.sync_all()
        });
        if written.is_err() || std::fs::rename(&tmp, &self.path).is_err() {
            let _ = std::fs::remove_file(&tmp);
            self.save_failed.store(true, Ordering::SeqCst);
            return false;
        }
        true
    }

    /// 화면에 알릴 저장소 상태. 평소에는 notice 가 null 이고 saveFailed 가 false 다
    pub fn status(&self) -> Value {
        let (notice, file) = match &self.load_notice {
            None => (Value::Null, Value::Null),
            Some(LoadNotice::Recovered(file)) => (json!("recovered"), json!(file)),
            Some(LoadNotice::Reset(file)) => (json!("reset"), json!(file)),
            Some(LoadNotice::ReadOnly) => (json!("readonly"), Value::Null),
        };
        json!({ "notice": notice, "file": file, "saveFailed": self.save_failed.load(Ordering::SeqCst) })
    }

    pub fn save(&self) -> bool {
        let data = self.data.lock().unwrap();
        self.save_locked(&data)
    }

    pub fn get(&self, key: &str) -> Option<Value> {
        self.data.lock().unwrap().get(key).cloned()
    }

    /// 데이터를 고치고 바뀌었으면 저장한다. 고치기와 저장 사이에 다른 쓰기가 끼지 않는다
    pub fn update<T>(&self, f: impl FnOnce(&mut Map<String, Value>) -> (bool, T)) -> T {
        let mut data = self.data.lock().unwrap();
        let (changed, out) = f(&mut data);
        if changed {
            self.save_locked(&data);
        }
        out
    }

    /// 전부 지우고 처음 상태로 만든다
    pub fn clear(&self) {
        self.update(|data| {
            data.clear();
            migrate(data);
            (true, ())
        });
    }

    /// 실행을 시작할 때 남긴 사본이 있으면 그 수정 시각(ms)
    pub fn backup_time(&self) -> Option<i64> {
        let bak = backup_path(&self.path);
        if !matches!(read_file(&bak), Read::Ok(_)) {
            return None;
        }
        let t = std::fs::metadata(&bak).ok()?.modified().ok()?;
        Some(t.duration_since(std::time::UNIX_EPOCH).ok()?.as_millis() as i64)
    }

    /// 이번 실행을 시작할 때의 사본으로 되돌린다. 지금 파일은 시각을 붙여 남긴다
    pub fn restore_backup(&self, now_ms: i64) -> bool {
        let Read::Ok(mut restored) = read_file(&backup_path(&self.path)) else { return false };
        let mut data = self.data.lock().unwrap();
        // 지금 상태를 먼저 디스크에 내리고 사본을 남긴다. 남기지 못하면 되돌리지 않는다.
        // 원본은 제자리에 둔다: 도중에 꺼져도 config.json 이 없는 순간이 없다
        if !self.save_locked(&data) || set_aside(&self.path, "before-restore", now_ms, true).is_none() {
            return false;
        }
        drop_session(&mut restored);
        migrate(&mut restored);
        // 디스크에 쓴 다음에 메모리를 바꾼다. 쓰기에 실패하면 지금 상태 그대로다
        if !self.save_locked(&restored) {
            return false;
        }
        *data = restored;
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "poketmon-idle-test-{}-{}-{}",
            name,
            std::process::id(),
            std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos()
        ));
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn files(dir: &Path) -> Vec<String> {
        let mut v: Vec<String> =
            std::fs::read_dir(dir).unwrap().flatten().map(|e| e.file_name().to_string_lossy().into_owned()).collect();
        v.sort();
        v
    }

    fn read_json(p: &Path) -> Map<String, Value> {
        match read_file(p) {
            Read::Ok(m) => m,
            _ => panic!("{} 을 읽지 못했다", p.display()),
        }
    }

    const GOOD: &str = r#"{"points":340,"totalPointsEarned":2100,"petSpeciesId":"charmeleon","caughtPokemon":[{"speciesId":"pidgey","level":3}]}"#;

    #[test]
    fn missing_file_starts_empty_and_writes_defaults() {
        let dir = temp_dir("missing");
        let path = dir.join("config.json");
        let store = Store::load(path.clone(), &[], 1_000);
        assert_eq!(store.get("schemaVersion"), Some(json!(SCHEMA_VERSION)));
        assert_eq!(store.get("encounterTickets"), Some(json!(1)));
        assert_eq!(files(&dir), vec!["config.json"]);
    }

    #[test]
    fn missing_file_imports_legacy() {
        let dir = temp_dir("legacy");
        let legacy = dir.join("old.json");
        std::fs::write(&legacy, GOOD).unwrap();
        let store = Store::load(dir.join("config.json"), &[legacy], 1_000);
        assert_eq!(store.get("points"), Some(json!(340)));
        assert_eq!(read_json(&dir.join("config.json")).get("points"), Some(&json!(340)));
    }

    /// 깨진 내용 세 가지: 문법 오류, 빈 파일, 쓰다 만 파일
    fn corrupt_cases() -> Vec<(&'static str, String)> {
        vec![
            ("garbage", "{{ not json".to_string()),
            ("empty", String::new()),
            ("partial", GOOD[..GOOD.len() / 2].to_string()),
            ("not-object", "[1,2,3]".to_string()),
        ]
    }

    #[test]
    fn corrupt_file_is_kept_not_overwritten() {
        for (name, broken) in corrupt_cases() {
            let dir = temp_dir(name);
            let path = dir.join("config.json");
            std::fs::write(&path, &broken).unwrap();
            let legacy = dir.join("old.json");
            std::fs::write(&legacy, GOOD).unwrap();

            let store = Store::load(path.clone(), &[legacy], 1_700_000_000_000);

            let kept = dir.join("config.json.corrupt-1700000000.bak");
            assert_eq!(std::fs::read_to_string(&kept).unwrap(), broken, "{name}: 원본이 그대로 남아야 한다");
            // 깨진 것은 처음 실행이 아니다. 옛 Electron 파일을 끌어오지 않는다
            assert_eq!(store.get("points"), None, "{name}");
            assert_eq!(store.status()["notice"], json!("reset"), "{name}");
            assert_eq!(store.status()["file"], json!("config.json.corrupt-1700000000.bak"), "{name}");
            assert!(store.save(), "{name}");
            assert!(matches!(read_file(&path), Read::Ok(_)), "{name}");
        }
    }

    #[test]
    fn corrupt_file_recovers_from_backup() {
        for (name, broken) in corrupt_cases() {
            let dir = temp_dir(&format!("recover-{name}"));
            let path = dir.join("config.json");
            // 1) 정상 실행 한 번: 사본이 생긴다
            std::fs::write(&path, GOOD).unwrap();
            drop(Store::load(path.clone(), &[], 1_000));
            assert!(dir.join("config.json.bak").exists());
            // 2) 파일이 깨진다
            std::fs::write(&path, &broken).unwrap();
            // 3) 다음 실행: 사본에서 되살아난다
            let store = Store::load(path.clone(), &[], 2_000_000);
            assert_eq!(store.get("points"), Some(json!(340)), "{name}");
            assert_eq!(store.status()["notice"], json!("recovered"), "{name}");
            assert_eq!(store.get("petSpeciesId"), Some(json!("charmeleon")), "{name}");
            assert_eq!(read_json(&path).get("totalPointsEarned"), Some(&json!(2100)), "{name}");
            assert_eq!(std::fs::read_to_string(dir.join("config.json.corrupt-2000.bak")).unwrap(), broken);
        }
    }

    #[test]
    fn recovery_drops_stale_focus_session() {
        let dir = temp_dir("stale-session");
        let path = dir.join("config.json");
        std::fs::write(&path, r#"{"points":10,"petSpeciesId":"pidgey","focusSession":{"minutes":25,"endsAt":5,"remainingMs":0,"awarded":0}}"#).unwrap();
        drop(Store::load(path.clone(), &[], 1_000));
        std::fs::write(&path, "").unwrap();
        let store = Store::load(path, &[], 2_000);
        assert_eq!(store.get("points"), Some(json!(10)));
        assert_eq!(store.get("focusSession"), None);
    }

    #[test]
    fn missing_file_with_backup_recovers_instead_of_starting_over() {
        // 깨진 파일을 치운 직후 꺼졌거나 쓰는 도중에 파일이 사라진 경우
        let dir = temp_dir("missing-with-bak");
        let path = dir.join("config.json");
        std::fs::write(&path, GOOD).unwrap();
        drop(Store::load(path.clone(), &[], 1_000));
        std::fs::remove_file(&path).unwrap();
        let legacy = dir.join("old.json");
        std::fs::write(&legacy, r#"{"points":1}"#).unwrap();

        let store = Store::load(path.clone(), &[legacy], 2_000);
        assert_eq!(store.get("points"), Some(json!(340)));
        assert_eq!(store.status()["notice"], json!("recovered"));
        // 한 번 더 켜도 사본이 빈 데이터로 덮이지 않는다
        drop(store);
        let again = Store::load(path, &[], 3_000);
        assert_eq!(again.get("points"), Some(json!(340)));
        assert_eq!(again.status()["notice"], Value::Null);
    }

    #[test]
    fn failed_restore_leaves_memory_and_file_untouched() {
        let dir = temp_dir("restore-fail");
        let path = dir.join("config.json");
        std::fs::write(&path, GOOD).unwrap();
        let store = Store::load(path.clone(), &[], 1_000);
        store.update(|d| {
            d.insert("points".into(), json!(999));
            (true, ())
        });
        // 지금 상태를 내리는 쓰기부터 실패시킨다
        std::fs::create_dir(dir.join("config.json.tmp")).unwrap();
        assert!(!store.restore_backup(5_000));
        assert_eq!(store.get("points"), Some(json!(999)));
        assert_eq!(read_json(&path).get("points"), Some(&json!(999)));
        assert_eq!(store.status()["saveFailed"], json!(true));
    }

    #[test]
    fn leftover_tmp_file_is_ignored() {
        let dir = temp_dir("tmp");
        let path = dir.join("config.json");
        std::fs::write(&path, GOOD).unwrap();
        std::fs::write(dir.join("config.json.tmp"), "{\"points\":").unwrap();
        let store = Store::load(path, &[], 1_000);
        assert_eq!(store.get("points"), Some(json!(340)));
    }

    #[test]
    fn save_is_atomic_and_leaves_no_tmp() {
        let dir = temp_dir("save");
        let path = dir.join("config.json");
        let store = Store::load(path.clone(), &[], 1_000);
        store.update(|d| {
            d.insert("points".into(), json!(77));
            (true, ())
        });
        assert_eq!(read_json(&path).get("points"), Some(&json!(77)));
        assert!(!dir.join("config.json.tmp").exists());
    }

    #[test]
    fn failed_save_keeps_previous_file() {
        let dir = temp_dir("save-fail");
        let path = dir.join("config.json");
        let store = Store::load(path.clone(), &[], 1_000);
        store.update(|d| {
            d.insert("points".into(), json!(5));
            (true, ())
        });
        // 임시 파일 자리에 폴더를 두어 쓰기를 실패시킨다
        std::fs::create_dir(dir.join("config.json.tmp")).unwrap();
        store.data.lock().unwrap().insert("points".into(), json!(999));
        assert!(!store.save());
        assert_eq!(read_json(&path).get("points"), Some(&json!(5)));
    }

    #[test]
    fn corrupt_copies_are_pruned() {
        let dir = temp_dir("prune");
        let path = dir.join("config.json");
        for i in 0..8 {
            std::fs::write(&path, "broken").unwrap();
            drop(Store::load(path.clone(), &[], 1_000_000 * (i + 1)));
        }
        let kept = files(&dir).into_iter().filter(|n| n.contains(".corrupt-")).count();
        assert_eq!(kept, KEEP_CORRUPT);
    }

    #[test]
    fn migrate_v1_keeps_level_points_and_owned() {
        let mut data = read_json_str(
            r#"{"points":340,"totalPointsEarned":2100,"totalWorkMinutes":410,"petSpeciesId":"charmeleon",
                "petStats":{"speciesId":"charmeleon","moves":["할퀴기"]},"purchasedItems":["tool_leftovers"],
                "ballInventory":{"ball_pokeball":3},"caughtPokemon":[{"speciesId":"pidgey"},{"speciesId":"pidgey"},{"speciesId":"gastly"}],
                "pomodoroHistory":[{"id":1,"completedAt":1,"durationMinutes":25}]}"#,
        );
        let before = data.clone();
        assert!(migrate(&mut data));
        for (k, v) in &before {
            assert_eq!(data.get(k), Some(v), "{k} 가 바뀌면 안 된다");
        }
        // 레벨은 focusXp 로 계산한다: 지금까지 번 포인트를 그대로 물려받아 레벨이 같다
        assert_eq!(data["focusXp"].as_f64(), Some(2100.0));
        assert_eq!(data["encounterTickets"], json!(MAX_TICKETS));
        assert_eq!(data["seenSpecies"], json!(["charmeleon", "pidgey", "gastly"]));
        assert_eq!(data["schemaVersion"], json!(SCHEMA_VERSION));
        // 두 번째는 아무것도 바꾸지 않는다
        let once = data.clone();
        assert!(!migrate(&mut data));
        assert_eq!(data, once);
    }

    #[test]
    fn migrate_does_not_touch_newer_or_current_data() {
        let mut data = read_json_str(r#"{"schemaVersion":2,"focusXp":10,"totalPointsEarned":900,"encounterTickets":0}"#);
        assert!(!migrate(&mut data));
        assert_eq!(data["focusXp"], json!(10));
        assert_eq!(data["encounterTickets"], json!(0));
        let mut newer = read_json_str(r#"{"schemaVersion":9,"points":1}"#);
        assert!(!migrate(&mut newer));
        assert_eq!(newer.len(), 2);
    }

    #[test]
    fn migrate_handles_bad_types() {
        let mut data = read_json_str(r#"{"totalPointsEarned":"many","petSpeciesId":null,"caughtPokemon":"x","focusXp":null}"#);
        assert!(migrate(&mut data));
        assert_eq!(data["focusXp"].as_f64(), Some(0.0));
        assert_eq!(data["encounterTickets"], json!(1));
        assert_eq!(data["seenSpecies"], json!([]));
    }

    #[test]
    fn load_migrates_and_backs_up_original() {
        let dir = temp_dir("load-migrate");
        let path = dir.join("config.json");
        std::fs::write(&path, GOOD).unwrap();
        let store = Store::load(path.clone(), &[], 1_000);
        assert_eq!(store.get("focusXp").and_then(|v| v.as_f64()), Some(2100.0));
        assert_eq!(read_json(&path).get("schemaVersion"), Some(&json!(SCHEMA_VERSION)));
        // 사본은 마이그레이션 전 원본이다
        assert_eq!(std::fs::read_to_string(dir.join("config.json.bak")).unwrap(), GOOD);
    }

    #[test]
    fn restore_backup_brings_back_launch_state() {
        let dir = temp_dir("restore");
        let path = dir.join("config.json");
        std::fs::write(&path, GOOD).unwrap();
        let store = Store::load(path.clone(), &[], 1_000);
        assert!(store.backup_time().is_some());
        store.clear();
        assert_eq!(store.get("points"), None);
        assert!(store.restore_backup(3_000_000));
        assert_eq!(store.get("points"), Some(json!(340)));
        assert_eq!(read_json(&path).get("petSpeciesId"), Some(&json!("charmeleon")));
        // 되돌리기 직전 상태(초기화한 상태)가 따로 남는다
        let kept = read_json(&dir.join("config.json.before-restore-3000.bak"));
        assert_eq!(kept.get("points"), None);
        assert_eq!(kept.get("schemaVersion"), Some(&json!(SCHEMA_VERSION)));
    }

    #[test]
    fn restore_without_backup_does_nothing() {
        let dir = temp_dir("restore-none");
        let store = Store::load(dir.join("config.json"), &[], 1_000);
        store.update(|d| {
            d.insert("points".into(), json!(9));
            (true, ())
        });
        assert!(!store.restore_backup(2_000));
        assert_eq!(store.get("points"), Some(json!(9)));
    }

    fn read_json_str(s: &str) -> Map<String, Value> {
        match serde_json::from_str::<Value>(s).unwrap() {
            Value::Object(m) => m,
            _ => unreachable!(),
        }
    }
}
