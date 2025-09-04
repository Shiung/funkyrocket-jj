import type { CreateTextResult } from '@/utils/pixi/text'
import type { BoneTracker } from '@/utils/pixi/boneTracker'
import type { FollowTextResult as TextFollowerResult } from '@/utils/pixi/textFollower'

// 遊戲狀態枚舉
export enum GameState {
  IDLE = 'IDLE',
  BOARDING = 'BOARDING',
  COUNTDOWN = 'COUNTDOWN',
  LAUNCHING = 'LAUNCHING',
  FLYING = 'FLYING',
  DISEMBARKING = 'DISEMBARKING',
  EXPLODING = 'EXPLODING',
  COMPLETED = 'COMPLETED'
}

// 角色類型
export type CharacterType = 'player' | 'streamer' | 'npc'

// 角色數據結構
export interface Character {
  id: string
  type: CharacterType
  spine: any
  position: { x: number; y: number }
  isVisible: boolean
  textResult?: CreateTextResult // 文字物件（可選）
  boneTracker?: BoneTracker // 骨骼追蹤器（可選）
}

// 文字跟隨功能結果
export type FollowTextResult = TextFollowerResult
