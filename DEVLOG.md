# 개발 로그 — 포켓몬 키우기 데스크탑 앱

## Phase 3: 야생 배틀 시스템 (2025.03.12)

### 1. 프레임 기반 배틀 로그 애니메이션

**문제**: 배틀 시 적과 내 포켓몬의 로그가 동시에 출력되어 누가 어떤 타이밍에 기술을 쓴 건지 구분 불가

**해결**:
- `processTurn()`이 단일 결과 대신 **프레임 배열**을 반환하도록 리팩토링
- 각 프레임은 `{ addLog, wild, player, phase, result }` 구조
- `useEffect` + `setTimeout(500ms)`으로 프레임을 하나씩 재생
- 스피드가 빠른 포켓몬이 먼저 공격 → 로그 → 결과 → 다음 포켓몬 순서

**흐름**: 기술 선택 → phase: `animating` → 0.5초 간격 프레임 재생 → phase: `selecting` (다음 턴)

**수정 파일**: `battleEngine.js`, `useStore.js` (executePlayerMove, advanceBattleFrame), `Battle.jsx`

---

### 2. 포켓몬센터 탭

**내용**: 배틀과 설정 사이에 새 탭 추가

- `PokeCenter.webp` 이미지 표시
- HP/PP 상태 표시 + 회복 버튼 (20pt 소모)
- 회복 후 2초간 "원기를 회복했다!" 메시지
- 탭 전환 시 이미지 사라지는 버그 → `display: none` 방식으로 해결 (항상 마운트)

**수정 파일**: `PokeCenter.jsx` (신규), `Panel.jsx`

---

### 3. 포인트 경제 시스템

**설계 의도**: 배틀과 회복의 빈도를 적절히 제한

| 행동 | 포인트 |
|------|--------|
| 야생 조우 | -10pt |
| 배틀 승리 | +30pt |
| 센터 회복 | -20pt |
| 순수익 (승리+회복) | ±0pt |

- HP 0일 때 조우 불가 (버튼 비활성화)
- 포인트 부족 시 조우/회복 불가
- 패배 시 "다시 조우" 버튼 숨김 → 닫기만 가능

**수정 파일**: `useStore.js` (startWildBattle, healAtCenter), `Battle.jsx`, `PokeCenter.jsx`

---

### 4. 용의분노(Dragon Rage) 수정

**문제**: `power: null` + `category: '특수'`로 설정되어 데미지/변화 어느 분기에도 안 걸림 → 아무 피드백 없음

**해결**: `fixedDamage: 40` 속성 추가 + 데미지 계산 분기에 `if (moveData.fixedDamage)` 처리
- 스탯/타입 상성 무시, 고정 40 데미지

**수정 파일**: `pokemon.js` (3곳 용의분노 항목), `battleEngine.js`

---

### 5. 타입 상성 피드백

**추가된 메시지**:
- "효과는 굉장했다!" (typeEff > 1)
- "효과가 별로인 것 같다..." (typeEff < 1)
- "효과가 없다!" (typeEff === 0)
- "빗나갔다!" (명중 실패)

**수정 파일**: `battleEngine.js`, `typeChart.js` (18타입 상성 테이블)

---

### 6. 스탯 단계(Stat Stage) 시스템

**배경**: 울음소리, 꼬리흔들기, 겁나는얼굴 등 변화 기술이 MOVE_META에 미등록 → 전부 "효과가 없는 것 같다..."

**구현 내용**:

#### 핵심 함수
```
getStageMultiplier(stage)    // +N → (2+N)/2, -N → 2/(2-N)
getAccEvaMultiplier(stage)   // +N → (3+N)/3, -N → 3/(3-N)
getEffectiveStat(battler, statName)  // base × multiplier
applyStatChanges(battler, changes, name)  // 불변성 유지 + ±6 클램핑
```

#### 지원 기술 목록

| 기술 | 효과 | 대상 |
|------|------|------|
| 울음소리 | 공격 -1 | 상대 |
| 꼬리흔들기 | 방어 -1 | 상대 |
| 겁나는얼굴 | 스피드 -2 | 상대 |
| 애교부리기 | 공격 -2 | 상대 |
| 껍질에숨기 | 방어 +1 | 자신 |
| 성장 | 공격 +1, 특수공격 +1 | 자신 |
| 철벽 | 방어 +2 | 자신 |
| 연막 | 명중률 -1 | 상대 |
| 모래뿌리기 | 명중률 -1 | 상대 |
| 달콤한향기 | 회피율 -2 | 상대 |
| 그림자분신 | 회피율 +1 | 자신 |

#### 특수 기술

| 기술 | 효과 |
|------|------|
| 울부짖기 | 배틀 즉시 종료 (flee_roar) |
| 광합성 | HP 50% 회복 |
| 잠자기 | HP 전회복 + 수면 2턴 |
| 아픔나누기 | 양쪽 HP 평균화 |

#### 설계 원칙
- stages는 `wildBattle` 객체 내부에만 존재 → 배틀 종료 시 자동 소멸
- `petStats`에는 저장하지 않음 (영구 적용 안 됨)
- ±6 범위 클램핑 + 한계 도달 시 메시지
- `accuracy: null` → 항상 명중 (자가 버프 기술)
- 명중률 체크: `moveAcc × (공격측 명중률 배율 / 방어측 회피율 배율)`

**수정 파일**: `battleEngine.js`, `pokemon.js` (MOVE_META 16개 추가), `Battle.jsx` (스탯 변화 태그 표시)

---

### 7. 코드 리뷰 후 버그 수정

| 이슈 | 수정 |
|------|------|
| 아픔나누기 후 HP 0 미체크 | 양쪽 HP 0 이하 체크 + `Math.max(0, ...)` 추가 |
| 미사용 `getMoveAccuracy` 함수 | dead code 제거 |

---

### 8. UI 개선

- 스탯창 텍스트 가독성: 어두운 회색(#444/#555) → 밝은 색(#aaa/#bbb/#eee)으로 변경
- 배틀 스프라이트 크기: `Math.round(getWinSize(speciesId) * 0.56)` — 스탯창과 동일
- 스탯창 "포켓몬센터" 버튼 제거 → 센터 탭으로 통합
- 해골 이모지 제거

---

### 9. 야생 포켓몬 픽셀아트 추가 (진행 중)

**대상 포켓몬**:

| dexNum | 포켓몬 | stage | sleep |
|--------|--------|-------|-------|
| 16 | 구구 | 1 | O |
| 17 | 피죤 | 2 | O |
| 18 | 피죤투 | 3 | O |
| 25 | 피카츄 | 1 | - |
| 26 | 라이츄 | 2 | - |
| 92 | 고오스 | 1 | - |
| 93 | 고우스트 | 2 | - |
| 94 | 겐가르 | 3 | - |
| 133 | 이브이 | 1 | - |
| 143 | 잠만보 | 1 | - |

**작업 과정**:
1. PNG 준비 (pixel-art-source/normal/, sleep/)
2. convert.py로 JS 그리드 변환 (stage3는 32열 고정)
3. anims 파일 합치기 (COLORS + BASE_BODY + SLEEP_COLORS + SLEEP_BODY)
4. outline 색상 `#191919`로 통일
5. PetCanvas.jsx / PokemonStats.jsx / Battle.jsx에 import 등록
6. 진화 단계(STAGE2/STAGE3) 등록
7. 미리보기 서버로 확인
8. 빌드 확인

**이슈**: sleep/18.png 해상도가 달라 69×64로 변환됨 → 리사이즈 후 32×29로 정상 변환

---

## 커밋 히스토리

| 커밋 | 내용 |
|------|------|
| `b26bb78` | feat: Phase 3 야생 배틀 시스템 구현 (WIP) |
| `ab229ec` | feat: 배틀 시스템 대폭 개선 — 프레임 애니메이션, 스탯 단계, 포켓몬센터 |
| `0a0e5c8` | fix: 아픔나누기 HP 0 체크 추가 + 미사용 getMoveAccuracy 제거 |

**PR**: [#25](https://github.com/ESeungJun/poketmon_idle/pull/25) — feat: Phase 3 야생 배틀 시스템 완성 (Merged)
