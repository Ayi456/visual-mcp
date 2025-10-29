import mysql from 'mysql2/promise';
import { Connection, ExecutionResult, Schema, Column } from '../../types/sql.types.js';
import { Connector } from './index.js';

export const createMySQLConnector = (connection: Connection): Connector => {
  let pool: mysql.Pool | null = null;

  const getPool = () => {
    if (!pool) {
      const poolConfig: any = {
        host: connection.host,
        port: connection.port,
        user: connection.username,
        password: connection.password,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        ssl: connection.ssl === true ? { rejectUnauthorized: false } : 
             connection.ssl || undefined
      };

      // MySQL 支持不指定数据库，连接后可动态切换
      if (connection.database) {
        poolConfig.database = connection.database;
      }

      pool = mysql.createPool(poolConfig);
    }
    return pool;
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      const conn = await getPool().getConnection();
      await conn.ping();
      conn.release();
      return true;
    } catch (error) {
      console.error('MySQL connection test failed:', error);
      return false;
    }
  };

  const execute = async (databaseName: string, statement: string): Promise<ExecutionResult> => {
    const conn = await getPool().getConnection();
    try {
      if (databaseName) {
        await conn.query(`USE \`${databaseName}\``);
      }

      const [result, fields] = await conn.execute(statement);

      // 处理查询结果
      if (Array.isArray(result)) {
        return {
          rows: result,
          fields: fields
        };
      }

      // 处理更新/插入/删除结果
      const resultHeader = result as mysql.ResultSetHeader;
      return {
        affectedRows: resultHeader.affectedRows,
        changedRows: resultHeader.changedRows,
        insertId: resultHeader.insertId,
        message: `Query OK, ${resultHeader.affectedRows} row(s) affected`
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to execute query');
    } finally {
      conn.release();
    }
  };

  const getDatabases = async (): Promise<string[]> => {
    const result = await execute('', 'SHOW DATABASES');
    if (result.rows) {
      return result.rows.map((row: any) => Object.values(row)[0] as string);
    }
    return [];
  };

  const getTableSchema = async (databaseName: string): Promise<Schema[]> => {
    const schemas: Schema[] = [];
    
    // 获取所有表
    const tablesResult = await execute(databaseName, 'SHOW TABLES');
    if (!tablesResult.rows) return schemas;

    const tableNames = tablesResult.rows.map((row: any) => Object.values(row)[0] as string);

    // 获取每个表的详细信息
    for (const tableName of tableNames) {
      const columnsResult = await execute(
        databaseName, 
        `SHOW COLUMNS FROM \`${tableName}\``
      );

      const columns: Column[] = [];
      if (columnsResult.rows) {
        for (const row of columnsResult.rows as any[]) {
          columns.push({
            name: row.Field,
            type: row.Type,
            nullable: row.Null === 'YES',
            default: row.Default,
            isPrimaryKey: row.Key === 'PRI',
            isAutoIncrement: row.Extra?.includes('auto_increment'),
            comment: row.Comment
          });
        }
      }

      schemas.push({
        name: tableName,
        type: 'table',
        columns
      });
    }

    // 获取所有视图
    try {
      const viewsResult = await execute(
        databaseName,
        `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS 
         WHERE TABLE_SCHEMA = '${databaseName}'`
      );
      
      if (viewsResult.rows) {
        for (const row of viewsResult.rows as any[]) {
          schemas.push({
            name: row.TABLE_NAME,
            type: 'view'
          });
        }
      }
    } catch (error) {
      // 忽略视图查询错误
      console.error('Failed to get views:', error);
    }

    return schemas;
  };

  return {
    testConnection,
    execute,
    getDatabases,
    getTableSchema
  };
};