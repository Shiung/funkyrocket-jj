import API from '@api/index'
import { APIERROR } from '@/apis/config'
import { setHeaderToken } from '@/apis/api-client'
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import { emitter } from '@/core/mitt'

enum CusCode {
  tokenFail = 1,
  authTokenFail = 2
}

export default function useInit() {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const { state } = storeToRefs(userStore)

  const routeQuery = computed(() => route.query)

  const fetchHandler = async () => {
    userStore.setState('unAuthorized', false)
    /** authtoken store 持久化如果有 如果有存在不call api consumeplayerCreate 只能請求一次 */
    const authToken = state.value.authToken
    try {
      const sessionToken = state.value.token
      let hasToken = authToken
      if (!hasToken) {
        const res = await API.common.consumeplayerCreate({ sessionToken })
        if (res.data.returnCode !== APIERROR.NoError) throw { message: APIERROR[res.data.returnCode as any], code: CusCode.tokenFail }
        hasToken = res.data.authToken ?? ''
      }
      if (hasToken) {
        setHeaderToken(hasToken)
        userStore.setState('authToken', hasToken)
      } else throw { message: 'without authtoken', code: CusCode.authTokenFail }

      const gameInfo = await API.cashorcrash.gameInfoCreate({})
      userStore.setState('gameInfo', gameInfo.data.gameInfo)
      userStore.setState('playerInfo', gameInfo.data.playerInfo)
    } catch (e: any) {
      console.warn('e ==>', e)
      if ([CusCode.tokenFail, CusCode.authTokenFail].some(c => c === e.code)) {
        emitter.emit('unAuthorized', true)
      }
    }
  }

  // const pageRedirect = () => {
  //   const queryFromWindow = Object.fromEntries(new URLSearchParams(window.location.search))

  //   /** routeQuery.value 生命週期還沒寫入 */
  //   router.replace({ name: 'game', query: { ...queryFromWindow, ...routeQuery.value }})
  // }

  onMounted(() => {
    console.log('useInit init ***')
    // pageRedirect()
    router.replace({ name: 'game' })
  })

  watch(() => routeQuery.value.token, (query) => {
    if (query) {
      userStore.setState('token', query.toString())
    }
  }, {
    immediate: true
  })

  watch(() => state.value.token, (t, prevToken) => {
    if (!t) return
    // token change reset authToken
    if (prevToken) {
      userStore.resetState()
    }
    fetchHandler()
  })
}
