/**
 * Dashboard路由配置
 */

import express from 'express';
import { DashboardController } from '../controllers/DashboardController.js';
import { UserManager } from '../core/UserManager.js';
import { PanelManager } from '../core/PanelManager.js';
import { createSqlAuthMiddleware } from '../middleware/authentication.js';

export function setupDashboardRoutes(
  app: express.Application,
  dashboardController: DashboardController,
  userManager: UserManager
) {
  const router = express.Router();

  // Dashboard CRUD路由
  router.post('/', dashboardController.createDashboard);
  router.get('/', dashboardController.getDashboardList);
  router.get('/:id', dashboardController.getDashboard);
  router.put('/:id', dashboardController.updateDashboard);
  router.delete('/:id', dashboardController.deleteDashboard);

  // Dashboard发布路由
  router.post('/:id/publish', dashboardController.publishDashboard);

  // Dashboard分享统计路由
  router.get('/:id/stats', dashboardController.getDashboardStats);
  router.post('/:id/record-view', dashboardController.recordDashboardView);

  // 注册路由到app
  app.use('/api/dashboard', router);

  console.log('Dashboard routes registered');
}
