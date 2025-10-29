import {
  Connection,
  Engine,
  ExecutionResult,
  Schema
} from '../../types/sql.types.js';
import { createMySQLConnector } from './mysql.js';
import { createPostgreSQLConnector } from './postgres.js';

export interface Connector {
  testConnection: () => Promise<boolean>;
  execute: (databaseName: string, statement: string) => Promise<ExecutionResult>;
  getDatabases: () => Promise<string[]>;
  getTableSchema: (databaseName: string) => Promise<Schema[]>;
}

/**
 * 兼容不同前端/调用方传参格式，规范化 engineType
 * 支持字段: engineType | type | engine | engine_name | engineType (大小写不敏感)
 * 支持取值: MYSQL | POSTGRESQL | POSTGRES | PG (大小写不敏感)
 */
function normalizeEngineType(raw: any): Engine | undefined {
  const candidates = [
    raw?.engineType,
    raw?.type,
    raw?.engine,
    raw?.engine_name,
    raw?.engineType?.toString?.(),
  ];

  for (const c of candidates) {
    if (!c) continue;
    const v = String(c).toUpperCase();
    if (v === 'MYSQL') return Engine.MySQL;
    if (v === 'POSTGRESQL' || v === 'POSTGRES' || v === 'PG') return Engine.PostgreSQL;
  }
  return undefined;
}

export const newConnector = (connection: Connection): Connector => {
  const engine = normalizeEngineType(connection as any);
  if (!engine) {
    throw new Error(
      `Unsupported engine type: ${String((connection as any)?.engineType ?? (connection as any)?.type ?? 'undefined')}\n` +
      `Expected one of: MYSQL, POSTGRESQL (also accepts: postgres, pg)`
    );
  }
  (connection as any).engineType = engine;

  switch (engine) {
    case Engine.MySQL:
      return createMySQLConnector(connection);
    case Engine.PostgreSQL:
      return createPostgreSQLConnector(connection);
    default:
      throw new Error(`Unsupported engine type: ${engine}`);
  }
};