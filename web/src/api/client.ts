import { ApiResponse, ApiErrorResponse } from '@/types/api'
import { NetworkError, AuthError, standardizeError } from '@/utils/errors'
import { getStorageItem } from '@/utils/storage'
import { cleanAccessKey } from '@/utils/cleanAccessKey'

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : ''
let resolvedBase = (import.meta as any).env?.VITE_API_BASE || (runtimeOrigin || 'http://localhost:3000')

if (typeof window !== 'undefined') {
  const isLocalBase = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(resolvedBase))
  const isPageLocal = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
  if (isLocalBase && !isPageLocal && runtimeOrigin) {
    resolvedBase = runtimeOrigin
  }
}

export const API_BASE = resolvedBase

/**
 * 获取认证头部信息
 * @returns 包含认证信息的头部对象
 */
function getAuthHeaders(): Record<string, string> {
  try {
    const accessKey = cleanAccessKey(getStorageItem('accessKey'))
    if (!accessKey) return {}

    // 使用 AccessKey 头，与后端期望的头名称一致
    return { AccessKey: `${accessKey}` }
  } catch (error) {
    console.warn('Failed to get auth headers:', error)
    return {}
  }
}

/**
 * 构建带查询参数的 URL
 * @param path - API 路径
 * @param params - 查询参数对象
 * @returns 完整的 URL 字符串
 */
function buildUrl(path: string, params?: Record<string, any>): string {
  const url = new URL(API_BASE + path)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

/**
 * 处理 API 响应，统一错误处理
 * @param response - Fetch 响应对象
 * @returns 解析后的响应数据
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  let responseData: any

  try {
    responseData = await response.json()
  } catch (error) {
    // 如果响应不是 JSON 格式
    responseData = { success: false, message: 'Invalid response format' }
  }

  if (!response.ok) {
    const errorMessage = responseData?.message || `HTTP ${response.status}: ${response.statusText}`

    // 根据状态码创建不同类型的错误
    if (response.status === 401 || response.status === 403) {
      throw new AuthError(errorMessage, response.status, responseData?.code, responseData)
    } else {
      throw new NetworkError(errorMessage, response.status, responseData?.code, responseData)
    }
  }

  // 确保返回标准的 API 响应格式
  return {
    success: responseData?.success ?? true,
    message: responseData?.message,
    data: responseData?.data ?? responseData,
    timestamp: new Date().toISOString()
  }
}

/**
 * 发送 POST 请求
 * @param path - API 路径
 * @param body - 请求体数据
 * @returns API 响应数据
 */
export async function apiPost<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(API_BASE + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(body || {})
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error('API POST error:', error)
    throw standardizeError(error)
  }
}

/**
 * 发送 GET 请求
 * @param path - API 路径
 * @param params - 查询参数
 * @returns API 响应数据
 */
export async function apiGet<T = any>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    const url = params ? buildUrl(path, params) : API_BASE + path
    const response = await fetch(url, {
      headers: {
        ...getAuthHeaders()
      }
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error('API GET error:', error)
    throw standardizeError(error)
  }
}

/**
 * 发送 PUT 请求
 * @param path - API 路径
 * @param body - 请求体数据
 * @returns API 响应数据
 */
export async function apiPut<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(API_BASE + path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(body || {})
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error('API PUT error:', error)
    throw standardizeError(error)
  }
}

/**
 * 发送 DELETE 请求
 * @param path - API 路径
 * @returns API 响应数据
 */
export async function apiDelete<T = any>(path: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(API_BASE + path, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    })

    return handleResponse<T>(response)
  } catch (error) {
    console.error('API DELETE error:', error)
    throw standardizeError(error)
  }
}
