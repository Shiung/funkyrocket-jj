import mitt from 'mitt'
import { ActionType, type MessageMap } from '@/core/wsClient/types'

// global
type Events = {
  /** 登入權限異常 */
  unAuthorized: boolean
}

// 將 enum + MessageMap 轉成 Event
type EventFromEnum<E, M extends Record<number, any>> = {
  [K in keyof E as Extract<E[K], keyof M> extends never ? never : K]:
    M[Extract<E[K], keyof M>]
}

export const emitter = mitt<Events & EventFromEnum<typeof ActionType, MessageMap>>()
