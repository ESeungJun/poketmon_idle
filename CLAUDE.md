# Desktop Pet — Claude 작업 가이드

## 핵심 파일
| 파일 | 역할 |
|------|------|
| `src-tauri/src/lib.rs` | Rust: 창 2개(pet·panel), 트레이, 저장소, 명령, wander/drag 로직 |
| `src-tauri/tauri.conf.json` | 앱 이름·식별자·아이콘·번들·CSP |
| `src/platform/tauri.js` | Tauri 명령·이벤트 → `window.electronAPI` (예전 preload와 같은 모양) |
| `src/App.jsx` | 라우팅: `window.__POKE_VIEW__` (`pet` / `panel`, Rust가 창마다 주입) |
| `src/store/useStore.js` | Zustand: points, items, petState |
| `src/data/pokemon.js` | 포켓몬 종 데이터 (스탯, 기술, 진화 정보) |
| `src/components/Pet/PetCanvas.jsx` | Canvas 애니메이션 루프 (PixelArtCanvas / sprite img 분기) |
| `src/components/Pet/pokemonDraw.js` | `drawPokemon`, `DEFAULT_ANIMATIONS` |
| `src/components/Panel/PomodoroTimer.jsx` | 집중모드 타이머 (wall-clock 기반) |
| `src/components/Panel/PokemonStats.jsx` | 포켓몬 스탯·기술 관리 |
| `src/components/Panel/StarterSelect.jsx` | 스타터 포켓몬 선택 UI |
| `src/components/Panel/Box.jsx` | 보관함 UI (잡은 포켓몬 목록, 파트너 교체, 놓아주기) |
| `src/components/Shop/items.js` | 아이템 카탈로그 |
| `src/data/typeChart.js` | 18타입 상성 테이블 (`getTypeEffectiveness`) |
| `src/data/battleEngine.js` | 배틀 순수 로직: 스탯 계산, 데미지, 상태이상, `processTurn`, 포획 확률 |

## 기술 스택
Tauri 2 (Rust, 시스템 웹뷰: 맥 WebKit · 윈도우 WebView2) · React 18 + Vite 5 · Zustand 4 · `config.json`(Rust에서 직접 저장) · HTML Canvas (`imageRendering: pixelated`)

## 창 구성
- Pet 창: 진화 단계별 `100×100` / `120×120` / `160×160px`, 투명·장식 없음·그림자 없음·항상 위 (맥은 `macOSPrivateApi` 필요)
- Panel 창: `380×580px`
- 두 창은 `emitTo(다른 창, 'state-sync')` 이벤트로 상태 동기화
- 스타터 미선택 시 Pet 창 숨김 (`petSpeciesId` 없으면 `null` 반환)

## 크로스플랫폼 원칙
macOS + Windows 동시 지원. 코드 작성 시 항상 양쪽을 고려한다.

- macOS 전용 처리(모든 데스크톱·전체화면 위 표시 등)는 Rust에서 `#[cfg(target_os = "macos")]` 가드 필수
- 경로는 `PathBuf::join` / Tauri `app.path()` 사용 (하드코딩 금지)
- 웹뷰가 OS마다 다르다(맥 WebKit, 윈도우 크로미움). CSS·캔버스 변경은 양쪽에서 확인
- hooks·스크립트 node 경로: `PATH="$PATH:/c/Program Files/nodejs:/usr/local/bin:/opt/homebrew/bin" node`

## 빌드 & 실행

`빌드해줘` 기본값은 `npm run dev`. `npm run build`(릴리즈)는 명시 요청 시에만.

```bash
npm run dev      # 로컬 (Vite HMR + Tauri 창). Rust 필요
npm run build    # 릴리즈 빌드 — 명시 요청 시에만
```

앱 실행 전 기존 프로세스 먼저 종료:
- **macOS**: `pkill -f "MacOS/poketmon-idle"; sleep 1; open "src-tauri/target/release/bundle/macos/포켓몬키우기.app"`
- **Windows**: `powershell -Command "Stop-Process -Name 'poketmon-idle' -Force -ErrorAction SilentlyContinue"; sleep 2 && start "" "src-tauri/target/release/poketmon-idle.exe"`
- 릴리스: `package.json`·`src-tauri/Cargo.toml` 버전을 올리고 `v<버전>` 태그 push → `release.yml`이 초안 릴리스(설치 파일 + 자동 업데이트용 `latest.json`)를 만든다. 공개(Publish)해야 앱의 자동 업데이트가 받는다.
- 자동 업데이트 서명 키: 비밀 키는 `~/.tauri/poketmon-idle.key`(+ `.password`)와 GitHub Secrets `TAURI_SIGNING_PRIVATE_KEY`·`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`. 잃어버리면 기존 설치본에 업데이트를 보낼 수 없다.
- Rust가 없는 Mac에서는 브랜치를 push 하면 Actions `Build`가 서명 없는 dmg·exe를 결과물로 남긴다(`gh run download`).

코드 수정 후 PR 전 절차: **빌드 → 실행 확인 → 사용자 확인 → PR 생성**
> dev 직접 push도 사용자 확인 후 진행.

## IPC 규칙
- 화면은 `window.electronAPI`만 부른다. 새 기능은 `src-tauri/src/lib.rs`에 `#[tauri::command]`를 만들고 `generate_handler!`와 `src/platform/tauri.js`에 같이 추가
- 이벤트 리스너는 반드시 해제 함수 반환 (메모리 누수 방지)
- store 키 allowlist: `ALLOWED_STORE_KEYS` (lib.rs) — 미허가 키 차단
- 상태 변경 시 `sendStateUpdate` 호출로 다른 창에 동기화

## petState
- `idle` — 기본 (wandering 활성)
- `happy` — 포인트 획득 시 2초간
- `sleeping` — 집중모드 실행 중 (wandering 비활성)
- `evolving` — 진화 연출 3초간

## 기타 아키텍처 규칙
- **타이머**: `setInterval` 틱 카운팅 금지 → `Date.now()` wall-clock 기반 (웹뷰 스로틀링 우회)
- **멀티모니터 드래그**: drag 시작 시 모든 데스크톱 표시를 끄고(맥), 종료 시 다시 켠다. 좌표는 모두 물리 px로 계산하고 모니터 배율(scale_factor)로 논리 px와 바꾼다.

## 픽셀아트 시스템

### anims 파일 구조
각 포켓몬 `*-anims.js`에서 export: `COLORS`, `SLEEP_COLORS`, `BASE_BODY`, `SLEEP_BODY`

PetCanvas 렌더링 분기:
1. `PIXEL_ART` 맵(`pixelArtRegistry.js`)에 `speciesId` 있으면 → `PixelArtCanvas` (커스텀 도트)
2. `dexNum` 있으면 → PokeAPI CDN 스프라이트 img 태그
3. 둘 다 없으면 → `null`

> `animations.js` (레거시)는 삭제됨. 신규 포켓몬은 `*-anims.js` 추가 후 `pixelArtRegistry.js`의 `PIXEL_ART` 맵에 등록.

### 작성 규칙
- outline 색상: `'#191919'` 고정 (모든 anims 파일 통일)
- 외곽 픽셀 (null과 맞닿는 픽셀): `'body'` 대신 `'outline'`
- 그리드: stage1/2는 20×20 내외, stage3는 32열 고정 (rows는 스프라이트에 맞게)
  - 6-anims.js (리자몽): 32×27 / 3-anims.js (이상해꽃): 32×25 / 9-anims.js (거북왕): 32×29

### 미리보기 서버
```bash
cd pixel-art-source && node generate-preview.js   # → http://localhost:3131
```
anims 파일 수정 후 F5 새로고침으로 즉시 반영. 픽셀 hover 시 좌표·색상키 표시.

## 새 포켓몬 추가
전체 과정은 `/add-pokemon-sprite` 스킬로 진행.

**창 크기**: stage1 = 100px / stage2 = 120px / stage3 = 160px
진화 시 `petSpeciesId` 변경 → `App.jsx` `resizePetWindow` useEffect가 자동 조정.

**진화 시 petStats 보존**: `confirmEvolution`은 `speciesId`만 교체. `natureName`, `abilityName`, `ivs`, `moves`, `learnedPool` 유지.

**스탯창 이미지**: `size={Math.round(getWinSize(petSpeciesId) * 0.56)}` (stage1=56px / stage2=67px / stage3=90px)

## 현재 등록된 포켓몬
| speciesId | 파일 | 단계 |
|-----------|------|------|
| bulbasaur | 1-anims.js | stage1 |
| charmander | 4-anims.js | stage1 |
| squirtle | 7-anims.js | stage1 |
| ivysaur | 2-anims.js | stage2 |
| charmeleon | 5-anims.js | stage2 |
| wartortle | 8-anims.js | stage2 |
| venusaur | 3-anims.js | stage3 |
| charizard | 6-anims.js | stage3 |
| blastoise | 9-anims.js | stage3 |
| pidgey | 16-anims.js | stage1 |
| pidgeotto | 17-anims.js | stage2 |
| pidgeot | 18-anims.js | stage3 |
| pikachu | 25-anims.js | stage1 |
| raichu | 26-anims.js | stage2 |
| gastly | 92-anims.js | stage1 |
| haunter | 93-anims.js | stage2 |
| gengar | 94-anims.js | stage3 |
| eevee | 133-anims.js | stage1 |
| snorlax | 143-anims.js | stage3 |

## 브랜치 전략
- `master` — 프로덕션 (직접 push 불가)
- `dev` — 통합 브랜치 (직접 push 불가)
- `feature/*` — 작업 브랜치. `bash scripts/new-feature.sh <name>`으로 생성

## PR 전 체크리스트
- `ROADMAP.md`: 완료 항목 `[ ]` → `[x]`, 신규 항목 추가
- `CLAUDE.md`: 새 포켓몬·핵심 파일 추가 시 표 업데이트
- 문서 업데이트는 기능 커밋에 함께 포함 (별도 커밋 불필요)

## 포켓몬 데이터 규칙

포켓몬 이름·기술·아이템·타입·스탯 추가·수정 시 **반드시 `pokemon-expert` 에이전트로 검증**. 기억·추측으로 작성 금지.

- 이름·기술명·아이템명 → `/verify-pokemon-ko` 스킬 또는 `pokemon-expert` 에이전트
- **한국어 기준**: PokeAPI `"ko"` 항목 (직역·영어 음차·일본어 음차 금지. 예: `보디슬램` ❌ → `누르기` ✓)
- **기술 데이터 기준**: 7세대(USUM). 에이전트 요청은 포켓몬별 분리 금지, 한 번에 몰아서.

## 작업 스타일
- 요청한 것만 수정. 불필요한 리팩터링·주석·타입 추가 금지.
- 코드 읽기 전에 수정 제안 금지.
- 빌드 결과(성공/실패) 항상 보고.

### 코드 리뷰 (필수)
코드 수정 후 반드시 리뷰 출력:
- **변경 요약**: 무엇을 왜 바꿨는지
- **핵심 로직**: 동작 방식 (복잡한 로직은 단계별)
- **부작용 / 주의사항**: 다른 코드 영향, 엣지 케이스
- **검증**: 빌드·실행으로 확인한 내용

단순 텍스트·스타일 변경은 간략하게, 로직·IPC·상태 흐름 변경은 상세하게.
