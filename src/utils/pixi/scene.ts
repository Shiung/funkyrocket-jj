/**
 * 場景管理相關工具函數
 */

// 場景狀態枚舉
export enum SceneState {
  IDLE = 'idle',           // 待機狀態
  READY = 'ready',         // 準備狀態（可以上車）
  COUNTDOWN = 'countdown', // 倒數階段
  FLYING = 'flying',       // 飛行中
  EXPLODED = 'exploded'    // 爆炸結束
}

// 角色類型
export enum CharacterType {
  PLAYER = 'player',       // 玩家角色
  PREMIUM = 'premium',     // 高級角色
  NPC = 'npc'             // NPC
}

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

// 音頻管理器
export class AudioManager {
  private audioCache = new Map<string, HTMLAudioElement>()
  private activeBGMs = new Map<string, HTMLAudioElement>() // 支援多個 BGM 同時播放
  private logger?: (message: string) => void
  private defaultVolume: number = 0.5

  constructor(assets: AudioAssets, logger?: (message: string) => void) {
    this.logger = logger
    this.preloadAudio(assets)
  }

  private preloadAudio(assets: AudioAssets): void {
    Object.entries(assets).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.preload = 'auto'
      audio.setAttribute('muted', '')
      audio.setAttribute('autoplay', '')
      audio.setAttribute('playsinline', '')
      // 先靜音播放一次，避免瀏覽器安全政策限制
      audio.volume = 0
      audio.muted = true
      // audio.play().then(() => { audio.pause() }).catch(e => this.log(`音頻播放失敗: ${e}`))

      this.audioCache.set(key, audio)
      this.log(`音頻已預載入: ${key}`)
    })
  }

  // 因為瀏覽器安全限制，要使用者點擊過才能播放音效，那就第一次點擊就全部播一次
  playAudioOnFirstClick() {
    let hasInteracted = false

    const checkPlayAudio = () => {
      if (hasInteracted) return

      const playPromiseList = Array.from(this.audioCache.values()).map(audio => audio.play())

      if (playPromiseList.every(playPromise => playPromise)) {
        playPromiseList.forEach(playPromise => {
          playPromise.then(() => {
            console.log('Audio unlocked and is now playing.')
            hasInteracted = true
            // 成功播放後，移除監聽器，避免重複觸發
            document.body.removeEventListener('click', checkPlayAudio)
            document.body.removeEventListener('touchstart', checkPlayAudio)
        }).catch(e => {
            console.warn(`BGM 播放失敗: ${e}`)
          })
        })
      }
    }
    
    // 監聽整個頁面的點擊事件
    document.body.addEventListener('click', checkPlayAudio)
    document.body.addEventListener('touchstart', checkPlayAudio) // 針對手機
  }

  playBGM(key: string, loop: boolean = true): void {
    // 如果這個 BGM 已經在播放，先停止
    this.stopBGM(key)
    
    const audio = this.audioCache.get(key)
    if (audio) {
      // 創建新的音頻實例以支援同時播放多個 BGM
      // const bgmInstance = audio.cloneNode() as HTMLAudioElement
      const bgmInstance = audio
      bgmInstance.loop = loop
      bgmInstance.currentTime = 0
      // 確保新實例使用當前音量設定
      bgmInstance.volume = this.defaultVolume
      bgmInstance.muted = false
      // 播放
      bgmInstance.play().catch(e => this.log(`BGM 播放失敗: ${e}`))
      
      // 儲存到活躍 BGM 列表
      this.activeBGMs.set(key, bgmInstance)
      this.log(`🎵 BGM 播放: ${key} (目前播放 ${this.activeBGMs.size} 個 BGM)`)
    }
  }

  stopBGM(key?: string): void {
    if (key) {
      // 停止特定的 BGM
      const bgm = this.activeBGMs.get(key)
      if (bgm) {
        bgm.pause()
        bgm.currentTime = 0
        this.activeBGMs.delete(key)
        this.log(`🎵 BGM 已停止: ${key}`)
      }
    } else {
      // 停止所有 BGM
      this.activeBGMs.forEach((bgm, bgmKey) => {
        bgm.pause()
        bgm.currentTime = 0
        this.log(`🎵 BGM 已停止: ${bgmKey}`)
      })
      this.activeBGMs.clear()
      this.log('🎵 所有 BGM 已停止')
    }
  }

  playSound(key: string): void {
    const audio = this.audioCache.get(key)
    if (audio) {
      // 創建新的實例以支援重疊播放
      const soundInstance = audio.cloneNode() as HTMLAudioElement
      // const soundInstance = audio
      soundInstance.currentTime = 0
      // 確保新實例使用當前音量設定
      soundInstance.volume = this.defaultVolume
      soundInstance.muted = false
      // 播放
      soundInstance.play().catch(e => this.log(`音效播放失敗: ${e}`))
      this.log(`🔊 音效播放: ${key}`)
    }
  }

  setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume))
    // 儲存預設音量
    this.defaultVolume = normalizedVolume
    
    // 設置預載入音頻的音量
    // this.audioCache.forEach(audio => {
    //   audio.volume = normalizedVolume
    // })
    
    // 設置正在播放的 BGM 音量
    this.activeBGMs.forEach(bgm => {
      bgm.volume = normalizedVolume
    })
  }

  private log(message: string): void {
    this.logger?.(message)
  }

  dispose(): void {
    // 停止所有 BGM
    this.stopBGM()
    
    // 清理預載入音頻
    this.audioCache.forEach(audio => {
      audio.pause()
      audio.src = ''
    })
    this.audioCache.clear()
    
    this.log('🗑️ 音頻管理器已清理')
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
