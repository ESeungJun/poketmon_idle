const { contextBridge, ipcRenderer } = require('electron')

// contextBridge: renderer(React)와 main 프로세스 사이의 보안 통로
// contextIsolation: true 환경에서 renderer가 Node.js에 직접 접근하는 것을 막고,
// 여기서 명시적으로 허용한 API만 window.electronAPI로 노출됨
contextBridge.exposeInMainWorld('electronAPI', {
  togglePanel: () => ipcRenderer.invoke('toggle-panel'),
  closePanel:  () => ipcRenderer.invoke('close-panel'),

  getStore:      (key)        => ipcRenderer.invoke('get-store', key),
  setStore:      (key, value) => ipcRenderer.invoke('set-store', key, value),
  setStoreAsync: (key, value) => ipcRenderer.invoke('set-store', key, value),  // useStore의 saveToStore에서 사용
  getAllStore:    ()           => ipcRenderer.invoke('get-all-store'),
  clearStore:    ()           => ipcRenderer.invoke('clear-store'),
  notifyStarterSelected: ()   => ipcRenderer.invoke('starter-selected'),
  quitApp:       ()           => ipcRenderer.invoke('quit-app'),

  // 창 간 상태 동기화:
  // 한 창에서 sendStateUpdate를 호출하면 main이 나머지 창에 state-sync를 브로드캐스트
  // onStateSync는 cleanup 함수를 반환 → useEffect cleanup에서 리스너를 제거해 메모리 누수 방지
  // (cleanup 없으면 컴포넌트 재마운트 시 리스너가 중복 등록됨)
  onStateSync: (callback) => {
    const handler = (_, data) => callback(data)
    ipcRenderer.on('state-sync', handler)
    return () => ipcRenderer.removeListener('state-sync', handler)
  },
  sendStateUpdate: (data) => {
    ipcRenderer.send('state-update', data)
  },

  // 배회 방향 변경 시 main → renderer로 전달 (펫 이미지 좌우반전용)
  onWanderDirection: (callback) => {
    const handler = (_, dir) => callback(dir)
    ipcRenderer.on('wander-direction', handler)
    return () => ipcRenderer.removeListener('wander-direction', handler)
  },

  // 드래그 후 보조 디스플레이의 GPU 레이어 리셋 버그 해결용
  // main이 이 이벤트를 보내면 PetCanvas가 key를 변경해 canvas를 강제 재마운트
  onForceRemount: (callback) => {
    const handler = () => callback()
    ipcRenderer.on('force-remount', handler)
    return () => ipcRenderer.removeListener('force-remount', handler)
  },

  startWandering: () => ipcRenderer.invoke('start-wandering'),
  stopWandering:  () => ipcRenderer.invoke('stop-wandering'),

  // 드래그: mousedown 시 오프셋(창 내 클릭 위치)을 main에 전달
  startDrag: (offset) => ipcRenderer.invoke('start-drag', offset),
  stopDrag:  ()       => ipcRenderer.invoke('stop-drag'),

  showContextMenu: () => ipcRenderer.invoke('show-context-menu'),
})
