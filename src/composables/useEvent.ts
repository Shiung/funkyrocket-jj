import { emitter } from '@/core/mitt'
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
// import { storeToRefs } from 'pinia'

export default function useEvent() {
  const userStore = useUserStore()
  // const { state } = storeToRefs(userStore)
  const unAuthorizedCallback = () => {
    console.log('unAuthorizedCallback ==>')
    // 權限異常 reset 所以狀態
    userStore.resetState()
  }

  onMounted(() => {
    emitter.on('unAuthorized', (s) => {
      userStore.setState('unAuthorized', s)
      unAuthorizedCallback()
    })
  })
  onUnmounted(() => {
    emitter.off('unAuthorized')
  })
}
