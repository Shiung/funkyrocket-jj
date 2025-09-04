import { ref, computed } from 'vue'

// 設計基準尺寸 (設計稿的原始尺寸)
const DESIGN_WIDTH = 750
const DESIGN_HEIGHT = 1624

// 全局共享的遊戲尺寸 - 保持比例，高度跟 body 一樣
const gameWidth = ref(DESIGN_WIDTH)
const gameHeight = ref(DESIGN_HEIGHT)

// 縮放因子
const scaleFactorX = computed(() => gameWidth.value / DESIGN_WIDTH)
const scaleFactorY = computed(() => gameHeight.value / DESIGN_HEIGHT)

// 基礎偏移量，都要浮上來一點 (會根據縮放因子調整)
const baseOffsetY = computed(() => -40 * scaleFactorY.value)

// 基礎縮放，所有角色都會縮放這個值 (會根據縮放因子調整)
const baseScale = computed(() => 0.85 * Math.min(scaleFactorX.value, scaleFactorY.value))

export const useBaseConfig = () => {
  return {
    // 遊戲尺寸
    gameWidth,
    gameHeight,
    
    // 設計基準尺寸
    DESIGN_WIDTH,
    DESIGN_HEIGHT,
    
    // 縮放因子
    scaleFactorX,
    scaleFactorY,
    
    // 基礎配置
    baseOffsetY,
    baseScale
  }
}
