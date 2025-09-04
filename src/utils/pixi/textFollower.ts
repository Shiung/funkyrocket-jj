/**
 * 文字跟隨工具
 * 結合文字管理和骨骼追蹤功能，提供完整的文字跟隨解決方案
 */

import type { Application } from 'pixi.js'
import { Container, Graphics } from 'pixi.js'
import { createPixiText, type CreateTextResult } from './text'
import { createBoneTracker, type BoneTracker } from './boneTracker'
import { createLogger } from './logger'

// 文字跟隨功能結果
export interface FollowTextResult {
  textResult?: CreateTextResult & { 
    /** 包含背景和文字的容器 */
    container?: Container 
  }
  boneTracker?: BoneTracker
}

// 創建文字跟隨功能
export const createFollowText = async (
  app: Application,
  spine: any, 
  startX: number, 
  startY: number, 
  followText: string,
  textOffset: { x: number, y: number } = { x: 0, y: 60 },
  withBackground: boolean = true,
): Promise<FollowTextResult> => {
  // 沒有文字或沒有 app 則返回 undefined
  if (!followText || !app) return { textResult: undefined, boneTracker: undefined }
  const logger = createLogger(50)

  try {
    
    // 1. 創建文字物件
    const textResult = createPixiText({
      text: followText,
      fontSize: 20,
      fill: 0xffffff,  // 白色文字
      strokeColor: 0x000000, // 黑色描邊
      strokeWidth: 1,
      dropShadow: false
    }, logger.createLogFunction())
    
    // 2. 設置文字位置和錨點
    textResult.textObject.anchor.set(0.5, 0.5)
    textResult.textObject.x = 0
    textResult.textObject.y = 0
    
    let finalObject: any
    
    if (withBackground) {
      // 3. 創建容器並先添加文字以便計算尺寸
      const textContainer = new Container()
      textContainer.addChild(textResult.textObject)
      
      // 4. 計算文字尺寸（現在文字已經在容器中）
      const textBounds = textResult.textObject.getBounds()
      const padding = 8 // 內邊距
      const cornerRadius = (textBounds.width + padding) / 2 // 圓角半徑
      
      const bgWidth = textBounds.width + padding * 2
      const bgHeight = textBounds.height + padding * 2
      
      // 5. 創建圓角背景
      const background = new Graphics()
      
      // 繪製半透明黑色背景和白色邊框
      background
        .roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, cornerRadius)
        .fill({ color: 0x000000, alpha: 0.7 }) // 70% 透明度的黑色
        .stroke({ color: 0xffffff, width: 1 }) // 白色邊框
      
      // 6. 將背景添加到容器（背景需要在文字下方）
      textContainer.addChildAt(background, 0) // 插入到第一位，作為背景
      
      finalObject = textContainer
      ;(textResult as any).container = textContainer
    } else {
      // 純文字，不需要背景
      finalObject = textResult.textObject
    }
    
    // 7. 設置物件位置並添加到舞台
    finalObject.x = startX
    finalObject.y = startY
    finalObject.visible = false  // 先隱藏
    app.stage.addChild(finalObject)
    app.stage.sortChildren()
    
    // 8. 創建骨骼追蹤器
    const boneTracker = createBoneTracker({
      textObject: finalObject,
      spine,
      textOffset, // 文字在動畫下方
      // enableDebugLog: true,
      // debugLogFrequency: 0.3
    })
    
    // 9. 不立即開始追蹤，等動畫播放時再開始
    const logMessage = withBackground ? '✅ 文字跟隨創建成功（帶背景樣式）' : '✅ 文字跟隨創建成功（純文字）'
    logger.info(logMessage)
    
    return { textResult, boneTracker }
    
  } catch (error) {
    logger.error(`❌ 文字跟隨創建失敗: ${error}`)
    return { textResult: undefined, boneTracker: undefined }
  }
}
