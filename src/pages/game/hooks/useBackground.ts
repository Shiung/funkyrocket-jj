import { ref, computed } from 'vue'
import type { Sprite } from 'pixi.js'
import { Assets } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { createLogger } from '@/utils/pixi/logger'
import { useBaseConfig } from './useBaseConfig'

const logger = createLogger()

export const useBackground = (getApp: () => any) => {
  // 基礎配置
  const {
    gameWidth,
    gameHeight,
    MIN_GAME_WIDTH,
    MAX_GAME_WIDTH,
    baseOffsetY,
    isDesktop
  } = useBaseConfig()
  // 背景精靈實例
  let defaultBackgroundSprite: Sprite | null = null
  let cycleBackgroundSprites: Sprite[] = [] // 多個循環背景精靈
  let frontCloudSprite: Sprite | null = null // 前景雲朵

  // 背景滾動狀態
  const isScrolling = ref(false)
  const scrollSpeed = ref(5) // 滾動速度 (初始值)
  
  // 計算屬性：滾動相關參數
  const baseScrollSpeed = ref(5)
  const speedIncrease = ref(0.02)
  const maxScrollSpeed = ref(20)

  // 響應式資源路徑 - 固定使用 funkyRocket
  const defaultBackground = computed(() => 
    '/assets/bg/bg_default.webp'
  )

  const cycleBackground = computed(() => 
    '/assets/bg/bg_cycle.webp'
  )

  const frontCloud = computed(() => 
    '/assets/bg/front_cloud.webp'
  )

  const pageBackgroundImage = computed(() => 
    `url('/assets/bg/bg_pc.webp')`
  )

  // 設置默認背景
  const setDefaultBackground = async (): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    try {
      logger.info(`🖼️ 載入默認背景`)
      
      const texture = await Assets.load(defaultBackground.value)
      defaultBackgroundSprite = new PIXI.Sprite(texture)
      
      // 設置背景尺寸以適應畫布，保持比例
      const scaleX = gameWidth.value / texture.width
      const scaleY = gameHeight.value / texture.height
      const scale = Math.max(scaleX, scaleY) // 確保完全覆蓋
      
      defaultBackgroundSprite.scale.set(scale)
      // 使用整數座標避免像素縫隙
      defaultBackgroundSprite.x = Math.floor((gameWidth.value - texture.width * scale) / 2)
      defaultBackgroundSprite.y = Math.floor((gameHeight.value - texture.height * scale) / 2)
      defaultBackgroundSprite.zIndex = -10 // 在最底層
      
      app.stage.addChild(defaultBackgroundSprite)
      
      logger.info('✅ 默認背景設置完成')
      
    } catch (error) {
      logger.error(`❌ 默認背景載入失敗: ${error}`)
    }
  }

  // 更新前景雲朵縮放
  const updateDefaultFrontCloudScale = (): void => {
    if (!frontCloudSprite) return

    const texture = frontCloudSprite.texture

    // 設置雲朵寬度填滿螢幕，但限制高度最多到螢幕一半
    const scale = gameWidth.value / texture.width
    const scaledHeight = texture.height * scale
    const maxHeight = gameHeight.value * 0.5  // 最多螢幕一半高度
    
    // 寬度始終填滿螢幕
    frontCloudSprite.width = gameWidth.value
    frontCloudSprite.x = 0
    
    // 高度限制在螢幕一半
    frontCloudSprite.height = Math.min(scaledHeight, maxHeight)
    
    // 靠下對齊 - 放在畫面底部
    frontCloudSprite.y = gameHeight.value / 2 + baseOffsetY.value
    frontCloudSprite.zIndex = 0 // 在背景上、火箭下
  }

  // 更新前景雲朵縮放 - 手機裝置
  const updateMobileFrontCloudScale = (): void => {
    if (!frontCloudSprite) return

    const texture = frontCloudSprite.texture

    if (gameWidth.value >= MIN_GAME_WIDTH && gameWidth.value <= MAX_GAME_WIDTH) {
      // 375-450範圍：縮放到0.5倍並置中，讓螢幕裁切
      console.log('🌤️ 手機模式 - 前景雲朵：0.5倍裁切模式')
      
      frontCloudSprite.scale.set(0.5)  // 縮放到0.5倍（900px → 450px）
      
      const scaledWidth = texture.width * 0.5  // 450px
      frontCloudSprite.x = Math.floor((gameWidth.value - scaledWidth) / 2)  // 置中對齊
      frontCloudSprite.y = gameHeight.value / 2 + baseOffsetY.value
      
      console.log(`手機裁切模式 - 螢幕寬度: ${gameWidth.value}px, 雲朵寬度: ${scaledWidth}px, x位置: ${frontCloudSprite.x}px`)
      
    } else if (gameWidth.value < MIN_GAME_WIDTH) {
      // 375以下：用375的寬度去縮放，保持裁切效果
      console.log('🌤️ 手機模式 - 前景雲朵：375基準縮放模式')
      
      // 計算以375為基準的縮放比例
      const baseScale = 0.5  // 375px時的基準縮放（900px → 450px）
      const scaleFactor = gameWidth.value / MIN_GAME_WIDTH  // 相對於375的縮放係數
      const finalScale = baseScale * scaleFactor
      
      frontCloudSprite.scale.set(finalScale)
      
      const scaledWidth = texture.width * finalScale
      frontCloudSprite.x = Math.floor((gameWidth.value - scaledWidth) / 2)  // 置中對齊
      frontCloudSprite.y = gameHeight.value / 2 + baseOffsetY.value
      
      console.log(`375基準縮放模式 - 螢幕寬度: ${gameWidth.value}px, 縮放係數: ${scaleFactor.toFixed(3)}, 最終縮放: ${finalScale.toFixed(3)}, 雲朵寬度: ${scaledWidth.toFixed(0)}px`)
      
    } else {
      // 450以上：使用預設處理
      console.log('🌤️ 手機模式 - 前景雲朵：使用預設處理')
      updateDefaultFrontCloudScale()
    }
  }

  // 更新前景雲朵縮放 - 根據裝置類型和螢幕寬度採用不同策略
  const updateFrontCloudScale = async (): Promise<void> => {
    if (isScrolling.value) return
    
    const app = getApp()
    if (!app || !frontCloudSprite) return
    
    if (isDesktop.value) updateDefaultFrontCloudScale()
    else updateMobileFrontCloudScale()
  }

  // 設置前景雲朵 - 高度最多到螢幕一半
  const setFrontCloud = async (): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    try {
      logger.info('☁️ 設置前景雲朵')
      const texture = await Assets.load(frontCloud.value)
      
      if (frontCloudSprite && app.stage.getChildIndex(frontCloudSprite) !== -1) {
        app.stage.removeChild(frontCloudSprite)
      }
      
      frontCloudSprite = new PIXI.Sprite(texture)
      
      // 更新雲朵縮放
      updateFrontCloudScale()
      
      app.stage.addChild(frontCloudSprite)
      app.stage.sortChildren()
      
      logger.info('✅ 前景雲朵設置完成')
    } catch (error) {
      logger.error(`❌ 前景雲朵設置失敗: ${error}`)
    }
  }

  // 初始化循環背景 - 在默認背景上方接續
  const initCycleBackground = async (startFromMiddle: boolean = false): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    try {
      logger.info(`🔄 初始化循環背景${startFromMiddle ? '（從中間開始）' : '（從頂部開始）'}`)
      
      const texture = await Assets.load(cycleBackground.value)
      
      // 設置背景寬度適應畫布，保持比例
      const scale = gameWidth.value / texture.width
      const scaledHeight = texture.height * scale
      
      // 創建足夠的精靈來填滿和覆蓋畫面高度（考慮滾動）
      const spriteCount = Math.ceil(gameHeight.value / scaledHeight) + 2
      
      // 計算起始偏移量
      let startOffset = 0
      if (startFromMiddle) {
        // 從中間開始：讓一些背景已經滾動過了
        startOffset = gameHeight.value * 0.5 // 偏移畫面高度的一半
      }
      
      for (let i = 0; i < spriteCount; i++) {
        const sprite = new PIXI.Sprite(texture)
        sprite.scale.set(scale)
        sprite.x = 0
        
        if (startFromMiddle) {
          // 從中間位置開始排列，模擬已經飛行了一段時間
          sprite.y = Math.floor(-scaledHeight * i + startOffset)
        } else {
          // 正常從頂部開始排列
          sprite.y = Math.floor(-scaledHeight * (i + 1))
        }
        
        sprite.zIndex = -5 // 在默認背景之上，但在其他元素之下
        
        cycleBackgroundSprites.push(sprite)
        app.stage.addChild(sprite)
      }
      
      app.stage.sortChildren()
      logger.info(`✅ 創建了 ${spriteCount} 個循環背景精靈，起始偏移: ${startOffset}`)
      
    } catch (error) {
      logger.error(`❌ 循環背景設置失敗: ${error}`)
    }
  }

  // 啟動背景滾動（包含默認背景和循環背景）
  const startBackgroundScroll = (): void => {
    if (isScrolling.value) return
    
    isScrolling.value = true
    // 重置速度到初始值
    scrollSpeed.value = baseScrollSpeed.value
    
    logger.info('🌊 開始背景滾動')
    
    const scroll = () => {
      if (!isScrolling.value) return
      
      // 漸進式加速，直到達到最大速度
      if (scrollSpeed.value < maxScrollSpeed.value) {
        scrollSpeed.value = Math.min(scrollSpeed.value + speedIncrease.value, maxScrollSpeed.value)
      }
      
      // 滾動默認背景（bgDefault）
      if (defaultBackgroundSprite) {
        defaultBackgroundSprite.y += scrollSpeed.value
      }
      
      // 滾動前景雲朵，跟著 bgDefault 一起移動
      if (frontCloudSprite) {
        frontCloudSprite.y += scrollSpeed.value
        // 前景雲朵滾出螢幕後就不再回來
      }
      
      // 滾動循環背景（bgCycle）
      cycleBackgroundSprites.forEach(sprite => {
        sprite.y += scrollSpeed.value
        
        // 當精靈完全移出下方時，移動到隊列最上方繼續循環
        if (sprite.y > gameHeight.value + sprite.height) {
          // 找到所有精靈中最上方的位置（包含默認背景）
          const allSprites = [defaultBackgroundSprite, ...cycleBackgroundSprites].filter(s => s !== null && s !== sprite)
          if (allSprites.length > 0) {
            const topY = Math.min(...allSprites.map(s => s!.y))
            // 確保無縫銜接，使用整數座標避免像素縫隙
            sprite.y = Math.floor(topY - sprite.height) + scrollSpeed.value
          }
        }
      })
      
      if (isScrolling.value) {
        requestAnimationFrame(scroll)
      }
    }
    
    scroll()
  }

  // 停止背景滾動
  const stopBackgroundScroll = (): void => {
    isScrolling.value = false
    logger.info('🛑 停止背景滾動')
  }

  // 背景淡入 + 前景浮現動畫
  const animateBackgroundFloatUp = (
    oldCycleSprites: any[] = [], 
    oldDefaultBackground: any = null, 
    oldFrontCloud: any = null
  ): void => {
    const app = getApp()
    if (!defaultBackgroundSprite && !frontCloudSprite) return
    
    // 保存原始位置
    const originalCloudY = frontCloudSprite?.y || 0
    
    // 背景淡入設置 - 保持在原位置，但設為透明
    if (defaultBackgroundSprite) {
      defaultBackgroundSprite.alpha = 0 // 初始透明
    }
    
    // 前景浮現設置 - 移到螢幕下方
    if (frontCloudSprite) {
      frontCloudSprite.y = gameHeight.value + frontCloudSprite.height
    }
    
    const duration = 500 // 0.5秒動畫
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用 easeOutCubic 緩動函數，讓動畫更自然
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      // 背景淡入動畫
      if (defaultBackgroundSprite) {
        defaultBackgroundSprite.alpha = easeProgress // 從 0 淡入到 1
      }
      
      // 前景浮現動畫
      if (frontCloudSprite) {
        const startY = gameHeight.value + frontCloudSprite.height
        const endY = originalCloudY
        frontCloudSprite.y = startY + (endY - startY) * easeProgress
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // 動畫完成，清理舊背景
        if (!app) return
 
        // 清理舊循環背景
        oldCycleSprites.forEach(sprite => {
          if (app && app.stage.getChildIndex(sprite) !== -1) {
            app.stage.removeChild(sprite)
          }
        })
        
        // 清理舊默認背景
        if (oldDefaultBackground && app.stage.getChildIndex(oldDefaultBackground) !== -1) {
          app.stage.removeChild(oldDefaultBackground)
        }
        
        // 清理舊前景雲朵
        if (oldFrontCloud && app.stage.getChildIndex(oldFrontCloud) !== -1) {
          app.stage.removeChild(oldFrontCloud)
        }
        
        // 重新排序子元素
        app.stage.sortChildren()
        
        logger.info('✅ 背景淡入 + 前景浮現動畫完成，舊背景已清理')
      }
    }
    
    logger.info('🎬 開始背景淡入 + 前景浮現動畫')
    animate()
  }

  // 更新背景縮放 - 根據裝置類型採用不同策略
  // PC裝置
  const updateDesktopBackgroundScale = (): void => {
    if (defaultBackgroundSprite) {
      const texture = defaultBackgroundSprite.texture
      const scaleX = gameWidth.value / texture.width
      const scaleY = gameHeight.value / texture.height
      const scale = Math.max(scaleX, scaleY)
      
      defaultBackgroundSprite.scale.set(scale)
      defaultBackgroundSprite.x = Math.floor((gameWidth.value - texture.width * scale) / 2)
      defaultBackgroundSprite.y = Math.floor((gameHeight.value - texture.height * scale) / 2)
    }
    
    // PC裝置的循環背景
    if (cycleBackgroundSprites.length > 0) {
      const texture = cycleBackgroundSprites[0].texture
      const scale = gameWidth.value / texture.width
      const scaledHeight = texture.height * scale
      
      cycleBackgroundSprites.forEach((sprite) => {
        sprite.scale.set(scale)
        sprite.x = 0
        sprite.y += Math.floor(scaledHeight)
      })
    }
  }

  // 手機裝置
  const updateMobileBackgroundScale = (): void => {
    if (defaultBackgroundSprite) {
      const texture = defaultBackgroundSprite.texture
      
      // 手機模式：確保背景填滿螢幕，左右或上下會被裁切
      const scaleX = gameWidth.value / texture.width  // 填滿寬度的縮放
      const scaleY = gameHeight.value / texture.height // 填滿高度的縮放
      
      // 使用較大的縮放比例，確保背景完全覆蓋螢幕（會被裁切）
      const scale = Math.max(scaleX, scaleY)
      
      // 調試信息
      console.log('📱 手機背景縮放調試:')
      console.log(`螢幕尺寸: ${gameWidth.value} x ${gameHeight.value}`)
      console.log(`背景原始尺寸: ${texture.width} x ${texture.height}`)
      console.log(`scaleX: ${scaleX.toFixed(3)}, scaleY: ${scaleY.toFixed(3)}`)
      console.log(`最終縮放: ${scale.toFixed(3)}`)
      console.log(`背景最終尺寸: ${(texture.width * scale).toFixed(0)} x ${(texture.height * scale).toFixed(0)}`)
      
      defaultBackgroundSprite.scale.set(scale)
      
      // 置中對齊
      defaultBackgroundSprite.x = Math.floor((gameWidth.value - texture.width * scale) / 2)
      defaultBackgroundSprite.y = Math.floor((gameHeight.value - texture.height * scale) / 2)
      
      console.log(`背景位置: x=${defaultBackgroundSprite.x}, y=${defaultBackgroundSprite.y}`)
    }
    
    // 手機裝置的循環背景：只需左右裁切
    if (cycleBackgroundSprites.length > 0) {
      const texture = cycleBackgroundSprites[0].texture
      // 寬度填滿，左右裁切
      const scale = gameWidth.value / texture.width
      const scaledHeight = texture.height * scale
      
      cycleBackgroundSprites.forEach((sprite) => {
        sprite.scale.set(scale)
        sprite.x = 0 // 左對齊
        sprite.y += Math.floor(scaledHeight)
      })
    }
  }
  // 更新背景縮放
  const updateBackgroundScale = async (): Promise<void> => {
    const app = getApp()
    if (!app) return
    
    if (isDesktop.value) {
      // PC裝置：保持原有的背景處理邏輯
      updateDesktopBackgroundScale()
    } else {
      // 手機裝置：背景置中，左右裁切，必要時下方裁切
      updateMobileBackgroundScale()
    }
  }

  // 重置背景（重置遊戲時用）
  const resetBackground = async (): Promise<{
    oldCycleSprites: any[]
    oldDefaultBackground: any
    oldFrontCloud: any
  }> => {
    const app = getApp()
    
    // 保存舊背景引用，稍後在動畫完成後清理
    const oldCycleSprites = [...cycleBackgroundSprites]
    const oldDefaultBackground = defaultBackgroundSprite
    const oldFrontCloud = frontCloudSprite
    
    // 重置引用但不清理實際元素
    cycleBackgroundSprites = []
    
    // 創建新的背景和前景
    if (app) {
      // 先重置引用
      defaultBackgroundSprite = null
      frontCloudSprite = null
      
      // 創建新背景和前景
      await setDefaultBackground()
      await setFrontCloud()
      
      // 確保新背景在所有舊背景上方
      if (defaultBackgroundSprite) {
        (defaultBackgroundSprite as any).zIndex = -1 // 比舊背景(-10)和循環背景(-5)都高
      }
      if (frontCloudSprite) {
        (frontCloudSprite as any).zIndex = 20 // 比舊前景(10)高  
      }
      
      // 立即排序以確保顯示順序正確
      app.stage.sortChildren()
    }

    return { oldCycleSprites, oldDefaultBackground, oldFrontCloud }
  }

  // 清理所有背景
  const destroyBackground = (): void => {
    const app = getApp()
    if (!app) return
    
    // 停止滾動
    stopBackgroundScroll()
    
    // 清理默認背景
    if (defaultBackgroundSprite && app.stage.getChildIndex(defaultBackgroundSprite) !== -1) {
      app.stage.removeChild(defaultBackgroundSprite)
    }
    defaultBackgroundSprite = null
    
    // 清理前景雲朵
    if (frontCloudSprite && app.stage.getChildIndex(frontCloudSprite) !== -1) {
      app.stage.removeChild(frontCloudSprite)
    }
    frontCloudSprite = null
    
    // 清理循環背景
    cycleBackgroundSprites.forEach(sprite => {
      if (app && app.stage.getChildIndex(sprite) !== -1) {
        app.stage.removeChild(sprite)
      }
    })
    cycleBackgroundSprites = []
    
    logger.info('🧹 背景已清理')
  }

  return {
    // 狀態
    isScrolling,
    scrollSpeed,
    
    // 計算屬性
    baseScrollSpeed,
    speedIncrease,
    maxScrollSpeed,
    defaultBackground,
    cycleBackground,
    frontCloud,
    pageBackgroundImage,

    // 方法
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
  }
}
