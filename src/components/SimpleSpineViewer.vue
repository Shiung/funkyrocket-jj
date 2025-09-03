<template>
  <div class="space-y-4">
    <h3 class="text-xl font-semibold mb-4">🎮 Spine 動畫播放器 (重構版)</h3>
    
    <!-- 狀態顯示 -->
    <div class="mb-4">
      <div v-if="loading" class="flex items-center gap-2 text-blue-400">
        <div class="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
        {{ status }}
      </div>
      <div v-else-if="error" class="text-red-400">
        ❌ {{ error }}
      </div>
      <div v-else class="text-green-400">
        ✅ 動畫已載入
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="grid lg:grid-cols-[300px_1fr] gap-6">
      <!-- 控制區 -->
      <div class="bg-gray-800 rounded-lg p-4 space-y-4 h-fit">
        <!-- 動畫選擇 -->
        <div v-if="availableAnimations.length > 0">
          <label class="block text-sm font-medium mb-2">選擇動畫:</label>
          <select 
            v-model="selectedAnim" 
            @change="playAnimation(selectedAnim)"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          >
            <option v-for="anim in availableAnimations" :key="anim" :value="anim">
              {{ anim }}
            </option>
          </select>
        </div>
        
        <!-- 播放控制 -->
        <div class="flex gap-2">
          <button 
            @click="playAnimation(selectedAnim)"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
          >
            ▶️ 播放
          </button>
          <button 
            @click="stopAnimation"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            ⏹️ 停止
          </button>
          <button 
            @click="resetAll"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
          >
            🔄 重置
          </button>
        </div>

        <!-- 特效控制 -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-yellow-300">🎭 特效控制</h4>
          
          <button 
            @click="toggleFloat"
            :class="[
              'w-full px-3 py-2 rounded text-sm font-medium transition-colors',
              effectManager.isEffectActive('float')
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            ]"
          >
            {{ effectManager.isEffectActive('float') ? '🌊 停止漂浮' : '🌊 開始漂浮' }}
          </button>
          
          <!-- 漂浮設置 -->
          <div v-if="effectManager.isEffectActive('float')" class="bg-gray-700 rounded p-3 space-y-2">
            <h5 class="text-xs font-medium text-blue-300">🌊 漂浮設置</h5>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label class="block text-gray-400 mb-1">
                  範圍: {{ floatConfig.range }}px
                </label>
                <input 
                  type="range" 
                  v-model="floatConfig.range" 
                  @input="updateFloatEffect"
                  min="5" 
                  max="50" 
                  step="5"
                  class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                >
              </div>
              <div>
                <label class="block text-gray-400 mb-1">
                  速度: {{ floatConfig.speed.toFixed(1) }}x
                </label>
                <input 
                  type="range" 
                  v-model="floatConfig.speed" 
                  @input="updateFloatEffect"
                  min="0.3" 
                  max="3" 
                  step="0.1"
                  class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                >
              </div>
            </div>
          </div>
          
          <button 
            @click="triggerShake"
            :class="[
              'w-full px-3 py-2 rounded text-sm font-medium transition-colors',
              effectManager.isEffectActive('shake')
                ? 'bg-red-600 text-white cursor-not-allowed' 
                : 'bg-orange-600 text-white hover:bg-orange-500'
            ]"
            :disabled="effectManager.isEffectActive('shake')"
          >
            {{ effectManager.isEffectActive('shake') ? '🚀 震動中...' : '🚀 起飛震動' }}
          </button>
          
          <!-- 震動設置 -->
          <div class="bg-gray-700 rounded p-3 space-y-2">
            <h5 class="text-xs font-medium text-orange-300">🚀 震動設置</h5>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label class="block text-gray-400 mb-1">
                  強度: {{ shakeConfig.intensity }}px
                </label>
                <input 
                  type="range" 
                  v-model="shakeConfig.intensity" 
                  min="5" 
                  max="30" 
                  step="1"
                  class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                >
              </div>
              <div>
                <label class="block text-gray-400 mb-1">
                  時長: {{ shakeConfig.duration }}ms
                </label>
                <input 
                  type="range" 
                  v-model="shakeConfig.duration" 
                  min="1000" 
                  max="5000" 
                  step="250"
                  class="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                >
              </div>
            </div>
          </div>

          <!-- 水平翻轉 -->
          <button 
            @click="toggleFlip"
            :class="[
              'w-full px-3 py-2 rounded text-sm font-medium transition-colors',
              transform.flipX
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            ]"
          >
            {{ transform.flipX ? '🔄 已翻轉' : '↔️ 水平翻轉' }}
          </button>
        </div>

        <!-- 變換控制 -->
        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-300">🎛️ 變換控制</h4>
          
          <!-- 縮放 -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">
              縮放: {{ transform.scale.toFixed(2) }}x
            </label>
            <input 
              type="range" 
              v-model="transform.scale" 
              @input="updateTransform"
              min="0.1" 
              max="3" 
              step="0.1"
              class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>

          <!-- 位置 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1">
                X: {{ transform.x }}
              </label>
              <input 
                type="range" 
                v-model="transform.x" 
                @input="updateTransform"
                min="-300" 
                max="300" 
                step="1"
                class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              >
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">
                Y: {{ transform.y }}
              </label>
              <input 
                type="range" 
                v-model="transform.y" 
                @input="updateTransform"
                min="-300" 
                max="300" 
                step="1"
                class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              >
            </div>
          </div>

          <!-- 旋轉 -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">
              旋轉: {{ transform.rotation }}°
            </label>
            <input 
              type="range" 
              v-model="transform.rotation" 
              @input="updateTransform"
              min="-180" 
              max="180" 
              step="5"
              class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>

          <!-- 速度 -->
          <div>
            <label class="block text-xs text-gray-400 mb-1">
              速度: {{ transform.speed.toFixed(1) }}x
            </label>
            <input 
              type="range" 
              v-model="transform.speed" 
              @input="updateSpeed"
              min="0.1" 
              max="3" 
              step="0.1"
              class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            >
          </div>
        </div>
      </div>
      
      <!-- Canvas -->
      <div class="border border-gray-600 rounded-lg overflow-hidden">
        <canvas ref="canvasRef" class="block"></canvas>
      </div>
    </div>
    
    <!-- 調試日誌 -->
    <div class="bg-gray-900 rounded-lg p-4">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-sm font-medium text-gray-300">📋 調試日誌</h4>
        <button 
          @click="logger.clear()" 
          class="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
        >
          清空
        </button>
      </div>
      <div class="bg-black rounded p-3 h-48 overflow-y-auto font-mono text-xs">
        <div 
          v-for="(entry, index) in logger.getLogs().value" 
          :key="index"
          :class="[
            'py-1',
            entry.level === 'error' ? 'text-red-400' : 
            entry.level === 'warn' ? 'text-yellow-400' : 'text-green-400'
          ]"
        >
          [{{ entry.timestamp }}] {{ entry.message }}
        </div>
        <div v-if="logger.getLogs().value.length === 0" class="text-gray-500 text-center py-8">
          暫無日誌
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import type { Application } from 'pixi.js'
import type { Spine } from '@esotericsoftware/spine-pixi-v8'
import { 
  createPixiApp, 
  destroyPixiApp,
  createSpineAnimation,
  playSpineAnimation,
  setSpineAnimationSpeed,
  applySpineTransform,
  clearSpineState,
  createFloatEffect,
  createShakeEffect,
  EffectManager,
  createLogger,
  type SpineTransform
} from '@/utils/pixi'

interface Props {
  atlasPath: string
  imagePath: string
  skelPath: string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600
})

// 響應式狀態
const canvasRef = ref<HTMLCanvasElement>()
const loading = ref(false)
const status = ref('')
const error = ref('')
const availableAnimations = ref<string[]>([])
const selectedAnim = ref('')

// PixiJS 和 Spine 實例
let app: Application | null = null
let spine: Spine | null = null

// 變換控制
const transform = reactive({
  x: -80, // 大幅向左偏移，修正視覺置中
  y: -30, // 稍微向上偏移，讓動畫看起來更置中
  scale: 0.35, // 縮小動畫尺寸
  rotation: 0,
  speed: 1.0,
  flipX: false
})

// 特效配置
const floatConfig = reactive({
  range: 20,
  speed: 1.0
})

const shakeConfig = reactive({
  intensity: 15,
  duration: 2000
})

// 工具實例
const logger = createLogger(50)
const effectManager = new EffectManager()

// 初始化
async function init(): Promise<void> {
  if (!canvasRef.value) {
    logger.error('Canvas 元素未找到')
    return
  }

  try {
    loading.value = true
    error.value = ''
    
    // 1. 創建 PixiJS 應用
    status.value = '創建 PixiJS 應用...'
    const result = await createPixiApp({
      canvas: canvasRef.value,
      width: props.width,
      height: props.height,
      backgroundColor: 0x1a1a1a,
      antialias: true,
      logger: logger.createLogFunction()
    })
    
    app = result.app
    
    // 2. 創建 Spine 動畫
    status.value = '載入 Spine 動畫...'
    const spineResult = await createSpineAnimation({
      skelPath: props.skelPath,
      atlasPath: props.atlasPath,
      imagePath: props.imagePath,
      logger: logger.createLogFunction()
    })
    
    spine = spineResult.spine
    availableAnimations.value = spineResult.animations
    
    // 3. 添加到舞台並設置初始位置
    app.stage.addChild(spine)
    
    // 設置初始變換（使用與 updateTransform 相同的邏輯）
    const scaleValue = Number(transform.scale)
    const initialTransform: SpineTransform = {
      x: (props.width / 2) + Number(transform.x),
      y: (props.height / 2) + Number(transform.y),
      scaleX: transform.flipX ? -scaleValue : scaleValue,
      scaleY: scaleValue,
      rotation: (Number(transform.rotation) * Math.PI) / 180
    }
    
    applySpineTransform(spine, initialTransform, logger.createLogFunction())
    
    // 4. 播放第一個動畫
    if (availableAnimations.value.length > 0) {
      selectedAnim.value = availableAnimations.value[0]
      playSpineAnimation(spine, selectedAnim.value, true, logger.createLogFunction())
    }
    
    setSpineAnimationSpeed(spine, transform.speed, logger.createLogFunction())
    
    logger.info('🎉 Spine 動畫系統初始化完成')
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : '未知錯誤'
    error.value = errorMessage
    logger.error(`初始化失敗: ${errorMessage}`)
  } finally {
    loading.value = false
    status.value = ''
  }
}

// 播放動畫
function playAnimation(animationName: string): void {
  if (!spine) return
  
  clearSpineState(spine, logger.createLogFunction())
  playSpineAnimation(spine, animationName, true, logger.createLogFunction())
}

// 停止動畫
function stopAnimation(): void {
  if (!spine) return
  clearSpineState(spine, logger.createLogFunction())
}

// 更新變換
function updateTransform(): void {
  if (!spine) return
  
  const scaleValue = Number(transform.scale)
  const spineTransform: SpineTransform = {
    x: (props.width / 2) + Number(transform.x),
    y: (props.height / 2) + Number(transform.y),
    scaleX: transform.flipX ? -scaleValue : scaleValue,
    scaleY: scaleValue,
    rotation: (Number(transform.rotation) * Math.PI) / 180
  }
  
  applySpineTransform(spine, spineTransform, logger.createLogFunction())
}

// 更新速度
function updateSpeed(): void {
  if (!spine) return
  setSpineAnimationSpeed(spine, Number(transform.speed), logger.createLogFunction())
}

// 漂浮效果
function toggleFloat(): void {
  if (effectManager.isEffectActive('float')) {
    effectManager.stopEffect('float')
    updateTransform() // 恢復位置
    logger.info('🌊 漂浮效果已停止')
  } else {
    startFloatEffect()
  }
}

function startFloatEffect(): void {
  if (!spine) return
  
  const floatState = createFloatEffect(
    spine,
    {
      range: Number(floatConfig.range),
      speed: Number(floatConfig.speed),
      baseX: (props.width / 2) + Number(transform.x),
      baseY: (props.height / 2) + Number(transform.y)
    },
    (x, y, _rotation) => {
      // 只在開始時記錄一次，避免日誌過多
      if (Math.random() < 0.01) {
        logger.info(`漂浮位置: (${x.toFixed(1)}, ${y.toFixed(1)})`)
      }
    }
  )
  
  effectManager.addEffect('float', floatState)
  logger.info(`🌊 漂浮效果已啟動 - 範圍: ${floatConfig.range}px, 速度: ${floatConfig.speed}x`)
}

function updateFloatEffect(): void {
  if (!effectManager.isEffectActive('float')) return
  
  // 重新啟動漂浮效果以應用新參數
  effectManager.stopEffect('float')
  startFloatEffect()
}

// 震動效果
function triggerShake(): void {
  if (!spine || effectManager.isEffectActive('shake')) return
  
  const shakeState = createShakeEffect(
    spine,
    {
      intensity: Number(shakeConfig.intensity),
      duration: Number(shakeConfig.duration),
      baseX: (props.width / 2) + Number(transform.x),
      baseY: (props.height / 2) + Number(transform.y),
      baseRotation: Number(transform.rotation),
      baseScale: Number(transform.scale)
    },
    (progress, _x, _y) => {
      if (Math.floor(progress * 10) !== Math.floor((progress - 0.1) * 10)) {
        logger.info(`震動進度: ${(progress * 100).toFixed(0)}%`)
      }
    },
    () => {
      logger.info('✅ 震動效果完成')
      updateTransform() // 恢復位置
    }
  )
  
  effectManager.addEffect('shake', shakeState)
  logger.info(`🚀 震動效果已啟動 - 強度: ${shakeConfig.intensity}px, 時長: ${shakeConfig.duration}ms`)
}

// 水平翻轉
function toggleFlip(): void {
  transform.flipX = !transform.flipX
  updateTransform()
  logger.info(`🔄 水平翻轉: ${transform.flipX ? '已開啟' : '已關閉'}`)
}

// 重置所有
function resetAll(): void {
  effectManager.stopAllEffects()
  
  transform.x = -80 // 重置到視覺置中位置
  transform.y = -30 // 重置到置中位置
  transform.scale = 0.35 // 重置到適當大小
  transform.rotation = 0
  transform.speed = 1.0
  transform.flipX = false
  
  floatConfig.range = 20
  floatConfig.speed = 1.0
  
  shakeConfig.intensity = 15
  shakeConfig.duration = 2000
  
  updateTransform()
  updateSpeed()
  
  logger.info('🔄 所有設置已重置')
}

// 清理
function cleanup(): void {
  effectManager.stopAllEffects()
  destroyPixiApp(app, logger.createLogFunction())
  app = null
  spine = null
}

onMounted(() => {
  init()
})

// 監聽 props 變化，重新初始化
watch([() => props.atlasPath, () => props.imagePath, () => props.skelPath], async (newPaths: string[], oldPaths: string[]) => {
  if (oldPaths && oldPaths.some((path: string) => path)) { // 確保不是初始化
    logger.info(`🎨 素材包變化，重新載入 Spine 動畫`)
    
    // 清理現有資源
    cleanup()
    
    // 重新初始化
    await init()
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* 自定義滑桿樣式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>