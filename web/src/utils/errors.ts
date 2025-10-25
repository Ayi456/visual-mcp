export interface ApiError extends Error {
  status?: number
  code?: string
  data?: any
  timestamp?: string
}

/**
 * 认证错误类
 */
export class AuthError extends Error implements ApiError {
  public status?: number
  public code?: string
  public data?: any
  public timestamp: string

  constructor(message: string, status?: number, code?: string, data?: any) {
    super(message)
    this.name = 'AuthError'
    this.status = status
    this.code = code
    this.data = data
    this.timestamp = new Date().toISOString()
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends Error implements ApiError {
  public status?: number
  public code?: string
  public data?: any
  public timestamp: string

  constructor(message: string, status?: number, code?: string, data?: any) {
    super(message)
    this.name = 'NetworkError'
    this.status = status
    this.code = code
    this.data = data
    this.timestamp = new Date().toISOString()
  }
}

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  public field?: string
  public timestamp: string

  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.timestamp = new Date().toISOString()
  }
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  AUTH = 'AUTH',
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  UNKNOWN = 'UNKNOWN'
}

/**
 * 错误严重程度枚举
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * 标准化错误信息
 */
export interface StandardError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  code?: string
  details?: any
  timestamp: string
}

export function standardizeError(error: any): StandardError {
  const timestamp = new Date().toISOString()

  // 处理已知的错误类型
  if (error instanceof AuthError) {
    return {
      type: ErrorType.AUTH,
      severity: ErrorSeverity.HIGH,
      message: error.message,
      code: error.code,
      details: error.data,
      timestamp
    }
  }

  if (error instanceof NetworkError) {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message: error.message,
      code: error.code,
      details: error.data,
      timestamp
    }
  }

  if (error instanceof ValidationError) {
    return {
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.LOW,
      message: error.message,
      details: { field: error.field },
      timestamp
    }
  }

  // 处理 HTTP 错误
  if (error?.status) {
    const severity = error.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
    return {
      type: ErrorType.NETWORK,
      severity,
      message: error.message || `HTTP ${error.status} Error`,
      code: error.status.toString(),
      details: error.data,
      timestamp
    }
  }

  // 默认处理
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: error?.message || 'An unknown error occurred',
    timestamp
  }
}


export function getUserFriendlyMessage(error: any): string {
  const standardError = standardizeError(error)
  const msg = (standardError.message || '').trim()

  // 优先展示服务端返回的明确文案（如：密码错误、用户不存在、验证码相关、手机号校验等）
  const passThroughKeywords = ['密码', '用户不存在', '验证码', '手机号', '邮箱']
  if (msg && passThroughKeywords.some(k => msg.includes(k))) {
    return msg
  }

  switch (standardError.type) {
    case ErrorType.AUTH:
      // 对认证类错误，若有明确消息则展示，否则给出通用提示
      return msg || '认证失败，请重新登录'
    case ErrorType.NETWORK:
      if (standardError.code === '404') return '请求的资源不存在'
      if (standardError.code === '500') return '服务器内部错误，请稍后重试'
      return msg || '网络连接异常，请检查网络设置'
    case ErrorType.VALIDATION:
      return msg || '参数校验失败'
    case ErrorType.STORAGE:
      return '本地存储异常，请清理浏览器缓存'
    default:
      // 默认回退到原始消息（若有），否则通用提示
      return msg || '操作失败，请稍后重试'
  }
}
