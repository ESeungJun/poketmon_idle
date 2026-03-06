const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron')
const path = require('path')
const Store = require('electron-store')

const store = new Store()
const isDev = process.env.NODE_ENV === 'development' || (!app.isPackaged && process.env.NODE_ENV !== 'production')

const WIN_SIZE = 100  // half of original 200

let petWindow = null
let panelWindow = null

// --- Drag state ---
let dragInterval = null
let dragOffsetX = 0
let dragOffsetY = 0

// --- Wander state ---
let wanderInterval = null
let wanderVx = Math.random() > 0.5 ? 1.0 : -1.0
const WANDER_SPEED = 1.0
let lastWanderDir = wanderVx > 0 ? 1 : -1
let wanderingLocked = false

function startWandering() {
  if (wanderInterval) return
  wanderInterval = setInterval(() => {
    if (!petWindow || dragInterval) return

    const [x] = petWindow.getPosition()

    // Get the display the pet is currently on
    const display = screen.getDisplayNearestPoint({ x, y: petWindow.getPosition()[1] })
    const { x: dX, y: dY, width, height } = display.workArea

    // Fixed Y: bottom 5% of the current display's work area
    const fixedY = dY + height - WIN_SIZE - Math.round(height * 0.02)

    // Random horizontal nudge
    if (Math.random() < 0.03) {
      wanderVx += (Math.random() - 0.5) * 0.6
    }
    // Clamp speed, keep moving
    wanderVx = Math.max(-WANDER_SPEED, Math.min(WANDER_SPEED, wanderVx))
    if (Math.abs(wanderVx) < 0.3) wanderVx = wanderVx < 0 ? -0.3 : 0.3

    let newX = x + wanderVx

    // Bounce within right 1/3 of the display
    const wanderMinX = dX + Math.round(width * 2 / 3)
    const wanderMaxX = dX + width - WIN_SIZE
    if (newX <= wanderMinX) {
      wanderVx = Math.abs(wanderVx)
      newX = wanderMinX
    } else if (newX >= wanderMaxX) {
      wanderVx = -Math.abs(wanderVx)
      newX = wanderMaxX
    }

    petWindow.setPosition(Math.round(newX), Math.round(fixedY))

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

  petWindow = new BrowserWindow({
    width: WIN_SIZE,
    height: WIN_SIZE,
    x: width - WIN_SIZE - 20,
    y: height - WIN_SIZE - 20,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    roundedCorners: false,
    // macOS: show on all Spaces
    visibleOnAllWorkspaces: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
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

  // macOS: pin to all Spaces so it never jumps back
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Force fully transparent background (belt-and-suspenders for macOS)
  petWindow.setBackgroundColor('#00000000')

  // Start wandering after window is ready
  petWindow.webContents.once('did-finish-load', () => {
    setTimeout(() => { if (!wanderingLocked) startWandering() }, 1000)
  })
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
    show: false,
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
}

app.whenReady().then(() => {
  createPetWindow()
  createPanelWindow()

  app.on('activate', () => {
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

// IPC handlers
ipcMain.handle('toggle-panel', () => {
  if (!panelWindow) return
  if (panelWindow.isVisible()) {
    panelWindow.hide()
  } else {
    // Position panel near the pet
    if (petWindow) {
      const [px, py] = petWindow.getPosition()
      const { width, height } = screen.getPrimaryDisplay().workAreaSize
      let panelX = px - 390
      let panelY = py - 480
      if (panelX < 0) panelX = px + WIN_SIZE + 10
      if (panelY < 0) panelY = 10
      if (panelY + 580 > height) panelY = height - 590
      panelWindow.setPosition(Math.round(panelX), Math.round(panelY))
    }
    panelWindow.show()
    panelWindow.focus()
  }
})

ipcMain.handle('get-store', (_, key) => store.get(key))
ipcMain.handle('set-store', (_, key, value) => store.set(key, value))
ipcMain.on('set-store-sync', (event, key, value) => { store.set(key, value); event.returnValue = true })
ipcMain.handle('get-all-store', () => store.store)
ipcMain.handle('clear-store', () => store.clear())

// Drag: poll cursor in main process so it works even when cursor leaves the window.
// visibleOnAllWorkspaces is disabled during drag — macOS otherwise blocks
// setPosition() from moving the window to a different physical display.
ipcMain.handle('start-drag', (_, { offsetX, offsetY }) => {
  dragOffsetX = offsetX
  dragOffsetY = offsetY
  stopWandering()

  // Must disable so macOS allows repositioning to another monitor
  petWindow.setVisibleOnAllWorkspaces(false)

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
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  petWindow.setBackgroundColor('#00000000')
  // On secondary displays, macOS resets the window compositing layer as white.
  // Force-remount the canvas element in the renderer to get a fresh GPU layer.
  setTimeout(() => {
    if (petWindow) petWindow.webContents.send('force-remount')
  }, 150)
  setTimeout(() => { if (!wanderingLocked) startWandering() }, 2000)
})

// Sync state between windows
ipcMain.on('state-update', (event, data) => {
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.webContents !== event.sender) {
      win.webContents.send('state-sync', data)
    }
  })
})

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
