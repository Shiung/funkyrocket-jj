/**
 * PixiJS 渲染器相關工具函數
 */
import { RendererType, VERSION, type Renderer} from 'pixi.js'

export interface RendererInfo {
  hasWebGL: boolean
  hasWebGPU: boolean
  webgpuAdapter: boolean
  preference: 'webgl' | 'webgpu'
}

export interface RendererDetails {
  type: number
  typeName: string
  name: string
  isWebGPU: boolean
  isWebGL: boolean
}

/**
 * 檢查瀏覽器渲染器支援
 */
export async function checkRendererSupport(): Promise<RendererInfo> {
  const hasWebGL = !!window.WebGLRenderingContext
  const hasWebGPU = !!navigator.gpu
  
  let webgpuAdapter = false
  if (hasWebGPU) {
    try {
      const adapter = await navigator.gpu.requestAdapter()
      webgpuAdapter = !!adapter
    } catch (e) {
      console.warn('WebGPU 檢查失敗:', e)
    }
  }
  
  // 優先使用 WebGPU，如果可用且有適配器
  const preference = (hasWebGPU && webgpuAdapter) ? 'webgpu' : 'webgl'
  
  return {
    hasWebGL,
    hasWebGPU,
    webgpuAdapter,
    preference
  }
}

/**
 * 獲取渲染器詳細信息
 */
export function getRendererDetails(renderer: Renderer): RendererDetails {
  const rendererTypes = {
    [RendererType.WEBGL]: 'WebGL', 
    [RendererType.WEBGPU]: 'WebGPU',
  }
  
  const typeName = rendererTypes[renderer.type as keyof typeof rendererTypes] || `未知類型(${renderer.type})`
  
  return {
    type: renderer.type,
    typeName,
    name: renderer.name,
    isWebGPU: renderer.type === RendererType.WEBGPU,
    isWebGL: renderer.type === RendererType.WEBGL
  }
}

/**
 * 記錄渲染器信息
 */
export function logRendererInfo(renderer: Renderer, logger?: (message: string) => void) {
  const details = getRendererDetails(renderer)
  
  logger?.(`PIXI 版本: ${VERSION}`)
  logger?.(`渲染器類型代碼: ${details.type}`)
  logger?.(`渲染器名稱: ${details.name}`)
  logger?.(`渲染器類型: ${details.typeName}`)
  
  // 檢查 PIXI 渲染器類型常量
  logger?.('PIXI 渲染器類型常量:')
  logger?.(`- WEBGL: ${RendererType.WEBGL}`)
  logger?.(`- WEBGPU: ${RendererType.WEBGPU}`)
  
  if (details.isWebGPU) {
    logger?.('🚀 使用最新的 WebGPU 渲染器！')
  } else if (details.isWebGL) {
    logger?.('📊 使用穩定的 WebGL 渲染器')
  } else {
    logger?.(`❓ 使用未知的渲染器類型: ${details.type}`)
  }
}