export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  code?: string
  timestamp?: string
}

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiErrorResponse {
  success: false
  message: string
  error?: string
  code?: string
  details?: any
  timestamp: string
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}


export interface ApiRequestConfig {
  method: HttpMethod
  url: string
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
}

/**
 * API 客户端配置接口
 */
export interface ApiClientConfig {
  baseURL: string
  timeout: number
  defaultHeaders: Record<string, string>
  retryAttempts: number
  retryDelay: number
}

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor<T = any> = (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>

/**
 * 错误拦截器类型
 */
export type ErrorInterceptor = (error: any) => any | Promise<any>

/**
 * 上传进度回调类型
 */
export type UploadProgressCallback = (progress: {
  loaded: number
  total: number
  percentage: number
}) => void

/**
 * 文件上传请求接口
 */
export interface FileUploadRequest {
  file: File
  filename?: string
  onProgress?: UploadProgressCallback
}

/**
 * 文件上传响应接口
 */
export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
  uploadedAt: string
}

/**
 * 批量操作请求接口
 */
export interface BatchRequest<T = any> {
  operations: Array<{
    method: HttpMethod
    url: string
    data?: T
  }>
}

/**
 * 批量操作响应接口
 */
export interface BatchResponse<T = any> {
  results: Array<{
    success: boolean
    data?: T
    error?: string
  }>
}

/**
 * WebSocket 消息接口
 */
export interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp: string
  id?: string
}

/**
 * 实时数据订阅接口
 */
export interface RealtimeSubscription {
  channel: string
  event: string
  callback: (data: any) => void
}

export enum ApiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
