<script setup lang="ts">
import { computed } from 'vue'
import { useBaseConfig } from '../hooks/useBaseConfig'

const { gameWidth, gameHeight } = useBaseConfig()

const emit = defineEmits<{
  close: []
}>()

const props = defineProps<{
  isReadyToPlay: boolean
}>()

const genMainStyle = computed(() => {
  return {
    width: gameWidth.value + 'px',
    height: gameHeight.value + 'px'
  }
})

function handleCloseClick() {
  emit('close')
}

</script>

<template>
  <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-90 z-50" :style="genMainStyle">
    <div class="h-full w-full flex flex-col gap-3 items-center justify-center">
      <img src="/assets/loading/loading.webp" alt="loading" class="w-[9.5rem] h-[11.25rem]" />
      <div class="text-white text-base">游戏载入中...</div>
      <!-- TODO: color -->
      <button :class="['rounded-lg px-3 py-1.5', !props.isReadyToPlay ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#B241FD] cursor-pointer']" :disabled="!props.isReadyToPlay" @click="handleCloseClick">
        <span :class="['text-base', !props.isReadyToPlay ? 'text-gray-400' : 'text-white']">开始游玩</span>
      </button>
    </div>
  </div>
</template>