import express from 'express';
import { UserManager } from '../UserManager.js';

export class UserController {
  constructor(private userManager: UserManager) {}
  getQuota = async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const quotaInfo = await this.userManager.getUserQuota(userId);

      if (!quotaInfo) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: quotaInfo
      });
    } catch (error: any) {
      console.error('获取用户配额错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取配额信息失败'
      });
    }
  };

  /**
   * 获取用户设置
   */
  getSettings = async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const settings = await this.userManager.getUserSettings(userId);

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: settings
      });
    } catch (error: any) {
      console.error('获取用户设置错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取用户设置失败'
      });
    }
  };

  /**
   * 更新用户设置
   */
  updateSettings = async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.params;
      const settingsData = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const updatedSettings = await this.userManager.updateUserSettings(userId, settingsData);

      res.json({
        success: true,
        message: '设置更新成功',
        data: updatedSettings
      });
    } catch (error: any) {
      console.error('更新用户设置错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新用户设置失败'
      });
    }
  };
}
