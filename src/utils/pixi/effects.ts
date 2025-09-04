/**
 * Spine 動畫特效相關工具函數
 */
import * as SPINE from '@esotericsoftware/spine-pixi-v8'

export interface FloatConfig {
  range: number
  speed: number
  baseX: number
  baseY: number
}

export interface ShakeConfig {
  intensity: number
  duration: number
  baseX: number
  baseY: number
  baseRotation: number
  baseScale: number
}

export interface EffectState {
  isActive: boolean
  animationId: number | null
  startTime: number
}

/**
 * 創建漂浮效果
 */
export function createFloatEffect(
  spine: SPINE.Spine,
  config: FloatConfig,
  onUpdate?: (x: number, y: number, rotation: number) => void
): EffectState {
  const state: EffectState = {
    isActive: true,
    animationId: null,
    startTime: Date.now()
  }
  
  function animate() {
    if (!state.isActive || !spine) return
    
    const elapsed = (Date.now() - state.startTime) * config.speed / 1000
    
    // 使用不同的正弦波創建自然的漂浮效果，調整相位讓初始值為 0
    const floatX = Math.sin(elapsed * 1.2) * config.range * 0.8
    const floatY = (Math.cos(elapsed * 0.8) - 1) * config.range  // 減 1 讓初始值為 0
    const floatRotation = Math.sin(elapsed * 1.5) * 5 // 輕微的旋轉晃動
    
    // 應用漂浮偏移
    const newX = config.baseX + floatX
    const newY = config.baseY + floatY
    const newRotation = (floatRotation * Math.PI) / 180
    
    // 直接設置 spine 位置而不通過回調，避免重複設置
    spine.x = newX
    spine.y = newY
    // 先不轉向
    // spine.rotation = newRotation
    
    // 調用更新回調
    onUpdate?.(newX, newY, newRotation)
    
    state.animationId = requestAnimationFrame(animate)
  }
  
  // 首先確保 spine 位置設置為基準位置，避免初始跳躍
  spine.x = config.baseX
  spine.y = config.baseY
  
  state.animationId = requestAnimationFrame(animate)
  return state
}

/**
 * 創建震動效果
 */
export function createShakeEffect(
  spine: SPINE.Spine,
  config: ShakeConfig,
  onUpdate?: (progress: number, x: number, y: number, rotation: number) => void,
  onComplete?: () => void
): EffectState {
  const state: EffectState = {
    isActive: true,
    animationId: null,
    startTime: Date.now()
  }
  
  function animate() {
    if (!state.isActive || !spine) return
    
    const elapsed = Date.now() - state.startTime
    const progress = elapsed / config.duration
    
    if (progress >= 1) {
      // 震動結束，恢復原位
      spine.x = config.baseX
      spine.y = config.baseY
      spine.rotation = (config.baseRotation * Math.PI) / 180
      spine.scale.set(config.baseScale)
      
      state.isActive = false
      onComplete?.()
      return
    }
    
    // 震動強度隨時間遞減（模擬引擎點火到穩定的過程）
    const intensityFactor = Math.max(0.2, 1 - progress * 0.5)
    const intensity = config.intensity * intensityFactor
    
    // 使用高頻隨機震動
    const shakeX = (Math.random() - 0.5) * intensity * 3
    const shakeY = (Math.random() - 0.5) * intensity * 3
    const shakeRotation = (Math.random() - 0.5) * intensity * 0.8 // 輕微旋轉震動
    
    // 應用震動
    const newX = config.baseX + shakeX
    const newY = config.baseY + shakeY
    const newRotation = ((config.baseRotation + shakeRotation) * Math.PI) / 180
    
    spine.x = newX
    spine.y = newY
    spine.rotation = newRotation
    spine.scale.set(config.baseScale)
    
    // 調用更新回調
    onUpdate?.(progress, newX, newY, newRotation)
    
    state.animationId = requestAnimationFrame(animate)
  }
  
  state.animationId = requestAnimationFrame(animate)
  return state
}

/**
 * 停止效果
 */
export function stopEffect(state: EffectState): void {
  state.isActive = false
  if (state.animationId) {
    cancelAnimationFrame(state.animationId)
    state.animationId = null
  }
}

/**
 * 創建組合效果管理器
 */
export class EffectManager {
  private effects = new Map<string, EffectState>()
  
  /**
   * 添加效果
   */
  addEffect(name: string, state: EffectState): void {
    // 如果已存在同名效果，先停止
    this.stopEffect(name)
    this.effects.set(name, state)
  }
  
  /**
   * 停止特定效果
   */
  stopEffect(name: string): void {
    const effect = this.effects.get(name)
    if (effect) {
      stopEffect(effect)
      this.effects.delete(name)
    }
  }
  
  /**
   * 停止所有效果
   */
  stopAllEffects(): void {
    const effectsNames = Array.from(this.effects.keys())
    for (const name of effectsNames) {
      this.stopEffect(name)
    }
  }
  
  /**
   * 檢查效果是否運行中
   */
  isEffectActive(name: string): boolean {
    const effect = this.effects.get(name)
    return effect?.isActive ?? false
  }
  
  /**
   * 獲取活躍效果列表
   */
  getActiveEffects(): string[] {
    return Array.from(this.effects.keys()).filter(name => 
      this.isEffectActive(name)
    )
  }
}