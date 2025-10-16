export interface WebSocketOptions {
  url?: string
  params?: Record<string, string>
  heartbeatTimeout?: number
  heartbeatMessage?: string | object
  heartbeatFunc?: (() => void) | null
  reconnectAttempts?: number // -1 表示無限重連
  reconnectTimeout?: number
  messageHandler?: (e: MessageEvent<any>) => void
  genObservekey?: ((s: any) => string | number)
  /** ws forbidden callback */
  forbiddenCb?: () => void
}

export type Listener = (arg: any) => void
