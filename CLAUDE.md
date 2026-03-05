# Desktop Pet — Claude 작업 가이드

## 프로젝트 개요
데스크탑 위에 항상 떠있는 픽셀아트 캐릭터(겐가르) 키우기 앱.
뽀모도로 타이머·할일 완료로 포인트를 모아 아이템 샵에서 캐릭터를 꾸밀 수 있다.

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
| `src/components/Pet/animations.js` | 20×20 픽셀 그리드, ANIMATIONS, ITEM_OVERLAYS, drawFrame |
| `src/components/Pet/PetCanvas.jsx` | Canvas 애니메이션 루프 |
| `src/components/Panel/PomodoroTimer.jsx` | 뽀모도로 타이머 (wall-clock 기반) |
| `src/components/Shop/items.js` | 아이템 카탈로그 |

## 필수 규칙

### 빌드
코드를 수정한 뒤에는 **반드시** 빌드를 실행한다.
```bash
npm run build
```
빌드 결과물: `release/mac-arm64/desktop-pet.app`

### 창 구성
- Pet 창: 100×100px, `transparent: true`, `backgroundColor: '#00000000'`, `roundedCorners: false`
- Panel 창: 380×580px, 일반 창
- 두 창은 IPC `state-update` / `state-sync` 로 상태 동기화

### 멀티모니터 드래그
- drag 시작: `setVisibleOnAllWorkspaces(false)` → 다른 디스플레이로 `setPosition()` 가능
- drag 종료: `setVisibleOnAllWorkspaces(true)` + `setBackgroundColor('#00000000')` + `force-remount` IPC (보조 디스플레이 흰 배경 방지)

### 타이머
`setInterval` 틱 카운팅 금지 → `Date.now()` wall-clock 기반으로 계산 (패널 숨김 시 Chromium 스로틀링 우회)

## 작업 스타일
- 수정 범위는 요청한 것만. 불필요한 리팩터링·주석·타입 추가 하지 않는다.
- 코드 읽기 전에 수정 제안하지 않는다.
- 답변은 짧고 직관적으로. 긴 설명보다 코드와 결과 중심.
- 빌드 후 결과(성공/실패)를 항상 보고한다.
