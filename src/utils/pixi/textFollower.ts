/**
 * 文字跟隨工具
 * 結合文字管理和骨骼追蹤功能，提供完整的文字跟隨解決方案
 */

import type { Application } from 'pixi.js'
import { createPixiText, type CreateTextResult } from './text'
import { createBoneTracker, type BoneTracker } from './boneTracker'
import { createLogger } from './logger'

// 文字跟隨功能結果
export interface FollowTextResult {
  textResult?: CreateTextResult
  boneTracker?: BoneTracker
}

// 創建文字跟隨功能
export const createFollowText = async (
  app: Application,
  spine: any, 
  startX: number, 
  startY: number, 
  followText: string
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
    
    // 2. 暫時隱藏文字，等骨骼追蹤器計算出正確位置再顯示
    textResult.textObject.x = startX
    textResult.textObject.y = startY
    textResult.textObject.anchor.set(0.5, 0.5)
    // textResult.textObject.zIndex = 15
    textResult.textObject.visible = false  // 先隱藏
    app.stage.addChild(textResult.textObject)
    app.stage.sortChildren()
    
    // 3. 創建骨骼追蹤器
    const boneTracker = createBoneTracker({
      textObject: textResult.textObject,
      spine,
      textOffset: { x: 0, y: 60 }, // 文字在動畫下方
      // enableDebugLog: true,
      // debugLogFrequency: 0.3
    })
    
    // 4. 不立即開始追蹤，等動畫播放時再開始
    logger.info('✅ 文字跟隨創建成功（等待動畫開始）')
    
    return { textResult, boneTracker }
    
  } catch (error) {
    logger.error(`❌ 文字跟隨創建失敗: ${error}`)
    return { textResult: undefined, boneTracker: undefined }
  }
}
