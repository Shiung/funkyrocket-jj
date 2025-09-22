import createWebsocket from '@/core/wsClient'
import { ActionType } from '@/core/wsClient/types/message'
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
  const subscribeAA = ws.subscribe({ action: ActionType.DRAWING }, (v) => {
    console.log(`v [${ActionType[ActionType.DRAWING]}] ===> `, v)
  })

  const subscribeBB = ws.subscribe({ action: ActionType.JOIN_GAME }, (v) => {
    console.log(`v [${ActionType[ActionType.JOIN_GAME]}] ===> `, v)
  })

  const wsConnect = () => {
    ws.setUrl('wss://dv8g9p7m1c2xqz5.highplayfky.com/gameChannels')
    ws.setParams({ wsToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkZ1bjUyOTQyMSRfQVMiLCJnYW1lTWFuYWdlclR5cGUiOiI2MDI4MTciLCJtYW5hZ2VySWQiOiJkZWZhdWx0IiwiZnBJZCI6IjE2ODAiLCJzZXNzaW9uSWQiOiJGdW41Mjk0MjEkX0FTIiwibmJmIjoxNzU4NTMwODgzLCJleHAiOjE3NTg1MzExODMsImlhdCI6MTc1ODUzMDg4M30.o8w8W66cGbj3fria-QeslVf2q5BBb1dHQ18rmZsIhww' })
    ws.connect()

  }

  onMounted(() => {
    wsConnect()
    window._ws = ws
    console.log('useWebsocket init ')
  })

  onUnmounted(() => {
    subscribeAA?.unsubscribe()
    subscribeBB?.unsubscribe()
    // subscribeCC?.unsubscribe()
    ws.close()
    console.log('useWebsocket destory 123')
  })
}