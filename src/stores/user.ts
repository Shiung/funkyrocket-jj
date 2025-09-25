import { defineStore } from 'pinia'
import { computed, reactive, readonly, watchEffect } from 'vue'
import { setHeaderToken } from '@/apis/api-client'
import type { GameInfoResponse } from '@/apis/codegen/data-contracts'

type State = {
  /** from plateform */
  token: string
  /** game use token */
  authToken: string
  /** from api response */
  gameInfo: GameInfoResponse['gameInfo']
  /** from api response */
  playerInfo: GameInfoResponse['playerInfo']
  /** 權限異常 */
  unAuthorized: boolean
}

export const useUserStore = defineStore('user', () => {
  const state = reactive<State>({ token: '', authToken: '', gameInfo: undefined, playerInfo: undefined, unAuthorized: false })

  const setState = <key extends keyof State>(property: key, value: State[key]) => {
    if (property in state) {
      state[property] = value
    }
  }

  /** 重置 user authToken, gameInfo, playerInfo */
  const resetState = () => {
    state.authToken = ''
    state.gameInfo = undefined
    state.playerInfo = undefined
    state.unAuthorized = false
  }

  const wsInfo = computed(() => {
    const { socketUrl = '', socketToken = '' } = state.gameInfo?.currentGame || {}
    return {
      socketUrl,
      socketToken
    }
  })

  watchEffect(() => {
    if (state.authToken) setHeaderToken(state.authToken)
  })

  return {
    // state
    state, // 因為持久化寫入store state readonly 會被reject // state: readonly(state),
    // getter
    wsInfo: readonly(wsInfo),
    // action
    setState,
    resetState
  }
}, {
  persist: [
    {
      key: 'auth',
      storage: sessionStorage,
      pick: ['state'],
      serializer: {
        // 狀態 -> 字串（存入 storage 前）
        serialize: (v) => {
          return v.state.authToken
        },
        // 字串 -> 狀態（讀取 storage 後）
        deserialize: (v) => {
          return {
            state: {
              authToken: v
            }
          }
        }
      }
    }
  ]
})
