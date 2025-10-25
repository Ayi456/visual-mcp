/**
 * 数据库相关类型定义
 */

export type DatabaseType = 'mysql' | 'postgresql' | 'sqlite' | 'mssql';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: DatabaseType;
  config: DatabaseConfig;
  status: ConnectionStatus;
  metadata?: DatabaseMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database?: string; // 可选，连接后可查看所有数据库。PostgreSQL 建议填写或使用默认值
  username: string;
  password?: string; // 加密存储
  ssl?: boolean;
  sslConfig?: SSLConfig;
  connectionTimeout?: number;
  queryTimeout?: number;
}

export interface SSLConfig {
  rejectUnauthorized?: boolean;
  ca?: string;
  cert?: string;
  key?: string;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface DatabaseMetadata {
  version: string;
  schemas: SchemaInfo[];
  charset?: string;
  collation?: string;
  size?: string;
}

export interface SchemaInfo {
  name: string;
  tables: TableInfo[];
  views?: ViewInfo[];
  procedures?: ProcedureInfo[];
  functions?: FunctionInfo[];
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  indexes?: IndexInfo[];
  constraints?: ConstraintInfo[];
  rowCount?: number;
  size?: string;
  comment?: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  defaultValue?: any;
  comment?: string;
  length?: number;
  precision?: number;
  scale?: number;
}

export interface IndexInfo {
  name: string;
  columns: string[];
  unique: boolean;
  type?: string;
}

export interface ConstraintInfo {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  columns: string[];
  referencedTable?: string;
  referencedColumns?: string[];
}

export interface ViewInfo {
  name: string;
  columns: ColumnInfo[];
  definition?: string;
}

export interface ProcedureInfo {
  name: string;
  parameters?: ParameterInfo[];
  definition?: string;
}

export interface FunctionInfo {
  name: string;
  parameters?: ParameterInfo[];
  returnType: string;
  definition?: string;
}

export interface ParameterInfo {
  name: string;
  type: string;
  mode: 'IN' | 'OUT' | 'INOUT';
  defaultValue?: any;
}