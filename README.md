# 포켓몬 키우기 — Desktop Pet

데스크탑 위에 항상 떠 있는 픽셀아트 포켓몬을 키우는 생산성 앱.
집중모드와 할일 완료로 포인트를 모아 파트너 포켓몬을 성장시킨다.

---

## 주요 기능

### 포켓몬
- **스타터 3종 선택** — 이상해씨 / 파이리 / 꼬부기
- **레벨 시스템** — 포인트 누적으로 레벨업, Gen 1 스탯 공식 적용
- **진화** — 일정 레벨 도달 시 자동 진화 (이상해씨 → 이상해풀 → 이상해꽃 등)
- **기술 학습** — 레벨업 시 Gen 1 기술배치 기반 자동 습득, TM 구매 가능
- **상태 애니메이션** — idle / happy / sleeping / evolving 상태별 픽셀아트
- **EV 강화** — 상점에서 비타민 구매하여 스탯 보정 가능

### 생산성
- **집중모드 타이머** — 25분 집중 / 5분 휴식 사이클, wall-clock 기반 (탭 전환 시에도 정확)
- **포인트 시스템** — 집중 1분당 +1pt / 집중모드 완료 +50pt

### 배틀 & 포획
- **야생 포켓몬 조우** — 레벨 기반 조우, 타입 상성·명중률·상태이상 포함
- **몬스터볼** — 일반볼 / 슈퍼볼 / 하이퍼볼, HP 비례 포획 확률
- **보관함(Box)** — 잡은 포켓몬 목록, 파트너 교체, 닉네임 관리

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 런타임 | Electron 28 |
| UI | React 18 + Vite 5 |
| 상태관리 | Zustand 4 |
| 영구저장 | electron-store 8 |
| 렌더링 | HTML Canvas (`imageRendering: pixelated`) |

---

## 프로젝트 구조

```
poketmon_idle/
├── electron/
│   ├── main.js          # 메인 프로세스: 창 생성, IPC, 배회/드래그 로직
│   └── preload.js       # contextBridge → window.electronAPI
├── src/
│   ├── App.jsx          # 라우팅: ?view=pet / ?view=panel
│   ├── store/
│   │   └── useStore.js  # Zustand 전역 상태
│   ├── data/
│   │   ├── pokemon.js   # 포켓몬 종 데이터, 스탯 공식, 기술 시스템
│   │   ├── battleEngine.js  # 배틀 순수 로직 (데미지, 상태이상, 포획)
│   │   └── typeChart.js     # 18타입 상성 테이블
│   └── components/
│       ├── Pet/
│       │   ├── PetCanvas.jsx        # 캔버스 애니메이션 루프
│       │   ├── pokemonDraw.js       # 픽셀아트 렌더러
│       │   ├── 1-anims.js           # 이상해씨 도트 데이터
│       │   ├── 4-anims.js           # 파이리 도트 데이터
│       │   └── 7-anims.js           # 꼬부기 도트 데이터 (외 진화형)
│       ├── Panel/
│       │   ├── Panel.jsx            # 탭 레이아웃
│       │   ├── PomodoroTimer.jsx    # 집중모드 타이머
│       │   ├── PointDisplay.jsx     # 포인트 / 레벨 표시
│       │   ├── PokemonStats.jsx     # 스탯 / 기술 / EV 관리
│       │   ├── StarterSelect.jsx    # 스타터 선택 화면
│       │   ├── Box.jsx              # 보관함 (잡은 포켓몬, 파트너 교체)
│       │   └── Settings.jsx         # 설정 (데이터 초기화, 앱 종료)
│       └── Shop/
│           ├── Shop.jsx             # 아이템 상점
│           ├── BallCanvas.jsx       # 볼 투척 애니메이션
│           └── items.js             # 아이템 카탈로그 (아이템, TM, 비타민)
├── pixel-art-source/
│   ├── convert.py       # PNG → JS 픽셀 그리드 변환 스크립트
│   ├── generate-preview.js  # 미리보기 서버 (localhost:3131)
│   ├── normal/          # 일반 상태 도트 원본
│   ├── sleep/           # 수면 상태 도트 원본
│   └── item/            # 아이템 도트 원본
└── scripts/
    ├── new-feature.sh   # feature 브랜치 생성 헬퍼
    └── setup-hooks.sh   # git hooks 설치
```

---

## 창 구성

| 창 | 크기 | 역할 |
|----|------|------|
| Pet 창 | 100×100px | 투명 always-on-top, 포켓몬 표시 |
| Panel 창 | 380×580px | 집중모드 / 스탯 / 배틀 / 보관함 / 설정 |

두 창은 IPC(`state-update` / `state-sync`)로 실시간 상태 동기화.
스타터 미선택 상태에서는 Pet 창이 표시되지 않음.

---

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# git hooks 설치 (최초 1회)
bash scripts/setup-hooks.sh

# 개발 서버 실행 (Vite + Electron 동시)
npm run dev

# 프로덕션 빌드
npm run build
# macOS → release/mac-universal/poketmon-idle.app
# Windows → release/win-unpacked/poketmon-idle.exe
```

---

## 브랜치 전략

```
master  ← 안정 릴리즈 (production), 직접 push 불가
dev     ← 개발 메인 브랜치, 직접 push 불가
feature/기능명  ← 기능별 작업 브랜치
```

```bash
bash scripts/new-feature.sh <feature-name>  # dev에서 feature 브랜치 생성
# 작업 후 push → GitHub에서 dev로 PR 생성 → 머지
```

---

## 스탯 계산 공식 (Gen 1 기반)

```
HP  = floor((2×base + IV + floor(EV/4)) × level / 100) + level + 10
기타 = floor((2×base + IV + floor(EV/4)) × level / 100) + 5  (× 성격 보정)
```

---

## 로드맵

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | 기반 완성 (스타터 3종, 레벨·진화, 집중모드, IPC 보안) | 완료 |
| Phase 2 | 진화형·야생 포켓몬 픽셀아트 완성 | 완료 |
| Phase 3 | 야생 포켓몬 조우 & 배틀 시스템 | 완료 |
| Phase 4 | 포획 시스템, 보관함, 파트너 교체 | 완료 |
| Phase 5 | 밸런스 조정, 버그 수정, 패키징 최적화 | 진행 중 |

자세한 내용은 [ROADMAP.md](./ROADMAP.md) 참고.
