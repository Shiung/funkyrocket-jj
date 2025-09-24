import API from '@api/index'
import { APIERROR } from '@/apis/config'
import { setHeaderToken } from '@/apis/api-client'
import { computed, onMounted, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'

export default function useInit() {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const { state } = storeToRefs(userStore)

  const routeQuery = computed(() => route.query)

  watchEffect(() => {
    if (routeQuery.value.token) {
      userStore.setState('token', routeQuery.value.token.toString())
    }
  })

  const fetchHandler = async () => {
    try {
      const sessionToken = state.value.token
      const res = await API.common.consumeplayerCreate({ sessionToken })
      if (res.data.returnCode === 1) throw Error(APIERROR[res.data.returnCode])
      const hasToken = res.data.authToken
      if (hasToken) {
        setHeaderToken(hasToken)
        userStore.setState('authToken', hasToken)
      }
      const gameInfo = await API.cashorcrash.gameInfoCreate({})
      userStore.setState('gameInfo', gameInfo.data.gameInfo)
      userStore.setState('playerInfo', gameInfo.data.playerInfo)
    } catch (e) {
      console.warn('e ==>', e)
    }
  }

  const pageRedirect = () => {
    const queryFromWindow = Object.fromEntries(new URLSearchParams(window.location.search))

    /** routeQuery.value 生命週期還沒寫入 */
    router.replace({ name: 'game', query: { ...queryFromWindow, ...routeQuery.value }})
  }

  onMounted(() => {
    console.log('useInit init ***')
    pageRedirect()
  })

  watch(() => state.value.token, (t) => {
    if (!t) return
    fetchHandler()
  })
}
