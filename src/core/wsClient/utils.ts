import type { WebSocketOptions } from './types'

type DebugMsg = {
  type: 'system' | 'info'
  title: string
  msg: string | any
  isDebug?: boolean
}

export const debugMessage = (props: DebugMsg) => {
  if (!props.isDebug) return
  switch (props.type) {
    case 'system':
      console.info(`%c [ws] ${props.title}`, 'background-color: rgba(144, 238, 144, 0.3); font-weight: bold', props.msg)
      break
    case 'info':
      console.info(`%c [ws] ${props.title}`, 'background-color: rgba(25, 118, 210, 0.3); font-weight: bold', props.msg)
      break
    default:
      break
  }
}

export const jsonParse = (d: any) => {
  try {
    return JSON.parse(d)
  } catch (e) {
    console.warn('_JsonParse error:', e)
    return d
  }
}

export const bindUrl = (url: string, params?: WebSocketOptions['params']) => {
  try {
    const urlObj = new URL(url)
    const searchParams = new URLSearchParams(params as unknown as URLSearchParams)
    if (searchParams.size !== 0) urlObj.search = searchParams.toString()
    return urlObj.href
  } catch (e) {
    console.warn('_BindUrl error', e)
  }
}