/**
 * Dashboard控制器
 * 处理Dashboard的CRUD操作、图表管理和分享功能
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getMysqlPool } from '../config/database.js';
import { UserManager } from '../core/UserManager.js';
import { PanelManager } from '../core/PanelManager.js';
import { generateDashboardAggregateHtml } from '../utils/dashboardGenerator.js';
import { uploadToOSS } from '../utils/ossClient.js';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { CacheHelper, CACHE_PREFIXES, CACHE_TTL } from '../utils/cacheHelper.js';

interface Dashboard extends RowDataPacket {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  theme: string;
  layout_config: string;
  is_public: boolean;
  share_token?: string;
  panel_url?: string;
  created_at: Date;
  updated_at: Date;
}

interface DashboardChart extends RowDataPacket {
  id: string;
  dashboard_id: string;
  chart_title: string;
  chart_type: string;
  chart_config: string;
  data_source: string;
  position: string;
  panel_id?: string; // 关联的 Panel ID
  panel_url?: string; // Panel 短链URL（新增）
  created_from?: string; // 图表来源：'sql-query' | 'manual'（新增）
}

export class DashboardController {
  constructor(
    private userManager: UserManager,
    private panelManager: PanelManager
  ) {}

  /**
   * 创建新Dashboard
   * POST /api/dashboard
   */
  createDashboard = async (req: express.Request, res: express.Response) => {
    try {
      const { title, description, theme = 'default', layoutConfig, charts = [], userId } = req.body;

      // 验证必填参数
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Dashboard标题不能为空'
        });
      }

      const dashboardId = uuidv4();
      const shareToken = this.generateShareToken();
      const pool = getMysqlPool();

      // 开始事务
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // 插入Dashboard记录
        await connection.execute(
          `INSERT INTO dashboards
           (id, user_id, title, description, theme, layout_config, share_token)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            dashboardId,
            userId || 'anonymous',
            title,
            description || null,
            theme,
            JSON.stringify(layoutConfig || { gridCols: 12, rowHeight: 80, charts: [] }),
            shareToken
          ]
        );

        // 插入图表记录（如果有）- 批量插入优化
        if (charts && charts.length > 0) {
          // 准备批量插入的数据
          const chartValues: any[] = [];
          const placeholders: string[] = [];

          for (const chart of charts) {
            const chartId = chart.id || uuidv4();
            placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            chartValues.push(
              chartId,
              dashboardId,
              chart.chartTitle || '未命名图表',
              chart.chartType || 'line',
              JSON.stringify(chart.chartConfig || {}),
              JSON.stringify(chart.dataSource || {}),
              JSON.stringify(chart.position || { x: 0, y: 0, w: 6, h: 4 }),
              chart.panelId || null,
              chart.panelUrl || null,
              chart.createdFrom || 'manual'
            );
          }

          // 一次性批量插入所有图表
          await connection.execute(
            `INSERT INTO dashboard_charts
             (id, dashboard_id, chart_title, chart_type, chart_config, data_source, position, panel_id, panel_url, created_from)
             VALUES ${placeholders.join(', ')}`,
            chartValues
          );
        }

        await connection.commit();

        // 清除缓存
        await CacheHelper.del(`${userId || 'anonymous'}`, { prefix: CACHE_PREFIXES.DASHBOARD_LIST });

        res.json({
          success: true,
          data: {
            dashboardId,
            shareToken,
            message: 'Dashboard创建成功'
          }
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('创建Dashboard失败:', error);
      res.status(500).json({
        success: false,
        message: '创建Dashboard失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  /**
   * 获取Dashboard列表
   * GET /api/dashboard
   */
  getDashboardList = async (req: express.Request, res: express.Response) => {
    try {
      const userId = req.query.userId as string || 'anonymous';
      const pool = getMysqlPool();

      // 缓存键
      const cacheKey = `${userId}`;

      // 尝试从缓存获取
      const cachedData = await CacheHelper.get(cacheKey, {
        prefix: CACHE_PREFIXES.DASHBOARD_LIST,
        ttl: CACHE_TTL.MEDIUM
      });

      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true
        });
      }

      // 查询用户的所有Dashboard（包含图表数量）
      const [rows] = await pool.execute<Dashboard[]>(
        `SELECT
          d.id,
          d.title,
          d.description,
          d.theme,
          d.is_public,
          d.panel_url,
          d.created_at,
          d.updated_at,
          COUNT(dc.id) as chart_count
         FROM dashboards d
         LEFT JOIN dashboard_charts dc ON d.id = dc.dashboard_id
         WHERE d.user_id = ? AND d.deleted_at IS NULL
         GROUP BY d.id, d.title, d.description, d.theme, d.is_public,
                  d.panel_url, d.created_at, d.updated_at
         ORDER BY d.updated_at DESC`,
        [userId]
      );

      // 将数据库字段名转换为前端期望的驼峰命名
      const formattedRows = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        theme: row.theme,
        isPublic: row.is_public,
        panelUrl: row.panel_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        chartCount: (row as any).chart_count
      }));

      // 缓存结果
      await CacheHelper.set(cacheKey, formattedRows, {
        prefix: CACHE_PREFIXES.DASHBOARD_LIST,
        ttl: CACHE_TTL.MEDIUM
      });

      res.json({
        success: true,
        data: formattedRows
      });
    } catch (error) {
      console.error('获取Dashboard列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取Dashboard列表失败'
      });
    }
  };

  /**
   * 获取Dashboard详情
   * GET /api/dashboard/:id
   */
  getDashboard = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string || 'anonymous';
      const pool = getMysqlPool();

      // 查询Dashboard基本信息
      const [dashboardRows] = await pool.execute<Dashboard[]>(
        `SELECT * FROM dashboards WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [id, userId]
      );

      if (!dashboardRows || dashboardRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard不存在或无权限访问'
        });
      }

      const dashboard = dashboardRows[0];

      // 查询所有图表
      const [chartRows] = await pool.execute<DashboardChart[]>(
        `SELECT * FROM dashboard_charts WHERE dashboard_id = ? ORDER BY created_at`,
        [id]
      );

      // 安全解析 JSON 字段的辅助函数
      const safeJsonParse = (value: any, defaultValue: any = {}) => {
        if (!value) return defaultValue;
        if (typeof value === 'object') return value;
        try {
          return JSON.parse(value);
        } catch (e) {
          console.warn('JSON 解析失败:', e);
          return defaultValue;
        }
      };

      // 解析JSON字段并转换为前端期望的字段名
      const parsedCharts = chartRows.map(chart => ({
        id: chart.id,
        dashboardId: chart.dashboard_id,
        chartTitle: chart.chart_title,
        chartType: chart.chart_type,
        chartConfig: safeJsonParse(chart.chart_config, {}),
        dataSource: safeJsonParse(chart.data_source, {}),
        position: safeJsonParse(chart.position, { x: 0, y: 0, w: 6, h: 4 }),
        panelId: chart.panel_id || null // 关联的 Panel ID
      }));

      res.json({
        success: true,
        data: {
          ...dashboard,
          layoutConfig: safeJsonParse(dashboard.layout_config, { gridCols: 12, rowHeight: 80, charts: [] }),
          charts: parsedCharts
        }
      });
    } catch (error) {
      console.error('获取Dashboard详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取Dashboard详情失败'
      });
    }
  };

  /**
   * 更新Dashboard
   * PUT /api/dashboard/:id
   */
  updateDashboard = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { title, description, theme, layoutConfig, charts, userId } = req.body;

      // 验证必填字段
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Dashboard标题不能为空'
        });
      }

      const pool = getMysqlPool();
      const connection = await pool.getConnection();

      try {
        // 检查权限
        const [dashboardRows] = await connection.execute<Dashboard[]>(
          `SELECT id FROM dashboards WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
          [id, userId || 'anonymous']
        );

        if (!dashboardRows || dashboardRows.length === 0) {
          connection.release();
          return res.status(404).json({
            success: false,
            message: 'Dashboard不存在或无权限'
          });
        }

        await connection.beginTransaction();

        // 更新Dashboard基本信息
        await connection.execute(
          `UPDATE dashboards
           SET title = ?, description = ?, theme = ?, layout_config = ?
           WHERE id = ?`,
          [
            title,
            description || null,
            theme || 'default',
            JSON.stringify(layoutConfig || { gridCols: 12, rowHeight: 80, charts: [] }),
            id
          ]
        );

        // 删除旧图表
        await connection.execute(
          `DELETE FROM dashboard_charts WHERE dashboard_id = ?`,
          [id]
        );

        // 插入新图表 - 批量插入优化
        if (charts && charts.length > 0) {
          const chartValues: any[] = [];
          const placeholders: string[] = [];

          for (const chart of charts) {
            const chartId = chart.id || uuidv4();
            placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            chartValues.push(
              chartId,
              id,
              chart.chartTitle || '未命名图表',
              chart.chartType || 'line',
              JSON.stringify(chart.chartConfig || {}),
              JSON.stringify(chart.dataSource || {}),
              JSON.stringify(chart.position || { x: 0, y: 0, w: 6, h: 4 }),
              chart.panelId || null,
              chart.panelUrl || null,
              chart.createdFrom || 'manual'
            );
          }

          // 一次性批量插入所有图表
          await connection.execute(
            `INSERT INTO dashboard_charts
             (id, dashboard_id, chart_title, chart_type, chart_config, data_source, position, panel_id, panel_url, created_from)
             VALUES ${placeholders.join(', ')}`,
            chartValues
          );
        }

        await connection.commit();

        // 清除缓存
        await CacheHelper.del(`${userId || 'anonymous'}`, { prefix: CACHE_PREFIXES.DASHBOARD_LIST });
        await CacheHelper.del(id, { prefix: CACHE_PREFIXES.DASHBOARD });

        res.json({
          success: true,
          message: 'Dashboard更新成功'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('更新Dashboard失败:', error);
      res.status(500).json({
        success: false,
        message: '更新Dashboard失败'
      });
    }
  };

  /**
   * 删除Dashboard（软删除）
   * DELETE /api/dashboard/:id
   */
  deleteDashboard = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const userId = req.query.userId as string || 'anonymous';
      const pool = getMysqlPool();

      // 软删除
      const [result] = await pool.execute<ResultSetHeader>(
        `UPDATE dashboards SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [id, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard不存在或无权限'
        });
      }

      // 清除缓存
      await CacheHelper.del(userId, { prefix: CACHE_PREFIXES.DASHBOARD_LIST });
      await CacheHelper.del(id, { prefix: CACHE_PREFIXES.DASHBOARD });

      res.json({
        success: true,
        message: 'Dashboard删除成功'
      });
    } catch (error) {
      console.error('删除Dashboard失败:', error);
      res.status(500).json({
        success: false,
        message: '删除Dashboard失败'
      });
    }
  };

  /**
   * 发布Dashboard（生成聚合页面和分享链接）
   * POST /api/dashboard/:id/publish
   *
   * 新逻辑：
   * 1. 查询Dashboard的所有图表（必须包含panel_url）
   * 2. 生成聚合页面HTML（iframe嵌入各个Panel）
   * 3. 上传聚合页面到OSS（不额外计费，只是组织展示）
   * 4. 创建Panel记录并生成短链
   */
  publishDashboard = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const userId = req.body.userId || 'anonymous';
      const pool = getMysqlPool();

      // 查询Dashboard完整数据
      const [dashboardRows] = await pool.execute<Dashboard[]>(
        `SELECT * FROM dashboards WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
        [id, userId]
      );

      if (!dashboardRows || dashboardRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard不存在'
        });
      }

      const dashboard = dashboardRows[0];

      // 查询所有图表（包含panel_url）
      const [chartRows] = await pool.execute<DashboardChart[]>(
        `SELECT * FROM dashboard_charts WHERE dashboard_id = ?`,
        [id]
      );

      if (!chartRows || chartRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Dashboard中没有图表，无法发布'
        });
      }

      // 检查是否所有图表都有panel_url
      const chartsWithoutPanel = chartRows.filter(c => !c.panel_url);
      if (chartsWithoutPanel.length > 0) {
        return res.status(400).json({
          success: false,
          message: `有${chartsWithoutPanel.length}个图表缺少Panel URL，请先从SQL查询生成图表`,
          details: chartsWithoutPanel.map(c => c.chart_title)
        });
      }

      // 解析配置并生成聚合页面HTML
      const charts = chartRows.map(c => ({
        id: c.id,
        chartTitle: c.chart_title,
        chartType: c.chart_type,
        chartConfig: JSON.parse(c.chart_config),
        dataSource: JSON.parse(c.data_source),
        position: JSON.parse(c.position),
        panelUrl: c.panel_url  // 关键：使用已生成的Panel URL
      }));

      // 使用聚合模式生成HTML
      const html = generateDashboardAggregateHtml({
        title: dashboard.title,
        theme: dashboard.theme,
        layoutConfig: JSON.parse(dashboard.layout_config),
        charts
      });

      // 上传聚合页面到OSS
      const fileName = `dashboard-${id}-${Date.now()}.html`;
      const ossUrl = await uploadToOSS(fileName, Buffer.from(html, 'utf-8'));

      // 生成短链（Dashboard聚合页面本身不额外计费，因为内部Panel已经计费过了）
      // 这里我们复用Panel系统，但可以标记为dashboard类型
      const result = await this.panelManager.addPanel(ossUrl, {
        user_id: userId,
        title: dashboard.title,
        description: dashboard.description || `包含${charts.length}个图表的Dashboard`,
        is_public: true
      });
      const panelUrl = result.url;

      // 更新Dashboard的panel_url
      await pool.execute(
        `UPDATE dashboards SET panel_url = ?, is_public = TRUE WHERE id = ?`,
        [panelUrl, id]
      );

      res.json({
        success: true,
        data: {
          panelUrl,
          shareToken: dashboard.share_token,
          chartCount: charts.length,
          message: `Dashboard发布成功！聚合了${charts.length}个已生成的图表`
        }
      });
    } catch (error) {
      console.error('发布Dashboard失败:', error);
      res.status(500).json({
        success: false,
        message: '发布Dashboard失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  /**
   * 获取Dashboard统计信息
   * GET /api/dashboard/:id/stats
   */
  getDashboardStats = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const pool = getMysqlPool();

      // 查询Dashboard基本信息和访问统计
      const [dashboardRows] = await pool.execute<Dashboard[]>(
        `SELECT id, title, is_public, panel_url, created_at FROM dashboards WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      if (!dashboardRows || dashboardRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard不存在'
        });
      }

      const dashboard = dashboardRows[0];

      // 查询图表数量
      const [chartCountRows] = await pool.execute<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM dashboard_charts WHERE dashboard_id = ?`,
        [id]
      );

      const chartCount = chartCountRows[0]?.count || 0;

      // 这里可以扩展添加访问次数等统计信息
      // 如果有dashboard_views表，可以查询访问记录

      res.json({
        success: true,
        data: {
          dashboardId: dashboard.id,
          title: dashboard.title,
          isPublic: dashboard.is_public,
          panelUrl: dashboard.panel_url,
          chartCount,
          createdAt: dashboard.created_at
        }
      });
    } catch (error) {
      console.error('获取Dashboard统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取Dashboard统计失败'
      });
    }
  };

  /**
   * 记录Dashboard访问
   * POST /api/dashboard/:id/record-view
   */
  recordDashboardView = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { viewerInfo } = req.body; // 可选：访问者信息（IP、设备等）
      const pool = getMysqlPool();

      // 验证Dashboard存在
      const [dashboardRows] = await pool.execute<Dashboard[]>(
        `SELECT id FROM dashboards WHERE id = ? AND deleted_at IS NULL`,
        [id]
      );

      if (!dashboardRows || dashboardRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Dashboard不存在'
        });
      }

      // 如果有dashboard_views表，可以在此插入访问记录
      // 示例：
      // await pool.execute(
      //   `INSERT INTO dashboard_views (dashboard_id, viewer_info, viewed_at) VALUES (?, ?, NOW())`,
      //   [id, JSON.stringify(viewerInfo || {})]
      // );

      res.json({
        success: true,
        message: '访问记录成功'
      });
    } catch (error) {
      console.error('记录Dashboard访问失败:', error);
      res.status(500).json({
        success: false,
        message: '记录Dashboard访问失败'
      });
    }
  };

  /**
   * 生成分享token
   */
  private generateShareToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}
