import mitt from 'mitt'

type Events = {
  /** 登入權限異常 */
  unAuthorized: boolean
}

export const emitter = mitt<Events>()
