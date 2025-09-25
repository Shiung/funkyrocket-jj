<template>
  <div class="absolute top-4 right-4 z-50">
    <!-- 漢堡選單按鈕 -->
    <button 
      @click="showMenu = !showMenu"
      class="bg-black/80 backdrop-blur-sm hover:bg-black/90 p-3 rounded-lg transition-colors"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>
    
    <!-- 選單內容 -->
    <div v-if="showMenu" class="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-sm rounded-lg shadow-xl p-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-lg font-bold text-yellow-400">🎸 Funky Rocket 遊戲</h1>
        <div class="flex items-center gap-2">
          <button 
            @click="onResetGame"
            class="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            🔄
          </button>
          <RouterLink 
            to="/"
            class="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            ←
          </RouterLink>
        </div>
      </div>
      
      <!-- 遊戲狀態 -->
      <div class="mb-4">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs text-gray-400">狀態:</span>
          <span :class="getStateColor(currentState)" class="text-xs font-medium">
            {{ getStateText(currentState) }}
          </span>
        </div>
        <div v-if="charactersOnBoard.length > 0" class="text-xs text-green-400">
          乘客: {{ charactersOnBoard.length }}
        </div>
      </div>
      
      <!-- 倒數計時顯示 -->
      <div v-if="countdown > 0" class="text-center mb-4">
        <span class="text-3xl font-bold text-red-400">{{ Math.ceil(countdown) }}</span>
        <div class="text-xs text-gray-400">秒後發射</div>
      </div>

      <!-- 音量控制 -->
      <div class="mb-4">
        <label class="text-xs text-gray-400 block mb-2">🔊 音量控制</label>
        <div class="flex items-center gap-2">
          <input 
            type="range" 
            v-model="audioStore.volume" 
            @input="updateVolume"
            min="0" 
            max="100" 
            class="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          >
          <span class="text-xs text-gray-400 w-10">{{ audioStore.volume }}%</span>
        </div>
      </div>

      <!-- 音效控制 -->
      <div class="mb-4">
        <label class="text-xs text-gray-400 block mb-2">🎵 音效控制</label>
        <div class="space-y-2">
          <!-- BGM 總開關 -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-300">背景音樂</span>
            <button 
              @click="toggleBGM()"
              :class="audioStore.bgmEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-500'"
              class="px-3 py-1 text-xs rounded transition-colors"
            >
              {{ audioStore.bgmEnabled ? '開啟' : '關閉' }}
            </button>
          </div>
          
          <!-- 音效總開關 -->
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-300">音效聲音</span>
            <button 
              @click="toggleSoundEffect()"
              :class="audioStore.soundEffectEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-500'"
              class="px-3 py-1 text-xs rounded transition-colors"
            >
              {{ audioStore.soundEffectEnabled ? '開啟' : '關閉' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAudioStore } from '@/stores/audio'
import { GameState, type CharacterType } from '../types'

// Props
interface Props {
  currentState: GameState
  charactersOnBoard: CharacterType[]
  countdown: number
}

const _props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  updateVolume: []
  toggleBGM: []
  toggleSoundEffect: []
  resetGame: []
}>()

// State
const showMenu = ref(false)
const audioStore = useAudioStore()

// Methods
const updateVolume = () => {
  emit('updateVolume')
}

const toggleBGM = () => {
  emit('toggleBGM')
}

const toggleSoundEffect = () => {
  emit('toggleSoundEffect')
}

const onResetGame = () => {
  showMenu.value = false // 關閉選單
  emit('resetGame')
}

// 狀態顯示函數
function getStateColor(state: GameState): string {
  switch (state) {
    case GameState.IDLE: return 'text-gray-400'
    case GameState.BOARDING: return 'text-blue-400'
    case GameState.COUNTDOWN: return 'text-yellow-400'
    case GameState.LAUNCHING: return 'text-orange-400'
    case GameState.FLYING: return 'text-green-400'
    case GameState.DISEMBARKING: return 'text-purple-400'
    case GameState.EXPLODING: return 'text-red-400'
    case GameState.COMPLETED: return 'text-cyan-400'
    default: return 'text-gray-400'
  }
}

function getStateText(state: GameState): string {
  switch (state) {
    case GameState.IDLE: return '待機中 (Launch動畫)'
    case GameState.BOARDING: return '乘客上車 (Launch動畫)'
    case GameState.COUNTDOWN: return '倒數計時 (Launch動畫)'
    case GameState.LAUNCHING: return '發射準備 (Rocket_shake動畫)'
    case GameState.FLYING: return '火箭飛行 (Flying_loop動畫)'
    case GameState.DISEMBARKING: return '乘客下車 (Flying_loop動畫)'
    case GameState.EXPLODING: return '火箭爆炸 (Explosion動畫)'
    case GameState.COMPLETED: return '遊戲結束'
    default: return '未知狀態'
  }
}

// 暴露方法給父組件
defineExpose({
  showMenu
})
</script>

<style scoped>
/* 自定義滑動條樣式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  border: 2px solid #4b5563;
}

input[type="range"]::-webkit-slider-track {
  width: 100%;
  height: 4px;
  cursor: pointer;
  background: #374151;
  border-radius: 2px;
}
</style>
