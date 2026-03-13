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
- [ ] 구구(pidgey)
- [ ] 고오스(gastly)
- [ ] 이브이(eevee)
- [ ] 잠만보(snorlax)
- [ ] 피카츄(pikachu)

---

## Phase 3 — 야생 포켓몬 조우 & 배틀

> **아키텍처 확정**:
> - 별도 오버레이 창 없음
> - 집중 타이머 완료 시 패널 자동 오픈 + 배틀 탭 전환
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
- [x] 배틀 종료: 승리(포인트 +30) / 패배(배틀 종료) / 도망

### 3-4. 배틀 UI (패널 탭)
- [x] 야생 포켓몬 도트 + HP바 + 상태이상 뱃지
- [x] 내 포켓몬 도트 + HP바 + 상태이상 뱃지
- [x] 기술 선택 버튼 4개 (위력 / 타입 색상 표시)
- [x] 도망 버튼
- [x] 턴 로그 텍스트 (빗나감 / 효과 굉장 / 상태이상 적용 등)

---

## Phase 4 — 포획 & 보관함

> **전제 조건**: Phase 3 완료 (wildBattle.wildHP 추적 필요)

- [ ] 상점에 몬스터볼 추가 (일반볼 / 슈퍼볼 / 하이퍼볼, 가격 차등)
- [ ] 볼 투척 → HP 비례 × 볼 종류 보정 포획 확률 계산
- [ ] 포획 성공 / 실패 연출 (텍스트 + 간단한 애니메이션)
- [ ] store에 `caughtPokemon[]` 추가
- [ ] 보관함(Box) 탭 UI — 잡은 포켓몬 도트 + 이름 + 레벨 목록
- [ ] 보관함에서 파트너 포켓몬 교체 기능

---

## Phase 5 — 마무리 & 품질

- [ ] 전체 밸런스 조정 (레벨업 XP 곡선, 배틀 데미지 스케일, 포획 확률)
- [ ] 버그 수정 및 엣지 케이스 처리
- [ ] 앱 아이콘 · 패키징 최적화

---

> 완료된 항목은 `- [ ]` → `- [x]` 로 변경
> 각 Phase는 이전 Phase 완료 후 진행 (특히 Phase 3→4는 의존성 강함)
