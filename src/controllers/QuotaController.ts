import express from 'express';
import { UserManager } from '../UserManager.js';

export class QuotaController {
  constructor(private userManager: UserManager) {}
  getStats = async (req: express.Request, res: express.Response) => {
    try {
      const stats = await this.userManager.getQuotaUsageStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('获取配额统计错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取配额统计失败'
      });
    }
  };

  /**
   * 手动重置日配额（管理员功能）
   */
  resetDaily = async (req: express.Request, res: express.Response) => {
    try {
      const result = await this.userManager.resetDailyQuota();

      res.json({
        success: true,
        data: result,
        message: `日配额重置完成，影响用户数: ${result.affectedUsers}`
      });
    } catch (error: any) {
      console.error('重置日配额错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '重置日配额失败'
      });
    }
  };

  /**
   * 手动重置月配额（管理员功能）
   */
  resetMonthly = async (req: express.Request, res: express.Response) => {
    try {
      const result = await this.userManager.resetMonthlyQuota();

      res.json({
        success: true,
        data: result,
        message: `月配额重置完成，影响用户数: ${result.affectedUsers}`
      });
    } catch (error: any) {
      console.error('重置月配额错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '重置月配额失败'
      });
    }
  };
}
