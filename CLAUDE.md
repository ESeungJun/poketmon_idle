# Desktop Pet — Claude 작업 가이드

## 프로젝트 개요
데스크탑 위에 항상 떠있는 픽셀아트 포켓몬 키우기 앱.
집중모드(타이머)·할일 완료로 포인트를 모아 아이템 샵에서 캐릭터를 꾸밀 수 있다.
스타터 포켓몬(이상해씨/파이리/꼬부기) 중 하나를 선택해 레벨업·진화시킨다.

## 기술 스택
- **Electron 28** — 투명 frameless 창, always-on-top, 멀티모니터
- **React 18 + Vite 5** — UI
- **Zustand 4** — 전역 상태
- **electron-store 8** — 데이터 영구 저장 (메인 프로세스)
- **HTML Canvas** — 픽셀아트 렌더링 (`imageRendering: pixelated`)

## 핵심 파일
| 파일 | 역할 |
|------|------|
| `electron/main.js` | 메인 프로세스: BrowserWindow 2개, IPC, wander/drag 로직 |
| `electron/preload.js` | contextBridge → `window.electronAPI` |
| `src/App.jsx` | 라우팅: `?view=pet` / `?view=panel` |
| `src/store/useStore.js` | Zustand: points, items, todos, petState |
| `src/data/pokemon.js` | 포켓몬 종 데이터 (스탯, 기술, 진화 정보) |
| `src/components/Pet/pokemonDraw.js` | `drawPokemon`, `DEFAULT_ANIMATIONS` |
| `src/components/Pet/PetCanvas.jsx` | Canvas 애니메이션 루프 (PixelArtCanvas / sprite img 분기) |
| `src/components/Pet/bulbasaur-anims.js` | 이상해씨 픽셀 데이터 (BASE_BODY, COLORS, SLEEP_BODY, SLEEP_COLORS) |
| `src/components/Pet/charmander-anims.js` | 파이리 픽셀 데이터 |
| `src/components/Pet/squirtle-anims.js` | 꼬부기 픽셀 데이터 |
| `src/components/Panel/PomodoroTimer.jsx` | 집중모드 타이머 (wall-clock 기반) |
| `src/components/Panel/StarterSelect.jsx` | 스타터 포켓몬 선택 UI |
| `src/components/Panel/PokemonStats.jsx` | 포켓몬 스탯·기술 관리 |
| `src/components/Shop/items.js` | 아이템 카탈로그 |

## 크로스플랫폼 원칙
이 프로젝트는 **macOS와 Windows 두 환경을 동시에 지원**한다. 코드 작성 시 항상 양쪽을 고려한다.

- macOS 전용 Electron API(`setVisibleOnAllWorkspaces`, `roundedCorners` 등)는 `process.platform !== 'win32'` 가드 필수
- macOS 전용 shell 명령어(`codesign`, `PlistBuddy`, `pkill`, `open` 등)는 `process.platform !== 'darwin'` 가드 또는 플랫폼 분기 처리
- 경로 구분자는 `path.join()`/`path.sep` 사용 (하드코딩 금지)
- hooks·스크립트의 node 경로: `PATH="$PATH:/c/Program Files/nodejs:/usr/local/bin:/opt/homebrew/bin" node`

## 필수 규칙

### 빌드
코드를 수정한 뒤에는 **반드시** 빌드 후 앱을 실행한다.
```bash
npm run build
```
빌드 결과물: `release/mac-universal/poketmon-idle.app`

앱을 실행할 때는 기존 프로세스를 먼저 종료한다.
```bash
pkill -f "poketmon-idle"; sleep 1; open "release/mac-universal/poketmon-idle.app"
```


### 창 구성
- Pet 창: 100×100px, `transparent: true`, `backgroundColor: '#00000000'`, `roundedCorners: false`
- Panel 창: 380×580px, 일반 창
- 두 창은 IPC `state-update` / `state-sync` 로 상태 동기화
- 스타터 미선택 시 Pet 창은 표시하지 않음 (`petSpeciesId` 없으면 `null` 반환)

### IPC 규칙
- `ipcRenderer.sendSync` 사용 금지 → 반드시 `ipcRenderer.invoke` (async)
- `ipcRenderer.on` 등록 시 반드시 cleanup 함수 반환 (메모리 누수 방지)
- store 키 allowlist: `ALLOWED_STORE_KEYS` (main.js) — 미허가 키 접근 차단
- 상태 변경 시 `sendStateUpdate` 호출로 다른 창에 동기화

### petState 종류
- `idle` — 기본 상태 (wandering 활성)
- `happy` — 포인트 획득 시 2초간
- `sleeping` — 집중모드 타이머 실행 중 (wandering 비활성)
- `evolving` — 진화 연출 3초간

### 멀티모니터 드래그
- drag 시작: `setVisibleOnAllWorkspaces(false)` → 다른 디스플레이로 `setPosition()` 가능
- drag 종료: `setVisibleOnAllWorkspaces(true)` + `setBackgroundColor('#00000000')` + `force-remount` IPC (보조 디스플레이 흰 배경 방지)
- `cachedDisplay`: wander 루프에서 디스플레이 재계산 최소화 (경계 ±20px에서만 갱신)

### 타이머
`setInterval` 틱 카운팅 금지 → `Date.now()` wall-clock 기반으로 계산 (패널 숨김 시 Chromium 스로틀링 우회)

### 포켓몬 픽셀 데이터 구조
각 포켓몬 anims 파일에서 export:
- `COLORS` / `SLEEP_COLORS` — 색상 팔레트
- `BASE_BODY` — 기본 상태 픽셀 그리드
- `SLEEP_BODY` — 수면(집중모드) 상태 픽셀 그리드

PetCanvas 렌더링 분기:
1. `speciesId`가 `PIXEL_ART` 맵에 있으면 → `PixelArtCanvas` (커스텀 도트)
2. `dexNum`이 있으면 → PokeAPI CDN 스프라이트 img 태그
3. 둘 다 없으면 → `null`

> `animations.js` (겐가르 레거시)는 삭제됨. 신규 포켓몬은 `*-anims.js` 파일 추가 후 `PIXEL_ART` 맵에 등록.

## 브랜치 전략
- `master` — 프로덕션. 직접 push 불가
- `dev` — 통합 브랜치. 직접 push 불가
- `feature/*` — 작업 브랜치. dev에서 분기, PR로 dev에 병합

새 기능 작업:
```bash
bash scripts/new-feature.sh <feature-name>
```

## 포켓몬 한국어 공식 명칭

포켓몬 이름·기술·아이템을 추가하거나 수정할 때는 **반드시 공식 한국어 명칭**을 사용한다.

- 기준: PokeAPI (`https://pokeapi.co/api/v2/move/{move-slug}`) names 배열의 `"ko"` 항목
- 불확실한 경우: `pokemon-expert` 에이전트를 호출하거나 `/verify-pokemon-ko` 스킬을 사용해 검증
- 직역·영어 음차 사용 금지 (예: `보디슬램` ❌ → `누르기` ✓, `헥스` ❌ → `병상첨병` ✓)

주요 수정 이력 (과거 오류 → 공식명):

| 잘못된 이름 | 공식 한국어명 | 영어명 |
|-------------|---------------|--------|
| 보디슬램 | 누르기 | Body Slam |
| 회오리 | 바람일으키기 | Gust |
| 물뿜기 | 거품광선 | Bubble Beam |
| 귀여운부탁 | 애교부리기 | Charm |
| 통증나누기 | 아픔나누기 | Pain Split |
| 고함치기 | 울부짖기 | Roar |
| 헥스 | 병상첨병 | Hex |
| 자화자찬 | 뽐내기 | Swagger |
| 집중펀치 | 힘껏펀치 | Focus Punch |
| 스톤엣지 | 스톤에지 | Stone Edge |
| 폭발 | 대폭발 | Explosion |
| 암석깨기 | 바위깨기 | Rock Smash |
| 진흙폭탄 | 오물폭탄 | Sludge Bomb |
| 검은 철구 | 검은진흙 | Black Sludge |

## 로드맵
작업 전 `ROADMAP.md`를 확인하고, 완료된 항목은 `- [ ]` → `- [x]` 로 업데이트한다.

## 작업 스타일
- 수정 범위는 요청한 것만. 불필요한 리팩터링·주석·타입 추가 하지 않는다.
- 코드 읽기 전에 수정 제안하지 않는다.
- 답변은 짧고 직관적으로. 긴 설명보다 코드와 결과 중심.
- 빌드 후 결과(성공/실패)를 항상 보고한다.

### 코드 리뷰 (필수)
코드를 수정한 뒤에는 **반드시** 수정된 로직에 대한 코드 리뷰를 출력한다.

리뷰 항목:
- **변경 요약**: 무엇을 왜 바꿨는지
- **핵심 로직**: 수정된 부분의 동작 방식 (복잡한 로직은 단계별로 설명)
- **부작용 / 주의사항**: 다른 코드에 미치는 영향, 엣지 케이스
- **검증**: 빌드·실행으로 확인한 내용

단순 텍스트·스타일 변경은 간략하게, 로직·알고리즘·IPC·상태 흐름 변경은 상세하게 작성한다.
