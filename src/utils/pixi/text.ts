/**
 * PixiJS 文字管理工具
 * 用於創建、管理和更新 PixiJS 文字物件
 */

import * as PIXI from 'pixi.js'

export interface TextConfig {
  /** 文字內容 */
  text: string
  /** 字體系列 */
  fontFamily?: string
  /** 字體大小 */
  fontSize?: number
  /** 文字顏色 */
  fill?: number | string
  /** 描邊顏色 */
  strokeColor?: number | string
  /** 描邊寬度 */
  strokeWidth?: number
  /** 是否啟用陰影 */
  dropShadow?: boolean
  /** 陰影顏色 */
  dropShadowColor?: number | string
  /** 陰影模糊度 */
  dropShadowBlur?: number
  /** 陰影角度 */
  dropShadowAngle?: number
  /** 陰影距離 */
  dropShadowDistance?: number
  /** 文字換行 */
  wordWrap?: boolean
  /** 文字換行寬度 */
  wordWrapWidth?: number
  /** 文字對齊 */
  align?: 'left' | 'center' | 'right'
}

export interface TextTransform {
  /** X 位置 */
  x?: number
  /** Y 位置 */
  y?: number
  /** 錨點 X (0-1) */
  anchorX?: number
  /** 錨點 Y (0-1) */
  anchorY?: number
  /** 層級 */
  zIndex?: number
  /** 是否可見 */
  visible?: boolean
}

export interface CreateTextResult {
  /** PixiJS 文字物件 */
  textObject: PIXI.Text
  /** 更新文字內容 */
  updateText: (newText: string) => void
  /** 更新樣式 */
  updateStyle: (styleConfig: Partial<TextConfig>) => void
  /** 設置變換 */
  setTransform: (transform: TextTransform) => void
  /** 顯示/隱藏 */
  setVisible: (visible: boolean) => void
  /** 銷毀文字物件 */
  destroy: () => void
}

/**
 * 創建預設的文字樣式配置
 */
export function createDefaultTextConfig(): TextConfig {
  return {
    text: 'Sample Text',
    fontFamily: 'Arial, sans-serif',
    fontSize: 32,
    fill: 0xffffff,
    strokeColor: 0x000000,
    strokeWidth: 2,
    dropShadow: true,
    dropShadowColor: 0x000000,
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
    align: 'center'
  }
}

/**
 * 創建 PixiJS 文字物件
 */
export function createPixiText(
  config: Partial<TextConfig> = {},
  logFunction?: (message: string) => void
): CreateTextResult {
  const log = logFunction || (() => {})
  
  try {
    // 合併預設配置
    const finalConfig = { ...createDefaultTextConfig(), ...config }
    
    log(`📝 創建文字物件: "${finalConfig.text}"`)
    
    // 創建文字樣式
    const textStyle = new PIXI.TextStyle({
      fontFamily: finalConfig.fontFamily,
      fontSize: finalConfig.fontSize,
      fill: finalConfig.fill,
      stroke: {
        color: finalConfig.strokeColor!,
        width: finalConfig.strokeWidth!
      },
      dropShadow: finalConfig.dropShadow ? {
        color: finalConfig.dropShadowColor!,
        blur: finalConfig.dropShadowBlur!,
        angle: finalConfig.dropShadowAngle!,
        distance: finalConfig.dropShadowDistance!,
      } : undefined,
      wordWrap: finalConfig.wordWrap,
      wordWrapWidth: finalConfig.wordWrapWidth,
      align: finalConfig.align
    })
    
    // 創建文字物件
    const textObject = new PIXI.Text({
      text: finalConfig.text,
      style: textStyle
    })
    
    log(`✅ 文字物件創建成功`)
    
    // 返回管理接口
    return {
      textObject,
      
      updateText(newText: string) {
        try {
          textObject.text = newText
          log(`📝 文字內容已更新: "${newText}"`)
        } catch (err) {
          log(`❌ 更新文字內容失敗: ${err}`)
        }
      },
      
      updateStyle(styleConfig: Partial<TextConfig>) {
        try {
          const currentStyle = textObject.style as PIXI.TextStyle
          const mergedConfig = { ...finalConfig, ...styleConfig }
          
          // 更新樣式屬性
          if (styleConfig.fontFamily) currentStyle.fontFamily = styleConfig.fontFamily
          if (styleConfig.fontSize) currentStyle.fontSize = styleConfig.fontSize
          if (styleConfig.fill !== undefined) currentStyle.fill = styleConfig.fill
          
          // 更新描邊
          if (styleConfig.strokeColor !== undefined || styleConfig.strokeWidth !== undefined) {
            currentStyle.stroke = {
              color: styleConfig.strokeColor ?? finalConfig.strokeColor!,
              width: styleConfig.strokeWidth ?? finalConfig.strokeWidth!
            }
          }
          
          // 更新陰影
          if (styleConfig.dropShadow !== undefined || 
              styleConfig.dropShadowColor !== undefined ||
              styleConfig.dropShadowBlur !== undefined ||
              styleConfig.dropShadowAngle !== undefined ||
              styleConfig.dropShadowDistance !== undefined) {
            
            if (mergedConfig.dropShadow) {
              (currentStyle as any).dropShadow = {
                color: styleConfig.dropShadowColor ?? finalConfig.dropShadowColor!,
                blur: styleConfig.dropShadowBlur ?? finalConfig.dropShadowBlur!,
                angle: styleConfig.dropShadowAngle ?? finalConfig.dropShadowAngle!,
                distance: styleConfig.dropShadowDistance ?? finalConfig.dropShadowDistance!,
              }
            } else {
              (currentStyle as any).dropShadow = undefined
            }
          }
          
          // 更新換行設置
          if (styleConfig.wordWrap !== undefined) currentStyle.wordWrap = styleConfig.wordWrap
          if (styleConfig.wordWrapWidth !== undefined) currentStyle.wordWrapWidth = styleConfig.wordWrapWidth
          if (styleConfig.align !== undefined) currentStyle.align = styleConfig.align
          
          // 應用更新後的配置
          Object.assign(finalConfig, styleConfig)
          
          log(`🎨 文字樣式已更新`)
        } catch (err) {
          log(`❌ 更新文字樣式失敗: ${err}`)
        }
      },
      
      setTransform(transform: TextTransform) {
        try {
          if (transform.x !== undefined) textObject.x = transform.x
          if (transform.y !== undefined) textObject.y = transform.y
          if (transform.anchorX !== undefined && transform.anchorY !== undefined) {
            textObject.anchor.set(transform.anchorX, transform.anchorY)
          }
          if (transform.zIndex !== undefined) textObject.zIndex = transform.zIndex
          if (transform.visible !== undefined) textObject.visible = transform.visible
          
          log(`📍 文字變換已更新: (${textObject.x}, ${textObject.y})`)
        } catch (err) {
          log(`❌ 設置文字變換失敗: ${err}`)
        }
      },
      
      setVisible(visible: boolean) {
        try {
          textObject.visible = visible
          log(`👁️ 文字${visible ? '顯示' : '隱藏'}: "${textObject.text}"`)
        } catch (err) {
          log(`❌ 設置文字可見性失敗: ${err}`)
        }
      },
      
      destroy() {
        try {
          if (textObject.parent) {
            textObject.parent.removeChild(textObject)
          }
          textObject.destroy()
          log(`🗑️ 文字物件已銷毀`)
        } catch (err) {
          log(`❌ 銷毀文字物件失敗: ${err}`)
        }
      }
    }
    
  } catch (err) {
    log(`❌ 創建文字物件失敗: ${err}`)
    throw err
  }
}

/**
 * 為文字物件添加到舞台
 */
export function addTextToStage(
  app: PIXI.Application,
  textResult: CreateTextResult,
  transform?: TextTransform,
  logFunction?: (message: string) => void
): void {
  const log = logFunction || (() => {})
  
  try {
    // 設置初始變換
    if (transform) {
      textResult.setTransform(transform)
    }
    
    // 添加到舞台
    app.stage.addChild(textResult.textObject)
    
    // 確保 zIndex 生效
    app.stage.sortChildren()
    
    log(`🎭 文字已添加到舞台`)
    
  } catch (err) {
    log(`❌ 添加文字到舞台失敗: ${err}`)
    throw err
  }
}

/**
 * 創建常用的文字樣式預設
 */
export const TEXT_PRESETS = {
  // 標題文字
  title: {
    fontSize: 48,
    fill: 0xffd700,
    strokeColor: 0x000000,
    strokeWidth: 3,
    dropShadow: true,
    dropShadowDistance: 8
  } as Partial<TextConfig>,
  
  // 副標題
  subtitle: {
    fontSize: 32,
    fill: 0xffffff,
    strokeColor: 0x000000,
    strokeWidth: 2,
    dropShadow: true,
    dropShadowDistance: 6
  } as Partial<TextConfig>,
  
  // 普通文字
  normal: {
    fontSize: 24,
    fill: 0xffffff,
    strokeColor: 0x000000,
    strokeWidth: 1,
    dropShadow: true,
    dropShadowDistance: 4
  } as Partial<TextConfig>,
  
  // 小文字
  small: {
    fontSize: 18,
    fill: 0xcccccc,
    strokeColor: 0x000000,
    strokeWidth: 1,
    dropShadow: false
  } as Partial<TextConfig>,
  
  // 警告文字
  warning: {
    fontSize: 28,
    fill: 0xff6b6b,
    strokeColor: 0x000000,
    strokeWidth: 2,
    dropShadow: true,
    dropShadowColor: 0x800000,
    dropShadowDistance: 5
  } as Partial<TextConfig>,
  
  // 成功文字
  success: {
    fontSize: 28,
    fill: 0x51cf66,
    strokeColor: 0x000000,
    strokeWidth: 2,
    dropShadow: true,
    dropShadowColor: 0x004000,
    dropShadowDistance: 5
  } as Partial<TextConfig>
}
