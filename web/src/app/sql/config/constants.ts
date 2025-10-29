/**
 * SQL模块的常量和配置
 */

// 面板尺寸配置
export const PANEL_CONFIG = {
  DEFAULT_TOP_HEIGHT: 60,
  MIN_TOP_HEIGHT: 30,
  MAX_TOP_HEIGHT: 80,
  STORAGE_KEY: 'sql-console-panel-height',
} as const;

// SQL编辑器配置
export const EDITOR_CONFIG = {
  DEFAULT_HEIGHT: '200px',
  MIN_HEIGHT: '100px',
  MAX_HEIGHT: '400px',
  THEME: 'vs-dark',
} as const;

// 聊天配置
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 5000,
  DEFAULT_OUTPUT_FORMAT: 'table',
  MAX_ROWS: 100,
  AUTO_SCROLL_DELAY: 100,
} as const;

// API配置
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '',
  TIMEOUT: 30000, // 30秒
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  CONNECTIONS: 'sql-connections',
  PANEL_HEIGHT: 'sql-console-panel-height',
  USER_PREFERENCES: 'sql-user-preferences',
  RECENT_QUERIES: 'sql-recent-queries',
} as const;

// 样式类名（用于动态样式）
export const STYLE_CLASSES = {
  CONNECTION: {
    IDLE: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
    CONNECTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    TESTING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    DISCONNECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  MESSAGE: {
    USER: 'bg-blue-500 text-white ml-auto shadow-md',
    ASSISTANT: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-auto shadow',
    SYSTEM: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    ERROR: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  },
} as const;

// 消息状态
export const MESSAGE_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// 默认错误消息
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: '数据库连接失败',
  NO_CONNECTION: '请先选择数据库连接',
  QUERY_FAILED: '查询执行失败',
  NETWORK_ERROR: '网络请求失败',
  AUTH_REQUIRED: '请先登录',
  INVALID_CREDENTIALS: '认证凭据无效',
} as const;