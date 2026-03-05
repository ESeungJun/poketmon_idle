const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  togglePanel: () => ipcRenderer.invoke('toggle-panel'),
  closePanel: () => ipcRenderer.invoke('close-panel'),

  getStore: (key) => ipcRenderer.invoke('get-store', key),
  setStore: (key, value) => ipcRenderer.invoke('set-store', key, value),
  setStoreSync: (key, value) => ipcRenderer.sendSync('set-store-sync', key, value),
  getAllStore: () => ipcRenderer.invoke('get-all-store'),

  onStateSync: (callback) => {
    ipcRenderer.on('state-sync', (_, data) => callback(data))
  },
  sendStateUpdate: (data) => {
    ipcRenderer.send('state-update', data)
  },

  onWanderDirection: (callback) => {
    ipcRenderer.on('wander-direction', (_, dir) => callback(dir))
  },
  onForceRemount: (callback) => {
    ipcRenderer.on('force-remount', () => callback())
  },

  startWandering: () => ipcRenderer.invoke('start-wandering'),
  stopWandering: () => ipcRenderer.invoke('stop-wandering'),

  startDrag: (offset) => ipcRenderer.invoke('start-drag', offset),
  stopDrag: () => ipcRenderer.invoke('stop-drag'),
  showContextMenu: () => ipcRenderer.invoke('show-context-menu'),

  getQueryParam: (param) => {
    const url = new URL(window.location.href)
    return url.searchParams.get(param)
  },
})
