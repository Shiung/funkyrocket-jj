/**
 * 骨骼追蹤工具
 * 用於追蹤 Spine 動畫中骨骼的移動並同步文字位置
 */

export interface TextOffset {
  /** X 軸偏移（左右，正值向右，負值向左） */
  x?: number
  /** Y 軸偏移（上下，正值向下，負值向上） */
  y?: number
}

export interface BoneTrackingOptions {
  /** 目標文字物件 */
  textObject: any
  /** Spine 物件 */
  spine: any
  /** 文字相對於骨骼的偏移量 */
  textOffset?: TextOffset
  /** 文字相對於骨骼的 Y 軸偏移（向後兼容，建議使用 textOffset） */
  textOffsetY?: number
  /** 是否啟用調試日誌 */
  enableDebugLog?: boolean
  /** 調試日誌輸出頻率 (0-1) */
  debugLogFrequency?: number
}

export interface BoneInfo {
  name: string
  index: number
  x: number
  y: number
  worldX: number
  worldY: number
}

export interface MovingBoneDetectionResult {
  movingBones: BoneInfo[]
  totalBones: number
  detectionDuration: number
}

export class BoneTracker {
  private animationId: number | null = null
  private detectionAnimationId: number | null = null
  private isTracking = false
  private options: Required<BoneTrackingOptions>
  private targetBone: any = null
  private initialBoneX = 0
  private initialBoneY = 0

  constructor(options: BoneTrackingOptions) {
    // 處理向後兼容性：如果只提供了 textOffsetY，轉換為 textOffset
    const textOffset = options.textOffset || {
      x: 0,
      y: options.textOffsetY || 60
    }
    
    this.options = {
      textOffset: {
        x: 0,
        y: 60,
        ...textOffset
      },
      textOffsetY: textOffset.y || 60, // 保持向後兼容
      enableDebugLog: false,
      debugLogFrequency: 0.3,
      ...options
    }
  }

  /**
   * 開始骨骼追蹤
   */
  public startTracking(): boolean {
    if (!this.options.spine?.skeleton?.bones || !this.options.textObject) {
      console.error('❌ Spine 骨骼或文字物件不存在，無法開始骨骼追蹤')
      return false
    }

    // 停止之前的追蹤
    this.stopTracking()

    if (this.options.enableDebugLog) {
      console.log('🦴 開始骨骼追蹤')
    }

    // 尋找主要骨骼
    this.targetBone = this.findMainBone()
    if (!this.targetBone) {
      console.error('❌ 找不到目標骨骼')
      return false
    }

    if (this.options.enableDebugLog) {
      const bones = this.options.spine.skeleton.bones
      console.log(`🎯 選定骨骼: ${this.targetBone.data?.name || '未知'} (索引: ${bones.indexOf(this.targetBone)})`)
    }

    // 記錄初始位置
    this.initialBoneX = this.targetBone.x || 0
    this.initialBoneY = this.targetBone.y || 0

    this.isTracking = true
    this.trackBonePosition()
    return true
  }

  /**
   * 停止骨骼追蹤
   */
  public stopTracking(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.isTracking = false
    
    if (this.options.enableDebugLog) {
      console.log('⏹️ 骨骼追蹤已停止')
    }
  }

  /**
   * 檢查是否正在追蹤
   */
  public isTrackingActive(): boolean {
    return this.isTracking
  }

  /**
   * 檢查所有骨骼位置
   */
  public checkAllBonePositions(): BoneInfo[] {
    if (!this.options.spine?.skeleton?.bones) {
      console.error('❌ Spine 或骨骼不存在')
      return []
    }

    const bones = this.options.spine.skeleton.bones
    const boneInfos: BoneInfo[] = []

    if (this.options.enableDebugLog) {
      console.log('🦴 檢查骨骼位置...')
      console.log(`📊 總骨骼數量: ${bones.length}`)
    }

    bones.forEach((bone: any, index: number) => {
      const boneInfo: BoneInfo = {
        name: bone.data?.name || `bone-${index}`,
        index,
        x: bone.x || 0,
        y: bone.y || 0,
        worldX: bone.worldX || 0,
        worldY: bone.worldY || 0
      }

      boneInfos.push(boneInfo)

      if (this.options.enableDebugLog) {
        console.log(`🦴 [${index}] ${boneInfo.name}: 本地(${boneInfo.x.toFixed(1)}, ${boneInfo.y.toFixed(1)}) | 世界(${boneInfo.worldX.toFixed(1)}, ${boneInfo.worldY.toFixed(1)})`)
      }
    })

    // 尋找主要骨骼
    const mainBone = this.findMainBone()
    if (mainBone && this.options.enableDebugLog) {
      console.log(`🎯 找到主要骨骼: ${mainBone.data?.name}`)
      console.log(`📍 主要骨骼位置: 本地(${mainBone.x}, ${mainBone.y}) | 世界(${mainBone.worldX}, ${mainBone.worldY})`)
    }

    return boneInfos
  }

  /**
   * 檢測移動的骨骼
   */
  public async detectMovingBones(
    detectionDuration: number = 2000,
    onAnimationStart?: () => void
  ): Promise<MovingBoneDetectionResult> {
    return new Promise((resolve) => {
      if (!this.options.spine?.skeleton?.bones) {
        console.error('❌ Spine 或骨骼不存在')
        resolve({ movingBones: [], totalBones: 0, detectionDuration: 0 })
        return
      }

      if (this.options.enableDebugLog) {
        console.log('🔍 開始檢測移動骨骼...')
      }

      const bones = this.options.spine.skeleton.bones
      const initialPositions: { [key: string]: { x: number, y: number, worldX: number, worldY: number } } = {}

      // 記錄所有骨骼的初始位置
      bones.forEach((bone: any, index: number) => {
        const name = bone.data?.name || `bone-${index}`
        initialPositions[name] = {
          x: bone.x || 0,
          y: bone.y || 0,
          worldX: bone.worldX || 0,
          worldY: bone.worldY || 0
        }
      })

      if (this.options.enableDebugLog) {
        console.log('📊 已記錄所有骨骼初始位置')
      }

      // 啟動動畫
      if (onAnimationStart) {
        onAnimationStart()
      }

      // 開始檢測
      const startTime = Date.now()
      const movingBones: Set<string> = new Set()
      const movingBoneInfos: BoneInfo[] = []

      const detectMovement = () => {
        if (!this.options.spine?.skeleton?.bones) return

        const elapsed = Date.now() - startTime

        if (elapsed < detectionDuration) {
          // 檢查每個骨骼的位置變化
          bones.forEach((bone: any, index: number) => {
            const name = bone.data?.name || `bone-${index}`
            const initial = initialPositions[name]

            if (initial) {
              const currentX = bone.x || 0
              const currentY = bone.y || 0
              const currentWorldX = bone.worldX || 0
              const currentWorldY = bone.worldY || 0

              const deltaX = Math.abs(currentX - initial.x)
              const deltaY = Math.abs(currentY - initial.y)
              const deltaWorldX = Math.abs(currentWorldX - initial.worldX)
              const deltaWorldY = Math.abs(currentWorldY - initial.worldY)

              // 如果任何座標有明顯變化（超過 0.1），認為是移動骨骼
              if (deltaX > 0.1 || deltaY > 0.1 || deltaWorldX > 0.1 || deltaWorldY > 0.1) {
                if (!movingBones.has(name)) {
                  movingBones.add(name)
                  const boneInfo: BoneInfo = {
                    name,
                    index,
                    x: currentX,
                    y: currentY,
                    worldX: currentWorldX,
                    worldY: currentWorldY
                  }
                  movingBoneInfos.push(boneInfo)

                  if (this.options.enableDebugLog) {
                    console.log(`🎯 發現移動骨骼: ${name} (索引: ${index})`)
                    console.log(`   本地變化: (${deltaX.toFixed(2)}, ${deltaY.toFixed(2)})`)
                    console.log(`   世界變化: (${deltaWorldX.toFixed(2)}, ${deltaWorldY.toFixed(2)})`)
                  }
                }
              }
            }
          })

          this.detectionAnimationId = requestAnimationFrame(detectMovement)
        } else {
          // 檢測結束
          if (this.options.enableDebugLog) {
            console.log('🏁 骨骼移動檢測完成')
            if (movingBones.size > 0) {
              console.log(`✅ 找到 ${movingBones.size} 個移動骨骼:`)
              Array.from(movingBones).forEach(name => {
                const index = bones.findIndex((bone: any) => (bone.data?.name || `bone-${bones.indexOf(bone)}`) === name)
                console.log(`   - ${name} (索引: ${index})`)
              })
            } else {
              console.log('⚠️ 沒有檢測到移動的骨骼')
              console.log('💡 這可能是純視覺動畫，建議使用手動軌跡或視覺追蹤')
            }
          }

          this.detectionAnimationId = null
          resolve({
            movingBones: movingBoneInfos,
            totalBones: bones.length,
            detectionDuration: elapsed
          })
        }
      }

      // 延遲 100ms 開始檢測，讓動畫有時間啟動
      setTimeout(() => {
        detectMovement()
      }, 100)
    })
  }

  /**
   * 停止移動檢測
   */
  public stopDetection(): void {
    if (this.detectionAnimationId !== null) {
      cancelAnimationFrame(this.detectionAnimationId)
      this.detectionAnimationId = null
      if (this.options.enableDebugLog) {
        console.log('⏹️ 骨骼移動檢測已停止')
      }
    }
  }

  /**
   * 更新選項
   */
  public updateOptions(newOptions: Partial<BoneTrackingOptions>): void {
    // 處理 textOffset 的更新
    if (newOptions.textOffset) {
      this.options.textOffset = {
        ...this.options.textOffset,
        ...newOptions.textOffset
      }
    }
    
    // 處理向後兼容的 textOffsetY
    if (newOptions.textOffsetY !== undefined) {
      this.options.textOffsetY = newOptions.textOffsetY
      this.options.textOffset!.y = newOptions.textOffsetY
    }
    
    this.options = { ...this.options, ...newOptions }
  }

  /**
   * 更新文字偏移量
   */
  public updateTextOffset(offset: TextOffset): void {
    this.options.textOffset = {
      ...this.options.textOffset,
      ...offset
    }
    
    // 同步更新 textOffsetY 以保持向後兼容
    if (offset.y !== undefined) {
      this.options.textOffsetY = offset.y
    }
    
    if (this.options.enableDebugLog) {
      console.log(`📍 文字偏移量已更新: X=${this.options.textOffset?.x || 0}, Y=${this.options.textOffset?.y || 0}`)
    }
  }

  /**
   * 獲取當前文字偏移量
   */
  public getTextOffset(): TextOffset {
    return { ...this.options.textOffset }
  }

  /**
   * 清理資源
   */
  public dispose(): void {
    this.stopTracking()
    this.stopDetection()
    this.targetBone = null
  }

  /**
   * 尋找主要骨骼
   */
  private findMainBone(): any {
    const bones = this.options.spine.skeleton.bones
    
    // 優先選擇特定名稱的骨骼
    const targetBone = bones.find((bone: any) => bone.data?.name === 'me') ||
                       bones.find((bone: any) => bone.data?.name === 'body') ||
                       bones.find((bone: any) => bone.data?.name === 'jump') ||
                       bones[24] // 回退到索引 24

    return targetBone
  }

  /**
   * 追蹤骨骼位置的主循環
   */
  private trackBonePosition(): void {
    if (!this.options.spine?.skeleton?.bones || !this.options.textObject || !this.isTracking) {
      if (this.options.enableDebugLog) {
        console.log('⏹️ 停止追蹤：條件不滿足')
      }
      return
    }

    // 檢查動畫是否還在播放
    const isAnimating = this.options.spine.state?.tracks && 
                       this.options.spine.state.tracks.length > 0 && 
                       this.options.spine.state.tracks[0]

    if (isAnimating) {
      // 獲取骨骼的本地位置
      const boneX = this.targetBone.x || 0
      const boneY = this.targetBone.y || 0

      // 嘗試獲取世界位置，如果不存在則使用本地位置
      const worldX = this.targetBone.worldX !== undefined ? this.targetBone.worldX : boneX
      const worldY = this.targetBone.worldY !== undefined ? this.targetBone.worldY : boneY

      // 轉換為 Canvas 座標
      const canvasX = this.options.spine.x + (worldX * this.options.spine.scale.x)
      const canvasY = this.options.spine.y + (worldY * this.options.spine.scale.y)

      // 應用偏移量並更新文字位置
      const offsetX = this.options.textOffset?.x || 0
      const offsetY = this.options.textOffset?.y || this.options.textOffsetY || 60
      
      this.options.textObject.x = canvasX + offsetX
      this.options.textObject.y = canvasY + offsetY

      // 檢查位置變化
      const deltaX = Math.abs(boneX - this.initialBoneX)
      const deltaY = Math.abs(boneY - this.initialBoneY)

      // 輸出調試信息
      if (this.options.enableDebugLog && Math.random() < this.options.debugLogFrequency) {
        console.log(`🦴 ${this.targetBone.data?.name}: 本地(${boneX.toFixed(1)}, ${boneY.toFixed(1)}) | 世界(${worldX.toFixed(1)}, ${worldY.toFixed(1)}) | Canvas(${canvasX.toFixed(1)}, ${canvasY.toFixed(1)}) | 文字(${this.options.textObject.x.toFixed(1)}, ${this.options.textObject.y.toFixed(1)}) | 變化(${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})`)
      }

      // 繼續追蹤
      this.animationId = requestAnimationFrame(() => this.trackBonePosition())
    } else {
      if (this.options.enableDebugLog) {
        console.log('✅ 動畫結束，停止骨骼追蹤')
      }
      this.stopTracking()
    }
  }
}

/**
 * 創建骨骼追蹤器的工廠函數
 */
export function createBoneTracker(options: BoneTrackingOptions): BoneTracker {
  return new BoneTracker(options)
}
