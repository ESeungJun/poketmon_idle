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
    setStoreMany: (values) => invoke('set_store_many', { values }),
    getAllStore: () => invoke('get_all_store'),
    clearStore: () => invoke('clear_store'),
    backupInfo: () => invoke('backup_info'),
    storeStatus: () => invoke('store_status'),
    restoreBackup: () => invoke('restore_backup'),
    onStoreReloaded: (callback) => on('store-reloaded', callback),
    notifyStarterSelected: () => invoke('starter_selected'),
    quitApp: () => invoke('quit_app'),

    // 창 간 상태 동기화: 다른 창에만 보낸다
    onStateSync: (callback) => on('state-sync', callback),
    sendStateUpdate: (data) => { emitTo(other, 'state-sync', data) },

    onWanderDirection: (callback) => on('wander-direction', callback),

    // 집중 타이머: 시간과 보상은 Rust 가 맡고, 바뀔 때마다 두 창에 focus-update 를 보낸다
    getFocus: () => invoke('get_focus'),
    focusReady: () => invoke('focus_ready'),
    startFocus: (minutes) => invoke('start_focus', { minutes }),
    pauseFocus: () => invoke('pause_focus'),
    resumeFocus: () => invoke('resume_focus'),
    cancelFocus: () => invoke('cancel_focus'),
    dismissFocusResult: () => invoke('dismiss_focus_result'),
    onFocusUpdate: (callback) => on('focus-update', callback),

    resizePetWindow: (size) => invoke('resize_pet_window', { size }),
    startDrag: ({ offsetX, offsetY }) => invoke('start_drag', { offsetX, offsetY }),
    stopDrag: () => invoke('stop_drag'),
  }
}
