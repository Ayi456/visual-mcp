// PanelManager 相关类型定义

export interface Panel {
  id: string;
  user_id?: string; 
  osspath: string;
  title?: string; 
  description?: string; 
  is_public: boolean;
  created_at: Date;
  expires_at: Date;
  visit_count: number;
  status: 'active' | 'expired';
}

// 用户管理相关类型定义

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  password_hash: string;
  access_id: string;
  access_key_hash: string;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  quota_daily: number;
  quota_monthly: number;
  quota_used_today: number;
  quota_used_month: number;
  quota_reset_date: Date;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  email_verified: boolean;
  email_verified_at?: Date;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  login_attempts: number;
  locked_until?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  last_api_call_at?: Date;
  profile?: any; // JSON字段
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}



export interface EmailVerificationCode {
  id: number;
  email: string;
  code: string;
  code_hash: string;
  type: 'registration' | 'password_reset' | 'email_change';
  expires_at: Date;
  used_at?: Date;
  attempts: number;
  created_at: Date;
}



// 用户操作相关的参数接口

export interface CreateUserArgs {
  username: string;
  email: string;
  phone?: string;
  password: string;
  display_name?: string;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
}

export interface LoginUserArgs {
  phone: string;
  password: string;
  ip_address: string;
  user_agent?: string;
  device_fingerprint?: string;
}

export interface UpdateUserArgs {
  id: string;
  username?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  quota_daily?: number;
  quota_monthly?: number;
  profile?: any;
}

export interface VerifyEmailArgs {
  email: string;
  code: string;
  type: 'registration' | 'password_reset' | 'email_change';
}

export interface ResetPasswordArgs {
  email: string;
  code: string;
  new_password: string;
}



// 用户查询结果接口

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  phone?: string;
  access_id: string;
  plan: string;
  quota_daily: number;
  quota_monthly: number;
  quota_used_today: number;
  quota_used_month: number;
  status: string;
  email_verified: boolean;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: Date;
  last_login_at?: Date;
}

export interface UserQuotaInfo {
  quota_daily: number;
  quota_monthly: number;
  quota_used_today: number;
  quota_used_month: number;
  quota_remaining_today: number;
  quota_remaining_month: number;
  quota_reset_date: Date;
}

export interface PanelConfig {
  id: string;
  osspath: string;
  ttl: number; // 生存时间（秒）
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface HttpServerConfig {
  port: number;
  baseUrl: string;
}

export interface CleanupConfig {
  enabled: boolean;
  intervalHours: number;
  retentionDays: number;
  batchSize: number;
}

export interface PanelManagerOptions {
  defaultTtl?: number; 
  maxTtl?: number; 
  idLength?: number;
}

export interface AddPanelResult {
  id: string;
  url: string;
  osspath: string;
  title?: string;
  description?: string;
  is_public: boolean;
  expires_at: Date;
  ttl: number;
}

export interface PanelInfo {
  id: string;
  user_id?: string;
  osspath: string;
  title?: string;
  description?: string;
  is_public: boolean;
  created_at: Date;
  expires_at: Date;
  visit_count: number;
  status: 'active' | 'expired';
  is_cached: boolean;
}

export interface AddPanelArgs {
  osspath: string;
  ttl?: number;
  user_id?: string; 
  title?: string; 
  description?: string; 
  is_public?: boolean;
}

export interface GetPanelArgs {
  id: string;
}

export interface GetPanelInfoArgs {
  id: string;
}

export interface GetUserPanelsArgs {
  user_id: string;
  page?: number;
  limit?: number;
  status?: 'active' | 'expired' | 'all';
  is_public?: boolean;
}

export interface UserPanelsResult {
  panels: PanelInfo[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// 错误类型已移除，使用标准 Error 类
