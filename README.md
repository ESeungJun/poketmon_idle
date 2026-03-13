# 포켓몬 키우기 — Desktop Pet

데스크탑 위에 항상 떠 있는 픽셀아트 포켓몬을 키우는 생산성 앱.
집중모드와 할일 완료로 포인트를 모아 파트너 포켓몬을 성장시킨다.

---

## 주요 기능

### 포켓몬
- **스타터 3종 선택** — 이상해씨 / 파이리 / 꼬부기
- **레벨 시스템** — 포인트 누적에 따라 레벨업, Gen 1 스탯 공식 적용
- **진화** — 일정 레벨 도달 시 자동 진화 (예: 이상해씨 → 이상해풀 → 이상해꽃)
- **기술 학습** — 레벨업 시 Gen 1 기술배치 기반 자동 습득, TM 구매 가능
- **상태 애니메이션** — idle / happy / sleeping / evolving 상태별 픽셀아트
- **EV 강화** — 상점에서 비타민 구매하여 스탯 보정 가능

### 생산성
- **집중모드 타이머** — 25분 집중 / 5분 휴식 사이클, wall-clock 기반 (탭 전환 시에도 정확)
- **할일 목록** — 완료 시 포인트 획득
- **포인트 시스템** — 집중 1분당 +1pt / 집중모드 완료 +50pt / 할일 완료 +20pt

### 포켓몬 스탯창
- 현재 레벨 기준 실시간 스탯 계산 (HP / 공격 / 방어 / 특수공격 / 특수방어 / 스피드)
- 보유 기술 및 레벨업 시 배울 기술 미리보기
- TM 기술 습득 후 슬롯 교체 가능

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
│   │   └── pokemon.js   # 포켓몬 종 데이터, 스탯 공식, 기술 시스템
│   └── components/
│       ├── Pet/
│       │   ├── PetCanvas.jsx        # 캔버스 애니메이션 루프
│       │   ├── pokemonDraw.js       # 픽셀아트 렌더러, DEFAULT_ANIMATIONS
│       │   ├── bulbasaur-anims.js   # 이상해씨 도트 데이터
│       │   ├── charmander-anims.js  # 파이리 도트 데이터
│       │   └── squirtle-anims.js    # 꼬부기 도트 데이터
│       ├── Panel/
│       │   ├── Panel.jsx            # 탭 레이아웃 (홈 / 스탯 / 설정)
│       │   ├── PomodoroTimer.jsx    # 집중모드 타이머
│       │   ├── TodoList.jsx         # 할일 목록
│       │   ├── PointDisplay.jsx     # 포인트 / 레벨 표시
│       │   ├── PokemonStats.jsx     # 스탯 / 기술 / EV 관리
│       │   ├── StarterSelect.jsx    # 스타터 선택 화면
│       │   └── Settings.jsx         # 설정 (데이터 초기화, 앱 종료)
│       └── Shop/
│           ├── Shop.jsx             # 아이템 상점
│           └── items.js             # 아이템 카탈로그 (아이템, TM, 비타민)
├── pixel-art-source/
│   ├── convert.py       # PNG → JS 픽셀 그리드 변환 스크립트
│   ├── normal/          # 일반 상태 도트 원본
│   └── sleep/           # 수면 상태 도트 원본
└── scripts/
    ├── new-feature.sh   # feature 브랜치 생성 헬퍼
    └── setup-hooks.sh   # git hooks 설치
```

---

## 창 구성

| 창 | 크기 | 역할 |
|----|------|------|
| Pet 창 | 100×100px | 투명 always-on-top, 포켓몬 표시, 클릭 시 패널 토글 |
| Panel 창 | 380×580px | 집중모드 / 할일 / 스탯 / 설정 |

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

# 프로덕션 빌드 (macOS universal)
npm run build
# → release/mac-universal/poketmon-idle.app

# 앱 실행 (기존 프로세스 종료 후 재실행)
pkill -f "poketmon-idle"; sleep 1; open "release/mac-universal/poketmon-idle.app"
```

> macOS 전용 빌드. Apple Silicon + Intel 통합 universal 바이너리.

---

## 브랜치 전략

```
master  ← 안정 릴리즈 (production), 직접 push 불가
dev     ← 개발 메인 브랜치, 직접 push 불가
feature/기능명  ← 기능별 작업 브랜치
```

**작업 흐름:**
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
| Phase 2 | 진화형 도트 완성 (이상해풀~이상해꽃, 리자드~리자몽, 어니부기~거북왕) | 진행 예정 |
| Phase 3 | 야생 포켓몬 조우 & 배틀 시스템 | 예정 |
| Phase 4 | 포획 시스템, 보관함, 파트너 교체 | 예정 |

자세한 내용은 [ROADMAP.md](./ROADMAP.md) 참고.
