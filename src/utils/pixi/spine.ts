/**
 * Spine 動畫相關工具函數
 */
import * as SPINE from '@esotericsoftware/spine-pixi-v8'
import { loadSpineAssets, type SpineAssets, type LoadedAssets } from './assets'

export interface SpineConfig extends SpineAssets {
  logger?: (message: string) => void
}

export interface CreateSpineResult {
  spine: SPINE.Spine
  loadedAssets: LoadedAssets
  animations: string[]
}

export interface SpineTransform {
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  rotation?: number // 以弧度為單位
}

/**
 * 創建 Spine 動畫實例
 */
export async function createSpineAnimation(config: SpineConfig): Promise<CreateSpineResult> {
  const { skelPath, atlasPath, imagePath, logger } = config
  const log = logger || console.log
  
  log('開始創建 Spine 動畫...')
  
  // 載入資源
  const loadedAssets = await loadSpineAssets({ skelPath, atlasPath, imagePath }, logger)
  
  // 創建 Spine 動畫實例
  const spine = SPINE.Spine.from({ 
    skeleton: skelPath, 
    atlas: atlasPath 
  })
  
  log('✅ Spine 動畫創建成功')
  
  // 獲取動畫列表
  const animations = spine.skeleton.data.animations.map(anim => anim.name)
  log(`可用動畫: ${animations.join(', ')}`)
  
  return {
    spine,
    loadedAssets,
    animations
  }
}

/**
 * 播放指定動畫
 */
export function playSpineAnimation(
  spine: SPINE.Spine,
  animationName: string,
  loop: boolean = true,
  logger?: (message: string) => void
): SPINE.TrackEntry | null {
  const log = logger || console.log
  
  try {
    if (!spine.skeleton.data.findAnimation(animationName)) {
      log(`❌ 動畫 "${animationName}" 不存在`)
      return null
    }
    
    const animation = spine.state.setAnimation(0, animationName, loop)
    log(`🎬 播放動畫: ${animationName} (循環: ${loop})`)
    return animation
  } catch (error) {
    log(`❌ 播放動畫失敗: ${error}`)
    return null
  }
}

export function playSpineAnimationWithTrack(
  spine: SPINE.Spine,
  animationName: string,
  loop: boolean = true,
  track: number = 1,
  delay: number = 0,
  logger?: (message: string) => void
): SPINE.TrackEntry | null {
  const log = logger || console.log
  
  try {
    if (!spine.skeleton.data.findAnimation(animationName)) {
      log(`❌ 動畫 "${animationName}" 不存在`)
      return null
    }
    
    const animation = spine.state.addAnimation(track, animationName, loop, delay)
    log(`🎬 新增軌道動畫: ${animationName} (循環: ${loop})`)
    return animation
  } catch (error) {
    log(`❌ 播放動畫失敗: ${error}`)
    return null
  }
}

/**
 * 設置動畫播放速度
 */
export function setSpineAnimationSpeed(
  spine: SPINE.Spine, 
  speed: number,
  logger?: (message: string) => void
): void {
  const log = logger || console.log
  
  try {
    spine.state.timeScale = speed
    log(`⏱️ 動畫速度設置為: ${speed}x`)
  } catch (error) {
    log(`❌ 設置動畫速度失敗: ${error}`)
  }
}

/**
 * 應用變換到 Spine 動畫
 */
export function applySpineTransform(
  spine: SPINE.Spine, 
  transform: SpineTransform,
  logger?: (message: string) => void
): void {
  const log = logger || console.log
  
  try {
    // 設置錨點為中心，確保動畫以中心為基準進行變換
    if (spine.pivot) {
      // 嘗試從骨骼計算更準確的中心，如果失敗則使用邊界框
      try {
        // 首先嘗試使用根骨骼的位置
        const rootBone = spine.skeleton.getRootBone()
        if (rootBone) {
          // 使用根骨骼作為參考點，通常更準確
          spine.pivot.set(0, 0)
        } else {
          // 如果沒有根骨骼，使用邊界框
          const bounds = spine.getBounds()
          spine.pivot.set(bounds.width / 2, bounds.height / 2)
        }
      } catch {
        // 如果骨骼獲取失敗，回退到邊界框方法
        const bounds = spine.getBounds()
        spine.pivot.set(bounds.width / 2, bounds.height / 2)
      }
    }
    
    if (transform.x !== undefined) spine.x = transform.x
    if (transform.y !== undefined) spine.y = transform.y
    if (transform.rotation !== undefined) spine.rotation = transform.rotation
    
    if (transform.scaleX !== undefined || transform.scaleY !== undefined) {
      const scaleX = transform.scaleX ?? spine.scale.x
      const scaleY = transform.scaleY ?? spine.scale.y
      
      // 安全地設置縮放
      if (spine.scale && spine.scale.set) {
        spine.scale.set(scaleX, scaleY)
      } else {
        // 如果 scale.set 不可用，直接設置屬性
        spine.scale.x = scaleX
        spine.scale.y = scaleY
      }
    }
    
    // log(`🔄 Spine 變換已應用: 位置(${spine.x}, ${spine.y}), 縮放(${spine.scale.x}, ${spine.scale.y}), 旋轉(${spine.rotation})`)
  } catch (error) {
    log(`❌ 應用 Spine 變換失敗: ${error}`)
  }
}

/**
 * 獲取 Spine 動畫的詳細信息
 */
export function getSpineInfo(spine: SPINE.Spine): {
  animations: string[]
  bones: string[]
  skins: string[]
  currentAnimation: string | null
  timeScale: number
  position: { x: number; y: number }
  scale: { x: number; y: number }
  rotation: number
} {
  const animations = spine.skeleton.data.animations.map(anim => anim.name)
  const bones = spine.skeleton.bones.map(bone => bone.data.name)
  const skins = spine.skeleton.data.skins.map(skin => skin.name)
  
  // 獲取當前播放的動畫
  const currentTrack = spine.state.tracks[0]
  const currentAnimation = currentTrack?.animation?.name || null
  
  return {
    animations,
    bones,
    skins,
    currentAnimation,
    timeScale: spine.state.timeScale,
    position: { x: spine.x, y: spine.y },
    scale: { x: spine.scale.x, y: spine.scale.y },
    rotation: spine.rotation
  }
}

/**
 * 清理 Spine 動畫狀態
 */
export function clearSpineStateWithTrack(spine: SPINE.Spine, track: number, logger?: (message: string) => void): void {
  const log = logger || console.log
  
  try {
    spine.state.clearTrack(track)
    spine.skeleton.setToSetupPose()
    log('🧹 Spine 動畫狀態已清理')
  } catch (error) {
    log(`❌ 清理 Spine 動畫狀態失敗: ${error}`)
  }
}

/**
 * 清理全部 Spine 動畫狀態
 */
export function clearSpineState(spine: SPINE.Spine, logger?: (message: string) => void): void {
  const log = logger || console.log
  
  try {
    spine.state.clearTracks()
    spine.skeleton.setToSetupPose()
    log('🧹 Spine 動畫狀態已清理')
  } catch (error) {
    log(`❌ 清理 Spine 動畫狀態失敗: ${error}`)
  }
}