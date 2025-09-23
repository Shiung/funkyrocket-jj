import createWebsocket from '@/core/wsClient'
import { ActionType, type MessageMap } from '@/core/wsClient/types/message'
import { onMounted, onUnmounted } from 'vue'

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

export default function useWebsocket() {
  const subscribe_drawing = ws.subscribe({ action: ActionType.DRAWING }, (v) => {
    console.log(`v [${ActionType[ActionType.DRAWING]}] ===> `, v)
  })

  const subscribe_joinGAME = ws.subscribe({ action: ActionType.JOIN_GAME }, (v: MessageMap[ActionType.JOIN_GAME]) => {
    console.log(`v [${ActionType[ActionType.JOIN_GAME]}] ===> `, v)
  })

  const subscribe_openBet = ws.subscribe({ action: ActionType.OPEN_BET }, (m: MessageMap[ActionType.OPEN_BET]) => {
    console.log('openBetScross', m)
  })

  const subscribe_syncTimer = ws.subscribe({ action: ActionType.SYNC_TIMER }, (m: MessageMap[ActionType.SYNC_TIMER]) => {
    console.log('syncScross', m)
  })

  const wsConnect = () => {
    return
    ws.setUrl('wss://dv8g9p7m1c2xqz5.highplayfky.com/gameChannels')
    ws.setParams({ wsToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkZ1bjk5NDM0NCRfQVMiLCJnYW1lTWFuYWdlclR5cGUiOiI2MDI4MTciLCJtYW5hZ2VySWQiOiJkZWZhdWx0IiwiZnBJZCI6IjE2ODAiLCJzZXNzaW9uSWQiOiJGdW45OTQzNDQkX0FTIiwibmJmIjoxNzU4NTk3Mzk1LCJleHAiOjE3NTg1OTc2OTUsImlhdCI6MTc1ODU5NzM5NX0.FKlmk_S3zSokaK5PWrl2NdctzwXZX3EZHSA9W724rRE' })
    ws.connect()

  }

  onMounted(() => {
    wsConnect()
    window._ws = ws
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