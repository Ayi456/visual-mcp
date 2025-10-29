/**
 * SQL Chat 相关类型定义
 */

export interface ChatSession {
  id: string;
  userId: string;
  connectionId?: string;
  startTime: Date;
  lastActiveTime: Date;
  messages: ChatMessage[];
  context: ChatContext;
  metadata: SessionMetadata;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sql?: string;
  result?: QueryResult;
  error?: string;
  tokens?: number;
  executed?: boolean;        // 是否已执行
  autoExecuted?: boolean;    // 是否自动执行
  executionResult?: any;     // 执行结果详情
}

export interface ChatContext {
  database?: string;
  tables?: string[];
  lastQuery?: string;
  variables?: Record<string, any>;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  outputFormat?: 'table' | 'json' | 'csv';
  maxRows?: number;
  dialect?: 'mysql' | 'postgresql' | 'sqlite';
  theme?: 'light' | 'dark';
  autoExecuteMode?: 'manual' | 'auto' | 'ask';  // SQL 自动执行模式
}

export interface SessionMetadata {
  tokenCount: number;
  queryCount: number;
  errorCount: number;
  avgResponseTime: number;
  lastError?: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
  affectedRows?: number;
}

export interface ChatRequest {
  sessionId?: string;
  userId: string;
  message: string;
  connectionId?: string;
}

export interface ChatResponse {
  sessionId: string;
  message: ChatMessage;
  result?: QueryResult;
  error?: string;
}

/**
 * 查询历史记录
 */
export interface QueryHistoryRecord {
  id: string;
  sql: string;
  timestamp: Date;
  duration: number;
  rowCount: number;
  status: 'success' | 'error';
  connectionName: string;
  connectionId: string;
  database: string;
  message?: string; // 可选的描述或上下文
  error?: string; // 错误信息
}