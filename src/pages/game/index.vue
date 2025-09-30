<template>
  <div class="h-screen text-white relative overflow-hidden" :style="{ 
    backgroundImage: isDesktop ? pageBackgroundImage : 'none', 
    backgroundSize: 'cover', 
    backgroundPosition: 'center',
    backgroundColor: isDesktop ? 'transparent' : '#000000'
  }">
    <!-- PixiJS Canvas 游戲本體 - 保持寬度比例，高度100vh -->
    <canvas 
      ref="canvasRef" 
      class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
      :style="{ width: gameWidth + 'px', height: gameHeight + 'px' }"
    ></canvas>
    
    <!-- 右上角漢堡選單 -->
    <HamburgerMenu 
      :currentState="currentState"
      :charactersOnBoard="charactersOnBoard"
      :countdown="countdown"
      @updateVolume="updateVolume"
      @toggleBGM="toggleBGM"
      @toggleSoundEffect="toggleSoundEffect"
      @resetGame="resetGame"
    />

    <!-- Bottom Sheet 控制區域 -->
    <BottomSheet 
      :currentState="currentState"
      :charactersOnBoard="charactersOnBoard"
      :isAnimating="isAnimating"
      :scrollSpeed="scrollSpeed"
      :isScrolling="isScrolling"
      @startGame="startGame"
      @playerBoard="playerBoard"
      @streamerBoard="streamerBoard"
      @npcBoard="npcBoard"
      @startCountdown="startCountdown"
      @playerDisembark="playerDisembark"
      @streamerDisembark="streamerDisembark"
      @npcDisembark="npcDisembark"
      @explodeRocket="explodeRocket"
      @resetGame="resetGame"
      @changeGameState="changeGameState"
    />
  </div>
  <Loading v-if="isLoading" :isReadyToPlay="isReadyToPlay" @close="handleCloseLoadingEvent" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createLogger } from '@/utils/pixi/logger'

import HamburgerMenu from './components/HamburgerMenu.vue'
import BottomSheet from './components/BottomSheet.vue'
import Loading from './components/Loading.vue'
import { GameState } from './types'
import { useAudio } from './hooks/useAudio'
import { useGameState } from './hooks/useGameState'
import { useBaseConfig } from './hooks/useBaseConfig'
import { useBackground } from './hooks/useBackground'
import { useRocket } from './hooks/useRocket'
import { useCharacters } from './hooks/useCharacters'
import { useScene } from './hooks/useScene'
import { useEvent } from './hooks/useEvent'

// 遊戲狀態管理
const {
  currentState,
  countdown,
  isAnimating,
  charactersOnBoard,
  setState,
} = useGameState()

// 使用音效 hooks
const {
  initializeAudio,
  updateVolume,
  toggleBGM,
  toggleSoundEffect,
  destroyAudio,
} = useAudio()

// 基礎配置管理
const {
  gameWidth,
  gameHeight,
  isDesktop
} = useBaseConfig()

// 場景管理
const {
  canvasRef,
  getApp,
  setupLifecycle
} = useScene()

const logger = createLogger()

// 火箭管理
const {
  initializeRocket,
  startRocketFloat,
  stopRocketFloat,
  updateRocketScale,
  destroyRocket,
  getRocketSpine
} = useRocket(getApp)

// 角色管理
const {
  updateCharactersScale,
  destroyAllCharacters,
} = useCharacters(getApp, getRocketSpine)

// 背景管理
const {
  isScrolling,
  scrollSpeed,
  pageBackgroundImage,
  setDefaultBackground,
  setFrontCloud,
  updateBackgroundScale,
  updateFrontCloudScale,
  destroyBackground
} = useBackground(getApp)

// 處理事件
const {
  changeGameState,
  startGame,
  playerBoard,
  streamerBoard,
  npcBoard,
  startCountdown,
  playerDisembark,
  streamerDisembark,
  npcDisembark,
  explodeRocket,
  resetGame,
} = useEvent()

// 處理 Loading 事件
const isLoading = ref(true)
// 場景是否init完成且可以開始遊戲
const isReadyToPlay = ref(false)
const handleCloseLoadingEvent = (): void => {
  // 更新火箭位置
  updateRocketScale()

  isLoading.value = false
  logger.info('🔄 關閉 Loading 事件')
}

// 場景初始化
const initScene = async (): Promise<void> => {
  try {
    logger.info('=== 開始初始化 Funky Rocket 遊戲場景 ===')

    // 1. 初始化音效系統
    initializeAudio()

    // 2. 設置初始背景
    await setDefaultBackground()
    
    // 3. 設置前景雲朵（高度限制在螢幕一半）
    await setFrontCloud()

    // 4. 創建火箭 Spine 動畫
    await initializeRocket()
    
    setState(GameState.IDLE)
    logger.info('✅ Funky Rocket 遊戲場景初始化完成')

    // 5. 設置場景初始化完成
    isReadyToPlay.value = true

  } catch (error) {
    logger.error(`❌ 場景初始化失敗: ${error}`)
  }
}

// 設置生命週期管理
setupLifecycle({
  initScene,
  updateFunctions: {
    updateRocketScale,
    updateBackgroundScale,
    updateFrontCloudScale,
    updateCharactersScale,
    resetRocketFloat: () => {
      if (isScrolling.value) {
        stopRocketFloat()
        startRocketFloat()
      }
    }
  },
  cleanupFunctions: {
    destroyAllCharacters,
    destroyBackground,
    destroyRocket,
    destroyAudio
  }
})
</script>