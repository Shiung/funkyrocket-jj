import { wsBase } from './wsBase'
import type { WebSocketOptions} from './types'

export const createWebsocket = (props: WebSocketOptions): wsBase => new wsBase(props)

export default createWebsocket
