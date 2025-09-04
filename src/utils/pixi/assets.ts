/**
 * PixiJS 資源管理相關工具函數
 */
import * as PIXI from 'pixi.js'

export interface SpineAssets {
  skelPath: string
  atlasPath: string
  imagePath?: string
}

export interface LoadedAssets {
  skelKey: string
  atlasKey: string
  imageKey?: string
}

/**
 * 生成唯一的資源鍵名
 */
export function generateAssetKey(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * 載入 Spine 動畫資源
 */
export async function loadSpineAssets(
  assets: SpineAssets, 
  logger?: (message: string) => void
): Promise<LoadedAssets> {
  const log = logger || console.log
  
  log('開始載入 Spine 動畫資源...')
  
  // 生成唯一鍵名
  const skelKey = generateAssetKey('skel')
  const atlasKey = generateAssetKey('atlas')
  const imageKey = assets.imagePath ? generateAssetKey('image') : undefined
  
  // 註冊資源
  log('註冊並載入資源到緩存...')
  PIXI.Assets.add({ alias: skelKey, src: assets.skelPath })
  PIXI.Assets.add({ alias: atlasKey, src: assets.atlasPath })
  
  const assetsToLoad = [skelKey, atlasKey]
  
  if (assets.imagePath && imageKey) {
    PIXI.Assets.add({ alias: imageKey, src: assets.imagePath })
    assetsToLoad.push(imageKey)
  }
  
  // 載入資源
  await PIXI.Assets.load(assetsToLoad)
  log('✅ Spine 動畫資源載入完成')
  
  return {
    skelKey,
    atlasKey,
    imageKey
  }
}
