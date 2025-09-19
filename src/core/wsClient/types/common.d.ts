export interface WebSocketOptions {
  url: string
  heartbeatTimeout?: number
  heartbeatMessage?: string | object
  heartbeatFunc?: (() => void) | null
  reconnectAttempts?: number // -1 表示無限重連
  reconnectTimeout?: number
  messageHandler?: (e: MessageEvent<any>, event: IWsMasterEvent) => void
  genObservekey?: ((s: any) => string | number)
}

export type Listener = (arg: any) => void
