<template>
  <div class="h-screen text-white relative overflow-hidden" :style="{ backgroundImage: pageBackgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }">
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
</template>

<script setup lang="ts">

import { createLogger } from '@/utils/pixi/logger'

import HamburgerMenu from './components/HamburgerMenu.vue'
import BottomSheet from './components/BottomSheet.vue'
import { GameState } from './types'
import { useAudio } from './hooks/useAudio'
import { useGameState } from './hooks/useGameState'
import { useBaseConfig } from './hooks/useBaseConfig'
import { useBackground } from './hooks/useBackground'
import { useRocket } from './hooks/useRocket'
import { useCharacters } from './hooks/useCharacters'
import { useScene } from './hooks/useScene'

// 遊戲狀態管理
const {
  currentState,
  countdown,
  isAnimating,
  hasPlayedLaunchPlayer,
  charactersOnBoard,
  setState,
  setCountdown,
  setAnimating,
  setLaunchPlayerPlayed,
  addCharacterToBoard,
  removeCharacterFromBoard,
  resetGameState
} = useGameState()

// 使用音效 hooks
const {
  initializeAudio,
  updateVolume,
  toggleBGM,
  toggleSoundEffect,
  playBGM,
  playSound,
  stopBGM,
  stopAllAudio,
  destroyAudio,
  bgmEnabled
} = useAudio()

// 基礎配置管理
const {
  gameWidth,
  gameHeight
} = useBaseConfig()

// 場景管理
const {
  canvasRef,
  getApp,
  getCountdownTimer,
  setupLifecycle
} = useScene()

const logger = createLogger()

// 火箭管理
const {
  initializeRocket,
  startRocketFloat,
  stopRocketFloat,
  playRocketAnimation,
  playRocketAnimationWithTrack,
  clearRocketStateWithTrack,
  resetRocket,
  updateRocketScale,
  destroyRocket,
  getRocketSpine
} = useRocket(getApp)

// 角色管理
const {
  createCharacterWalk,
  createCharacterJump,
  animateCharacterWalk,
  animateCharacterJump,
  updateCharactersScale,
  destroyAllCharacters,
  waitForAllCharactersComplete
} = useCharacters(getApp, getRocketSpine)

// 背景管理
const {
  isScrolling,
  scrollSpeed,
  pageBackgroundImage,
  setDefaultBackground,
  setFrontCloud,
  initCycleBackground,
  startBackgroundScroll,
  stopBackgroundScroll,
  animateBackgroundFloatUp,
  updateBackgroundScale,
  updateFrontCloudScale,
  resetBackground,
  destroyBackground
} = useBackground(getApp)

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
    
  } catch (error) {
    logger.error(`❌ 場景初始化失敗: ${error}`)
  }
}

// ===== 遊戲流程控制函數 =====

// 開始遊戲
const startGame = (): void => {
  if (currentState.value !== GameState.IDLE) return
  
  logger.info('🎮 開始 Funky Rocket 遊戲')
  setState(GameState.BOARDING)

  // 播放開場BGM（如果開關啟用）
  if (bgmEnabled.value) playBGM('bgm_open', true)
}

// 玩家上車
const playerBoard = async (): Promise<void> => {
  const character = await createCharacterWalk('player', `player-${Date.now()}`)
  if (!character) return

  addCharacterToBoard('player')
  playSound('button_bet') // 玩家上車音效(投注)
  await animateCharacterWalk(character, 'left')
  playSound('into') // 角色進艙門音效
}

// 主播上車
const streamerBoard = async (): Promise<void> => {
  
  const character = await createCharacterWalk('streamer', `streamer-${Date.now()}`)
  if (!character) return

  addCharacterToBoard('streamer')
  
  // 等待主播上車動畫完全完成
  await animateCharacterWalk(character, 'left')
  playSound('into') // 角色進艙門音效
  
  // 等待主播上車動畫完全結束後，才播放 launch_player
  // 主播有上車過就不需要再播放了
  if (hasPlayedLaunchPlayer.value) return

  const trackEntry = playRocketAnimationWithTrack('launch_player', false, 1)
  if (trackEntry) {
    // 嘗試設定 mixBlend 為 normal，保持原始效果
    if ((trackEntry as any).mixBlend !== undefined) {
      (trackEntry as any).mixBlend = 'add'
    }
    
    trackEntry.alpha = 1  // 完全不透明
    trackEntry.mixDuration = 0
  }
  setLaunchPlayerPlayed(true)
}

// NPC上車
const npcBoard = async (): Promise<void> => {
  
  const character = await createCharacterWalk('npc', `npc-${Date.now()}`)
  if (!character) return

  addCharacterToBoard('npc')
  await animateCharacterWalk(character, 'right')
  playSound('into') // 角色進艙門音效
}

// 開始倒數計時
const startCountdown = (): void => {
  const countdownTimer = getCountdownTimer()
  if (!countdownTimer) return
  
  logger.info('⏰ 開始倒數計時')
  setState(GameState.COUNTDOWN)
  
  let lastSecond = -1 // 追蹤上一秒的值
  
  // 倒數5秒
  playSound('countdown_5_sec')

  countdownTimer.start(5, (remaining) => {
    const currentSecond = Math.ceil(remaining)
    setCountdown(remaining)
    
    // 只在秒數變化時播放音效
    if (currentSecond !== lastSecond && currentSecond > 0) {
      logger.info(`🔊 倒數: ${currentSecond}`)
      lastSecond = currentSecond
    }
  }, async () => {
    setCountdown(0)
    await launchRocket()
  })
}

// 火箭發射序列
const launchRocket = async (): Promise<void> => {
  logger.info('🚀 火箭發射序列開始')

  // 先停止開場BGM，但保留其他BGM
  stopBGM('bgm_open')
  
  // 等待所有上車動畫完成 - 檢查是否還有角色在移動中
  await waitForAllCharactersComplete()
  
  try {
    // 1. 發射準備階段 - 播放 rocket_shake 動畫
    setState(GameState.LAUNCHING)
    
    playRocketAnimation('rocket_shake', false)
    
    playBGM('rocket_prelaunch', false)
    
    // 等待1秒
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 2. 發射啟動階段 - 播放 flying 動畫並開始背景滾動
    playRocketAnimation('flying', false)

    // 初始化循環背景並開始滾動 (flying 動畫開始時才滾動)
    await initCycleBackground()
    startBackgroundScroll()
    
    // 等待1.5秒
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 3. 飛行階段 - 播放 flying_loop 動畫
    setState(GameState.FLYING)
    playRocketAnimation('flying_loop', true)

    // 播放飛行BGM（如果開關啟用）
    if (bgmEnabled.value) {
      playBGM('bgm_fly', true)
    }

    // 進入下車階段
    setState(GameState.DISEMBARKING)
    logger.info('✅ 火箭發射完成，進入下車階段')

      // 開始火箭漂浮效果（延遲一小段時間確保位置穩定）
      setTimeout(() => {
        startRocketFloat()
      }, 100)
    
  } catch (error) {
    logger.error(`❌ 火箭發射失敗: ${error}`)
  }
}

// 玩家下車
const playerDisembark = async (): Promise<void> => {
  logger.info('🎯 玩家下車按鈕被點擊')
  const character = await createCharacterJump('player', `player-disembark-${Date.now()}`, { 
    name: '玩家下車囉', 
    odds: '9999999.99x' 
  })
  if (!character) return

  removeCharacterFromBoard('player')
  logger.info('🎯 玩家角色創建成功，開始動畫')
  await animateCharacterJump(character)
  playSound('user_jump') // 玩家下車音效
}

// 主播下車
const streamerDisembark = async (): Promise<void> => {
  if (hasPlayedLaunchPlayer.value) {
    setLaunchPlayerPlayed(false)
    const trackEntry = playRocketAnimationWithTrack('launch_player', false, 1)
    if (trackEntry) {
      // 反轉動畫
      trackEntry.reverse = true
      // 嘗試設定 mixBlend 為 normal，保持原始效果
      if ((trackEntry as any).mixBlend !== undefined) {
        (trackEntry as any).mixBlend = 'add'
      }
      
      trackEntry.alpha = 1
      trackEntry.mixDuration = 0
    }
    // 等launch_player動畫反轉播完
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  const character = await createCharacterJump('streamer', `streamer-disembark-${Date.now()}`, { 
    name: '主播下車囉', 
    odds: '9999999.99x' 
  })
  if (!character) return

  removeCharacterFromBoard('streamer')
  await animateCharacterJump(character)
  playSound('other_jump') // 其他人下車音效
}

// NPC下車
const npcDisembark = async (): Promise<void> => {
  const character = await createCharacterJump('npc', `npc-disembark-${Date.now()}`)
  if (!character) return

  removeCharacterFromBoard('npc')
  await animateCharacterJump(character)
  playSound('other_jump') // 其他人下車音效
}

// 火箭爆炸
const explodeRocket = async (): Promise<void> => {
  if (isAnimating.value) return
  
  logger.info('💥 火箭爆炸')
  setState(GameState.EXPLODING)
  setAnimating(true)
  
  try {    
    // 停止火箭飛行音效、背景滾動和漂浮效果
    stopAllAudio()
    stopBackgroundScroll()
    stopRocketFloat()
    
    // 清理火箭軌道狀態
    clearRocketStateWithTrack(1)
    
    // 播放爆炸動畫和音效
    playRocketAnimation('explosion', false)
    playSound('rocket_explode')
    logger.info('💥 火箭爆炸')
    
    // 等待爆炸動畫完成（假設3秒）
    // await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 遊戲結束
    setState(GameState.COMPLETED)
    setAnimating(false)
    logger.info('✅ 遊戲流程完成')
    
  } catch (error) {
    logger.error(`❌ 爆炸序列失敗: ${error}`)
    setAnimating(false)
  }
}

// 重置遊戲
const resetGame = async (): Promise<void> => {
  logger.info('🔄 重置 Funky Rocket 遊戲')

  // 重新開始音效
  playSound('return')
  
  // 停止所有動畫、計時器和音效
  const countdownTimer = getCountdownTimer()
  if (countdownTimer) {
    countdownTimer.stop()
  }
  stopAllAudio() // 停止所有背景音樂
  stopRocketFloat() // 停止火箭漂浮效果
  // 清理所有角色
  destroyAllCharacters()
  
  // 重置所有遊戲狀態
  resetGameState()
  
  // 重置背景系統
  stopBackgroundScroll()
  
  // 重置背景並獲取舊背景引用
  const { oldCycleSprites, oldDefaultBackground, oldFrontCloud } = await resetBackground()
  
  // 添加從下往上的浮現動畫，並在完成後清理舊背景
  animateBackgroundFloatUp(oldCycleSprites, oldDefaultBackground, oldFrontCloud)
  
  // 重置火箭動畫和大小 (考慮縮放因子)
  resetRocket()
  
  logger.info('✅ 遊戲重置完成')
}

// 快速切換遊戲階段
const changeGameState = async (newState: string): Promise<void> => {
  const targetState = newState as GameState
  logger.info(`🎮 快速切換遊戲階段: ${currentState.value} -> ${targetState}`)
  
  // 如果是同樣的狀態，直接返回
  if (currentState.value === targetState) return
  
  try {
    // 先停止所有正在進行的動畫和音效
    const countdownTimer = getCountdownTimer()
    if (countdownTimer) countdownTimer.stop()

    stopBGM()
    stopAllAudio()
    setCountdown(0)
    setAnimating(false)
    stopRocketFloat()

    // 根據目標狀態設置場景
    switch (targetState) {
      case GameState.IDLE:
        destroyBackground()
        resetGameState()
        await resetBackground()
        await setFrontCloud()
        playBGM('bgm_open')
        resetRocket()
        break
        
      case GameState.BOARDING:
        destroyBackground()
        setState(GameState.BOARDING)
        await resetBackground()
        await setFrontCloud()
        playBGM('bgm_open')
        resetRocket()
        playRocketAnimation('launch', true)
        break
        
      case GameState.COUNTDOWN:
        destroyBackground()
        setState(GameState.COUNTDOWN)
        await resetBackground()
        await setFrontCloud()
        playBGM('bgm_open')
        resetRocket()
        playRocketAnimation('launch', true)
        startCountdown()
        break
        
      case GameState.LAUNCHING:
        destroyBackground()
        setState(GameState.LAUNCHING)
        setAnimating(true)
        await setDefaultBackground()
        await setFrontCloud()
        playRocketAnimation('launch', true)

        launchRocket()
        break
        
      case GameState.FLYING:
        destroyBackground()
        setState(GameState.FLYING)
        // 從中間開始滾動，模擬已經飛行了一段時間
        await initCycleBackground(true)
        await setFrontCloud()
        startBackgroundScroll()
        playBGM('bgm_fly')
        startRocketFloat()
        playRocketAnimation('flying_loop', true)
        break
        
      case GameState.DISEMBARKING:
        destroyBackground()
        setState(GameState.DISEMBARKING)
        // 從中間開始滾動，模擬已經飛行了一段時間  
        await initCycleBackground(true)
        await setFrontCloud()
        startBackgroundScroll()
        playBGM('bgm_fly')
        startRocketFloat()
        playRocketAnimation('flying_loop', true)
        break
        
      case GameState.EXPLODING:
        destroyBackground()
        setState(GameState.EXPLODING)
        await initCycleBackground(true)
        setAnimating(true)
        playSound('rocket_explode')
        stopRocketFloat()
        clearRocketStateWithTrack(1)
        playRocketAnimation('explosion', false)
        break
        
      case GameState.COMPLETED:
        destroyBackground()
        setState(GameState.COMPLETED)
        await initCycleBackground(true)
        setAnimating(false)
        playSound('win')
        stopRocketFloat()
        break
    }
    
    logger.info(`✅ 遊戲階段切換完成: ${targetState}`)
    
  } catch (error) {
    logger.error(`❌ 遊戲階段切換失敗: ${error}`)
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