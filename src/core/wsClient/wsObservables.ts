import type { Listener } from './types'

class EventObservable {
  constructor(private listeners: Array<Listener> = []) {}

  subscribe(listener: Listener) {
    if (this.listeners.indexOf(listener) === -1) {
      this.listeners.push(listener)
    }

    return {
      unsubscribe: () => {
        this.listeners.splice(this.listeners.indexOf(listener), 1)
      }
    }
  }

  notify(message: any) {
    this.listeners.map(listener => listener(message))
  }
}

class WsObservables<TEventKeys> {
  public observables: Map<TEventKeys, EventObservable>

  constructor() {
    this.observables = new Map()
  }

  public notice(event: TEventKeys) {
    return this.observables.has(event) ? this.observables.get(event) : false
  }

  public get(event: TEventKeys) {
    if (!this.observables.has(event)) this.observables.set(event, new EventObservable())
    return this.observables.get(event)
  }

  public reset() {
    this.observables.clear()
  }
}

export default new WsObservables<string | number | Symbol>()
