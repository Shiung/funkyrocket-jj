import createWebsocket from '@/core/wsClient'
import { ActionType, type MessageMap } from '@/core/wsClient/types/message'
import { onMounted, onUnmounted, watchEffect } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { emitter } from '@/core/mitt'

const genObservekey = (data = {}) => {
  return `action_${'action' in data ? data.action : 'other'}`
}

const wsConnectFail = () => {
  console.log('ws connect error')
}

const ws = createWebsocket({
  genObservekey,
  forbiddenCb: wsConnectFail
})
declare global {
  interface Window {
    /** instance debug */
    _ws?: any
  }
}

window._ws = ws

export default function useWebsocket() {
  const { wsInfo, state } = storeToRefs(useUserStore())

  const subscribe_joinGAME = ws.subscribe({ action: ActionType.JOIN_GAME }, (m: MessageMap[ActionType.JOIN_GAME]) => {
    console.log(`v [${ActionType[ActionType.JOIN_GAME]}] ===> `, m)
    emitter.emit('JOIN_GAME', m)
  })

  const subscribe_openBet = ws.subscribe({ action: ActionType.OPEN_BET }, (m: MessageMap[ActionType.OPEN_BET]) => {
    console.log(`v [${ActionType[ActionType.OPEN_BET]}] ===> `, m)
    emitter.emit('OPEN_BET', m)
  })

  const subscribe_closeBet = ws.subscribe({ action: ActionType.CLOSE_BET }, (m: MessageMap[ActionType.CLOSE_BET]) => {
    console.log(`v [${ActionType[ActionType.CLOSE_BET]}] ===> `, m)
    emitter.emit('CLOSE_BET', m)
  })

  const subscribe_gameResult = ws.subscribe({ action: ActionType.GAME_RESULT }, (m: MessageMap[ActionType.GAME_RESULT]) => {
    console.log(`v [${ActionType[ActionType.GAME_RESULT]}] ===> `, m)
    emitter.emit('GAME_RESULT', m)
  })

  const subscribe_betResult = ws.subscribe({ action: ActionType.BET_RESULT }, (m: MessageMap[ActionType.BET_RESULT]) => {
    console.log(`v [${ActionType[ActionType.BET_RESULT]}] ===> `, m)
    emitter.emit('BET_RESULT', m)
  })

  const subscribe_syncTimer = ws.subscribe({ action: ActionType.SYNC_TIMER }, (m: MessageMap[ActionType.SYNC_TIMER]) => {
    console.log(`v [${ActionType[ActionType.SYNC_TIMER]}] ===> `, m)
    emitter.emit('SYNC_TIMER', m)
  })

  const subscribe_getHistory = ws.subscribe({ action: ActionType.GET_HISTORY }, (m: MessageMap[ActionType.GET_HISTORY]) => {
    console.log(`v [${ActionType[ActionType.GET_HISTORY]}] ===> `, m)
    emitter.emit('GET_HISTORY', m)
  })

  const subscribe_updateOtherChips = ws.subscribe({ action: ActionType.UPDATE_OTHER_CHIPS }, (m: MessageMap[ActionType.UPDATE_OTHER_CHIPS]) => {
    console.log(`v [${ActionType[ActionType.UPDATE_OTHER_CHIPS]}] ===> `, m)
    emitter.emit('UPDATE_OTHER_CHIPS', m)
  })

  const subscribe_getBallance = ws.subscribe({ action: ActionType.GET_BALANCE }, (m: MessageMap[ActionType.GET_BALANCE]) => {
    console.log(`v [${ActionType[ActionType.GET_BALANCE]}] ===> `, m)
    emitter.emit('GET_BALANCE', m)
  })

  const subscribe_drawing = ws.subscribe({ action: ActionType.DRAWING }, (m: MessageMap[ActionType.DRAWING]) => {
    console.log(`v [${ActionType[ActionType.DRAWING]}] ===> `, m)
    emitter.emit('DRAWING', m)
  })

  const subscribe_cashOut = ws.subscribe({ action: ActionType.CASH_OUT }, (m: MessageMap[ActionType.CASH_OUT]) => {
    console.log(`v [${ActionType[ActionType.CASH_OUT]}] ===> `, m)
    emitter.emit('CASH_OUT', m)
  })

  const wsConnect = async (url: string, token: string) => {
    if (!url || !token) return
    ws.setUrl(url)
    ws.setParams({ wsToken: token })
    await ws.close(1006)
    ws.connect()
  }

  watchEffect(async () => {
    if (state.value.unAuthorized) {
      // 終止連線
      await ws.close()
    }
  })

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
    subscribe_closeBet?.unsubscribe()
    subscribe_gameResult?.unsubscribe()
    subscribe_betResult?.unsubscribe()
    subscribe_syncTimer?.unsubscribe()
    subscribe_getHistory?.unsubscribe()
    subscribe_updateOtherChips?.unsubscribe()
    subscribe_getBallance?.unsubscribe()
    subscribe_cashOut?.unsubscribe()

    ws.close()
  })
}