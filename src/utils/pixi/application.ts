/**
 * PixiJS 應用程式相關工具函數
 */
import { Application, RendererType } from 'pixi.js'
import { initDevtools } from '@pixi/devtools'
import { checkRendererSupport, logRendererInfo } from './renderer'

export interface AppConfig {
  canvas: HTMLCanvasElement
  width: number
  height: number
  backgroundColor?: number
  backgroundAlpha?: number
  antialias?: boolean
  logger?: (message: string) => void
}

export interface CreateAppResult {
  app: Application
  rendererInfo: {
    type: number
    typeName: string
    name: string
    isWebGPU: boolean
    isWebGL: boolean
  }
}

/**
 * 創建 PixiJS 應用程式
 */
export async function createPixiApp(config: AppConfig): Promise<CreateAppResult> {
  const {
    canvas,
    width,
    height,
    backgroundColor = 0x1a1a1a,
    backgroundAlpha = 1,
    antialias = true,
    logger,
  } = config
  const log = logger || console.log

  log('=== 開始 PixiJS 應用初始化 ===')

  const DPR = Math.min(window.devicePixelRatio || 1, 2)

  // 檢查瀏覽器支援
  const rendererSupport = await checkRendererSupport()
  log(`WebGL 支援: ${rendererSupport.hasWebGL}`)
  log(`WebGPU 支援: ${rendererSupport.hasWebGPU}`)
  log(`WebGPU 適配器: ${rendererSupport.webgpuAdapter ? '可用' : '不可用'}`)

  // 創建應用
  const app = new Application()
  await app.init({
    canvas,
    width, // 邏輯寬
    height, // 邏輯高
    backgroundColor,
    backgroundAlpha,
    antialias, // 要求抗鋸齒
    resolution: DPR,
    preference: rendererSupport.preference,
    powerPreference: 'high-performance',
  })

  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  app.renderer.resize(width, height)

  log('✅ PIXI 應用創建成功')

  // 記錄渲染器信息
  logRendererInfo(app.renderer, logger)

  // 獲取渲染器詳細信息
  const rendererTypes = {
    [RendererType.WEBGL]: 'WebGL',
    [RendererType.WEBGPU]: 'WebGPU',
  } as const

  const rendererInfo = {
    type: app.renderer.type,
    typeName:
      rendererTypes[app.renderer.type as keyof typeof rendererTypes] ||
      `未知類型(${app.renderer.type})`,
    name: app.renderer.name,
    isWebGPU: app.renderer.type === RendererType.WEBGPU,
    isWebGL: app.renderer.type === RendererType.WEBGL,
  }

  // 初始化開發者工具
  if (import.meta.env?.DEV) {
    initDevtools({ app })
  }

  return { app, rendererInfo }
}

/**
 * 安全銷毀 PixiJS 應用
 */
export function destroyPixiApp(
  app: Application | null,
  logger?: (message: string) => void,
): void {
  const log = logger || console.log
  if (!app) return
  try {
    app.destroy()
    log('🗑️ PixiJS 應用已銷毀')
  } catch (error) {
    log(`❌ 銷毀 PixiJS 應用時發生錯誤: ${error}`)
  }
}
