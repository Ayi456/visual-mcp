#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

import dotenv from 'dotenv';

// 导入新创建的模块
import { DataType, ChartType, SchemaField, VisualizationData, ThemeConfig, StyleConfig } from './types/chart.types.js';
import { HTML_SAVE_CONFIG, CHART_TYPE_NAMES } from './constants/chart.constants.js';
import { getThemeConfig, applyThemeToChart } from './config/themes.js';
import { recommendChartType } from './utils/dataTypeDetector.js';
import { generateChartConfig, generateMultiSeriesChartConfig, generateComboChartConfig } from './utils/chartGenerator.js';
import { generateVisualizationHtml, generateFileName, getChartTypeName } from './utils/htmlGenerator.js';

// 导入PanelManager相关模块
import { PanelManager } from './PanelManager.js';
import { UserManager } from './UserManager.js';
import { HttpRedirectServer } from './HttpServer.js';
import {
  initMysqlPool,
  initRedisClient,
  closeAllConnections,
  gracefulShutdown
} from './database.js';
import {
  initOSSUploader,
  getOSSUploader,
  isOSSUploaderInitialized,
  OSSConfig
} from './OssUploader.js';
import {
  DatabaseConfig,
  RedisConfig,
  HttpServerConfig,
  CleanupConfig,
  AddPanelArgs,
  GetPanelInfoArgs
} from './types.js';
import { CleanupScheduler } from './CleanupScheduler.js';
import { QuotaScheduler } from './QuotaScheduler.js';
import { initSmsService } from './SmsService.js';

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// 加载环境变量
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

// 导入日志系统



// 全局实例
let panelManager: PanelManager | null = null;
let userManager: UserManager | null = null;
let httpRedirectServer: HttpRedirectServer | null = null;
let cleanupScheduler: CleanupScheduler | null = null;
let quotaScheduler: QuotaScheduler | null = null;

// HTML保存路径设置（使用导入的常量）
const htmlSaveConfig = {
  ...HTML_SAVE_CONFIG,
  baseDir: PROJECT_ROOT
};

// 类型定义已移至 src/types/chart.types.ts

// 创建MCP服务器
const server = new Server(
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

// 图表生成函数已移至 src/utils/chartGenerator.ts


// HTML生成函数已移至 src/utils/htmlGenerator.ts



// 自动打开浏览器查看HTML文件
function openInBrowser(url: string): void {
  const command = process.platform === 'win32' ? 'start' :
                 process.platform === 'darwin' ? 'open' : 'xdg-open';

  exec(`${command} "${url}"`, (error) => {
    if (error) {
      console.warn(`无法自动打开浏览器: ${error.message}`);
    }
  });
}

// 注册工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_visualization_chart',
        title: '通用数据可视化工具',
        description: '接收结构化数据并生成可视化图表和HTML报告页面，支持智能图表类型推荐',
        inputSchema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              description: '二维数组格式的原始数据。例如：[[1, 10], [2, 30], [3, 20]]'
            },
            schema: {
              type: 'array',
              description: '描述数据每一列的结构和类型。例如：[{"name": "stuNo", "type": "number"}, {"name": "score", "type": "number"}]'
            },
            chartType: {
              type: 'string',
              enum: ['auto', 'line', 'bar', 'pie', 'scatter', 'radar', 'area', 'heatmap', 'bubble'],
              description: '指定图表类型。"auto" 模式下，服务器会根据数据特征智能选择最合适的图表。',
              default: 'auto'
            },
            title: {
              type: 'string',
              description: '图表的标题，例如："学生成绩分布图"'
            },
            axisLabels: {
              type: 'object',
              properties: {
                x: { type: 'string', description: 'X轴的名称/标签' },
                y: { type: 'string', description: 'Y轴的名称/标签' }
              },
              description: '定义坐标轴的名称。'
            },
            style: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['default', 'dark', 'business', 'colorful'],
                  description: '预设主题：default(默认), dark(深色), business(商务), colorful(彩色)'
                },
                customColors: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '自定义颜色数组，如：["#FF6384", "#36A2EB"]'
                },
                animation: { type: 'boolean', description: '是否启用动画效果' },
                responsive: { type: 'boolean', description: '是否响应式布局' },
                showLegend: { type: 'boolean', description: '是否显示图例' },
                showGrid: { type: 'boolean', description: '是否显示网格线' },
                showTooltips: { type: 'boolean', description: '是否显示工具提示' }
              },
              description: '样式和主题配置'
            }
          },
          required: ['data', 'schema'],
          additionalProperties: false
        }
      },
      {
        name: 'add_panel',
        title: 'Panel链接管理器 - 添加链接',
        description: '为OSS路径生成临时访问链接，支持自定义过期时间',
        inputSchema: {
          type: 'object',
          properties: {
            osspath: {
              type: 'string',
              description: 'OSS资源路径，可以是完整的URL或相对路径'
            },
            // ttl: {
            //   type: 'number',
            //   description: '链接生存时间（秒），默认300秒（5分钟），最大86400秒（24小时）',
            //   minimum: 1,
            //   maximum: 86400,
            //   default: 300
            // }
          },
          required: ['osspath'],
          additionalProperties: false
        }
      },
      {
        name: 'get_panel_info',
        title: 'Panel链接管理器 - 查询链接信息',
        description: '查询Panel链接的详细信息，包括创建时间、过期时间、访问次数等',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Panel链接的唯一标识符',
              minLength: 16,
              maxLength: 16
            }
          },
          required: ['id'],
          additionalProperties: false
        }
      }
    ]
  };
});

// 防重复调用的缓存
const callCache = new Map<string, { timestamp: number; result: any }>();
const CACHE_DURATION = 5000;

// 定期清理过期缓存
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of callCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      callCache.delete(key);
    }
  }
}, 10000);

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  const { name, arguments: args } = request.params;

  // 从会话存储中获取认证用户信息
  let authenticatedUser: import('./types.js').User | null = null;

  // 尝试从 extra 参数中获取会话ID
  const sessionId = (extra as any)?.sessionId ||
                   (extra as any)?.transport?.sessionId ||
                   (request as any)?.sessionId;

  if (sessionId && httpRedirectServer) {
    authenticatedUser = httpRedirectServer.getSessionUser(sessionId) || null;
  }


  // 云函数兜底：若 transport 未透传 headers，则尝试从 mcpServer 上的最新快照获取
  try {
    if (!(extra as any)?.transport?.requestHeaders && (server as any)?.__latestHeaders) {
      const snap = (server as any).__latestHeaders;
      (extra as any).transport = (extra as any).transport || {};
      (extra as any).transport.requestHeaders = snap;
    }
    if (!authenticatedUser && (server as any)?.__latestAuthenticatedUser) {
      const u = (server as any).__latestAuthenticatedUser;
      authenticatedUser = u;
    }
  } catch {}

  console.error(`工具调用 [${name}]`, {
    sessionId,
    hasUser: !!authenticatedUser,
    userId: authenticatedUser?.id,
    username: authenticatedUser?.username
  });

  // 如果没有认证用户信息，优先从 transport 透传的用户对象获取（云函数场景）
  if (!authenticatedUser) {
    const transportUser = (extra as any)?.transport?.authenticatedUser;
    if (transportUser) {
      authenticatedUser = transportUser;
      console.error('CallTool 使用 transport.authenticatedUser', { userId: transportUser.id, username: transportUser.username });
    }
  }

  // 仍没有则尝试从请求头直接鉴权
  if (!authenticatedUser) {
    try {
      const headers: any =
        (extra as any)?.transport?.requestHeaders ||
        (extra as any)?.requestHeaders ||
        (extra as any)?.headers ||
        {};
      const accessId = headers['accessid'] || headers['AccessID'];
      const authHeader = headers['accesskey'] || headers['AccessKey'];
      if (accessId && authHeader && userManager) {
        const accessKey = String(authHeader).startsWith('Bearer ')
          ? String(authHeader).slice(7)
          : String(authHeader);
        const user = await userManager.validateUserCredentials(accessId, accessKey);
        if (user) {
          authenticatedUser = user;
          console.error('CallTool 直接头鉴权成功', { userId: user.id, username: user.username });
        }
      }
    } catch (e) {
      console.error('CallTool 直接头鉴权异常:', e);
    }
  }

  // 仍无用户则报错
  if (!authenticatedUser) {
    return {
      content: [
        { type: 'text', text: '错误: 未找到认证用户信息。请确保在配置中包含有效的 AccessID 和 AccessKey。' },
      ],
      isError: true,
    };
  }

  // 检查用户配额（仅对资源消耗型工具）
  if (name === 'create_visualization_chart' || name === 'add_panel') {
    try {
      if (!userManager) {
        throw new Error('UserManager未初始化，请先启动服务器');
      }

      // 检查用户配额是否充足
      const quotaCheck = await userManager.checkQuotaAvailable(authenticatedUser.id);

      if (!quotaCheck.available) {
        return {
          content: [
            {
              type: 'text',
              text: `配额不足: ${quotaCheck.reason}。请升级您的套餐或等待配额重置。`,
            },
          ],
          isError: true,
        };
      }

      console.log(`用户 ${authenticatedUser.username} 调用工具 ${name}，配额检查通过`);
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `错误: 配额检查失败 - ${error}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === 'create_visualization_chart') {
    // 生成调用的唯一标识
    const callId = JSON.stringify({ name, args });
    const callHash = Buffer.from(callId).toString('base64').substring(0, 16);

    console.error(`收到可视化工具调用 [${callHash}]`);
    console.error(`数据行数: ${(args as any)?.data?.length || 0}, 图表类型: ${(args as any)?.chartType || 'auto'}`);

    const { data, schema, chartType = 'auto', title, axisLabels, style } = args as {
      data: any[][];
      schema: SchemaField[];
      chartType?: ChartType;
      title?: string;
      axisLabels?: { x?: string; y?: string };
      style?: StyleConfig;
    };

    try {
      // 验证输入数据
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('数据不能为空');
      }

      if (!Array.isArray(schema) || schema.length === 0) {
        throw new Error('Schema不能为空');
      }

      // 构建可视化数据对象
      const visualizationData: VisualizationData = {
        data,
        schema,
        chartType,
        title,
        axisLabels,
        style
      };

      // 生成HTML内容
      const htmlContent = generateVisualizationHtml(visualizationData);

      // --- 诊断日志开始 ---
      console.error('--- DIAGNOSTIC LOG START ---');
      console.error(`PROJECT_ROOT: ${PROJECT_ROOT}`);
      console.error(`HTML Save Base Directory: ${HTML_SAVE_CONFIG.baseDir}`);

      // 生成文件名（使用时间戳避免冲突）
      const fileName = generateFileName(chartType);
      const filePath = path.join(HTML_SAVE_CONFIG.baseDir, HTML_SAVE_CONFIG.subDir, fileName);

      console.error(`Attempting to write file to path: ${filePath}`);
      // --- 诊断日志结束 ---

      let finalUrl: string;
      let panelUrl: string | null = null;
      let panelId: string | null = null;

      // 获取最终的图表类型（提前计算）
      const finalChartType = chartType === 'auto' ? recommendChartType(schema, data) : chartType;

      // 尝试上传到 OSS 并生成 Panel 短链接
      if (isOSSUploaderInitialized() && panelManager) {
        try {
          // 上传到 OSS
          const ossUploader = getOSSUploader();
          const uploadResult = await ossUploader.uploadHTML(htmlContent, fileName);
          console.error(`OSS 上传成功: ${uploadResult.url}`);

          // 生成 Panel 短链接，关联到认证用户
          const panelResult = await panelManager.addPanel(uploadResult.url, {
            user_id: authenticatedUser.id,
            title: title || '数据可视化图表',
            description: `由 ${authenticatedUser.username} 创建的${getChartTypeName(finalChartType)}`,
            is_public: false  // 默认为私有
          });
          console.error(`Panel 短链接生成成功: ${panelResult.url} (id=${panelResult.id})`);

          finalUrl = panelResult.url;
          panelUrl = panelResult.url;
          panelId = panelResult.id;

          console.error('HTML 已上传到 OSS 并生成 Panel 短链接');

        } catch (error) {
          console.error('OSS 上传或 Panel 生成失败，回退到本地文件模式:', error);

          // 回退到本地文件模式
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(filePath, htmlContent, 'utf8');
          console.log(`HTML 文件已保存到: ${filePath}`);

          finalUrl = `file://${filePath}`;
          openInBrowser(finalUrl);
        }
      } else {
        console.error('OSS 或 PanelManager 未初始化，使用本地文件模式');

        // 本地文件模式
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, htmlContent, 'utf8');
        console.log(`HTML 文件已保存到: ${filePath}`);

        finalUrl = `file://${filePath}`;
        openInBrowser(finalUrl);
      }



      const result = {
        visualizationData: {
          dataRows: data.length,
          schemaFields: schema.length,
          chartType: finalChartType,
          title: title || '数据可视化图表',
          createdBy: authenticatedUser.username
        },
        chartTypeName: getChartTypeName(finalChartType),
        previewUrl: finalUrl,
        summary: `已生成${getChartTypeName(finalChartType)}，包含${data.length}行数据，${schema.length}个字段`,
        message: panelUrl
          ? `数据可视化Dashboard已生成（${getChartTypeName(finalChartType)}）。访问链接: ${panelUrl}`
          : `数据可视化Dashboard已生成（${getChartTypeName(finalChartType)}）并自动打开浏览器查看。Dashboard地址: ${finalUrl}`,
        instructions: "点击上方链接即可查看Dashboard报告。"
      };

      // 构建响应内容
      let responseText = `✅ ${result.summary}\n\n📊 图表类型: ${result.chartTypeName}\n📈 数据: ${result.visualizationData.dataRows}行 × ${result.visualizationData.schemaFields}列\n🎯 标题: ${result.visualizationData.title}`;

      // 添加可点击的链接
      if (panelUrl) {
        responseText += `\n\n**点击查看可视化图表**: ${panelUrl}\nPANEL_ID: ${panelId}\nPANEL_URL: ${panelUrl}\n\n💡 提示: 点击上方链接即可在浏览器中查看交互式图表`;
      } else if (finalUrl.startsWith('file://')) {
        responseText += `\n\n🔗 本地文件路径: ${finalUrl.replace('file://', '')}\n\n💡 提示: 文件已自动在浏览器中打开`;
      }

      const response = {
        content: [
          {
            type: 'text',
            text: responseText,
          },
        ],
      };


      console.error(`可视化工具执行完成 [${callHash}]`);

      // 扣减用户配额（工具调用成功后）
      try {
        if (userManager) {
          await userManager.incrementQuotaUsage(authenticatedUser.id);
          console.log(`用户 ${authenticatedUser.username} 配额扣减成功`);
        }
      } catch (error) {
        console.error('配额扣减失败:', error);
        // 不影响主流程，只记录错误
      }

      return response;
    } catch (error) {
      // --- 错误日志开始 ---
      console.error('--- ERROR IN create_visualization_chart ---');
      console.error(error);
      console.error('--- END ERROR INFO ---');
      // --- 错误日志结束 ---
      return {
        content: [
          {
            type: 'text',
            text: `错误: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === 'add_panel') {
    const { osspath, ttl = 24*60*60*7, title, description, is_public } = args as unknown as AddPanelArgs;

    try {
      if (!panelManager) {
        throw new Error('PanelManager未初始化，请先启动服务器');
      }

      // 添加Panel，使用认证用户信息
      const result = await panelManager.addPanel(osspath, {
        user_id: authenticatedUser.id,  // 使用认证用户的ID
        title,
        description,
        is_public,
        ttl
      });

      // 扣减用户配额（工具调用成功后）
      try {
        if (userManager) {
          await userManager.incrementQuotaUsage(authenticatedUser.id);
          console.log(`用户 ${authenticatedUser.username} 配额扣减成功`);
        }
      } catch (error) {
        console.error('配额扣减失败:', error);
        // 不影响主流程，只记录错误
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: result,
              message: `Panel链接已生成，有效期${ttl}秒`,
              instructions: `访问链接: ${result.url}`
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `错误: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }


  if (name === 'get_panel_info') {
    const { id } = args as unknown as GetPanelInfoArgs;

    try {
      // 确保PanelManager已初始化
      if (!panelManager) {
        throw new Error('PanelManager未初始化，请先启动服务器');
      }

      // 获取Panel信息
      const panelInfo = await panelManager.getPanelInfo(id);

      if (!panelInfo) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                message: 'Panel不存在或已被删除'
              }, null, 2),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: panelInfo,
              message: 'Panel信息查询成功'
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `错误: ${error}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`未知工具: ${name}`);
});

// 初始化PanelManager和相关服务
async function initializePanelManager(): Promise<void> {
  console.error('开始初始化 PanelManager 服务...');

  try {
    // 从环境变量读取配置
    const databaseConfig: DatabaseConfig = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'mcp'
    };

    const redisConfig: RedisConfig = {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined
    };

    const httpConfig: HttpServerConfig = {
      port: parseInt(process.env.PORT || process.env.HTTP_PORT || '3000'),
      baseUrl: process.env.BASE_URL || 'http://localhost'
    };

    const cleanupConfig: CleanupConfig = {
      enabled: process.env.DB_CLEANUP_ENABLED !== 'false',
      intervalHours: parseInt(process.env.DB_CLEANUP_INTERVAL_HOURS || '24'),
      retentionDays: parseInt(process.env.DB_DATA_RETENTION_DAYS || '2'),
      batchSize: parseInt(process.env.DB_CLEANUP_BATCH_SIZE || '1000')
    };

    const ossConfig: OSSConfig = {
      accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
      bucket: process.env.OSS_BUCKET || '',
      endpoint: process.env.OSS_ENDPOINT || ''
    };

    console.error(`连接 MySQL: ${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`);

    // 初始化数据库连接
    await initMysqlPool(databaseConfig);
    console.error('MySQL 连接成功');

    console.error(`连接 Redis: ${redisConfig.host}:${redisConfig.port}`);
    await initRedisClient(redisConfig);
    console.error('Redis 连接成功');

    // 数据表已存在，跳过创建
    console.error('数据库连接完成');

    // 初始化 OSS 上传器
    if (ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket && ossConfig.endpoint) {
      console.error('初始化阿里云 OSS...');
      initOSSUploader(ossConfig);
      console.error('OSS 上传器初始化成功');
    } else {
      console.error('OSS 配置不完整，将使用本地存储模式');
    }

    // 初始化PanelManager
    console.error('初始化 PanelManager...');

    // 在云函数环境下，公网入口通常是 443/https，由网关转发到容器内部端口（如 9000），
    // 因此生成对外链接时不要附加内部端口，直接使用 BASE_URL。
    const isCloudFunction = !!(
      process.env.SERVERLESS ||
      process.env.SCF_RUNTIME_API ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.TENCENTCLOUD_RUNENV ||
      process.env.SCF_NAMESPACE ||
      process.env._SCF_SERVER_PORT ||
      process.env.FORCE_CLOUD_FUNCTION === 'true'
    );

    const publicBaseUrl = isCloudFunction
      ? `${httpConfig.baseUrl}`
      : `${httpConfig.baseUrl}:${httpConfig.port}`;

    panelManager = new PanelManager(publicBaseUrl, {
      defaultTtl: 24*60*60*7, // 7天
      maxTtl: 24 * 60 * 60 * 30, // 30天
      idLength: 16
    });
    console.error(`PanelManager 初始化完成，publicBaseUrl=${publicBaseUrl}`);

    // 初始化UserManager
    userManager = new UserManager();
    console.error('UserManager 初始化完成');

    // 初始化SmsService
    initSmsService();
    console.error('SmsService 初始化完成');

    // 初始化QuotaScheduler
    quotaScheduler = new QuotaScheduler(userManager);
    quotaScheduler.start();
    console.error('QuotaScheduler 初始化完成');

    // 启动HTTP重定向服务器
    console.error(`启动 HTTP 重定向服务器: ${httpConfig.baseUrl}:${httpConfig.port}`);
    httpRedirectServer = new HttpRedirectServer(panelManager, httpConfig, server);  // 传递 MCP Server
    await httpRedirectServer.start();
    console.error('HTTP 重定向服务器启动成功');

    // 启动数据库清理调度器
    console.error('初始化数据库清理调度器...');
    cleanupScheduler = new CleanupScheduler(cleanupConfig);
    cleanupScheduler.start();
    console.error('数据库清理调度器启动成功');

    console.error('PanelManager 服务完全启动成功！');
  } catch (error) {
    console.error('PanelManager 初始化失败:', error);
    throw error;
  }
}

// 启动服务器
async function main() {
  try {
    // 初始化PanelManager（可选，如果环境变量配置完整）
    try {
      await initializePanelManager();
    } catch (error) {
      console.error('PanelManager初始化失败，将仅启用可视化功能:', error);

      // 如果 PanelManager 初始化失败，我们仍然启动基本的 HTTP 服务器
      if (!httpRedirectServer) {
        const { HttpRedirectServer } = await import('./HttpServer.js');
        const basicConfig = {
          port: parseInt(process.env.PORT || process.env.HTTP_PORT || '3000'),
          baseUrl: process.env.BASE_URL || 'http://localhost'
        };

        // 创建一个基本的 PanelManager 实例（仅用于 HTTP 服务器），并传递 MCP Server
        httpRedirectServer = new HttpRedirectServer(null as any, basicConfig, server);
        await httpRedirectServer.start();
        console.error('基本 HTTP 服务器已启动（无 Panel 功能）');
      }
    }

    // MCP HTTP 端点已集成（在 HttpRedirectServer 构造时）
    console.error('MCP HTTP 端点已集成到 HTTP 服务器');

    console.error('Visualization Chart MCP Server 已启动 (HTTP模式)');

    // 优雅关闭处理
    process.on('SIGINT', async () => {
      console.error('正在关闭服务器...');
      try {
        if (httpRedirectServer) {
          await httpRedirectServer.stop();
        }
        await gracefulShutdown(cleanupScheduler);
      } catch (error) {
        console.error('关闭服务器时出错:', error);
      }
      process.exit(0);
    });

  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('服务器启动失败:', error);
  process.exit(1);
});
