<template>
  <!-- Bottom Sheet 控制區域 -->
  <div class="fixed bottom-0 left-0 right-0 z-40">
    <!-- Bottom Sheet 拖拉把手和背景 -->
    <div 
      class="bg-black/90 backdrop-blur-sm rounded-t-2xl transition-all duration-300 ease-out"
      :class="{ 'translate-y-0': showBottomSheet, 'translate-y-[calc(100%-60px)]': !showBottomSheet }"
    >
      <!-- 拖拉把手 -->
      <div 
        @click="showBottomSheet = !showBottomSheet"
        class="flex items-center justify-center py-3 cursor-pointer hover:bg-white/10 rounded-t-2xl transition-colors"
      >
        <div class="w-10 h-1 bg-gray-400 rounded-full"></div>
        <span class="ml-3 text-sm text-gray-300">
          {{ showBottomSheet ? '收起控制面板' : '展開控制面板' }}
        </span>
      </div>
      
      <!-- 控制面板內容 -->
      <div class="px-4 pb-4 space-y-4 max-h-[calc(50vh-120px)] overflow-y-auto">
        <!-- 階段一：開始遊戲 -->
        <div v-if="currentState === GameState.IDLE" class="space-y-4">
          <div class="text-center">
            <button 
              @click="emit('startGame')"
              class="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-bold text-lg w-full max-w-sm"
            >
              🚀 開始遊戲
            </button>
          </div>
        </div>

        <!-- 階段二：上車階段和倒數階段 -->
        <div v-if="currentState === GameState.BOARDING || currentState === GameState.COUNTDOWN" class="space-y-4">
          <h2 class="text-lg font-semibold text-center text-yellow-400">
            {{ currentState === GameState.COUNTDOWN ? '⏰ 倒數中 - 快上車！' : '🚌 乘客上車' }}
          </h2>
          <div class="grid grid-cols-2 gap-3">
            <button 
              @click="emit('playerBoard')"
              class="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-semibold"
            >
              👤 玩家上車
            </button>
            <button 
              @click="emit('streamerBoard')"
              class="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors font-semibold"
            >
              📺 主播上車
            </button>
            <button 
              @click="emit('npcBoard')"
              class="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded transition-colors font-semibold"
            >
              🤖 NPC上車
            </button>
            <button 
              @click="emit('startCountdown')"
              :disabled="currentState === GameState.COUNTDOWN"
              class="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded transition-colors font-semibold"
            >
              ⏰ 倒數5秒
            </button>
          </div>
        </div>

        <!-- 階段三：下車階段 -->
        <div v-if="currentState === GameState.DISEMBARKING" class="space-y-4">
          <h2 class="text-lg font-semibold text-center text-yellow-400">🪂 乘客下車</h2>
          <div class="grid grid-cols-2 gap-3">
            <button 
              @click="emit('playerDisembark')"
              class="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors font-semibold"
            >
              👤 玩家下車
            </button>
            <button 
              @click="emit('streamerDisembark')"
              class="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded transition-colors font-semibold"
            >
              📺 主播下車
            </button>
            <button 
              @click="emit('npcDisembark')"
              class="px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded transition-colors font-semibold"
            >
              🤖 NPC下車
            </button>
            <button 
              @click="emit('explodeRocket')"
              :disabled="isAnimating"
              class="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded transition-colors font-semibold"
            >
              💥 爆炸
            </button>
          </div>
        </div>

        <!-- 階段四：重新開始 -->
        <div v-if="currentState === GameState.COMPLETED" class="space-y-4">
          <div class="text-center">
            <h2 class="text-xl font-bold mb-4 text-yellow-400">🎉 遊戲結束</h2>
            <button 
              @click="emit('resetGame')"
              class="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-bold text-lg w-full max-w-sm"
            >
              🔄 重新開始
            </button>
          </div>
        </div>

        <!-- 遊戲階段控制 -->
        <div class="border-t border-gray-700 pt-4">
          <div class="mb-4">
            <label for="gameStateSelect" class="block text-sm font-medium text-gray-300 mb-2">
              🎮 快速切換遊戲階段
            </label>
            <select 
              id="gameStateSelect"
              :value="currentState"
              @change="(e) => emit('changeGameState', (e.target as HTMLSelectElement).value)"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="IDLE">🏠 待機 (IDLE)</option>
              <option value="BOARDING">🚌 上車階段 (BOARDING)</option>
              <option value="COUNTDOWN">⏰ 倒數階段 (COUNTDOWN)</option>
              <option value="LAUNCHING">🚀 發射階段 (LAUNCHING)</option>
              <option value="FLYING">✈️ 飛行階段 (FLYING)</option>
              <option value="DISEMBARKING">🪂 下車階段 (DISEMBARKING)</option>
              <option value="EXPLODING">💥 爆炸階段 (EXPLODING)</option>
              <option value="COMPLETED">🎉 完成階段 (COMPLETED)</option>
            </select>
          </div>
        </div>

        <!-- 底部狀態信息 -->
        <div class="border-t border-gray-700 pt-4">
          <div class="grid grid-cols-2 gap-4 text-xs mb-3">
            <div>
              <span class="text-gray-400">素材包:</span>
              <span class="ml-1 font-medium text-yellow-400">Funky Rocket</span>
            </div>
            <div>
              <span class="text-gray-400">遊戲階段:</span>
              <span class="ml-1 font-medium text-green-400">{{ currentState }}</span>
            </div>
            <div>
              <span class="text-gray-400">乘客數量:</span>
              <span class="ml-1 font-medium text-blue-400">{{ charactersOnBoard.length }}</span>
            </div>
            <div>
              <span class="text-gray-400">動畫狀態:</span>
              <span class="ml-1 font-medium text-purple-400">{{ isAnimating ? '播放中' : '待機' }}</span>
            </div>
            <div>
              <span class="text-gray-400">飛行速度:</span>
              <span class="ml-1 font-medium" :class="getSpeedColor()">
                {{ isScrolling ? scrollSpeed.toFixed(1) : '0.0' }}
              </span>
            </div>
            <div>
              <span class="text-gray-400">背景滾動:</span>
              <span class="ml-1 font-medium" :class="isScrolling ? 'text-green-400' : 'text-gray-400'">
                {{ isScrolling ? '進行中' : '停止' }}
              </span>
            </div>
          </div>
          
          <!-- 角色狀態 -->
          <div v-if="charactersOnBoard.length > 0" class="text-xs">
            <div class="flex flex-wrap gap-2">
              <span class="text-gray-400">在場角色:</span>
              <span v-for="character in charactersOnBoard" :key="character" :class="getCharacterColor(character)" class="font-medium">
                {{ getCharacterName(character) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 遊戲狀態枚舉
enum GameState {
  IDLE = 'IDLE',
  BOARDING = 'BOARDING',
  COUNTDOWN = 'COUNTDOWN',
  LAUNCHING = 'LAUNCHING',
  FLYING = 'FLYING',
  DISEMBARKING = 'DISEMBARKING',
  EXPLODING = 'EXPLODING',
  COMPLETED = 'COMPLETED'
}

// 角色類型
type CharacterType = 'player' | 'streamer' | 'npc'

// Props
interface Props {
  currentState: GameState
  charactersOnBoard: CharacterType[]
  isAnimating: boolean
  scrollSpeed: number
  isScrolling: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  startGame: []
  playerBoard: []
  streamerBoard: []
  npcBoard: []
  startCountdown: []
  playerDisembark: []
  streamerDisembark: []
  npcDisembark: []
  explodeRocket: []
  resetGame: []
  changeGameState: [gameState: string]
}>()

// State
const showBottomSheet = ref(true) // 預設展開控制面板

// 角色相關函數
function getCharacterColor(character: CharacterType): string {
  switch (character) {
    case 'player': return 'text-blue-400'
    case 'streamer': return 'text-purple-400'
    case 'npc': return 'text-orange-400'
    default: return 'text-gray-400'
  }
}

function getCharacterName(character: CharacterType): string {
  switch (character) {
    case 'player': return '👤 玩家'
    case 'streamer': return '📺 主播'
    case 'npc': return '🤖 NPC'
    default: return '未知角色'
  }
}

function getSpeedColor(): string {
  if (!props.isScrolling) return 'text-gray-400'
  
  const speed = props.scrollSpeed
  if (speed <= 5) return 'text-cyan-400'      // 慢速 - 青色
  else if (speed <= 10) return 'text-green-400'   // 中速 - 綠色
  else if (speed <= 15) return 'text-yellow-400'  // 快速 - 黃色
  else return 'text-red-400'                       // 極速 - 紅色
}

// 暴露狀態給父組件
defineExpose({
  showBottomSheet
})
</script>

<style scoped>
/* 可以在這裡添加特定的樣式 */
</style>
