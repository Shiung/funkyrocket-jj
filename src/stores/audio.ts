import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAudioStore = defineStore('audio', () => {
  // 從 localStorage 讀取設定，提供預設值
  const volume = ref(Number(localStorage.getItem('audio-volume') ?? '50'))
  const bgmEnabled = ref(localStorage.getItem('audio-bgm-enabled') !== 'false') // 預設開啟
  const soundEffectEnabled = ref(localStorage.getItem('audio-sound-enabled') !== 'false') // 預設開啟

  // 計算屬性：正規化的音量 (0-1)
  const normalizedVolume = computed(() => volume.value / 100)

  // 更新音量
  const setVolume = (newVolume: number) => {
    volume.value = Math.max(0, Math.min(100, newVolume))
    localStorage.setItem('audio-volume', volume.value.toString())
  }

  // 切換 BGM 開關
  const toggleBGM = () => {
    bgmEnabled.value = !bgmEnabled.value
    localStorage.setItem('audio-bgm-enabled', bgmEnabled.value.toString())
  }

  // 切換音效開關
  const toggleSoundEffect = () => {
    soundEffectEnabled.value = !soundEffectEnabled.value
    localStorage.setItem('audio-sound-enabled', soundEffectEnabled.value.toString())
  }

  // 設定 BGM 開關
  const setBGMEnabled = (enabled: boolean) => {
    bgmEnabled.value = enabled
    localStorage.setItem('audio-bgm-enabled', enabled.toString())
  }

  // 設定音效開關
  const setSoundEffectEnabled = (enabled: boolean) => {
    soundEffectEnabled.value = enabled
    localStorage.setItem('audio-sound-enabled', enabled.toString())
  }

  return {
    // 狀態
    volume,
    bgmEnabled,
    soundEffectEnabled,
    normalizedVolume,
    
    // 方法
    setVolume,
    toggleBGM,
    toggleSoundEffect,
    setBGMEnabled,
    setSoundEffectEnabled
  }
})
