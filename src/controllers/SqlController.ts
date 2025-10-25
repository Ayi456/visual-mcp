import express from 'express';
import { UserManager } from '../UserManager.js';
import { SqlAiService } from '../services/SqlAiService.js';
import { newConnector } from '../lib/connectors/index.js';
import { Connection } from '../types/sql.types.js';
import { isReadOnlySql } from '../utils/sqlUtils.js';

export class SqlController {
  constructor(
    private userManager: UserManager,
    private sqlAiService: SqlAiService
  ) {}

  testConnection = async (req: express.Request, res: express.Response) => {
    try {
      const connection = req.body.connection as Connection;
      if (!connection) {
        return res.status(400).json({
          success: false,
          message: '连接配置不能为空'
        });
      }

      // 构造连接器
      let connector: ReturnType<typeof newConnector>;
      try {
        connector = newConnector(connection);
      } catch (err: any) {
        const emsg = String(err?.message || err);
        if (/Unsupported engine type/i.test(emsg)) {
          return res.status(400).json({
            success: false,
            message: '数据库类型缺失或无效，请在连接配置中选择 MySQL 或 PostgreSQL',
            details: {
              expected: 'engineType | type | engine | engine_name ∈ { MYSQL | POSTGRESQL }',
              received: {
                engineType: (connection as any)?.engineType,
                type: (connection as any)?.type,
                engine: (connection as any)?.engine,
                engine_name: (connection as any)?.engine_name
              }
            }
          });
        }
        throw err;
      }

      const isConnected = await connector.testConnection();

      res.json({
        success: isConnected,
        message: isConnected ? '连接成功' : '连接失败'
      });
    } catch (error: any) {
      console.error('SQL 连接测试错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '连接测试失败'
      });
    }
  };

  /**
   * 执行 SQL 查询（仅支持只读查询）
   */
  execute = async (req: express.Request, res: express.Response) => {
    try {
      const { connection, database, statement } = req.body;

      if (!connection || !statement) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数'
        });
      }

      // 只读校验
      if (!isReadOnlySql(String(statement))) {
        return res.status(400).json({
          success: false,
          message: '仅支持查询语句（SELECT/WITH/EXPLAIN SELECT），已拒绝非查询操作'
        });
      }

      const connector = newConnector(connection);
      const result = await connector.execute(database || '', statement);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('SQL 执行错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'SQL 执行失败'
      });
    }
  };

  /**
   * 获取数据库列表
   */
  getDatabases = async (req: express.Request, res: express.Response) => {
    try {
      const { connection } = req.body;

      if (!connection) {
        return res.status(400).json({
          success: false,
          message: '连接配置不能为空'
        });
      }

      const connector = newConnector(connection);
      const databases = await connector.getDatabases();

      res.json({
        success: true,
        data: databases
      });
    } catch (error: any) {
      console.error('获取数据库列表错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取数据库列表失败'
      });
    }
  };

  /**
   * 获取数据库架构
   */
  getSchema = async (req: express.Request, res: express.Response) => {
    try {
      const { connection, database } = req.body;

      if (!connection || !database) {
        return res.status(400).json({
          success: false,
          message: '缺少必要参数'
        });
      }

      const connector = newConnector(connection);
      const schema = await connector.getTableSchema(database);

      res.json({
        success: true,
        data: schema
      });
    } catch (error: any) {
      console.error('获取数据库架构错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取数据库架构失败'
      });
    }
  };

  /**
   * SQL 聊天 - 使用 AI 生成 SQL
   */
  chat = async (req: express.Request, res: express.Response) => {
    try {
      const { message, connection, database, previousQueries } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: '消息不能为空'
        });
      }

      if (!connection) {
        return res.status(400).json({
          success: false,
          message: '请先选择一个数据库连接'
        });
      }

      // 获取数据库架构
      let tableSchema;
      if (database) {
        try {
          const connector = newConnector(connection);
          const schema = await connector.getTableSchema(database);
          tableSchema = schema;
        } catch (error) {
          console.error('获取架构失败，继续生成 SQL:', error);
        }
      }

      // 使用 AI 服务生成 SQL
      const result = await this.sqlAiService.generateSql(message, {
        connection,
        database,
        tableSchema,
        previousQueries
      });

      const response = {
        role: 'assistant',
        content: result.explanation,
        sql: result.sql,
        confidence: result.confidence,
        warnings: result.warnings,
        suggestedDatabase: result.suggestedDatabase
      };

      res.json({
        success: true,
        data: response
      });
    } catch (error: any) {
      console.error('SQL 聊天错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'SQL 聊天失败'
      });
    }
  };
}
