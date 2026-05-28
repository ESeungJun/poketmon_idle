# 개발 로그 — 포켓몬 키우기 데스크탑 앱

---

## Phase 4: 포획 & 보관함 시스템 (완료)

- 상점에 몬스터볼 추가 (일반볼 / 슈퍼볼 / 하이퍼볼, 가격 차등)
- 볼 투척 → HP 비례 × 볼 종류 보정 포획 확률 계산 (`battleEngine.js`)
- 포획 성공 / 실패 연출 (볼 흔들림 애니메이션 + 야생 반격)
- `store`에 `caughtPokemon[]` + `ballInventory` 추가
- 보관함(Box) 탭 UI — 잡은 포켓몬 도트 + 닉네임 + 레벨 목록
- 파트너 교체 기능 (닉네임 개별 포켓몬 귀속)
- 배틀 중 포켓몬센터 회복 차단
- 진화 시 진화형 기술 자동 습득 (`learnedPool` 확장)
- 진화 레벨 초과 상태에서도 레벨업 시 진화 트리거

**PR**: [#29](https://github.com/ESeungJun/poketmon_idle/pull/29)

---

## Phase 3: 야생 배틀 시스템 (완료)

### 프레임 기반 배틀 로그 애니메이션

**문제**: 배틀 시 적과 내 포켓몬의 로그가 동시에 출력되어 타이밍 구분 불가

**해결**:
- `processTurn()`이 단일 결과 대신 **프레임 배열** 반환 (`{ addLog, wild, player, phase, result }`)
- `useEffect` + `setTimeout(500ms)`으로 프레임을 하나씩 재생
- 스피드 빠른 포켓몬 먼저 공격 → 로그 → 결과 순서

---

### 포켓몬센터 탭

- `PokeCenter.webp` 이미지 + HP/PP 상태 + 회복 버튼 (20pt)
- 탭 전환 시 이미지 사라지는 버그 → `display: none` 방식으로 해결

---

### 포인트 경제 시스템

| 행동 | 포인트 |
|------|--------|
| 야생 조우 | -10pt |
| 배틀 승리 | +30pt |
| 센터 회복 | -20pt |

- HP 0이면 조우 불가, 포인트 부족 시 조우/회복 불가
- 패배 시 "다시 조우" 버튼 숨김

---

### 스탯 단계(Stat Stage) 시스템

```
getStageMultiplier(stage)    // +N → (2+N)/2, -N → 2/(2-N)
getAccEvaMultiplier(stage)   // +N → (3+N)/3, -N → 3/(3-N)
getEffectiveStat(battler, statName)
applyStatChanges(battler, changes, name)  // ±6 클램핑
```

지원 기술: 울음소리(공-1), 꼬리흔들기(방-1), 겁나는얼굴(스피드-2), 껍질에숨기(방+1), 성장(공+1/특공+1), 철벽(방+2) 등

특수 기술: 울부짖기(배틀 종료), 광합성(HP 50% 회복), 잠자기(전회복+수면 2턴), 아픔나누기(양쪽 평균화)

- stages는 `wildBattle` 내부에만 존재 → 배틀 종료 시 자동 소멸
- `accuracy: null` → 항상 명중 (자가 버프 기술)

---

### 용의분노 수정
`fixedDamage: 40` 속성 추가 → 스탯/타입 상성 무시, 고정 40 데미지

### 타입 상성 피드백
"효과는 굉장했다!" / "효과가 별로인 것 같다..." / "효과가 없다!" / "빗나갔다!"

### 버그 수정
- 아픔나누기 후 HP 0 미체크 → `Math.max(0, ...)` + 양쪽 체크 추가
- 미사용 `getMoveAccuracy` 함수 제거

**PR**: [#25](https://github.com/ESeungJun/poketmon_idle/pull/25)
