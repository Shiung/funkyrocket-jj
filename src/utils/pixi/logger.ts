/**
 * 日誌工具
 */
import { ref, type Ref } from 'vue'

export interface LogEntry {
  timestamp: string
  message: string
  level: 'info' | 'warn' | 'error'
}

export class Logger {
  private logs: Ref<LogEntry[]>
  private maxLogs: number
  
  constructor(maxLogs: number = 50) {
    this.logs = ref<LogEntry[]>([])
    this.maxLogs = maxLogs
  }
  
  /**
   * 記錄信息
   */
  info(message: string, ...args: any[]): void {
    console.log(message, ...args)
    this.addLog(message, 'info')
  }
  
  /**
   * 記錄警告
   */
  warn(message: string, ...args: any[]): void {
    console.warn(message, ...args)
    this.addLog(message, 'warn')
  }
  
  /**
   * 記錄錯誤
   */
  error(message: string, ...args: any[]): void {
    console.error(message, ...args)
    this.addLog(message, 'error')
  }
  
  /**
   * 添加日誌條目
   */
  private addLog(message: string, level: LogEntry['level']): void {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      level
    }
    
    this.logs.value.push(entry)
    
    // 保持日誌數量在限制內
    if (this.logs.value.length > this.maxLogs) {
      this.logs.value = this.logs.value.slice(-Math.floor(this.maxLogs * 0.6))
    }
  }
  
  /**
   * 獲取日誌列表（響應式）
   */
  getLogs(): Ref<LogEntry[]> {
    return this.logs
  }
  
  /**
   * 清理日誌
   */
  clear(): void {
    this.logs.value = []
  }
  
  /**
   * 創建日誌函數（用於傳遞給其他工具函數）
   */
  createLogFunction(): (message: string) => void {
    return (message: string) => this.info(message)
  }
}

/**
 * 創建默認日誌實例
 */
export function createLogger(maxLogs?: number): Logger {
  return new Logger(maxLogs)
}