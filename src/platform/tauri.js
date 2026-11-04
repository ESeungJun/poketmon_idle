// Tauri 에서 실행될 때 예전 Electron preload 와 같은 window.electronAPI 를 만든다.
// 화면 코드는 그대로 window.electronAPI 를 부르고, 실제 일은 src-tauri/src/lib.rs 의 명령이 한다.
import { invoke } from '@tauri-apps/api/core'
import { emitTo } from '@tauri-apps/api/event'
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow'

if (window.__TAURI_INTERNALS__ && !window.electronAPI) {
  const me = getCurrentWebviewWindow()
  const other = me.label === 'pet' ? 'panel' : 'pet'

  // 이 창으로 온 이벤트만 듣고, 바로 부를 수 있는 해제 함수를 돌려준다 (useEffect cleanup 용)
  const on = (event, callback) => {
    const unlisten = me.listen(event, (e) => callback(e.payload))
    return () => { unlisten.then((fn) => fn()) }
  }

  window.electronAPI = {
    togglePanel: () => invoke('toggle_panel'),
    closePanel: () => invoke('close_panel'),

    getStore: (key) => invoke('get_store', { key }),
    setStoreAsync: (key, value) => invoke('set_store', { key, value }),
    getAllStore: () => invoke('get_all_store'),
    clearStore: () => invoke('clear_store'),
    notifyStarterSelected: () => invoke('starter_selected'),
    quitApp: () => invoke('quit_app'),

    // 창 간 상태 동기화: 다른 창에만 보낸다
    onStateSync: (callback) => on('state-sync', callback),
    sendStateUpdate: (data) => { emitTo(other, 'state-sync', data) },

    onWanderDirection: (callback) => on('wander-direction', callback),
    // Electron 의 보조 모니터 GPU 레이어 버그용 이벤트. Tauri 에서는 보내지 않는다
    onForceRemount: () => () => {},

    resizePetWindow: (size) => invoke('resize_pet_window', { size }),
    startWandering: () => invoke('start_wandering'),
    stopWandering: () => invoke('stop_wandering'),
    startDrag: ({ offsetX, offsetY }) => invoke('start_drag', { offsetX, offsetY }),
    stopDrag: () => invoke('stop_drag'),
  }
}
