import mitt from 'mitt'
import { ActionType, type MessageMap } from '@/core/wsClient/types/message'

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

type MittEvents = Events & EventFromEnum<typeof ActionType, MessageMap>

/** 
 * [emitter] callback function
 */
export type HandlerOf<K extends keyof MittEvents> = (payload: MittEvents[K]) => void

/**
 * 
 * @example
 * ```ts
 * emitter.on('unAuthorized', (message) => {}) 
 * ```
 * @param message 會推倒定義的型別
 * 
 * @example
 * ```ts
 * const callback: HandlerOf<'unAuthorized'> = (messageCb) => {}
 * emitter.on('unAuthorized', callback)
 * ```
 * @param messageCb 會推倒定義的型別
 * @description 透過 `type HandlerOf` 進行callback function 推導
*/
export const emitter = mitt<MittEvents>()

declare global {
  interface Window {
    /** instance debug */
    _emitter?: any
  }
}

window._emitter = emitter
