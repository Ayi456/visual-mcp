/**
 * 用户信息接口
 */
export interface User {
  id: string
  username: string
  email: string
  access_id: string
  display_name?: string
  plan?: string
  created_at?: string
  email_verified?: boolean
}


export interface AuthState {
  user?: User
  accessKey?: string
  hydrated: boolean
  setAuth: (user: User, accessKey?: string) => void
  loadFromStorage: () => void
  logout: () => void
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  identifier?: string  // 手机号或邮箱
  phone?: string       
  password: string
  ip_address?: string
  user_agent?: string
}

export interface LoginResponseData {
  user: User
  accessKey?: string
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string
  email: string
  password: string
  display_name?: string
}

/**
 * 注册响应数据
 */
export interface RegisterResponseData {
  user: User
  accessKey?: string
}

/**
 * 认证令牌信息
 */
export interface AuthToken {
  accessKey: string
  expiresAt?: string
  refreshToken?: string
}


export enum UserPermission {
  READ = 'READ',
  WRITE = 'WRITE',
  ADMIN = 'ADMIN'
}

/**
 * 用户计划类型
 */
export enum UserPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}

export interface AuthContextType {
  user: User | null
  accessKey: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
  refreshAuth: () => Promise<void>
}
