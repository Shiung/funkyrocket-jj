import { ref, computed } from 'vue'
import { AudioManager, type AudioAssets } from '@/utils/pixi/scene'
import { useAudioStore } from '@/stores/audio'
import { createLogger } from '@/utils/pixi/logger'

// 音效管理器實例
const audioManager = ref<AudioManager | null>(null)

const logger = createLogger()

export const useAudio = () => {
  const audioStore = useAudioStore()

  // 響應式音效資源配置 - 固定使用 funkyRocket
  const audioAssets = computed<AudioAssets>(() => ({
    into: '/assets/mp3/into.mp3', // 角色進艙門
    button_bet: '/assets/mp3/button_bet.mp3', // 下注按鈕
    button_normal: '/assets/mp3/button_normal.mp3', // 其他按鈕
    bgm_open: '/assets/mp3/start.mp3', // 起飛前背景音樂
    bgm_fly: '/assets/mp3/loop.mp3', // 飛行背景音樂
    countdown_5_sec: '/assets/mp3/countdown5sec.mp3', // 倒數5秒
    countdown_10_sec: '/assets/mp3/countdown10sec.mp3', // 倒數10秒
    rocket_prelaunch: '/assets/mp3/launch.mp3', // 火箭發射
    user_jump: '/assets/mp3/jumpMe.mp3', // 玩家跳躍
    other_jump: '/assets/mp3/jumpOther.mp3', // 其他人跳躍
    win: '/assets/mp3/win.mp3', // 獲勝
    rocket_explode: '/assets/mp3/explode.mp3', // 火箭爆炸
    return: '/assets/mp3/return.mp3', // 重新開始
  }))

  // 初始化 AudioManager
  const createAudioManager = (): AudioManager => {
    const manager = new AudioManager(audioAssets.value, logger.createLogFunction())
    // 立即應用當前音量設定
    manager.setVolume(audioStore.normalizedVolume)
    // 因為瀏覽器安全限制，要使用者點擊過才能播放音效，那就第一次點擊就全部播一次
    manager.playAudioOnFirstClick()
    return manager
  }

  // 初始化音效系統
  const initializeAudio = (): void => {
    audioManager.value = createAudioManager()
    updateVolume() // 設置初始音量
    logger.info('🔊 音效系統初始化完成')
  }

  // 音量控制
  const updateVolume = (): void => {
    if (audioManager.value) {
      audioStore.setVolume(audioStore.volume) // 觸發 localStorage 保存
      audioManager.value.setVolume(audioStore.normalizedVolume)
      logger.info(`🔊 音量設置: ${audioStore.volume}%`)
    }
  }

  // BGM 總開關控制
  const toggleBGM = (): void => {
    audioStore.toggleBGM()
    
    if (!audioManager.value) return
    
    if (audioStore.bgmEnabled) {
      logger.info('🎵 BGM 已開啟')
    } else {
      // 停止所有 BGM
      audioManager.value.stopAllBGM()
      logger.info('🎵 BGM 已關閉')
    }
  }

  // 音效總開關控制
  const toggleSoundEffect = (): void => {
    audioStore.toggleSoundEffect()
    logger.info(`🔊 音效${audioStore.soundEffectEnabled ? '已開啟' : '已關閉'}`)
  }

  // 安全播放 BGM（檢查開關狀態）
  const playBGM = (key: string, loop: boolean = true): void => {
    if (!audioManager.value || !audioStore.bgmEnabled || audioManager.value.isBGMActive(key)) return
    audioManager.value.playBGM(key, loop)
  }

  // 安全播放音效（檢查開關狀態）
  const playSound = (key: string): void => {
    if (!audioManager.value || !audioStore.soundEffectEnabled) return
    audioManager.value.playSound(key)
  }

  // 停止指定 BGM
  const stopBGM = (key?: string): void => {
    if (!audioManager.value) return

    if (key) audioManager.value.stopBGM(key)
    else audioManager.value.stopAllBGM()
  }

  // 銷毀音效系統
  const destroyAudio = (): void => {
    if (audioManager.value) {
      audioManager.value.dispose()
      audioManager.value = null
      logger.info('🔊 音效系統已銷毀')
    }
  }

  return {
    // 狀態
    audioManager,
    audioAssets,

    // 音效控制方法
    initializeAudio,
    updateVolume,
    toggleBGM,
    toggleSoundEffect,
    playBGM,
    playSound,
    stopBGM,
    destroyAudio,

    // Store 狀態
    bgmEnabled: computed(() => audioStore.bgmEnabled),
    soundEffectEnabled: computed(() => audioStore.soundEffectEnabled),
    volume: computed(() => audioStore.volume)
  }
}
