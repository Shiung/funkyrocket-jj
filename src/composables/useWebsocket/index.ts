import createWebsocket from '@/core/wsClient'
import { ActionType, type MessageMap } from '@/core/wsClient/types/message'
import { onMounted, onUnmounted, watchEffect } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const genObservekey = (data = {}) => {
  return `action_${'action' in data ? data.action : 'other'}`
}

const ws = createWebsocket({
  genObservekey
})
declare global {
  interface Window {
    /** instance debug */
    _ws?: any
  }
}

window._ws = ws

export default function useWebsocket() {
  const { wsInfo } = storeToRefs(useUserStore())

  const subscribe_drawing = ws.subscribe({ action: ActionType.DRAWING }, (v) => {
    console.log(`v [${ActionType[ActionType.DRAWING]}] ===> `, v)
  })

  const subscribe_joinGAME = ws.subscribe({ action: ActionType.JOIN_GAME }, (v: MessageMap[ActionType.JOIN_GAME]) => {
    console.log(`v [${ActionType[ActionType.JOIN_GAME]}] ===> `, v)
  })

  const subscribe_openBet = ws.subscribe({ action: ActionType.OPEN_BET }, (m: MessageMap[ActionType.OPEN_BET]) => {
    console.log(`v [${ActionType[ActionType.OPEN_BET]}] ===> `, m)
  })

  const subscribe_syncTimer = ws.subscribe({ action: ActionType.SYNC_TIMER }, (m: MessageMap[ActionType.SYNC_TIMER]) => {
    console.log(`v [${ActionType[ActionType.SYNC_TIMER]}] ===> `, m)
  })

  const wsConnect = async (url: string, token: string) => {
    if (!url || !token) return
    ws.setUrl(url)
    ws.setParams({ wsToken: token })
    await ws.close()
    ws.connect()
  }

  watchEffect(() => {
    console.log('wsInfo', wsInfo.value)
    if (wsInfo.value.socketUrl && wsInfo.value.socketToken) {
      wsConnect(wsInfo.value.socketUrl, wsInfo.value.socketToken)
    }
  })

  onMounted(() => {
    console.log('useWebsocket init ')
  })

  onUnmounted(() => {
    subscribe_drawing?.unsubscribe()
    subscribe_joinGAME?.unsubscribe()
    subscribe_openBet?.unsubscribe()
    subscribe_syncTimer?.unsubscribe()

    ws.close()
  })
}