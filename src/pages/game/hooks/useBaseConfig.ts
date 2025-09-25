import { ref, computed } from 'vue'

// 設計基準尺寸 (設計稿的原始尺寸)
const DESIGN_WIDTH = 750
const DESIGN_MAX_WIDTH = 900
const DESIGN_HEIGHT = 1624

const MIN_GAME_WIDTH = 375
const MAX_GAME_WIDTH = 450

// 水平線偏移量，因為圖片包含上面柵欄那些
const HORIZON_OFFSET = 76
// 畫面最下方到水平線的距離
const BOTTOM_TO_HORIZON = {
  default: 342,
  compact: 248,
  least: 188,
}

// 全局共享的遊戲尺寸 - 保持比例，高度跟 body 一樣
const gameWidth = ref(DESIGN_WIDTH)
const gameHeight = ref(DESIGN_HEIGHT)

// 裝置類型判斷 - 基於寬度
const judgeDeviceType = () => {
  const parentDom = document.getElementById('app')
  if (!parentDom) return true // 預設為PC
  
  const viewportWidth = parentDom?.clientWidth || DESIGN_WIDTH
  const viewportHeight = parentDom?.clientHeight || DESIGN_HEIGHT
  
  // 寬度450以上或寬度大於高度都算PC
  const isPC = viewportWidth > MAX_GAME_WIDTH || viewportWidth >= viewportHeight
  
  console.log(`📊 裝置判斷: 寬度=${viewportWidth}px, 高度=${viewportHeight}px, 結果=${isPC ? 'PC' : '手機'}`)
  
  return isPC
}

const isDesktop = ref(judgeDeviceType())

// 是否為小螢幕
const isCompact = computed(() => {
  if (isDesktop.value) return false

  return gameHeight.value <= 667
})


// 縮放因子
const scaleFactorX = computed(() => gameWidth.value / DESIGN_WIDTH)
const scaleFactorY = computed(() => gameHeight.value / DESIGN_HEIGHT)

// 基礎偏移量，都要浮上來一點 (會根據縮放因子調整)
const baseOffsetY = computed(() => -40 * scaleFactorY.value)

// 基礎縮放，所有角色都會縮放這個值 (會根據縮放因子調整)
const baseScale = computed(() => 0.85 * Math.min(scaleFactorX.value, scaleFactorY.value))

// 水平線高度
const horizon = computed(() => {
  if (isDesktop.value) return BOTTOM_TO_HORIZON.least

  return isCompact.value ? BOTTOM_TO_HORIZON.compact : BOTTOM_TO_HORIZON.default
})

export const useBaseConfig = () => {
  return {
    // 遊戲尺寸
    gameWidth,
    gameHeight,
    horizon,
    
    // 設計基準尺寸
    DESIGN_WIDTH,
    DESIGN_MAX_WIDTH,
    DESIGN_HEIGHT,
    HORIZON_OFFSET,

    // 遊戲尺寸範圍
    MIN_GAME_WIDTH,
    MAX_GAME_WIDTH,
    
    // 裝置類型
    isDesktop,
    isCompact,
    judgeDeviceType,
    
    // 縮放因子
    scaleFactorX,
    scaleFactorY,
    
    // 基礎配置
    baseOffsetY,
    baseScale,
  }
}
