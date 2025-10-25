import express from 'express';
import { UserManager } from '../UserManager.js';
import { PanelManager } from '../PanelManager.js';
import { createVisualization } from '../utils/visualization.js';

export class VisualizationController {
  constructor(
    private userManager: UserManager,
    private panelManager: PanelManager
  ) {}

  /**
   * SQL 查询结果可视化
   */
  visualize = async (req: express.Request, res: express.Response) => {
    try {
      const user = req.authenticatedUser;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '未授权访问'
        });
      }

      // 检查配额
      const quotaCheck = await this.userManager.checkQuotaAvailable(user.id);
      if (!quotaCheck.available) {
        return res.status(429).json({
          success: false,
          message: '配额不足',
          reason: quotaCheck.reason
        });
      }

      // 接收前端传来的数据
      const {
        data,
        schema,
        chartType,
        title,
        axisLabels,
        style
      } = req.body;

      // 验证必填参数
      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({
          success: false,
          message: '数据不能为空'
        });
      }
      if (!schema || !Array.isArray(schema) || schema.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Schema 不能为空'
        });
      }

      console.log(`用户 ${user.username} 请求可视化: ${data.length} 行数据, 图表类型: ${chartType || 'auto'}`);

      // 调用可视化生成工具
      const visualizationResult = await createVisualization({
        data,
        schema,
        chartType: chartType || 'auto',
        title: title || '查询结果可视化',
        axisLabels,
        style,
        userId: user.id,
        username: user.username,
        panelManager: this.panelManager
      });

      // 扣减配额
      await this.userManager.incrementQuotaUsage(user.id);
      console.log(`用户 ${user.username} 配额扣减成功`);

      // 返回结果
      res.json({
        success: true,
        data: {
          panelUrl: visualizationResult.panelUrl,
          panelId: visualizationResult.panelId,
          chartType: visualizationResult.chartType,
          chartTypeName: visualizationResult.chartTypeName
        },
        message: '可视化图表生成成功'
      });
    } catch (error: any) {
      console.error('可视化生成失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '可视化生成失败'
      });
    }
  };
}
