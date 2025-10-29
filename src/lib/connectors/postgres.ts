import { Pool, PoolClient, QueryResult } from 'pg';
import { Connection, ExecutionResult, Schema, Column } from '../../types/sql.types.js';
import { Connector } from './index.js';

// PostgreSQL 系统模式，查询时需要排除
const SYSTEM_SCHEMAS = [
  'information_schema',
  'pg_catalog',
  'pg_toast',
  '_timescaledb_cache',
  '_timescaledb_catalog',
  '_timescaledb_internal',
  '_timescaledb_config',
  'timescaledb_information',
  'timescaledb_experimental'
];

// 系统表，查询时需要排除
const SYSTEM_TABLES = ['_prisma_migrations'];

export const createPostgreSQLConnector = (connection: Connection): Connector => {
  let pool: Pool | null = null;

  const getPool = () => {
    if (!pool) {
      const poolConfig: any = {
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        // PostgreSQL 如果不指定数据库，默认连接到 postgres 数据库
        database: connection.database || 'postgres',
        max: 10, // 最大连接数
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        application_name: 'mcpdemo'
      };

      // 处理 SSL 配置
      if (connection.ssl === true) {
        poolConfig.ssl = { rejectUnauthorized: false };
      } else if (connection.ssl && typeof connection.ssl === 'object') {
        poolConfig.ssl = {
          ca: connection.ssl.ca,
          cert: connection.ssl.cert,
          key: connection.ssl.key,
          rejectUnauthorized: false
        };
      }

      pool = new Pool(poolConfig);

      // 监听错误事件
      pool.on('error', (err) => {
        console.error('PostgreSQL pool error:', err);
      });
    }
    return pool;
  };

  const testConnection = async (): Promise<boolean> => {
    let client: PoolClient | null = null;
    try {
      client = await getPool().connect();
      await client.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('PostgreSQL connection test failed:', error);
      return false;
    } finally {
      if (client) {
        client.release();
      }
    }
  };

  const execute = async (databaseName: string, statement: string): Promise<ExecutionResult> => {
    let client: PoolClient | null = null;
    try {
      client = await getPool().connect();

      // 如果指定了数据库且与当前连接不同，需要重新连接
      if (databaseName && databaseName !== connection.database) {
        // PostgreSQL 不支持 USE database 语句，需要重新创建连接
        // 这里我们使用当前连接的数据库，如果需要切换数据库需要创建新的连接器
        console.warn(`Cannot switch to database ${databaseName} in PostgreSQL, using current database`);
      }

      const result: QueryResult = await client.query(statement);

      // 判断是否为查询语句（返回行数据）
      if (result.rows && result.rows.length > 0) {
        // SELECT 查询
        return {
          rows: result.rows,
          fields: result.fields.map(f => ({
            name: f.name,
            dataTypeID: f.dataTypeID
          }))
        };
      } else if (result.rowCount !== null && result.rowCount !== undefined) {
        // INSERT/UPDATE/DELETE 等修改语句
        return {
          affectedRows: result.rowCount,
          message: `Query OK, ${result.rowCount} row(s) affected`
        };
      } else {
        // 其他语句（如 CREATE TABLE, DROP TABLE 等）
        return {
          message: 'Query executed successfully'
        };
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to execute query');
    } finally {
      if (client) {
        client.release();
      }
    }
  };

  const getDatabases = async (): Promise<string[]> => {
    let client: PoolClient | null = null;
    try {
      client = await getPool().connect();

      // 获取所有非模板数据库（排除系统数据库）
      const result = await client.query(
        `SELECT datname FROM pg_database 
         WHERE datistemplate = false 
         AND datname NOT IN ('postgres')
         ORDER BY datname`
      );

      return result.rows.map((row: any) => row.datname);
    } catch (error: any) {
      console.error('Failed to get databases:', error);
      throw new Error(error.message || 'Failed to get databases');
    } finally {
      if (client) {
        client.release();
      }
    }
  };

  const getTableSchema = async (databaseName: string): Promise<Schema[]> => {
    let client: PoolClient | null = null;
    try {
      client = await getPool().connect();
      const schemas: Schema[] = [];

      // 使用传入的 databaseName，如果为空则使用连接配置的数据库或默认的 postgres
      const targetDatabase = databaseName || connection.database || 'postgres';

      // 获取所有表和视图（排除系统模式和表）
      const systemSchemasStr = SYSTEM_SCHEMAS.map(s => `'${s}'`).join(', ');
      const systemTablesStr = SYSTEM_TABLES.map(t => `'${t}'`).join(', ');

      const tablesResult = await client.query(
        `SELECT 
          table_schema,
          table_name,
          table_type
         FROM information_schema.tables 
         WHERE table_schema NOT IN (${systemSchemasStr})
           AND table_name NOT IN (${systemTablesStr})
           AND table_catalog = $1
           AND (table_type = 'BASE TABLE' OR table_type = 'VIEW')
         ORDER BY table_schema, table_name`,
        [targetDatabase]
      );

      // 按 schema 分组处理表
      for (const tableRow of tablesResult.rows) {
        const schemaName = tableRow.table_schema;
        const tableName = tableRow.table_name;
        const tableType = tableRow.table_type === 'VIEW' ? 'view' : 'table';

        // 获取表的列信息
        const columnsResult = await client.query(
          `SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
           FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = $2
           ORDER BY ordinal_position`,
          [schemaName, tableName]
        );

        // 获取主键信息
        const pkResult = await client.query(
          `SELECT a.attname as column_name
           FROM pg_index i
           JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
           WHERE i.indrelid = $1::regclass
           AND i.indisprimary`,
          [`"${schemaName}"."${tableName}"`]
        );

        const primaryKeys = pkResult.rows.map((row: any) => row.column_name);

        // 构建列信息
        const columns: Column[] = columnsResult.rows.map((row: any) => {
          let typeStr = row.data_type.toUpperCase();
          
          // 添加长度信息
          if (row.character_maximum_length) {
            typeStr += `(${row.character_maximum_length})`;
          } else if (row.numeric_precision && row.numeric_scale) {
            typeStr += `(${row.numeric_precision},${row.numeric_scale})`;
          } else if (row.numeric_precision) {
            typeStr += `(${row.numeric_precision})`;
          }

          return {
            name: row.column_name,
            type: typeStr,
            nullable: row.is_nullable === 'YES',
            default: row.column_default,
            isPrimaryKey: primaryKeys.includes(row.column_name),
            isAutoIncrement: row.column_default?.includes('nextval') || false
          };
        });

        // 添加到结果中（使用完整表名：schema.table）
        const fullTableName = schemaName === 'public' ? tableName : `${schemaName}.${tableName}`;
        schemas.push({
          name: fullTableName,
          type: tableType as 'table' | 'view',
          columns: tableType === 'table' ? columns : undefined
        });
      }

      return schemas;
    } catch (error: any) {
      console.error('Failed to get table schema:', error);
      throw new Error(error.message || 'Failed to get table schema');
    } finally {
      if (client) {
        client.release();
      }
    }
  };

  return {
    testConnection,
    execute,
    getDatabases,
    getTableSchema
  };
};
