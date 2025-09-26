<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { createSpineAnimation, playSpineAnimation, createPixiApp } from '@/utils/pixi'
import { useBaseConfig } from '../hooks/useBaseConfig'

const { gameWidth, gameHeight } = useBaseConfig()

const emit = defineEmits<{
  close: []
}>()

const props = defineProps<{
  isReadyToPlay: boolean
}>()

// Loading Spine 動畫相關
const loadingCanvasRef = ref<HTMLCanvasElement>()
let loadingApp: any = null
let loadingSpine: any = null

const genMainStyle = computed(() => {
  return {
    width: gameWidth.value + 'px',
    height: gameHeight.value + 'px'
  }
})

// 初始化 Loading Spine 動畫
const initLoadingSpine = async () => {
  if (!loadingCanvasRef.value) return

  try {
    // 使用現有的 createPixiApp 函數
    const pixiResult = await createPixiApp({
      canvas: loadingCanvasRef.value,
      width: 152, // 9.5rem = 152px
      height: 200, // 11.25rem = 180px
      backgroundColor: 0x000000,
      backgroundAlpha: 0 // 透明背景
    })

    loadingApp = pixiResult.app

    // 創建 Spine 動畫
    const spineResult = await createSpineAnimation({
      skelPath: '/assets/spine/loading/loading.skel',
      atlasPath: '/assets/spine/loading/loading.atlas',
      imagePath: '/assets/spine/loading/loading.png'
    })

    loadingSpine = spineResult.spine

    // 設置 Spine 位置和縮放
    loadingSpine.x = 76 // 畫布中心
    loadingSpine.y = 125
    loadingSpine.scale.set(0.5) // 根據需要調整大小

    loadingApp.stage.addChild(loadingSpine)

    // 播放動畫（如果有的話）
    if (spineResult.animations.length > 0) {
      playSpineAnimation(loadingSpine, spineResult.animations[0], true)
    }

    console.log('✅ Loading Spine 動畫初始化完成')
  } catch (error) {
    console.error('❌ Loading Spine 動畫初始化失敗:', error)
  }
}

// 清理 Loading Spine 動畫
const destroyLoadingSpine = () => {
  if (loadingSpine && loadingApp) {
    loadingApp.stage.removeChild(loadingSpine)
    loadingSpine = null
  }
  
  if (loadingApp) {
    loadingApp.destroy()
    loadingApp = null
  }
}

function handleCloseClick() {
  emit('close')
}

onMounted(() => {
  initLoadingSpine()
})

onUnmounted(() => {
  destroyLoadingSpine()
})

</script>

<template>
  <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-90 z-50" :style="genMainStyle">
    <div class="h-full w-full flex flex-col gap-3 items-center justify-center">
      <canvas 
        ref="loadingCanvasRef" 
        class="w-[9.5rem] h-[11.25rem]"
      ></canvas>
      <div class="text-white text-base">游戏载入中...</div>
      <!-- TODO: color -->
      <button
        :class="['rounded-lg px-3 py-1.5', !props.isReadyToPlay ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#B241FD] cursor-pointer']"
        :disabled="!props.isReadyToPlay" @click="handleCloseClick">
        <span :class="['text-base', !props.isReadyToPlay ? 'text-gray-400' : 'text-white']">开始游玩</span>
      </button>
    </div>
  </div>
</template>
