/**
 * 場景管理相關工具函數
 */

// 音效類型
export interface AudioAssets {
  into: string // 角色進艙門
  button_bet: string // 下注按鈕
  button_normal: string // 其他按鈕
  bgm_open: string // 起飛前背景音樂
  bgm_fly: string // 飛行背景音樂
  countdown_5_sec: string // 倒數5秒
  countdown_10_sec: string // 倒數10秒
  rocket_prelaunch: string // 火箭發射
  user_jump: string // 玩家跳躍
  other_jump: string // 其他人跳躍
  win: string // 獲勝
  rocket_explode: string // 火箭爆炸
  return: string // 重新開始
}

// 場景配置
export interface SceneConfig {
  countdownDuration: number  // 倒數時間（秒）
  audioAssets: AudioAssets
  logger?: (message: string) => void
}

// Web Audio API 音頻管理器
export class AudioManager {
  private audioContext!: AudioContext
  private buffers = new Map<string, AudioBuffer>()
  private activeBGMs = new Map<string, AudioBufferSourceNode>() // 支援多個 BGM 同時播放
  private peddingBGMs = new Set<string>() // 待播放的 BGM
  private gainNode!: GainNode // 主音量控制
  private logger?: (message: string) => void
  private defaultVolume: number = 0.5
  private isContextReady = false

  constructor(assets: AudioAssets, logger?: (message: string) => void) {
    this.logger = logger
    this.initAudioContext()
    this.preloadAudio(assets)
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)
      this.gainNode.gain.value = this.defaultVolume
      this.log('🎵 Web Audio Context 已初始化')
    } catch (error) {
      this.log(`Web Audio Context 初始化失敗: ${error}`)
    }
  }

  private async preloadAudio(assets: AudioAssets): Promise<void> {
    const loadPromises = Object.entries(assets).map(async ([key, path]) => {
      try {
        const response = await fetch(path)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
        this.buffers.set(key, audioBuffer)
        this.log(`🔊 音頻已解碼: ${key}`)
      } catch (error) {
        this.log(`音頻載入失敗 ${key}: ${error}`)
      }
    })

    await Promise.all(loadPromises)
    this.log('✅ 所有音頻載入完成')
  }

  // 因為瀏覽器安全限制，要使用者點擊過才能播放音效
  playAudioOnFirstClick() {

    const unlockAudio = async () => {
      if (this.isContextReady) return

      this.log('🔓 開始解鎖 Web Audio Context...')

      try {
        this.isContextReady = true
        // 播放所有待播放的 BGM
        this.peddingBGMs.forEach(key => this.playBGM(key))
        this.log('✅ Web Audio Context 已解鎖')
      } catch (error) {
        this.log(`Web Audio Context 解鎖失敗: ${error}`)
      }

      // 移除監聽器
      document.body.removeEventListener('click', unlockAudio)
      document.body.removeEventListener('touchstart', unlockAudio)
    }
    
    // 監聽整個頁面的點擊事件
    document.body.addEventListener('click', unlockAudio)
    document.body.addEventListener('touchstart', unlockAudio) // 針對手機
  }

  playBGM(key: string, loop: boolean = true): void {
    // 如果音頻未解鎖，先加入待播放列表
    if (!this.isContextReady) {
      this.peddingBGMs.add(key)
      this.log(`🔒 BGM 待播放: ${key} (等待用戶互動)`)
      return
    }

    // 如果這個 BGM 已經在播放，先停止
    this.stopBGM(key)
    
    const buffer = this.buffers.get(key)
    if (!buffer) return this.log(`BGM 未找到: ${key}`)

    try {
      // 創建新的音頻源
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.loop = loop
      source.connect(this.gainNode)
      source.start()
      
      // 儲存到活躍 BGM 列表
      this.activeBGMs.set(key, source)
      this.log(`🎵 BGM 播放: ${key} (目前播放 ${this.activeBGMs.size} 個 BGM)`)
    } catch (error) {
      this.log(`BGM 播放失敗: ${error}`)
    }
  }

  stopBGM(key: string): void {
    // 音頻未解鎖
    if (!this.isContextReady) {
      this.peddingBGMs.delete(key)
      return
    }

    // 停止特定的 BGM
    const source = this.activeBGMs.get(key)
    if (!source) return

    try {
      source.stop()
    } catch {
      // BufferSource 可能已經停止，忽略錯誤
    }
    this.activeBGMs.delete(key)
    this.log(`🎵 BGM 已停止: ${key}`)
  }

  stopAllBGM(): void {
    // 為觸發音頻解鎖
    if (!this.isContextReady) return this.peddingBGMs.clear()
    // 停止所有 BGM
    this.activeBGMs.forEach((source, bgmKey) => {
      try {
        source.stop()
      } catch {
        // BufferSource 可能已經停止，忽略錯誤
      }
      this.log(`🎵 BGM 已停止: ${bgmKey}`)
    })
    this.activeBGMs.clear()
    this.log('🎵 所有 BGM 已停止')
  }

  playSound(key: string): void {
    if (!this.isContextReady) return this.log(`🔒 音效已忽略: ${key} (音頻未解鎖)`)

    const buffer = this.buffers.get(key)
    if (!buffer) return this.log(`音效未找到: ${key}`)

    try {
      // 創建新的音頻源 - 超快速，支援完美重疊播放
      const source = this.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect(this.gainNode)
      source.start() // 立即播放，零延遲！
      
      this.log(`🔊 音效播放: ${key}`)
    } catch (error) {
      this.log(`音效播放失敗: ${error}`)
    }
  }

  isBGMActive(key: string): boolean {
    return this.activeBGMs.has(key)
  }

  setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume))
    // 儲存預設音量
    this.defaultVolume = normalizedVolume
    
    // 設置主音量節點 - 控制所有音頻
    if (this.gainNode) {
      this.gainNode.gain.value = normalizedVolume
      this.log(`🔊 音量設置: ${Math.round(normalizedVolume * 100)}%`)
    }
  }

  private log(message: string): void {
    this.logger?.(message)
  }

  dispose(): void {
    // 停止所有 BGM
    this.stopAllBGM()
    
    // 清理音頻緩衝區
    this.buffers.clear()
    
    // 關閉 AudioContext
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(error => {
        this.log(`AudioContext 關閉失敗: ${error}`)
      })
    }
    
    this.log('🗑️ Web Audio 管理器已清理')
  }
}

// 倒數計時器
export class CountdownTimer {
  private startTime: number = 0
  private duration: number = 0
  private isRunning: boolean = false
  private animationId: number | null = null
  private onTick?: (remaining: number) => void
  private onComplete?: () => void
  private logger?: (message: string) => void

  constructor(logger?: (message: string) => void) {
    this.logger = logger
  }

  start(duration: number, onTick?: (remaining: number) => void, onComplete?: () => void): void {
    this.duration = duration
    this.onTick = onTick
    this.onComplete = onComplete
    this.startTime = Date.now()
    this.isRunning = true

    this.log(`⏰ 倒數計時開始: ${duration} 秒`)
    this.tick()
  }

  private tick(): void {
    if (!this.isRunning) return

    const elapsed = (Date.now() - this.startTime) / 1000
    const remaining = Math.max(0, this.duration - elapsed)

    this.onTick?.(remaining)

    if (remaining <= 0) {
      this.stop()
      this.onComplete?.()
      this.log('⏰ 倒數計時完成')
    } else {
      this.animationId = requestAnimationFrame(() => this.tick())
    }
  }

  stop(): void {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  isActive(): boolean {
    return this.isRunning
  }

  private log(message: string): void {
    this.logger?.(message)
  }
}
