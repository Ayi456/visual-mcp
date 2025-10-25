import express from 'express';
import cors from 'cors';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { PanelManager } from './PanelManager.js';
import { HttpServerConfig } from './types.js';
import { UserManager } from './UserManager.js';
import { initSmsService } from './SmsService.js';
import { SqlAiService } from './services/SqlAiService.js';
import { User } from './types.js';

// Middleware
import { configureCors } from './middleware/cors.js';
import { configureBodyParser } from './middleware/bodyParser.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

// Routes
import { setupAllRoutes } from './routes/index.js';

/**
 * HTTP 服务器类
 * 负责 HTTP 服务器的初始化、配置和生命周期管理
 */
export class HttpRedirectServer {
  private app: express.Application;
  private server: any;
  private panelManager: PanelManager;
  private userManager: UserManager;
  private config: HttpServerConfig;
  private mcpServer: Server | null = null;
  private mcpTransports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
  private sessionUserMap: Map<string, User> = new Map();
  private sqlAiService: SqlAiService;

  constructor(panelManager: PanelManager, config: HttpServerConfig, mcpServer?: Server | null) {
    this.panelManager = panelManager;
    this.userManager = new UserManager();
    this.config = config;
    this.app = express();
    this.sqlAiService = new SqlAiService();
    this.mcpServer = mcpServer || null;  // 接收可选的 MCP Server

    // 初始化短信服务（如果配置可用）
    if (process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY) {
      try {
        initSmsService();
        console.log('短信服务初始化成功');
      } catch (error) {
        console.error('短信服务初始化失败:', error);
      }
    }

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 设置 MCP 服务器实例
   */
  setMcpServer(mcpServer: Server): void {
    this.mcpServer = mcpServer;
  }

  /**
   * 根据会话ID获取认证用户信息
   */
  getSessionUser(sessionId: string): User | undefined {
    return this.sessionUserMap.get(sessionId);
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // CORS 配置
    const corsOptions = configureCors();
    this.app.use(cors(corsOptions));

    // Body 解析中间件
    configureBodyParser(this.app);

    // 反向代理信任
    this.app.set('trust proxy', 1);
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 注册所有路由
    setupAllRoutes(this.app, {
      panelManager: this.panelManager,
      userManager: this.userManager,
      sqlAiService: this.sqlAiService,
      mcpServer: this.mcpServer,
      mcpTransports: this.mcpTransports,
      sessionUserMap: this.sessionUserMap
    });

    // 404 处理
    this.app.use(notFoundHandler);

    // 全局错误处理
    this.app.use(globalErrorHandler);
  }

  /**
   * 启动HTTP服务器
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, '0.0.0.0', () => {
          console.log(`HTTP重定向服务器已启动: ${this.config.baseUrl}:${this.config.port}`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            reject(new Error(`端口 ${this.config.port} 已被占用`));
          } else {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 停止HTTP服务器
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('HTTP重定向服务器已停止');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 获取Express应用实例（用于测试）
   */
  getApp(): express.Application {
    return this.app;
  }
}
