import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { UserManager } from '../core/UserManager.js';
import { SqlAiService } from '../services/SqlAiService.js';
import { PanelManager } from '../core/PanelManager.js';
import { newConnector } from '../lib/connectors/index.js';
import { Connection } from '../types/sql.types.js';
import { isReadOnlySql } from '../utils/sqlUtils.js';
import { generateUnifiedChartFromSqlResult } from '../utils/unifiedChartGenerator.js';
import { generateEChartsHtml } from '../utils/htmlGenerator.js';
import { uploadToOSS } from '../utils/ossClient.js';
import { getMysqlPool } from '../config/database.js';
import { ResultSetHeader } from 'mysql2';

export class SqlController {
  constructor(
    private userManager: UserManager,
    private sqlAiService: SqlAiService,
    private panelManager: PanelManager
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

  /**
   * 从SQL查询结果生成图表并创建Panel
   * POST /api/sql/generate-chart
   */
  generateChart = async (req: express.Request, res: express.Response) => {
    try {
      const user = req.authenticatedUser;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      const {
        sql,
        queryResult,
        chartConfig,
        dashboardId
      } = req.body;

      // 验证必填参数
      if (!queryResult || !queryResult.columns || !queryResult.rows) {
        return res.status(400).json({
          success: false,
          message: '缺少查询结果数据'
        });
      }

      if (!chartConfig || !chartConfig.type || !chartConfig.title) {
        return res.status(400).json({
          success: false,
          message: '缺少图表配置（类型和标题必填）'
        });
      }

      // 检查用户配额（使用users表中的配额字段）
      const pool = getMysqlPool();
      const [userRows] = await pool.execute<any[]>(
        `SELECT quota_daily, quota_monthly, quota_used_today, quota_used_month FROM users WHERE id = ?`,
        [user.id]
      );

      if (!userRows || userRows.length === 0) {
        return res.status(403).json({
          success: false,
          message: '未找到用户信息'
        });
      }

      const userQuota = userRows[0];
      const remainingDaily = userQuota.quota_daily - userQuota.quota_used_today;
      const remainingMonthly = userQuota.quota_monthly - userQuota.quota_used_month;

      if (remainingDaily <= 0) {
        return res.status(403).json({
          success: false,
          message: '今日配额已用完，无法生成图表',
          quota: {
            daily: {
              total: userQuota.quota_daily,
              used: userQuota.quota_used_today,
              remaining: 0
            },
            monthly: {
              total: userQuota.quota_monthly,
              used: userQuota.quota_used_month,
              remaining: remainingMonthly
            }
          }
        });
      }

      if (remainingMonthly <= 0) {
        return res.status(403).json({
          success: false,
          message: '本月配额已用完，无法生成图表',
          quota: {
            daily: {
              total: userQuota.quota_daily,
              used: userQuota.quota_used_today,
              remaining: remainingDaily
            },
            monthly: {
              total: userQuota.quota_monthly,
              used: userQuota.quota_used_month,
              remaining: 0
            }
          }
        });
      }

      // 1. 生成 ECharts 配置（统一图表生成器）
      const echartsConfig = generateUnifiedChartFromSqlResult(
        queryResult,
        chartConfig.type,
        chartConfig.title,
        {
          xAxis: chartConfig.xAxis,
          yAxis: chartConfig.yAxis
        }
      );

      // 2. 生成单图表HTML（使用 ECharts）
      const chartHtml = generateEChartsHtml({
        title: chartConfig.title,
        type: chartConfig.type,
        echartsConfig,
        sqlQuery: sql
      });

      // 3. 上传到OSS
      const chartId = uuidv4();
      const fileName = `chart-${chartId}-${Date.now()}.html`;
      const ossUrl = await uploadToOSS(fileName, Buffer.from(chartHtml, 'utf-8'));

      // 4. 创建Panel记录
      const panelResult = await this.panelManager.addPanel(ossUrl, {
        user_id: user.id,
        title: chartConfig.title,
        description: `从SQL查询生成: ${sql.substring(0, 100)}...`,
        is_public: false
      });

      const panelUrl = panelResult.url;
      const panelId = panelResult.id;

      // 5. 扣除配额（更新users表）
      await pool.execute(
        `UPDATE users SET quota_used_today = quota_used_today + 1, quota_used_month = quota_used_month + 1 WHERE id = ?`,
        [user.id]
      );

      // 6. 如果指定了dashboardId，自动添加到Dashboard
      let addedToDashboard = false;
      if (dashboardId) {
        try {
          // 检查Dashboard是否存在
          const [dashboardRows] = await pool.execute<any[]>(
            `SELECT id FROM dashboards WHERE id = ? AND deleted_at IS NULL`,
            [dashboardId]
          );

          if (dashboardRows && dashboardRows.length > 0) {
            // 添加图表到Dashboard
            await pool.execute(
              `INSERT INTO dashboard_charts
               (id, dashboard_id, chart_title, chart_type, chart_config, data_source, position, panel_id, panel_url, created_from)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                chartId,
                dashboardId,
                chartConfig.title,
                chartConfig.type,
                JSON.stringify(echartsConfig),
                JSON.stringify({
                  type: 'sql-query',
                  query: sql,
                  columns: queryResult.columns,
                  rowCount: queryResult.rows.length
                }),
                JSON.stringify({ x: 0, y: 9999, w: 6, h: 4 }),
                panelId,
                panelUrl,
                'sql-query'
              ]
            );

            addedToDashboard = true;
          }
        } catch (error) {
          console.error('添加到Dashboard失败:', error);
        }
      }

      res.json({
        success: true,
        data: {
          chartId,
          panelId,
          panelUrl,
          ossUrl,
          addedToDashboard,
          dashboardId: addedToDashboard ? dashboardId : null,
          message: `图表生成成功！今日剩余配额：${remainingDaily - 1}次，本月剩余：${remainingMonthly - 1}次`,
          quota: {
            daily: {
              total: userQuota.quota_daily,
              used: userQuota.quota_used_today + 1,
              remaining: remainingDaily - 1
            },
            monthly: {
              total: userQuota.quota_monthly,
              used: userQuota.quota_used_month + 1,
              remaining: remainingMonthly - 1
            }
          }
        }
      });
    } catch (error) {
      console.error('生成图表失败:', error);
      res.status(500).json({
        success: false,
        message: '生成图表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };
}
