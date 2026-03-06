const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  togglePanel: () => ipcRenderer.invoke('toggle-panel'),
  closePanel: () => ipcRenderer.invoke('close-panel'),

  getStore: (key) => ipcRenderer.invoke('get-store', key),
  setStore: (key, value) => ipcRenderer.invoke('set-store', key, value),
  setStoreAsync: (key, value) => ipcRenderer.invoke('set-store', key, value),
  getAllStore: () => ipcRenderer.invoke('get-all-store'),
  clearStore: () => ipcRenderer.invoke('clear-store'),
  notifyStarterSelected: () => ipcRenderer.invoke('starter-selected'),
  quitApp: () => ipcRenderer.invoke('quit-app'),

  onStateSync: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('state-sync', handler)
    return () => ipcRenderer.removeListener('state-sync', handler)
  },
  sendStateUpdate: (data) => {
    ipcRenderer.send('state-update', data)
  },

  onWanderDirection: (callback) => {
    const handler = (_, dir) => callback(dir)
    ipcRenderer.on('wander-direction', handler)
    return () => ipcRenderer.removeListener('wander-direction', handler)
  },
  onForceRemount: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('force-remount', handler)
    return () => ipcRenderer.removeListener('force-remount', handler)
  },

  startWandering: () => ipcRenderer.invoke('start-wandering'),
  stopWandering: () => ipcRenderer.invoke('stop-wandering'),

  startDrag: (offset) => ipcRenderer.invoke('start-drag', offset),
  stopDrag: () => ipcRenderer.invoke('stop-drag'),
  showContextMenu: () => ipcRenderer.invoke('show-context-menu'),
})
