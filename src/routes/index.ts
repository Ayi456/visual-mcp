import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PanelManager } from '../PanelManager.js';
import { UserManager } from '../UserManager.js';
import { SqlAiService } from '../services/SqlAiService.js';
import { User } from '../types.js';

// Controllers
import { AuthController } from '../controllers/AuthController.js';
import { SmsController } from '../controllers/SmsController.js';
import { SqlController } from '../controllers/SqlController.js';
import { PanelController } from '../controllers/PanelController.js';
import { UserController } from '../controllers/UserController.js';
import { QuotaController } from '../controllers/QuotaController.js';
import { VisualizationController } from '../controllers/VisualizationController.js';

// Routes
import { setupHealthRoutes } from './healthRoutes.js';
import { setupAuthRoutes } from './authRoutes.js';
import { setupSmsRoutes } from './smsRoutes.js';
import { setupSqlRoutes } from './sqlRoutes.js';
import { setupPanelRoutes } from './panelRoutes.js';
import { setupUserRoutes } from './userRoutes.js';
import { setupQuotaRoutes } from './quotaRoutes.js';
import { setupMcpRoutes } from './mcpRoutes.js';
import { setupStaticRoutes } from './staticRoutes.js';

/**
 * 路由注册中心
 * 统一管理所有路由的注册
 */
export function setupAllRoutes(
  app: express.Application,
  params: {
    panelManager: PanelManager;
    userManager: UserManager;
    sqlAiService: SqlAiService;
    mcpServer: Server | null;
    mcpTransports: { [sessionId: string]: StreamableHTTPServerTransport };
    sessionUserMap: Map<string, User>;
  }
) {
  const {
    panelManager,
    userManager,
    sqlAiService,
    mcpServer,
    mcpTransports,
    sessionUserMap
  } = params;

  // 初始化控制器
  const authController = new AuthController(userManager);
  const smsController = new SmsController(userManager);
  const sqlController = new SqlController(userManager, sqlAiService);
  const panelController = new PanelController(panelManager);
  const userController = new UserController(userManager);
  const quotaController = new QuotaController(userManager);
  const visualizationController = new VisualizationController(userManager, panelManager);

  // 注册路由
  setupHealthRoutes(app, mcpServer, mcpTransports);
  setupAuthRoutes(app, authController);
  setupSmsRoutes(app, smsController);
  setupSqlRoutes(app, sqlController, visualizationController, userManager);
  setupPanelRoutes(app, panelController, panelManager);
  setupUserRoutes(app, userController);
  setupQuotaRoutes(app, quotaController);

  // MCP 路由需要在最后注册（避免与其他路由冲突）
  // 注意：即使 mcpServer 为 null，也要注册路由，在运行时检查
  setupMcpRoutes(app, mcpServer, mcpTransports, sessionUserMap, userManager);

  // 静态文件路由必须在所有 API 路由之后
  setupStaticRoutes(app);
}
