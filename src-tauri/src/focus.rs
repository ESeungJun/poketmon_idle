//! 집중 타이머와 보상 규칙. 화면이 아니라 여기서 시간을 재고 포인트를 준다.
//! 세션은 종료 시각으로 저장하므로 앱을 껐다 켜도 이어진다. 전부 순수 함수다.

use serde_json::{json, Map, Value};

use crate::store::MAX_TICKETS;

pub const MIN_MINUTES: i64 = 1;
pub const MAX_MINUTES: i64 = 120;
/// 집중 1분마다 주는 포인트
pub const POINTS_PER_MINUTE: i64 = 2;
/// 완료 보너스: 분 × 3. 이보다 짧은 세션은 보너스가 없다
pub const BONUS_PER_MINUTE: i64 = 3;
pub const BONUS_MIN_MINUTES: i64 = 5;
/// 집중 이만큼마다 조우권 한 장
pub const TICKET_EVERY_MINUTES: i64 = 25;
const HISTORY_LIMIT: usize = 100;

/// 완료 보너스. 집중한 시간에 비례한다 (25분이면 75)
pub fn completion_bonus(minutes: i64) -> i64 {
    if minutes < BONUS_MIN_MINUTES {
        0
    } else {
        minutes * BONUS_PER_MINUTE
    }
}

#[derive(Clone, Debug, PartialEq)]
pub struct Session {
    pub minutes: i64,
    /// 돌아가는 중이면 종료 시각(ms). 멈춰 있으면 None
    pub ends_at: Option<i64>,
    /// 멈춘 순간 남아 있던 시간(ms)
    pub remaining_ms: i64,
    /// 이미 포인트를 준 분
    pub awarded: i64,
    /// 이 세션에서 얻은 조우권
    pub tickets: i64,
}

impl Session {
    pub fn new(minutes: i64, now_ms: i64) -> Option<Self> {
        if !(MIN_MINUTES..=MAX_MINUTES).contains(&minutes) {
            return None;
        }
        let total = minutes * 60_000;
        Some(Session { minutes, ends_at: Some(now_ms + total), remaining_ms: total, awarded: 0, tickets: 0 })
    }

    pub fn from_value(v: &Value) -> Option<Self> {
        let minutes = v.get("minutes")?.as_i64()?;
        if !(MIN_MINUTES..=MAX_MINUTES).contains(&minutes) {
            return None;
        }
        Some(Session {
            minutes,
            ends_at: v.get("endsAt").and_then(Value::as_i64),
            remaining_ms: v.get("remainingMs").and_then(Value::as_i64).unwrap_or(minutes * 60_000),
            awarded: v.get("awarded").and_then(Value::as_i64).unwrap_or(0).clamp(0, minutes),
            tickets: v.get("tickets").and_then(Value::as_i64).unwrap_or(0).clamp(0, MAX_TICKETS),
        })
    }

    pub fn to_value(&self) -> Value {
        json!({
            "minutes": self.minutes,
            "endsAt": self.ends_at,
            "remainingMs": self.remaining_ms,
            "awarded": self.awarded,
            "tickets": self.tickets,
        })
    }

    fn total_ms(&self) -> i64 {
        self.minutes * 60_000
    }

    /// 남은 시간(ms). 시계가 뒤로 가도 세션 길이를 넘지 않는다
    pub fn remaining(&self, now_ms: i64) -> i64 {
        match self.ends_at {
            Some(end) => end.saturating_sub(now_ms),
            None => self.remaining_ms,
        }
        .clamp(0, self.total_ms())
    }

    pub fn running(&self) -> bool {
        self.ends_at.is_some()
    }
}

pub fn session(data: &Map<String, Value>) -> Option<Session> {
    data.get("focusSession").and_then(Session::from_value)
}

/// 방금 끝난 집중의 결과. 화면이 그대로 그리므로 숫자가 아닌 값이 섞여 있으면 없는 것으로 친다
pub fn result(data: &Map<String, Value>) -> Option<Value> {
    let r = data.get("focusResult")?;
    let ok = ["minutes", "gained", "bonus", "tickets"].iter().all(|k| r.get(*k).is_some_and(|v| v.is_i64() || v.is_u64()));
    ok.then(|| r.clone())
}

fn number(data: &Map<String, Value>, key: &str) -> f64 {
    data.get(key).and_then(Value::as_f64).filter(|n| n.is_finite()).unwrap_or(0.0).max(0.0)
}

/// 숫자 키에 더한다. 정수면 정수로 적는다
fn add(data: &mut Map<String, Value>, key: &str, delta: i64) {
    let next = (number(data, key) + delta as f64).max(0.0);
    let value = if next.fract() == 0.0 && next < 9e15 { json!(next as i64) } else { json!(next) };
    data.insert(key.to_string(), value);
}

/// 집중 n분의 보상: 포인트·레벨 경험치·누적 분, 그리고 조우권 진행
fn award_minutes(data: &mut Map<String, Value>, n: i64) -> i64 {
    add(data, "points", n * POINTS_PER_MINUTE);
    add(data, "focusXp", n * POINTS_PER_MINUTE);
    add(data, "totalPointsEarned", n * POINTS_PER_MINUTE);
    add(data, "totalWorkMinutes", n);
    // 파일에 이상하게 큰 값이 들어 있어도 넘치지 않게 한 장 분량 안으로 자른다
    let progress = number(data, "ticketMinutes").min((TICKET_EVERY_MINUTES - 1) as f64) as i64 + n;
    let earned = progress / TICKET_EVERY_MINUTES;
    data.insert("ticketMinutes".into(), json!(progress % TICKET_EVERY_MINUTES));
    let before = number(data, "encounterTickets").min(MAX_TICKETS as f64) as i64;
    let after = (before + earned).min(MAX_TICKETS);
    data.insert("encounterTickets".into(), json!(after));
    after - before
}

#[derive(Debug, Default, PartialEq)]
pub struct Advance {
    /// 저장 데이터가 바뀌었다
    pub changed: bool,
    /// 이번에 세션이 끝났으면 그 결과 (focusResult 와 같은 값)
    pub done: Option<Value>,
    /// 보상을 주기 전의 레벨 경험치. 화면이 레벨업을 판정하는 데 쓴다
    pub prev_xp: f64,
}

/// 지금 시각까지 지난 만큼 보상을 주고, 다 됐으면 세션을 끝낸다.
/// 앱이 꺼져 있던 동안 지난 시간도 한 번에 반영한다.
pub fn advance(data: &mut Map<String, Value>, now_ms: i64) -> Advance {
    let mut out = Advance { prev_xp: number(data, "focusXp"), ..Default::default() };
    let Some(mut s) = session(data) else {
        // 알아볼 수 없는 세션 값은 치운다
        out.changed = data.remove("focusSession").is_some();
        return out;
    };
    let remaining = s.remaining(now_ms);
    let finished = s.running() && remaining == 0;
    let elapsed_minutes = (s.total_ms() - remaining) / 60_000;
    let target = if finished { s.minutes } else { elapsed_minutes.min(s.minutes) };
    let n = target - s.awarded;
    if n > 0 {
        s.tickets += award_minutes(data, n);
        s.awarded = target;
        out.changed = true;
    }
    if finished {
        let bonus = completion_bonus(s.minutes);
        add(data, "points", bonus);
        add(data, "focusXp", bonus);
        add(data, "totalPointsEarned", bonus);
        let ended = s.ends_at.unwrap_or(now_ms);
        let mut history = data.get("pomodoroHistory").and_then(Value::as_array).cloned().unwrap_or_default();
        history.push(json!({ "id": ended, "completedAt": ended, "durationMinutes": s.minutes }));
        let skip = history.len().saturating_sub(HISTORY_LIMIT);
        data.insert("pomodoroHistory".into(), Value::Array(history.split_off(skip)));
        let result = json!({
            "minutes": s.minutes,
            "gained": s.minutes * POINTS_PER_MINUTE + bonus,
            "bonus": bonus,
            "tickets": s.tickets,
            "at": ended,
        });
        data.insert("focusResult".into(), result.clone());
        data.remove("focusSession");
        out.done = Some(result);
        out.changed = true;
    } else if out.changed {
        data.insert("focusSession".into(), s.to_value());
    }
    out
}

/// 다음에 볼 일이 생길 때까지 남은 시간(ms): 다음 1분 지급 또는 종료. 돌아가는 세션이 없으면 None
pub fn next_wake_ms(data: &Map<String, Value>, now_ms: i64) -> Option<i64> {
    let s = session(data).filter(Session::running)?;
    let remaining = s.remaining(now_ms);
    let elapsed = s.total_ms() - remaining;
    let next_minute = (s.awarded + 1) * 60_000 - elapsed;
    Some(next_minute.min(remaining).max(0))
}

pub fn start(data: &mut Map<String, Value>, minutes: i64, now_ms: i64) -> bool {
    if session(data).is_some() {
        return false;
    }
    let Some(s) = Session::new(minutes, now_ms) else { return false };
    data.insert("focusSession".into(), s.to_value());
    data.remove("focusResult");
    true
}

pub fn pause(data: &mut Map<String, Value>, now_ms: i64) -> bool {
    let Some(mut s) = session(data).filter(Session::running) else { return false };
    s.remaining_ms = s.remaining(now_ms);
    s.ends_at = None;
    data.insert("focusSession".into(), s.to_value());
    true
}

pub fn resume(data: &mut Map<String, Value>, now_ms: i64) -> bool {
    let Some(mut s) = session(data).filter(|s| !s.running()) else { return false };
    s.ends_at = Some(now_ms + s.remaining(now_ms));
    data.insert("focusSession".into(), s.to_value());
    true
}

pub fn cancel(data: &mut Map<String, Value>) -> bool {
    data.remove("focusSession").is_some()
}

#[cfg(test)]
mod tests {
    use super::*;

    const MIN: i64 = 60_000;

    fn empty() -> Map<String, Value> {
        Map::new()
    }

    fn int(data: &Map<String, Value>, key: &str) -> i64 {
        data.get(key).and_then(Value::as_i64).unwrap_or(0)
    }

    /// 세션을 시작해 끝까지 보내고 번 포인트를 돌려준다
    fn run_full(minutes: i64) -> (Map<String, Value>, i64) {
        let mut data = empty();
        assert!(start(&mut data, minutes, 0));
        advance(&mut data, minutes * MIN);
        let points = int(&data, "points");
        (data, points)
    }

    #[test]
    fn bonus_is_proportional_to_minutes() {
        // 화면의 src/data/balance.test.js 와 같은 표
        for (minutes, bonus) in [(1, 0), (4, 0), (5, 15), (10, 30), (25, 75), (50, 150), (120, 360)] {
            assert_eq!(completion_bonus(minutes), bonus, "{minutes}분");
        }
    }

    #[test]
    fn session_totals_match_the_plan() {
        // 개선안의 예상 결과: 1분 2pt, 25분 125pt, 50분 250pt
        assert_eq!(run_full(1).1, 2);
        assert_eq!(run_full(25).1, 125);
        assert_eq!(run_full(50).1, 250);
    }

    #[test]
    fn short_sessions_never_beat_one_long_session() {
        // 같은 25분을 1분 세션 25번으로 쪼개도 한 번에 한 것보다 많이 받지 못한다
        let mut data = empty();
        let mut now = 0;
        for _ in 0..25 {
            assert!(start(&mut data, 1, now));
            now += MIN;
            advance(&mut data, now);
        }
        assert_eq!(int(&data, "points"), 50);
        assert!(int(&data, "points") <= run_full(25).1);
    }

    #[test]
    fn minutes_are_awarded_as_they_pass() {
        let mut data = empty();
        start(&mut data, 25, 0);
        assert!(!advance(&mut data, 59_999).changed);
        assert!(advance(&mut data, MIN).changed);
        assert_eq!(int(&data, "points"), 2);
        assert_eq!(int(&data, "focusXp"), 2);
        assert_eq!(int(&data, "totalWorkMinutes"), 1);
        // 같은 시각에 다시 불러도 두 번 주지 않는다
        assert!(!advance(&mut data, MIN).changed);
        advance(&mut data, 10 * MIN + 500);
        assert_eq!(int(&data, "points"), 20);
        assert_eq!(session(&data).unwrap().awarded, 10);
    }

    #[test]
    fn completion_clears_session_and_records_real_minutes() {
        let (data, points) = run_full(40);
        assert_eq!(points, 40 * 2 + 120);
        assert!(session(&data).is_none());
        let history = data["pomodoroHistory"].as_array().unwrap();
        assert_eq!(history.len(), 1);
        assert_eq!(history[0]["durationMinutes"], json!(40));
        assert_eq!(data["focusResult"]["gained"], json!(200));
        assert_eq!(data["focusResult"]["minutes"], json!(40));
        assert_eq!(int(&data, "focusXp"), 200);
        assert_eq!(int(&data, "totalPointsEarned"), 200);
    }

    #[test]
    fn survives_restart_and_catches_up() {
        // 25분 세션을 3분에 저장하고 앱을 껐다가 한참 뒤에 켠 경우
        let mut data = empty();
        start(&mut data, 25, 1_000);
        advance(&mut data, 1_000 + 3 * MIN);
        let saved = serde_json::to_string(&data).unwrap();

        let mut reloaded: Map<String, Value> = serde_json::from_str(&saved).unwrap();
        assert_eq!(session(&reloaded).unwrap().remaining(1_000 + 10 * MIN), 15 * MIN);
        let out = advance(&mut reloaded, 1_000 + 90 * MIN);
        assert!(out.done.is_some());
        assert_eq!(int(&reloaded, "points"), 125);
        assert_eq!(reloaded["pomodoroHistory"][0]["completedAt"], json!(1_000 + 25 * MIN));
    }

    #[test]
    fn pause_stops_the_clock() {
        let mut data = empty();
        start(&mut data, 10, 0);
        advance(&mut data, 4 * MIN + 30_000);
        assert!(pause(&mut data, 4 * MIN + 30_000));
        assert!(!advance(&mut data, 500 * MIN).changed);
        assert_eq!(int(&data, "points"), 8);
        assert_eq!(next_wake_ms(&data, 500 * MIN), None);
        assert!(resume(&mut data, 500 * MIN));
        // 남은 5분 30초 가운데 30초가 지나면 5분째가 찬다
        advance(&mut data, 500 * MIN + 30_000);
        assert_eq!(int(&data, "points"), 10);
        let out = advance(&mut data, 500 * MIN + 5 * MIN + 30_000);
        assert!(out.done.is_some());
        assert_eq!(int(&data, "points"), 20 + 30);
    }

    #[test]
    fn cancel_keeps_minutes_but_gives_no_bonus() {
        let mut data = empty();
        start(&mut data, 25, 0);
        advance(&mut data, 24 * MIN + 59_000);
        assert!(cancel(&mut data));
        assert_eq!(int(&data, "points"), 48);
        assert!(data.get("pomodoroHistory").is_none());
        assert!(!advance(&mut data, 100 * MIN).changed);
    }

    #[test]
    fn tickets_come_from_focus_minutes_and_cap() {
        let mut data = empty();
        data.insert("encounterTickets".into(), json!(0));
        // 20분 + 20분: 누적 40분이라 한 장, 15분이 다음으로 넘어간다
        start(&mut data, 20, 0);
        advance(&mut data, 20 * MIN);
        assert_eq!(int(&data, "encounterTickets"), 0);
        start(&mut data, 20, 20 * MIN);
        let out = advance(&mut data, 40 * MIN);
        assert_eq!(int(&data, "encounterTickets"), 1);
        assert_eq!(int(&data, "ticketMinutes"), 15);
        assert_eq!(out.done.unwrap()["tickets"], json!(1));
        // 상한
        data.insert("encounterTickets".into(), json!(MAX_TICKETS));
        start(&mut data, 120, 40 * MIN);
        advance(&mut data, 160 * MIN);
        assert_eq!(int(&data, "encounterTickets"), MAX_TICKETS);
    }

    #[test]
    fn existing_progress_is_added_to_not_replaced() {
        let mut data = empty();
        data.insert("points".into(), json!(340));
        data.insert("focusXp".into(), json!(2100));
        data.insert("totalPointsEarned".into(), json!(2100));
        data.insert("totalWorkMinutes".into(), json!(410));
        data.insert("pomodoroHistory".into(), json!([{ "id": 1, "completedAt": 1, "durationMinutes": 25 }]));
        start(&mut data, 25, 0);
        let out = advance(&mut data, 25 * MIN);
        assert_eq!(out.prev_xp, 2100.0);
        assert_eq!(int(&data, "points"), 465);
        assert_eq!(int(&data, "focusXp"), 2225);
        assert_eq!(int(&data, "totalWorkMinutes"), 435);
        assert_eq!(data["pomodoroHistory"].as_array().unwrap().len(), 2);
    }

    #[test]
    fn history_keeps_last_hundred() {
        let mut data = empty();
        let mut now = 0;
        for _ in 0..105 {
            start(&mut data, 1, now);
            now += MIN;
            advance(&mut data, now);
        }
        let history = data["pomodoroHistory"].as_array().unwrap();
        assert_eq!(history.len(), 100);
        assert_eq!(history[99]["completedAt"], json!(105 * MIN));
    }

    #[test]
    fn rejects_bad_input() {
        let mut data = empty();
        assert!(!start(&mut data, 0, 0));
        assert!(!start(&mut data, 121, 0));
        assert!(start(&mut data, 25, 0));
        // 이미 세션이 있으면 새로 시작하지 않는다
        assert!(!start(&mut data, 50, 0));
        assert_eq!(session(&data).unwrap().minutes, 25);
        // 알아볼 수 없는 세션 값은 치우고 보상하지 않는다
        data.insert("focusSession".into(), json!({ "minutes": 999_999, "endsAt": 0 }));
        assert!(advance(&mut data, 10 * MIN).changed);
        assert!(data.get("focusSession").is_none());
        assert_eq!(int(&data, "points"), 0);
    }

    #[test]
    fn clock_going_backwards_does_not_extend_or_reward() {
        let mut data = empty();
        start(&mut data, 25, 100 * MIN);
        // 시계가 한 시간 뒤로 갔다: 남은 시간은 세션 길이를 넘지 않고, 보상도 없다
        assert_eq!(session(&data).unwrap().remaining(40 * MIN), 25 * MIN);
        assert!(!advance(&mut data, 40 * MIN).changed);
    }

    #[test]
    fn huge_ticket_progress_in_file_does_not_overflow() {
        let mut data = empty();
        data.insert("ticketMinutes".into(), json!(1e19));
        data.insert("encounterTickets".into(), json!(1e19));
        start(&mut data, 2, 0);
        advance(&mut data, 2 * MIN);
        assert_eq!(int(&data, "encounterTickets"), MAX_TICKETS);
        assert!((0..TICKET_EVERY_MINUTES).contains(&int(&data, "ticketMinutes")));
    }

    #[test]
    fn malformed_result_is_not_sent_to_the_screen() {
        let mut data = empty();
        data.insert("focusResult".into(), json!({ "minutes": {}, "gained": 1, "bonus": 0, "tickets": 0 }));
        assert_eq!(result(&data), None);
        data.insert("focusResult".into(), json!("x"));
        assert_eq!(result(&data), None);
        let (done, _) = run_full(25);
        assert_eq!(result(&done).unwrap()["gained"], json!(125));
    }

    #[test]
    fn next_wake_is_next_minute_or_end() {
        let mut data = empty();
        assert_eq!(next_wake_ms(&data, 0), None);
        start(&mut data, 2, 0);
        assert_eq!(next_wake_ms(&data, 0), Some(MIN));
        assert_eq!(next_wake_ms(&data, 45_000), Some(15_000));
        advance(&mut data, MIN);
        assert_eq!(next_wake_ms(&data, MIN + 10_000), Some(50_000));
        assert_eq!(next_wake_ms(&data, 3 * MIN), Some(0));
    }
}
