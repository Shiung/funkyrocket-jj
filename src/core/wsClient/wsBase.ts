import wsObservables from './wsObservables'
import type { WebSocketOptions } from './types'

// const _checkIsConnect

export class wsBase {
  private ws: WebSocket | null = null
  private readonly options: WebSocketOptions
  private _wsDebug = sessionStorage.getItem('omg') === 'true' || false

  private observableInstance = wsObservables
  /** ws 可以正常交握 */
  private enabled: boolean = false

  /** reconnect timer */
  private timer: {
    reconnet: ReturnType<typeof setTimeout> | null
    heartbeat: ReturnType<typeof setTimeout> | null
  } = { reconnet: null, heartbeat: null }

  constructor(options: WebSocketOptions) {
    this.options = {
      heartbeatTimeout: 1000 * 10, // 预设心跳间隔 10 秒
      heartbeatMessage: 'ping', // 预设心跳讯息
      heartbeatFunc: null, // 心跳函式 如果有设定 在只使用这个函式 不使用预设心跳讯息
      reconnectAttempts: 5, // 预设重试 5 次
      reconnectTimeout: 3000,
      genObservekey: (v) => {return `${v}`},
      ...options
    }
  }

  /** 建立連線 */
  public connect() {
    if ([WebSocket.CONNECTING, WebSocket.OPEN].some((status) => status === this.ws?.readyState)) return
    // const url = new URL(this.url)
    this.ws = new WebSocket(this.options.url)

    this.ws.onopen = (event) => {
      console.log('😱 onopen', event)
      this.enabled = true
    }

    this.ws.onmessage = (event) => {
      console.log('😱 onmessage', event, JSON.parse(event.data))
      this.obserableNotify(JSON.parse(event.data))
    }

    this.ws.onerror = (event) => {
      console.log('😱 onerror', event)

    }

    this.ws.onclose = (event) => {
      console.log('😱 onclose', event)
    }
  }

  private reconnect(): void {

  }

  /** close socket */
  public async close(): Promise<void> {
    if (!this.ws || [WebSocket.CLOSING, WebSocket.CLOSED].some(status => status === this.ws?.readyState)) {
      return Promise.resolve()
    }

    /** 使用者手動關閉行為 status 1000 */
    this.ws.close(1000, 'user close')
    await this.waitingSocketClosed()

    this.cleanup()
  }

  /** socket send message */
  public async send(data: any): Promise<void> {
    if (this.ws?.readyState === WebSocket.CONNECTING) {
      await this.waitingSocketConnect()
    }
    if (this.enabled && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    }
  }

  // private heartbeatRoop() {
  //   const heartBeatFn = () => {
  //     this.ws
  //   }
  //   this.timer.heartbeat = setInterval(() => {
  //     if (this.ws?.readyState !== WebSocket.OPEN) return

  //     if (this.options.heartbeatFunc) {
  //       this.options.heartbeatFunc()
  //     } else {
  //       this.send(this.options.heartbeatMessage)
  //     }
  //   }, this.options.heartbeatInterval)
  // }

  /** 用 promise 等待確認ws是否已經正常關閉 */
  private async waitingSocketClosed() {
    return new Promise(resolve => {
      const checkState = () => {
        if (this.ws?.readyState === WebSocket.CLOSED) resolve(true)
        else setTimeout(checkState, 10)
      }
      checkState()
    })
  }

  /** 用 promise 等待確認ws是否已經連線 */
  private async waitingSocketConnect() {
    return new Promise(resolve => {
      const checkState = () => {
        if (this.ws?.readyState === WebSocket.OPEN) resolve(true)
        else setTimeout(checkState, 10)
      }
      checkState()
    })
  }

  public subscribe(event: any, callback: (agr: any) => void) {
    const key = this.options.genObservekey?.(event) ?? Symbol()
    const observable = this.observableInstance.get(key)
    return observable?.subscribe(callback)
  }


  private obserableNotify(event: any) {
    try {
      const key = this.options.genObservekey?.(event)
  
      if (!key) return
      const observable = this.observableInstance.notice(key)
      if (observable) {
        observable.notify(event)
      }
    } catch (e) {
      console.warn('error', e)
    }
  }



  /** 清理資源 */
  private cleanup(): void {
    if (this.timer.heartbeat) {
      clearTimeout(this.timer.heartbeat)
      this.timer.heartbeat = null
    }
    if (this.timer.reconnet) {
      clearTimeout(this.timer.reconnet)
      this.timer.reconnet = null
    }
    this.enabled = false
  }
}