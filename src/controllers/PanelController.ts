import express from 'express';
import { PanelManager } from '../PanelManager.js';
import { generateSignedUrl } from '../OssUploader.js';

export class PanelController {
  constructor(private panelManager: PanelManager) {}

  /**
   * 获取用户的 Panels 列表
   */
  getUserPanels = async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '10', status = 'all', is_public } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '用户ID不能为空'
        });
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          message: '分页参数无效'
        });
      }

      const panelsResult = await this.panelManager.getUserPanels({
        user_id: userId,
        page: pageNum,
        limit: limitNum,
        status: status as 'active' | 'expired' | 'all',
        is_public: is_public ? is_public === 'true' : undefined
      });

      res.json({
        success: true,
        data: panelsResult
      });
    } catch (error: any) {
      console.error('获取用户Panels错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取Panels失败'
      });
    }
  };

  /**
   * 更新 Panel 信息
   */
  updatePanel = async (req: express.Request, res: express.Response) => {
    try {
      const { panelId } = req.params;
      const { title, description, is_public, user_id } = req.body;

      if (!panelId) {
        return res.status(400).json({
          success: false,
          message: 'Panel ID不能为空'
        });
      }

      // 验证权限
      const panelInfo = await this.panelManager.getPanelInfo(panelId);
      if (!panelInfo) {
        return res.status(404).json({
          success: false,
          message: 'Panel不存在'
        });
      }

      if (panelInfo.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: '无权限修改此Panel'
        });
      }

      await this.panelManager.updatePanelInfo(panelId, {
        title,
        description,
        is_public: is_public !== undefined ? Boolean(is_public) : undefined
      });

      res.json({
        success: true,
        message: 'Panel信息更新成功'
      });
    } catch (error: any) {
      console.error('更新Panel信息错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '更新Panel信息失败'
      });
    }
  };

  /**
   * 获取Panel的签名访问URL
   */
  getPanelUrl = async (req: express.Request, res: express.Response) => {
    try {
      const { panelId } = req.params;
      const { expires = '86400' } = req.query;

      if (!panelId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '缺少Panel ID'
        });
      }

      const panelInfo = await this.panelManager.getPanelInfo(panelId);

      if (!panelInfo || !panelInfo.osspath) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Panel不存在或文件路径无效'
        });
      }

      const expiresSeconds = parseInt(expires as string, 10);
      if (isNaN(expiresSeconds) || expiresSeconds <= 0 || expiresSeconds > 24 * 60 * 60) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '过期时间必须在 1 秒到 24 小时之间'
        });
      }

      let objectKey = panelInfo.osspath;
      if (objectKey.startsWith('http')) {
        try {
          const url = new URL(objectKey);
          objectKey = url.pathname.substring(1);
        } catch (error) {
          console.error('解析OSS URL失败:', error);
          return res.status(500).json({
            error: 'Internal Server Error',
            message: '文件路径格式错误'
          });
        }
      }

      const signedUrl = await generateSignedUrl(objectKey, expiresSeconds);

      res.json({
        success: true,
        data: {
          url: signedUrl,
          panelId: panelId,
          expiresIn: expiresSeconds,
          expiresAt: new Date(Date.now() + expiresSeconds * 1000).toISOString()
        }
      });
    } catch (error) {
      console.error('生成签名URL错误:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: '生成访问链接失败'
      });
    }
  };

  /**
   * 获取Panel信息
   */
  getPanelInfo = async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '缺少Panel ID'
        });
      }

      const panelInfo = await this.panelManager.getPanelInfo(id);

      if (!panelInfo) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Panel不存在'
        });
      }

      res.json({
        success: true,
        data: panelInfo
      });
    } catch (error: any) {
      console.error('获取Panel信息错误:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: '服务器内部错误'
      });
    }
  };
}
