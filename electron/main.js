const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store()
const isDev = process.env.NODE_ENV === 'development' || (!app.isPackaged && process.env.NODE_ENV !== 'production')

// 펫 창 기본 크기(px)
const WIN_SIZE = 100

// 진화 단계별 윈도우 크기 (stage2 = 1.5×, stage3 = 1.5²×)
const STAGE2_SPECIES = new Set(['ivysaur','charmeleon','wartortle','pidgeotto','raichu','haunter'])
const STAGE3_SPECIES = new Set(['venusaur','charizard','blastoise','pidgeot','gengar'])
function getWinSizeForSpecies(speciesId) {
  if (STAGE3_SPECIES.has(speciesId)) return 160
  if (STAGE2_SPECIES.has(speciesId)) return 120
  return WIN_SIZE
}

let currentWinSize = WIN_SIZE

let petWindow = null
let panelWindow = null

// --- 드래그 상태 ---
// renderer의 mousemove 대신 main에서 커서를 폴링하는 이유:
// 창 밖으로 커서가 나가면 renderer 이벤트가 끊기지만, main은 항상 커서 위치를 알 수 있음
let dragInterval = null
let dragOffsetX = 0  // 클릭 시점의 창 내부 오프셋 (커서 위치 - 창 좌상단)
let dragOffsetY = 0

// --- 배회(wander) 상태 ---
// 펫이 화면 우측 1/3 구간에서 좌우로 돌아다님
// wanderVx: 현재 수평 속도 (양수=오른쪽, 음수=왼쪽)
let wanderInterval = null
let wanderVx = Math.random() > 0.5 ? 1.0 : -1.0
const WANDER_SPEED = 1.0
let lastWanderDir = wanderVx > 0 ? 1 : -1
let wanderingLocked = false  // true이면 stop-drag 후에도 배회를 재시작하지 않음 (집중모드 중)
let cachedDisplay = null     // getDisplayNearestPoint 결과 캐시 (매 틱 호출 방지)

// showPetWindow 내부의 딜레이 타이머 핸들 (중복 호출 시 이전 타이머 취소용)
let showPetTimer = null

function startWandering() {
  if (wanderInterval) return  // 이미 실행 중이면 중복 시작 방지
  wanderInterval = setInterval(() => {
    if (!petWindow || dragInterval) return  // 드래그 중에는 배회 중단

    const [x, y] = petWindow.getPosition()

    // 디스플레이 캐싱: 매 틱(33ms)마다 재계산하면 비용이 크므로
    // 현재 캐시된 디스플레이 범위(±20px)를 벗어날 때만 다시 계산
    if (!cachedDisplay) {
      cachedDisplay = screen.getDisplayNearestPoint({ x, y })
    } else {
      const { x: dX, width } = cachedDisplay.workArea
      if (x < dX - 20 || x > dX + width + 20) {
        cachedDisplay = screen.getDisplayNearestPoint({ x, y })
      }
    }
    const display = cachedDisplay
    const { x: dX, y: dY, width, height } = display.workArea

    // Y축 고정: 작업 영역 하단 2% 위에 고정
    const fixedY = dY + height - currentWinSize - Math.round(height * 0.02)

    // 3% 확률로 랜덤 가속도를 더해 자연스러운 방향 전환 유도
    if (Math.random() < 0.03) {
      wanderVx += (Math.random() - 0.5) * 0.6
    }
    // 최대 속도 제한 + 최소 속도 보장 (완전히 멈추지 않도록)
    wanderVx = Math.max(-WANDER_SPEED, Math.min(WANDER_SPEED, wanderVx))
    if (Math.abs(wanderVx) < 0.3) wanderVx = wanderVx < 0 ? -0.3 : 0.3

    let newX = x + wanderVx

    // 화면 우측 1/3 구간 내에서 바운스
    const wanderMinX = dX + Math.round(width * 2 / 3)
    const wanderMaxX = dX + width - currentWinSize
    if (newX <= wanderMinX) {
      wanderVx = Math.abs(wanderVx)   // 오른쪽으로 반전
      newX = wanderMinX
    } else if (newX >= wanderMaxX) {
      wanderVx = -Math.abs(wanderVx)  // 왼쪽으로 반전
      newX = wanderMaxX
    }

    petWindow.setPosition(Math.round(newX), Math.round(fixedY))

    // 방향이 바뀐 경우에만 renderer에 알려 flipX(좌우반전) 처리
    const dir = wanderVx > 0 ? 1 : -1
    if (dir !== lastWanderDir) {
      lastWanderDir = dir
      petWindow.webContents.send('wander-direction', dir)
    }
  }, 33) // ~30fps
}

function stopWandering() {
  if (wanderInterval) {
    clearInterval(wanderInterval)
    wanderInterval = null
  }
}

function createPetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const initSize = getWinSizeForSpecies(store.get('petSpeciesId'))
  currentWinSize = initSize

  petWindow = new BrowserWindow({
    width: initSize,
    height: initSize,
    x: width - initSize - 20,
    y: height - initSize - 20,
    transparent: true,
    backgroundColor: '#00000000',  // 완전 투명 (macOS GPU 레이어 초기화 방지용으로 중복 설정)
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    roundedCorners: false,         // macOS 자동 둥근 모서리 비활성화
    visibleOnAllWorkspaces: true,  // 모든 스페이스/데스크탑에서 표시
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // renderer에서 Node.js 직접 접근 차단
      nodeIntegration: false,
    },
  })

  if (isDev) {
    petWindow.loadURL('http://localhost:5173/?view=pet')
  } else {
    petWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
      query: { view: 'pet' },
    })
  }

  petWindow.on('closed', () => {
    petWindow = null
    stopWandering()
  })

  petWindow.webContents.on('render-process-gone', (event, details) => {
    if (details.reason === 'clean-exit') return
    console.error('[pet] renderer gone:', details.reason, '— reloading')
    petWindow.reload()
  })

  petWindow.on('unresponsive', () => {
    console.error('[pet] unresponsive — reloading')
    petWindow.reload()
  })

  // macOS: visibleOnFullScreen 옵션으로 풀스크린 앱 위에서도 펫이 보이게 함
  if (process.platform !== 'win32') {
    petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }
  petWindow.setBackgroundColor('#00000000')
}

function showPetWindow() {
  if (!petWindow) return
  petWindow.show()
  if (process.platform !== 'win32') {
    petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }
  petWindow.setBackgroundColor('#00000000')
  // 창이 완전히 그려지기 전에 배회를 시작하면 초기 위치가 잘못될 수 있으므로 1초 딜레이
  // 중복 호출 시 이전 타이머를 취소하고 재설정
  if (showPetTimer) clearTimeout(showPetTimer)
  showPetTimer = setTimeout(() => { showPetTimer = null; if (!wanderingLocked) startWandering() }, 1000)
}

function createPanelWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  panelWindow = new BrowserWindow({
    width: 380,
    height: 580,
    x: width - 400,
    y: height - 620,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    show: false,  // did-finish-load 이후 수동으로 show()
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    panelWindow.loadURL('http://localhost:5173/?view=panel')
  } else {
    panelWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'), {
      query: { view: 'panel' },
    })
  }

  panelWindow.on('closed', () => {
    panelWindow = null
  })

  panelWindow.webContents.on('render-process-gone', (event, details) => {
    if (details.reason === 'clean-exit') return
    console.error('[panel] renderer gone:', details.reason, '— reloading')
    panelWindow.reload()
  })

  panelWindow.on('unresponsive', () => {
    console.error('[panel] unresponsive — reloading')
    panelWindow.reload()
  })
}

app.whenReady().then(() => {
  createPetWindow()
  createPanelWindow()

  // 저장된 스타터가 있으면 펫 창 즉시 표시, 없으면 패널만 열어 스타터 선택 유도
  const hasPet = !!store.get('petSpeciesId')
  if (hasPet) {
    showPetWindow()
  }
  panelWindow.webContents.once('did-finish-load', () => {
    panelWindow.show()
    panelWindow.focus()
  })

  app.on('activate', () => {
    // macOS: Dock 아이콘 클릭 시 창이 없으면 재생성
    if (BrowserWindow.getAllWindows().length === 0) {
      createPetWindow()
      createPanelWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// --- IPC 핸들러 ---

// 패널 토글: 펫 창의 현재 디스플레이 기준으로 패널 위치를 계산
// 화면 밖으로 벗어나지 않도록 경계 보정 포함
ipcMain.handle('toggle-panel', () => {
  if (!panelWindow) return
  if (panelWindow.isVisible()) {
    panelWindow.hide()
  } else {
    if (petWindow) {
      const [px, py] = petWindow.getPosition()
      const display = screen.getDisplayNearestPoint({ x: px, y: py })
      const { x: dX, y: dY, width, height } = display.workArea
      // 기본: 펫 왼쪽 위에 배치
      let panelX = px - 390
      let panelY = py - 480
      // 화면 경계 보정
      if (panelX < dX) panelX = px + WIN_SIZE + 10
      if (panelX + 380 > dX + width) panelX = dX + width - 390
      if (panelY < dY) panelY = dY + 10
      if (panelY + 580 > dY + height) panelY = dY + height - 590
      panelWindow.setPosition(Math.round(panelX), Math.round(panelY))
    }
    panelWindow.show()
    panelWindow.focus()
  }
})

// renderer가 임의 키를 읽거나 쓰는 것을 방지하는 허용 키 목록
const ALLOWED_STORE_KEYS = new Set([
  'points', 'totalPointsEarned', 'purchasedItems', 'equippedItems',
  'todos', 'pomodoroHistory', 'petState', 'lastActiveTime', 'totalWorkMinutes',
  'petSpeciesId', 'petStats', 'petName', 'petEVs', 'ownedTMs', 'equippedTool',
])

ipcMain.handle('get-store', (_, key) => {
  if (!ALLOWED_STORE_KEYS.has(key)) return undefined
  return store.get(key)
})
ipcMain.handle('set-store', (_, key, value) => {
  if (!ALLOWED_STORE_KEYS.has(key)) return
  store.set(key, value)
})
ipcMain.handle('get-all-store', () => store.store)
ipcMain.handle('clear-store', () => {
  store.clear()
  if (petWindow) petWindow.hide()
  stopWandering()
})

// 스타터 선택 완료 시 renderer가 호출 → 펫 창 표시
ipcMain.handle('starter-selected', () => {
  showPetWindow()
})

// 드래그: main 프로세스에서 커서를 폴링해 창 이동
// visibleOnAllWorkspaces를 드래그 중에 false로 해제해야
// macOS에서 다른 물리적 디스플레이로 setPosition()이 허용됨
ipcMain.handle('start-drag', (_, { offsetX, offsetY }) => {
  dragOffsetX = offsetX
  dragOffsetY = offsetY
  stopWandering()
  if (process.platform !== 'win32') {
    petWindow.setVisibleOnAllWorkspaces(false)
  }

  if (dragInterval) clearInterval(dragInterval)
  dragInterval = setInterval(() => {
    if (!petWindow) return
    const cursor = screen.getCursorScreenPoint()
    petWindow.setPosition(
      cursor.x - dragOffsetX,
      cursor.y - dragOffsetY,
    )
  }, 16) // ~60fps
})

ipcMain.handle('stop-drag', () => {
  if (dragInterval) {
    clearInterval(dragInterval)
    dragInterval = null
  }
  cachedDisplay = null  // 다른 디스플레이로 이동했을 수 있으므로 캐시 초기화
  if (process.platform !== 'win32') {
    petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }
  petWindow.setBackgroundColor('#00000000')
  // macOS 버그: 보조 디스플레이에서 visibleOnAllWorkspaces 토글 시
  // GPU 컴포지팅 레이어가 흰색으로 리셋됨
  // → 150ms 후 renderer에 force-remount를 보내 canvas를 재마운트해서 새 GPU 레이어 생성
  setTimeout(() => {
    if (petWindow) petWindow.webContents.send('force-remount')
  }, 150)
  setTimeout(() => { if (!wanderingLocked) startWandering() }, 2000)
})

// 창 간 상태 동기화:
// 패널 또는 펫 창에서 state-update(send)를 보내면
// main이 나머지 모든 창에 state-sync를 브로드캐스트
// renderer는 onStateSync 콜백에서 zustand store에 병합
ipcMain.on('state-update', (event, data) => {
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.webContents !== event.sender) {
      win.webContents.send('state-sync', data)
    }
  })
})

// 집중모드 시작/종료 시 renderer가 호출
// wanderingLocked: true이면 드래그 종료 후에도 배회를 재시작하지 않음
ipcMain.handle('start-wandering', () => {
  wanderingLocked = false
  startWandering()
})
ipcMain.handle('stop-wandering', () => {
  wanderingLocked = true
  stopWandering()
})

ipcMain.handle('close-panel', () => {
  if (panelWindow) panelWindow.hide()
})

ipcMain.handle('resize-pet-window', (_, newSize) => {
  if (!petWindow || currentWinSize === newSize) return
  currentWinSize = newSize
  const [x, y] = petWindow.getPosition()
  const display = screen.getDisplayNearestPoint({ x, y })
  const { x: dX, y: dY, width, height } = display.workArea
  petWindow.setSize(newSize, newSize)
  const newY = dY + height - newSize - Math.round(height * 0.02)
  petWindow.setPosition(x, Math.round(newY))
})

ipcMain.handle('quit-app', () => {
  app.quit()
})

ipcMain.handle('show-context-menu', (event) => {
  const menu = Menu.buildFromTemplate([
    {
      label: '패널 열기/닫기',
      click: () => {
        if (!panelWindow) return
        if (panelWindow.isVisible()) panelWindow.hide()
        else { panelWindow.show(); panelWindow.focus() }
      },
    },
    { type: 'separator' },
    {
      label: '종료',
      click: () => app.quit(),
    },
  ])
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})
