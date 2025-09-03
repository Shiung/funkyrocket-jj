/**
 * PixiJS 工具函數集合
 */

// 渲染器相關
export * from './renderer'

// 應用程式相關
export * from './application'

// 資源管理相關
export * from './assets'

// Spine 動畫相關
export * from './spine'

// 特效相關
export * from './effects'

// 日誌相關
export * from './logger'

// 文字管理相關
export * from './text'
export * from './textFollower'

// 骨骼追蹤相關
export * from './boneTracker'

// 場景管理相關
export * from './scene'

// 重新導出常用類型
export type { 
  RendererInfo, 
  RendererDetails 
} from './renderer'

export type { 
  AppConfig, 
  CreateAppResult 
} from './application'

export type { 
  SpineAssets, 
  LoadedAssets 
} from './assets'

export type { 
  SpineConfig, 
  CreateSpineResult, 
  SpineTransform 
} from './spine'

export type { 
  FloatConfig, 
  ShakeConfig, 
  EffectState 
} from './effects'

export type { 
  TextConfig, 
  TextTransform, 
  CreateTextResult 
} from './text'

export type { 
  BoneInfo, 
  MovingBoneDetectionResult, 
  BoneTrackingOptions, 
  BoneTracker,
  TextOffset 
} from './boneTracker'