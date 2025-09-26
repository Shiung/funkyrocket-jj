// api/apiClient.ts
import { HttpClient } from './codegen/http-client'
import { emitter } from '@/core/mitt'

interface SecurityDataType {
  token?: string
}

const isDevelopMode = import.meta.env.DEV
console.log('isDevelopMode', isDevelopMode)

// 初始化全局的 HttpClient 实例
export const apiClient = new HttpClient<SecurityDataType>({
  baseURL: isDevelopMode ? 'https://gate.ljbdev.site/fk/' : '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  secure: true,
  withCredentials: true,
  securityWorker: securityData => {
    if (securityData && securityData.token) {
      return {
        headers: {
          Authorization: securityData.token,
        },
      }
    }
  },
})

// 全局错误处理 request 攔截器
apiClient.instance.interceptors.request.use(
  response => {
    // console.log('response ===>', response)
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

// 全局错误处理 response 攔截器
apiClient.instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401 && !error.config._retry) {
      // TODO 權限異常
      emitter.emit('unAuthorized', true)
    }
    console.log('攔截器 error', error)
    return Promise.reject(error)
  }
)

export const setHeaderToken = (token: string | null) => {
  apiClient.setSecurityData(token ? { token } : null)
}

if (typeof localStorage !== 'undefined') {
  const cacheToken = localStorage.getItem('token')

  if (cacheToken) {
    setHeaderToken(cacheToken)
  }
}
