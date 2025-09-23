import wsObservables from './wsObservables'
import type { WebSocketOptions } from './types'
import { debugMessage, jsonParse, bindUrl } from './utils'

const _defaultOption = {
  heartbeatTimeout: 1000 * 10, // 预设心跳间隔 10 秒
  heartbeatMessage: 'ping', // 预设心跳讯息
  heartbeatFunc: null, // 心跳函式 如果有设定 在只使用这个函式 不使用预设心跳讯息
  reconnectAttempts: 5, // 预设重试 5 次
  reconnectTimeout: 3000,
  genObservekey: (v: string) => {return `${v}`},
}

export class wsBase {
  private ws: WebSocket | null = null
  private readonly options: WebSocketOptions  
  private _wsDebug = sessionStorage.getItem('omg') === 'true' || false

  /** reconnect process */
  private reconnectIng: boolean = false

  /** 已重複連線次數 */
  private reconnectCount: number = 0

  /** 終止ws連線 */
  private endOfWs: boolean = false

  private observableInstance = wsObservables
  /** ws 可以正常交握 */
  private enabled: boolean = false

  /** timer 容器 */
  private timer: {
    reconnet: ReturnType<typeof setTimeout> | null
    heartbeat: ReturnType<typeof setTimeout> | null
  } = { reconnet: null, heartbeat: null }

  constructor(options: WebSocketOptions) {
    this.options = {
      ..._defaultOption,
      ...options
    }
  }

  /** 建立連線 */
  public connect() {
    if ([WebSocket.CONNECTING, WebSocket.OPEN].some((status) => status === this.ws?.readyState)) return
    
    const connectUrl = bindUrl(this.options.url ?? '', this.options.params)
    if (!connectUrl) return
    this.ws = new WebSocket(connectUrl)

    this.ws.onopen = (event) => {
      debugMessage({ type: 'system', title: '😱 onopen', msg: event, isDebug: this._wsDebug })
      this.enabled = true
      this.reconnectCount = 0
      this.reconnectIng = false
      this.endOfWs = false
    }

    this.ws.onmessage = (event) => {
      const resData = jsonParse(event.data)
      debugMessage({ type: 'system', title: '😱 onmessage', msg: resData, isDebug: this._wsDebug })
      this.obserableNotify(resData)
    }

    this.ws.onerror = (event) => {
      debugMessage({ type: 'system', title: '😱 onerror', msg: event, isDebug: this._wsDebug })
    }

    this.ws.onclose = (event) => {
      this.reconnectIng = false
      debugMessage({ type: 'system', title: '😱 onclose', msg: event, isDebug: this._wsDebug })
      
      if (event.code === 1000 || this.endOfWs) {
        // 使用者發起的關閉
        return
      }

      debugMessage({ type: 'info', title: 'reconnect', msg: 'reconnect action', isDebug: this._wsDebug })
      this.reconnect()
    }
  }

  /** reconnect socket */
  private async reconnect() {
    const maxReAttemp = this.options.reconnectAttempts || _defaultOption.reconnectAttempts
    const reconnectTimeout = this.options.reconnectTimeout || _defaultOption.reconnectTimeout

    if (this.reconnectIng || this.reconnectCount > maxReAttemp) return // 終止重新連線
    
    this.reconnectIng = true

    if (this.ws?.readyState === WebSocket.OPEN) {
      debugMessage({ type: 'info', title: 'reconnect', msg: 'old socket close', isDebug: this._wsDebug })
      await this.close(1006)
    }
    if (this.reconnectCount > 0) {
      await new Promise((resolve) => {
        this.timer.reconnet = setTimeout(() => resolve(true), reconnectTimeout)
      })
    }
    debugMessage({ type: 'info', title: 'reconnect', msg: 'connect process', isDebug: this._wsDebug })
    this.cleanup()
    this.reconnectCount++
    this.connect()
  }

  /** close socket */
  public async close(status: number = 1000): Promise<void> {
    if (!this.ws || [WebSocket.CLOSING, WebSocket.CLOSED].some(status => status === this.ws?.readyState)) {
      return Promise.resolve()
    }

    /** 使用者手動關閉行為 status 1000 */
    if (status === 1000) {
      this.endOfWs = true
      this.ws.close(1000, 'user close')
    } else {
      this.ws.close()
    }
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

  /** 更新連線 URL */
  public setUrl(newUrl: WebSocketOptions['url']) {
    if (this.options.url === newUrl) return
    this.options.url = newUrl
  }

  /** 更新連線 params */
  public setParams(p: WebSocketOptions['params']) {
    this.options.params = p
  }

  // TODO heatbeat

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