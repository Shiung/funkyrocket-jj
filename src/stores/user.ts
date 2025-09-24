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
}

export const useUserStore = defineStore('user', () => {
  const state = reactive<State>({ token: '', authToken: '', gameInfo: undefined, playerInfo: undefined })

  const setState = <key extends keyof State>(property: key, value: State[key]) => {
    if (property in state) {
      state[property] = value
    }
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
    state: readonly(state),
    // getter
    wsInfo: readonly(wsInfo),
    // action
    setState
  }
})