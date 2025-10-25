// 数据库引擎类型
export enum Engine {
  MySQL = 'MYSQL',
  PostgreSQL = 'POSTGRESQL',
  MSSQL = 'MSSQL',
  SQLite = 'SQLITE',
  TiDB = 'TIDB',
  OceanBase = 'OCEANBASE'
}

// 数据库连接配置
export interface Connection {
  id: string;
  title: string;
  engineType: Engine;
  host: string;
  port: number;
  username: string;
  password?: string;
  database?: string;
  ssl?: boolean | {
    ca?: string;
    cert?: string;
    key?: string;
  };
}

// SQL 执行结果
export interface ExecutionResult {
  message?: string;
  affectedRows?: number;
  changedRows?: number;
  insertId?: number | string;
  fields?: any[];
  rows?: any[];
  error?: string;
}

// 数据库架构信息
export interface Schema {
  name: string;
  type: 'table' | 'view';
  columns?: Column[];
  indexes?: Index[];
}

// 列信息
export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  default?: any;
  comment?: string;
  isPrimaryKey?: boolean;
  isAutoIncrement?: boolean;
}

// 索引信息
export interface Index {
  name: string;
  columns: string[];
  unique: boolean;
  type?: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sql?: string;
  error?: string;
  timestamp: Date;
  status?: 'loading' | 'success' | 'error';
}

// 聊天会话
export interface ChatSession {
  id: string;
  connectionId?: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}