# Desktop Pet 로드맵

## Phase 1 — 기반 완성 (완료)

- [x] 진입 시 패널 창만 표시, 펫 창은 포켓몬 선택 후 등장
- [x] 스타터를 꼬부기 · 파이리 · 이상해씨 3종으로 교체 (팬텀 제거)
- [x] 꼬부기 도트 애니메이션 (idle / happy / sleeping)
- [x] 파이리 도트 애니메이션 (idle / happy / sleeping)
- [x] 이상해씨 도트 애니메이션 (idle / happy / sleeping)
- [x] 레벨업 · 진화 로직 (evolveAt / evolveTo / confirmEvolution)
- [x] 집중모드 중 sleeping 상태로 전환, 종료 시 idle 복귀
- [x] IPC 보안 강화 (allowlist, sendSync 제거, 리스너 cleanup)
- [x] 브랜치 전략 (master / dev / feature/* + pre-push hook)

---

## Phase 2 — 진화형 · 야생 포켓몬 도트 완성

> 도트 제작은 사용자가 직접 PNG 제작 → `pixel-art-source/convert.py`로 JS 변환.
> 코드 작업: 변환된 파일을 `*-anims.js`로 등록하고 `PIXEL_ART` 맵에 연결.
>
> **선결 조건**: 진화형 도트가 없으면 진화 후 빈 화면 표시됨.
> 야생 포켓몬 도트는 Phase 3 배틀/배회 연출에 필요.

### 진화형 (스타터 3종 진화 라인)
- [x] 이상해풀(ivysaur) — BASE_BODY / COLORS / SLEEP_BODY / SLEEP_COLORS
- [x] 이상해꽃(venusaur)
- [x] 리자드(charmeleon)
- [x] 리자몽(charizard)
- [x] 어니부기(wartortle)
- [x] 거북왕(blastoise)

### 야생 포켓몬 (pokemon.js DB에 데이터 이미 존재)
- [x] 구구(pidgey) / 피죤(pidgeotto) / 피죤투(pidgeot)
- [x] 고오스(gastly) / 고우스트(haunter) / 팬텀(gengar)
- [x] 이브이(eevee)
- [x] 잠만보(snorlax)
- [x] 피카츄(pikachu) / 라이츄(raichu)

---

## Phase 3 — 야생 포켓몬 조우 & 배틀

> **아키텍처 확정**:
> - 별도 오버레이 창 없음
> - 집중 타이머 완료 시 시스템 알림 + 펫 말풍선 (패널 자동 오픈은 방해가 되어 넣지 않는다). 배틀은 집중으로 얻은 조우권으로 한다
> - 배틀: 기술 선택 UI, 타입상성, 명중률, 상태이상 모두 포함

### 3-1. 데이터 확장 (pokemon.js / items.js)
- [x] 기술 데이터에 `accuracy`, `statusEffect` 필드 추가 (`MOVE_META` 맵으로 구현)
  - `statusEffect`: `{ type: 'burn'|'poison'|'paralysis'|'sleep'|'freeze', chance: 0~1 }`
- [x] 18타입 상성 테이블 구현 (`src/data/typeChart.js`)
- [x] 야생 포켓몬 등장 레벨 범위 정의 (`WILD_POOL`, `pickWildEncounter` — 내 레벨 ±3)

### 3-2. 배틀 상태 관리 (store)
- [x] `wildBattle` 상태 추가 (in-memory, 미영속):
  ```
  { wild, player, turn, phase, log, result }
  ```
- [x] 배틀 시작(`startWildBattle`) / 턴 실행(`executePlayerMove`) / 도망(`fleeFromBattle`) / 닫기(`dismissBattle`) 액션

### 3-3. 배틀 로직
- [x] 데미지 계산: `기술 위력 × (공격 / 방어) × 타입상성 × 0.5`
- [x] 명중률: `Math.random() < move.accuracy` 로 빗나감 처리
- [x] 상태이상 적용: 기술의 `statusEffect.chance` 확률로 발동
- [x] 상태이상 턴 효과:
  - 화상(burn): 매 턴 최대 HP의 1/16 감소
  - 독(poison): 매 턴 최대 HP의 1/8 감소
  - 마비(paralysis): 25% 확률로 행동 불능
  - 잠듦(sleep): 1~3턴 행동 불능 후 자동 해제
  - 얼음(freeze): 20% 확률로 해제될 때까지 행동 불능
- [x] 내 기술 선택 → 데미지/상태 적용 → 상대 랜덤 기술 자동 반격 → 턴 반복
- [x] 배틀 종료: 승리(포인트 10 + 야생 레벨×1.5) / 패배(배틀 종료) / 도망

### 3-4. 배틀 UI (패널 탭)
- [x] 야생 포켓몬 도트 + HP바 + 상태이상 뱃지
- [x] 내 포켓몬 도트 + HP바 + 상태이상 뱃지
- [x] 기술 선택 버튼 4개 (위력 / 타입 색상 표시)
- [x] 도망 버튼
- [x] 턴 로그 텍스트 (빗나감 / 효과 굉장 / 상태이상 적용 등)

---

## Phase 4 — 포획 & 보관함

> **전제 조건**: Phase 3 완료 (wildBattle.wildHP 추적 필요)

- [x] 상점에 몬스터볼 추가 (일반볼 / 슈퍼볼 / 하이퍼볼, 가격 차등)
- [x] 볼 투척 → HP 비례 × 볼 종류 보정 포획 확률 계산
- [x] 포획 성공 / 실패 연출 (볼 흔들림 애니메이션 + 야생 반격)
- [x] store에 `caughtPokemon[]` + `ballInventory` 추가
- [x] 보관함(Box) 탭 UI — 잡은 포켓몬 도트 + 닉네임 + 레벨 목록
- [x] 보관함에서 파트너 포켓몬 교체 기능
- [x] 닉네임 개별 포켓몬 귀속 (교체 시 함께 이동)
- [x] 배틀 중 포켓몬센터 회복 차단
- [x] 진화 시 진화형 기술 자동 습득 (learnedPool 확장)
- [x] 진화 레벨 초과 상태에서도 레벨업 시 진화 트리거
- [x] 진화 전 종 기술이 진화 후에도 정상 표시/사용 가능

---

## Phase 5 — 마무리 & 품질

- [x] 전체 밸런스 조정 (레벨업 XP 곡선, 배틀 데미지 스케일, 포획 확률)
- [x] 버그 수정 및 엣지 케이스 처리
- [x] 앱 아이콘 · 패키징 최적화
- [x] Electron → Tauri 전환 (설치 파일 맥 198MB → 4MB, 윈도우 92MB → 1.4MB, 기존 저장 데이터 자동 이전)
- [x] 자동 업데이트 (GitHub 릴리스 latest.json, 미리 받아 두고 트레이 메뉴에서 설치)

---

## Phase 6 — 점검 반영 (2026-11)

- [x] 깨진 저장 파일을 덮어쓰지 않고 보존, 직전 사본에서 복구, 설정 탭 "백업에서 되돌리기"
- [x] 저장 구조 버전(`schemaVersion`)과 마이그레이션, 여러 키 한 번에 쓰기
- [x] 완료 보너스를 집중 시간에 비례하게 (분 × 3, 5분 미만 없음)
- [x] 레벨은 집중 포인트(`focusXp`)로만, 배틀은 조우권으로
- [x] 집중 타이머를 Rust 로 (종료 시각 저장, 재시작해도 이어짐), 완료 알림과 결과 말풍선, 트레이에서 시작·중단
- [x] 지니기 아이템 6종 배틀 효과, 나머지 4종은 "준비 중"
- [x] 펫이 걷다가 서 있는 구간, 서 있는 동안 반복 작업 휴면
- [x] 집중 기록(최근 7일·연속 일수), 도감
- [x] 테스트: `npm test`(vitest), `cargo test`, CI 연결
- [ ] 지니기 아이템 나머지 4종(구애안경·구애스카프·기합의띠·검은진흙) 효과
- [ ] 개체별 성장 (포켓몬마다 레벨·경험치)
- [ ] 연속 집중 보너스

---

> 완료된 항목은 `- [ ]` → `- [x]` 로 변경
> 각 Phase는 이전 Phase 완료 후 진행 (특히 Phase 3→4는 의존성 강함)
