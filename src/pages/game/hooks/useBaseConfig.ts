import { ref, computed } from 'vue'

// 設計基準尺寸 (設計稿的原始尺寸)
const DESIGN_WIDTH = 750
const DESIGN_HEIGHT = 1624

const MIN_GAME_WIDTH = 375
const MAX_GAME_WIDTH = 450

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

// 縮放因子
const scaleFactorX = computed(() => gameWidth.value / DESIGN_WIDTH)
const scaleFactorY = computed(() => gameHeight.value / DESIGN_HEIGHT)

// 基礎偏移量，都要浮上來一點 (會根據縮放因子調整)
const baseOffsetY = computed(() => -40 * scaleFactorY.value)

// 基礎縮放，所有角色都會縮放這個值 (會根據縮放因子調整)
const baseScale = computed(() => 0.85 * Math.min(scaleFactorX.value, scaleFactorY.value))

// 計算手機模式下的背景偏移量
const backgroundOffset = computed(() => {
  if (isDesktop.value) {
    // PC模式沒有偏移
    return { offsetX: 0, offsetY: 0, scale: 1 }
  }
  
  // 手機模式：基於設計尺寸計算偏移
  const scaleX = gameWidth.value / DESIGN_WIDTH
  const scaleY = gameHeight.value / DESIGN_HEIGHT
  const scale = Math.max(scaleX, scaleY)
  
  // 背景的實際位置（置中對齊後的偏移）
  const backgroundOffsetX = gameWidth.value <= MIN_GAME_WIDTH ? 0 : Math.floor((gameWidth.value - DESIGN_WIDTH * scale) / 2)
  const backgroundOffsetY = gameWidth.value <= MIN_GAME_WIDTH ? 0 : Math.floor((gameHeight.value - DESIGN_HEIGHT * scale) / 2)
  
  console.log(`📊 背景偏移計算 - 螢幕: ${gameWidth.value}x${gameHeight.value}, 背景縮放: ${scale.toFixed(3)}, 偏移: (${backgroundOffsetX}, ${backgroundOffsetY})`)
  
  return { 
    offsetX: backgroundOffsetX, 
    offsetY: backgroundOffsetY,
    scale: scale
  }
})

export const useBaseConfig = () => {
  return {
    // 遊戲尺寸
    gameWidth,
    gameHeight,
    
    // 設計基準尺寸
    DESIGN_WIDTH,
    DESIGN_HEIGHT,

    // 遊戲尺寸範圍
    MIN_GAME_WIDTH,
    MAX_GAME_WIDTH,
    
    // 裝置類型
    isDesktop,
    judgeDeviceType,
    
    // 縮放因子
    scaleFactorX,
    scaleFactorY,
    
    // 基礎配置
    baseOffsetY,
    baseScale,
    backgroundOffset
  }
}
