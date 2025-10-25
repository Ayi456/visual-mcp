import express from 'express';
import { SqlController } from '../controllers/SqlController.js';
import { VisualizationController } from '../controllers/VisualizationController.js';
import { createSqlAuthMiddleware } from '../middleware/authentication.js';
import { UserManager } from '../UserManager.js';

export function setupSqlRoutes(
  app: express.Application,
  sqlController: SqlController,
  visualizationController: VisualizationController,
  userManager: UserManager
) {
  // 应用认证中间件到所有 SQL API
  const sqlAuthMiddleware = createSqlAuthMiddleware(userManager);
  app.use(/^\/api\/sql\/.*/, sqlAuthMiddleware);

  app.post('/api/sql/connection/test', sqlController.testConnection);

  app.post('/api/sql/execute', sqlController.execute);

  app.post('/api/sql/databases', sqlController.getDatabases);

  app.post('/api/sql/schema', sqlController.getSchema);

  app.post('/api/sql/chat', sqlController.chat);

  app.post('/api/sql/visualize', visualizationController.visualize);
}
