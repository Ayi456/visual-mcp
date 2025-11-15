import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { PanelManager } from '../core/PanelManager.js';
import { UserManager } from '../core/UserManager.js';
import { HttpRedirectServer } from './HttpServer.js';
import { CleanupScheduler } from '../core/CleanupScheduler.js';
import { QuotaScheduler } from '../core/QuotaScheduler.js';
import { initSmsService } from '../core/SmsService.js';
import {
  initMysqlPool,
  initRedisClient,
  gracefulShutdown
} from '../config/database.js';
import {
  initOSSUploader,
  testOSSConnection,
} from '../core/OssUploader.js';
import { loadConfig, validateConfig, getPublicBaseUrl, AppConfig } from '../config/environment.js';
import { McpToolHandler } from './McpToolHandler.js';

export class Application {
  private config: AppConfig;
  private server: Server;
  private panelManager: PanelManager | null = null;
  private userManager: UserManager | null = null;
  private httpRedirectServer: HttpRedirectServer | null = null;
  private cleanupScheduler: CleanupScheduler | null = null;
  private quotaScheduler: QuotaScheduler | null = null;
  private mcpToolHandler: McpToolHandler | null = null;

  constructor() {
    // 加载配置
    this.config = loadConfig();

    // 创建 MCP 服务器
    this.server = new Server(
      {
        name: 'visualization-chart-server',
        version: '1.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  /**
   * 启动应用
   */
  async start(): Promise<void> {
    try {
      console.error('正在启动 Visualization Chart MCP Server...');

      // 验证配置
      try {
        validateConfig(this.config);
        console.error('配置验证通过');
      } catch (error) {
        console.error('配置验证失败，将使用默认配置:', error);
      }

      await this.initializeServices();

      // 初始化 MCP 工具处理器
      this.mcpToolHandler = new McpToolHandler(
        this.server,
        this.panelManager,
        this.userManager,
        this.config.projectRoot
      );

      console.error('Visualization Chart MCP Server 已启动 (HTTP模式)');

      this.setupGracefulShutdown();

    } catch (error) {
      console.error('服务器启动失败:', error);
      throw error;
    }
  }

  /**
   * 初始化所有服务
   */
  private async initializeServices(): Promise<void> {
    try {
      console.error('开始初始化服务...');

      // 初始化数据库连接
      console.error(`连接 MySQL: ${this.config.database.host}:${this.config.database.port}/${this.config.database.database}`);
      await initMysqlPool(this.config.database);
      console.error('MySQL 连接成功');

      console.error(`连接 Redis: ${this.config.redis.host}:${this.config.redis.port}`);
      await initRedisClient(this.config.redis);
      console.error('Redis 连接成功');

      // 初始化 OSS 上传器
      if (this.config.oss.accessKeyId && this.config.oss.accessKeySecret &&
        this.config.oss.bucket && this.config.oss.endpoint) {
        console.error('初始化阿里云 OSS...');
        console.error(`OSS配置: bucket=${this.config.oss.bucket}, endpoint=${this.config.oss.endpoint}`);
        initOSSUploader(this.config.oss);
        console.error('OSS 上传器初始化成功');

        // 测试 OSS 连接
        console.error('测试 OSS 连接...');
        const testResult = await testOSSConnection();
        if (testResult.success) {
          console.error('✓ ' + testResult.message);
        } else {
          console.error('✗ ' + testResult.message);
          console.error('警告: OSS 连接测试失败，但服务将继续运行。上传可能会失败。');
          console.error('请检查以下配置：');
          console.error('  1. OSS_ENDPOINT 是否正确 (应为: oss-cn-hangzhou.aliyuncs.com 格式)');
          console.error('  2. 网络是否可以访问阿里云OSS服务');
          console.error('  3. AccessKey 和 Secret 是否有效');
          console.error('  4. Bucket 名称是否正确且有访问权限');
        }
      } else {
        console.error('OSS 配置不完整，将使用本地存储模式');
      }

      // 初始化 PanelManager
      console.error('初始化 PanelManager...');
      const publicBaseUrl = getPublicBaseUrl(this.config.http);
      this.panelManager = new PanelManager(publicBaseUrl, {
        defaultTtl: 24 * 60 * 60 * 7, // 7天
        maxTtl: 24 * 60 * 60 * 30, // 30天
        idLength: 16
      });
      console.error(`PanelManager 初始化完成，publicBaseUrl=${publicBaseUrl}`);

      // 初始化 UserManager
      this.userManager = new UserManager();
      console.error('UserManager 初始化完成');

      // 初始化 SmsService
      initSmsService();
      console.error('SmsService 初始化完成');

      // 初始化 QuotaScheduler
      this.quotaScheduler = new QuotaScheduler(this.userManager);
      this.quotaScheduler.start();
      console.error('QuotaScheduler 初始化完成');

      // 启动 HTTP 重定向服务器
      console.error(`启动 HTTP 服务器: ${this.config.http.baseUrl}:${this.config.http.port}`);
      this.httpRedirectServer = new HttpRedirectServer(
        this.panelManager,
        this.config.http,
        this.server
      );
      // 使 McpToolHandler 能通过 server 访问到会话用户映射
      try {
        (this.server as any).httpRedirectServer = this.httpRedirectServer;
      } catch {}
      await this.httpRedirectServer.start();
      console.error('HTTP 服务器启动成功');

      if (this.config.cleanup.enabled) {
        console.error('初始化数据库清理调度器...');
        this.cleanupScheduler = new CleanupScheduler(this.config.cleanup);
        this.cleanupScheduler.start();
        console.error('数据库清理调度器启动成功');
      }

      console.error('所有服务初始化完成！');
    } catch (error) {
      console.error('服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 设置优雅关闭
   */
  private setupGracefulShutdown(): void {
    const shutdown = async () => {
      console.error('正在关闭服务器...');
      try {
        if (this.httpRedirectServer) {
          await this.httpRedirectServer.stop();
        }
        await gracefulShutdown(this.cleanupScheduler);
        console.error('服务器已关闭');
      } catch (error) {
        console.error('关闭服务器时出错:', error);
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
