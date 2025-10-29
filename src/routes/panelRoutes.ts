import express from 'express';
import { PanelController } from '../controllers/PanelController.js';
import { PanelManager } from '../PanelManager.js';
import { handlePrivateBucketAccess } from '../utils/ossProxy.js';

/**
 * 设置 Panel 管理路由
 */
export function setupPanelRoutes(
  app: express.Application,
  panelController: PanelController,
  panelManager: PanelManager
) {
  app.get('/api/users/:userId/panels', panelController.getUserPanels);

  app.put('/api/panels/:panelId', panelController.updatePanel);

  app.get('/api/panels/:panelId/url', panelController.getPanelUrl);

  app.get('/panel/:id/info', panelController.getPanelInfo);

  app.get('/panel/:id', async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: '缺少Panel ID'
        });
      }

      const panelInfo = await panelManager.getPanelInfo(id);

      if (!panelInfo || !panelInfo.osspath) {
        return res.status(404).json({
          error: 'Not Found',
          message: '链接不存在或已过期'
        });
      }

      // 检查面板是否已过期
      const now = new Date();
      const expiresAt = new Date(panelInfo.expires_at);

      if (expiresAt <= now || panelInfo.status === 'expired') {
        return res.status(410).send(`
          <!DOCTYPE html>
          <html lang="zh-CN">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>面板已过期</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f5f5f5 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
              }
              .container {
                max-width: 500px;
                width: 100%;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-radius: 24px;
                padding: 3rem 2.5rem;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);
                text-align: center;
              }
              .icon {
                width: 80px;
                height: 80px;
                margin: 0 auto 2rem;
                background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
                border-radius: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 16px rgba(107, 114, 128, 0.2);
              }
              .icon svg {
                width: 40px;
                height: 40px;
                color: white;
              }
              h1 {
                font-size: 1.75rem;
                font-weight: 600;
                color: #111827;
                margin-bottom: 1rem;
                letter-spacing: -0.025em;
              }
              p {
                font-size: 1.0625rem;
                line-height: 1.75;
                color: #6b7280;
                margin-bottom: 2rem;
              }
              .info {
                background: rgba(243, 244, 246, 0.6);
                border-radius: 16px;
                padding: 1.25rem;
                margin-bottom: 2rem;
                text-align: left;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(229, 231, 235, 0.5);
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                font-size: 0.9375rem;
                color: #6b7280;
              }
              .info-value {
                font-size: 0.9375rem;
                font-weight: 500;
                color: #374151;
              }
              .btn {
                display: inline-block;
                padding: 0.875rem 2rem;
                background: #111827;
                color: white;
                text-decoration: none;
                border-radius: 16px;
                font-weight: 500;
                font-size: 1.0625rem;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
              }
              .btn:hover {
                background: #1f2937;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                transform: translateY(-2px);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1>面板已过期</h1>
              <p>此可视化面板的访问链接已过期，无法继续查看内容</p>
              <div class="info">
                <div class="info-row">
                  <span class="info-label">面板ID</span>
                  <span class="info-value">${id}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">过期时间</span>
                  <span class="info-value">${expiresAt.toLocaleString('zh-CN')}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">状态</span>
                  <span class="info-value">已过期</span>
                </div>
              </div>
              <a href="/" class="btn">返回首页</a>
            </div>
          </body>
          </html>
        `);
      }

      const osspath = panelInfo.osspath;

      // 检查是否是 HTML 文件
      if (osspath.includes('.html')) {
        console.log(`处理 HTML 文件: ${osspath}`);
        await handlePrivateBucketAccess(res, osspath);
      } else {
        console.log(`非 HTML 文件，直接重定向: ${osspath}`);
        res.redirect(302, osspath);
      }
    } catch (error) {
      console.error('Panel重定向错误:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: '服务器内部错误'
        });
      }
    }
  });
}
