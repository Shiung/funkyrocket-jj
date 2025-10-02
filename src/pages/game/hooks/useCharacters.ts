
import { getRandomNum } from '@/utils'
import { 
  createSpineAnimation,
  playSpineAnimation,
  applySpineTransform,
  setSpineAnimationSpeed,
} from '@/utils/pixi'
import { createLogger } from '@/utils/pixi/logger'
import { createFollowText } from '@/utils/pixi/textFollower'
import type { CharacterType, Character } from '../types'
import { useBaseConfig } from './useBaseConfig'

// 角色實例管理
const characters: Map<string, Character> = new Map()

const logger = createLogger()

export const useCharacters = (getApp: () => any, getRocketSpine: () => any) => {
  // 基礎配置
  const {
    HORIZON_OFFSET,
    gameWidth,
    gameHeight,
    horizon,
    // scaleFactorX,
    scaleFactorY,
    baseScale,
    baseOffsetY,
    isDesktop,
  } = useBaseConfig()
  
  // 計算角色上車X座標的調整（只調整X，Y維持原本邏輯）
  const calculateCharacterBoardingX = (baseX: number, isNpc: boolean) => {
    const offset = 75 * baseScale.value
  
    // PC模式：直接使用原始X座標
    if (isDesktop.value) return isNpc ? baseX - offset : baseX + offset

    // 小螢幕模式
    if (gameWidth.value < 400) return isNpc ? baseX - offset / 2 : baseX + offset / 2

    // 一般手機
    return isNpc ? baseX - offset : baseX + offset
  }

  // 固定使用 funkyRocket 的 getSpineAssets 函數
  const getSpineAssets = (animationName: string) => {
    return {
      skelPath: `/assets/spine/${animationName}/${animationName}.skel`,
      atlasPath: `/assets/spine/${animationName}/${animationName}.atlas`,
      imagePath: `/assets/spine/${animationName}/${animationName}.png`
    }
  }

  // 創建角色（走路動畫）
  const createCharacterWalk = async (type: CharacterType, id: string, direction: 'left' | 'right'): Promise<Character | null> => {
    const app = getApp()
    if (!app) return null
  
    try {
      logger.info(`👤 創建角色: ${type} (${id})`)
      
      // 所有角色都使用統一的上車動畫
      const animationName = 'walk'
      
      const characterAssets = getSpineAssets(animationName)
      const spineResult = await createSpineAnimation({
        skelPath: characterAssets.skelPath,
        atlasPath: characterAssets.atlasPath,
        imagePath: characterAssets.imagePath
      })
      
      const spine = spineResult.spine
      
      // 設定角色起始位置 - 從螢幕邊緣開始，增加動畫距離
      const scale = baseScale.value * 1.5  // 放大角色，讓它更明顯
      const textrueWidth = spine.getBounds().width || 0
      const textrueHeight = spine.getBounds().height || 0
      
      // 玩家和主播從左側開始，NPC從右側開始，距離螢幕邊緣20%的位置
      const isFromLeft = direction === 'left'
      const directionOffsetX = isFromLeft ? -textrueWidth : textrueWidth
      // 增加偏移量，讓動畫更明顯
      const directionOffsetY = isDesktop.value ? 40 : baseOffsetY.value - 15 * scaleFactorY.value
      const startX = gameWidth.value / 2 + directionOffsetX
      const startY = gameHeight.value - horizon.value - textrueHeight / 2 + directionOffsetY
      
      logger.info(`🎯 角色起始位置: (${startX.toFixed(0)}, ${startY.toFixed(0)}), 畫面大小: ${gameWidth.value}x${gameHeight.value}, 類型: ${type}`)
      
      // 玩家和主播需要鏡像反轉
      const shouldFlip = type === 'player' || type === 'streamer'
      
      applySpineTransform(spine, {
        x: startX,
        y: startY,
        scaleX: shouldFlip ? -scale : scale, // 負值表示左右反轉
        scaleY: scale
      })

      app.stage.addChild(spine)

      const character: Character = {
        id,
        type,
        spine,
        position: { x: startX, y: startY },
        isVisible: true
      }
      
      characters.set(id, character)
      logger.info(`✅ 角色創建成功: ${type} (${id})`)
      
      return character
      
    } catch (error) {
      logger.error(`❌ 角色創建失敗 ${type}: ${error}`)
      return null
    }
  }

  // 角色動畫 - 上車
  const animateCharacterWalk = async (character: Character, _direction: 'left' | 'right'): Promise<void> => {
    if (!character.spine) return
    
    return new Promise<void>((resolve, reject) => {
      try {
        const app = getApp()
        if (!app) return reject(new Error('App not available'))

        const isNpc = _direction !== 'left'
        const animationName = isNpc ? 'others_walk' : 'me_walk'
        
        // 播放跳躍動畫（原地跳躍）
        playSpineAnimation(character.spine, animationName, false)
        
        // 移動到火箭附近的地面位置，終點更靠近中心
        const textrueWidth = character.spine.getBounds().width || 0
        const offsetX = (isNpc ? textrueWidth : -textrueWidth) * 0.6
        const baseTargetX = gameWidth.value / 2 + offsetX // 畫面水平中心點
        // 小裝置特別處理
        const directionOffsetY = !isDesktop.value && gameWidth.value < 400 ? baseOffsetY.value / 2 : baseOffsetY.value // 增加偏移量，讓動畫更明顯
        const textrueHeight = character.spine.getBounds().height || 0
        const baseTargetY = gameHeight.value - horizon.value - textrueHeight / 2 - (HORIZON_OFFSET * 2 * baseScale.value) - directionOffsetY   // 畫面中心 + 基礎偏移量
        
        // 只調整X座標（考慮手機模式的背景偏移），Y座標維持原本邏輯
        const targetX = calculateCharacterBoardingX(baseTargetX, isNpc)
        const targetY = baseTargetY  // Y座標維持原本比例，讓動畫距離隨螢幕高度調整
        
        const startX = character.position.x
        const startY = character.position.y
        const duration = 3000 // 3秒
        const startTime = Date.now()
        
        // 計算動畫距離
        const animationDistance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2))
        logger.info(`🏃 ${character.type} 上車動畫 - 起點: (${startX.toFixed(0)}, ${startY.toFixed(0)}) → 終點: (${targetX.toFixed(0)}, ${targetY.toFixed(0)}), 距離: ${animationDistance.toFixed(0)}px`)
        
        const animate = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          
          const easeOut = 1 - Math.pow(1 - progress, 3)
          const currentX = startX + (targetX - startX) * easeOut
          const currentY = startY + (targetY - startY) * easeOut
          
          applySpineTransform(character.spine, {
            x: currentX,
            y: currentY,
            scaleX: isNpc ? baseScale.value : -baseScale.value,
            scaleY: baseScale.value
          })
          
          character.position.x = currentX
          character.position.y = currentY
          
          if (progress < 1) requestAnimationFrame(animate)
          else {
            // 動畫完成，移除角色
            if (app && app.stage.getChildIndex(character.spine) !== -1) {
              app.stage.removeChild(character.spine)
            }
            characters.delete(character.id)
            logger.info(`✅ ${character.type} 上車完成，角色已移除`)
            
            // 🆕 動畫完成後 resolve Promise
            resolve()
          }
        }
        
        animate()
        
      } catch (error) {
        logger.error(`❌ ${character.type} 上車動畫失敗: ${error}`)
        reject(error)
      }
    })
  }

  // 創建下車角色（使用 jump 動畫）
  const createCharacterJump = async (type: CharacterType, id: string, followText?: { name: string, odds: string }): Promise<Character | null> => {
    const app = getApp()
    const rocketSpine = getRocketSpine()
    if (!app) return null
    
    try {
      logger.info(`🎯 創建下車角色 ${type} (${id})`)
      
      const isNpc = type === 'npc'
      const animationName = 'jump'
      const characterAssets = getSpineAssets(animationName)
      const spineResult = await createSpineAnimation({
        skelPath: characterAssets.skelPath,
        atlasPath: characterAssets.atlasPath,
        imagePath: characterAssets.imagePath
      })
      
      const spine = spineResult.spine
      
      // 從火箭的實際位置開始 (考慮縮放因子)
      const startX = rocketSpine ? rocketSpine.x : gameWidth.value / 2
      const startY = rocketSpine ? rocketSpine.y : gameHeight.value / 2 + baseOffsetY.value
      
      // 初始設置
      applySpineTransform(spine, {
        x: startX,
        y: startY,
        scaleX: isNpc ? -baseScale.value : baseScale.value,
        scaleY: baseScale.value
      })
      // 跳慢一點
      setSpineAnimationSpeed(spine, 0.5)
      
      app.stage.addChild(spine)
      
      // 為角色創建文字跟隨（如果需要）
      const textResults: any[] = []
      const boneTrackers: any[] = []
      
      if (followText) {
        // 創建 name 文字（帶背景）
        const nameResult = await createFollowText(app, spine, startX, startY, followText.name, { x: 0, y: 60 }, true)
        if (nameResult.textResult) textResults.push(nameResult.textResult)
        if (nameResult.boneTracker) boneTrackers.push(nameResult.boneTracker)
        
        // 創建 odds 文字（純文字）
        const oddsResult = await createFollowText(app, spine, startX, startY, followText.odds, { x: 0, y: 100 }, false)
        if (oddsResult.textResult) textResults.push(oddsResult.textResult)
        if (oddsResult.boneTracker) boneTrackers.push(oddsResult.boneTracker)
      }
      
      const character: Character = {
        id,
        type,
        spine,
        position: { x: startX, y: startY },
        isVisible: true,
        boneTrackers: boneTrackers.length > 0 ? boneTrackers : undefined,
        textResults: textResults.length > 0 ? textResults : undefined
      }
      
      characters.set(id, character)
      logger.info(`✅ 下車角色創建成功: ${type} (${id})`)
      
      return character
      
    } catch (error) {
      logger.error(`❌ 下車角色創建失敗 ${type}: ${error}`)
      return null
    }
  }

  // 角色動畫 - 下車（跳躍）
  const animateCharacterJump = async (character: Character): Promise<void> => {
    const app = getApp()
    if (!character.spine || !app) return
    
    try {
      logger.info(`🎯 開始 ${character.type} 下車動畫，起始位置: (${character.position.x}, ${character.position.y})`)
      
      const isNpc = character.type === 'npc'
      const randomAnimationNumber = ['', 2, 3][getRandomNum(0, 3)]
      const animationName = isNpc ? `jump_others${randomAnimationNumber}` : `jump_me${randomAnimationNumber}`

      // 播放跳躍動畫（原地跳躍）
      playSpineAnimation(character.spine, animationName, false)

      const scale = baseScale.value
      
      // 設置 Spine 的縮放，但保持位置不變
      applySpineTransform(character.spine, {
        x: character.spine.x,  // 保持原位置
        y: character.spine.y,  // 保持原位置
        scaleX: isNpc ? -scale : scale,
        scaleY: scale
      })

      // 啟動所有骨骼追蹤器並顯示文字
      if (character.boneTrackers && character.textResults) {
        // 啟動所有骨骼追蹤器
        character.boneTrackers.forEach(tracker => tracker.startTracking())
        
        // 等一個 frame 讓骨骼追蹤器計算位置，然後顯示所有文字
        requestAnimationFrame(() => {
          character.textResults!.forEach(textResult => {
            const textResultWithContainer = textResult as any
            if (textResultWithContainer?.container) {
              textResultWithContainer.container.visible = true
            } else {
              textResult.textObject.visible = true
            }
          })
        })
      }
      
      const duration = 3000 // 3秒跳躍動畫
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 檢查動畫是否完成
        if (progress < 1) requestAnimationFrame(animate)
        else {
          // 動畫完成，清理資源
          if (character.boneTrackers) {
            character.boneTrackers.forEach(tracker => {
              tracker.stopTracking()
              tracker.dispose()
            })
          }

          if (character.textResults && app) {
            character.textResults.forEach(textResult => {
              const textResultWithContainer = textResult as any
              if (textResultWithContainer?.container) {
                // 如果有容器，移除容器
                if (app.stage.getChildIndex(textResultWithContainer.container) !== -1) {
                  app.stage.removeChild(textResultWithContainer.container)
                }
              } else {
                // 如果沒有容器，移除原始文字物件
                if (app.stage.getChildIndex(textResult.textObject) !== -1) {
                  app.stage.removeChild(textResult.textObject)
                }
              }
              textResult.destroy()
            })
          }

          // 移除 Spine
          if (app && app.stage.getChildIndex(character.spine) !== -1) {
            app.stage.removeChild(character.spine)
          }

          characters.delete(character.id)
          logger.info(`✅ ${character.type} 下車完成`)
        }
      }

      animate()

    } catch (error) {
      logger.error(`❌ ${character.type} 下車動畫失敗: ${error}`)
    }
  }

  // 更新現有角色縮放
  const updateCharactersScale = (): void => {
    for (const character of characters.values()) {
      if (character.spine) {
        const isNpc = character.type === 'npc'
        applySpineTransform(character.spine, {
          x: character.spine.x, // 保持當前位置
          y: character.spine.y, // 保持當前位置
          scaleX: isNpc ? -baseScale.value : baseScale.value,
          scaleY: baseScale.value
        })
      }
    }
  }

  // 清理所有角色
  const destroyAllCharacters = (): void => {
    const app = getApp()
    if (!app) return

    for (const character of characters.values()) {
      if (character.boneTrackers) {
        character.boneTrackers.forEach(tracker => {
          tracker.stopTracking()
          tracker.dispose()
        })
      }

      if (character.textResults) {
        character.textResults.forEach(textResult => {
          const textResultWithContainer = textResult as any
          if (textResultWithContainer?.container) {
            // 如果有容器，移除容器
            if (app.stage.getChildIndex(textResultWithContainer.container) !== -1) {
              app.stage.removeChild(textResultWithContainer.container)
            }
          } else {
            // 如果沒有容器，移除原始文字物件
            if (app.stage.getChildIndex(textResult.textObject) !== -1) {
              app.stage.removeChild(textResult.textObject)
            }
          }
          textResult.destroy()
        })
      }

      if (app.stage.getChildIndex(character.spine) !== -1) {
        app.stage.removeChild(character.spine)
      }
    }
    characters.clear()

    logger.info('🧹 所有角色已清理')
  }

  // 等待所有角色動畫完成
  const waitForAllCharactersComplete = async (): Promise<void> => {
    while (characters.size > 0) {
      logger.info(`⏳ 等待上車動畫完成，剩餘角色: ${characters.size}`)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  // 獲取指定角色
  const getCharacter = (id: string): Character | undefined => {
    return characters.get(id)
  }

  // 獲取所有角色
  const getAllCharacters = (): Character[] => {
    return Array.from(characters.values())
  }

  // 獲取角色數量
  const getCharacterCount = (): number => {
    return characters.size
  }

  return {
    // 方法
    createCharacterWalk,
    createCharacterJump,
    animateCharacterWalk,
    animateCharacterJump,
    updateCharactersScale,
    destroyAllCharacters,
    waitForAllCharactersComplete,
    getCharacter,
    getAllCharacters,
    getCharacterCount
  }
}
