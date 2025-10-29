/**
 * SQL模块统一类型定义
 * 将所有类型集中导出，便于维护
 */

// 重新导出所有类型
export * from './sql-api.types';
export * from './chat.types';
export * from './database.types';

// 额外的通用类型定义
export type ConnectionStatus = 'idle' | 'testing' | 'connected' | 'disconnected';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

// 状态管理相关类型
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retryCount?: number;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
  lastFetch?: Date;
}

// 事件类型
export interface SqlExecuteEvent {
  sql: string;
  connectionId: string;
  database?: string;
  timestamp: Date;
}

export interface ConnectionChangeEvent {
  previousConnection?: string;
  currentConnection: string;
  timestamp: Date;
}

// 用户偏好设置
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  editorTheme?: string;
  fontSize?: number;
  autoComplete?: boolean;
  autoSave?: boolean;
  maxHistorySize?: number;
}

// 查询历史记录
export interface QueryHistory {
  id: string;
  sql: string;
  connectionId: string;
  database?: string;
  executedAt: Date;
  executionTime?: number;
  rowCount?: number;
  success: boolean;
  error?: string;
}