import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

import { PanelManager } from '../core/PanelManager.js';
import { UserManager } from '../core/UserManager.js';
import {
  initOSSUploader,
  getOSSUploader,
  isOSSUploaderInitialized,
} from '../core/OssUploader.js';
import { HTML_SAVE_CONFIG } from '../constants/chart.constants.js';
import {
  SchemaField,
  VisualizationData,
  ChartType,
  StyleConfig
} from '../types/chart.types.js';
import { AddPanelArgs, GetPanelInfoArgs, User } from '../types.js';
import { recommendChartType } from '../utils/dataTypeDetector.js';
import { generateVisualizationHtml, generateFileName, getChartTypeName } from '../utils/htmlGenerator.js';

/**
 * MCP 工具处理器
 * 负责处理 MCP 工具的注册和调用
 */
export class McpToolHandler {
  private server: Server;
  private panelManager: PanelManager | null;
  private userManager: UserManager | null;
  private projectRoot: string;

  constructor(
    server: Server,
    panelManager: PanelManager | null,
    userManager: UserManager | null,
    projectRoot: string
  ) {
    this.server = server;
    this.panelManager = panelManager;
    this.userManager = userManager;
    this.projectRoot = projectRoot;

    this.setupHandlers();
  }

  /**
   * 设置请求处理器
   */
  private setupHandlers(): void {
    // 注册工具列表
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return this.listTools();
    });

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
      return this.handleToolCall(request, extra);
    });
  }

  /**
   * 列出所有可用工具
   */
  private listTools() {
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
              }
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
  }

  /**
   * 处理工具调用
   */
  private async handleToolCall(request: any, extra: any) {
    const { name, arguments: args } = request.params;

    // 获取认证用户
    const authenticatedUser = await this.getAuthenticatedUser(extra, request);

    if (!authenticatedUser) {
      return {
        content: [
          { type: 'text', text: '错误: 未找到认证用户信息。请确保在配置中包含有效的 AccessID 和 AccessKey。' },
        ],
        isError: true,
      };
    }

    // 检查配额（仅对资源消耗型工具）
    if (name === 'create_visualization_chart' || name === 'add_panel') {
      const quotaCheck = await this.checkUserQuota(authenticatedUser.id);
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
    }

    // 路由到具体的工具处理方法
    switch (name) {
      case 'create_visualization_chart':
        return this.handleCreateVisualization(args, authenticatedUser);
      case 'add_panel':
        return this.handleAddPanel(args, authenticatedUser);
      case 'get_panel_info':
        return this.handleGetPanelInfo(args);
      default:
        throw new Error(`未知工具: ${name}`);
    }
  }

  /**
   * 获取认证用户
   */
  private async getAuthenticatedUser(extra: any, request: any): Promise<User | null> {
    let authenticatedUser: User | null = null;

    // 从会话中获取
    const sessionId = (extra as any)?.sessionId ||
      (extra as any)?.transport?.sessionId ||
      (request as any)?.sessionId;

    if (sessionId && (this.server as any).httpRedirectServer) {
      authenticatedUser = (this.server as any).httpRedirectServer.getSessionUser(sessionId) || null;
    }

    // 云函数兜底
    if (!authenticatedUser && (this.server as any)?.__latestAuthenticatedUser) {
      authenticatedUser = (this.server as any).__latestAuthenticatedUser;
    }

    // 从 transport 获取
    if (!authenticatedUser) {
      const transportUser = (extra as any)?.transport?.authenticatedUser;
      if (transportUser) {
        authenticatedUser = transportUser;
      }
    }

    // 从请求头鉴权
    if (!authenticatedUser) {
      try {
        const headers: any =
          (extra as any)?.transport?.requestHeaders ||
          (extra as any)?.requestHeaders ||
          (extra as any)?.headers ||
          {};
        const accessId = headers['accessid'] || headers['AccessID'];
        const authHeader = headers['accesskey'] || headers['AccessKey'];

        if (accessId && authHeader && this.userManager) {
          const accessKey = String(authHeader).startsWith('Bearer ')
            ? String(authHeader).slice(7)
            : String(authHeader);
          const user = await this.userManager.validateUserCredentials(accessId, accessKey);
          if (user) {
            authenticatedUser = user;
          }
        }
      } catch (e) {
        console.error('CallTool 直接头鉴权异常:', e);
      }
    }

    return authenticatedUser;
  }

  /**
   * 检查用户配额
   */
  private async checkUserQuota(userId: string): Promise<{ available: boolean; reason?: string }> {
    if (!this.userManager) {
      throw new Error('UserManager未初始化，请先启动服务器');
    }

    return await this.userManager.checkQuotaAvailable(userId);
  }

  /**
   * 处理创建可视化图表
   */
  private async handleCreateVisualization(args: any, user: User) {
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

      // 生成文件名
      const fileName = generateFileName(chartType);
      const htmlSaveConfig = {
        ...HTML_SAVE_CONFIG,
        baseDir: this.projectRoot
      };
      const filePath = path.join(htmlSaveConfig.baseDir, htmlSaveConfig.subDir, fileName);

      let finalUrl: string;
      let panelUrl: string | null = null;
      let panelId: string | null = null;

      // 获取最终的图表类型
      const finalChartType = chartType === 'auto' ? recommendChartType(schema, data) : chartType;

      // 尝试上传到 OSS 并生成 Panel 短链接
      if (isOSSUploaderInitialized() && this.panelManager) {
        try {
          const ossUploader = getOSSUploader();
          const uploadResult = await ossUploader.uploadHTML(htmlContent, fileName);

          const panelResult = await this.panelManager.addPanel(uploadResult.url, {
            user_id: user.id,
            title: title || '数据可视化图表',
            description: `由 ${user.username} 创建的${getChartTypeName(finalChartType)}`,
            is_public: false
          });

          finalUrl = panelResult.url;
          panelUrl = panelResult.url;
          panelId = panelResult.id;
        } catch (error) {
          console.error('OSS 上传或 Panel 生成失败，回退到本地文件模式:', error);
          this.saveToLocalFile(filePath, htmlContent);
          finalUrl = `file://${filePath}`;
          this.openInBrowser(finalUrl);
        }
      } else {
        this.saveToLocalFile(filePath, htmlContent);
        finalUrl = `file://${filePath}`;
        this.openInBrowser(finalUrl);
      }

      // 扣减配额
      if (this.userManager) {
        await this.userManager.incrementQuotaUsage(user.id);
      }

      // 构建响应
      let responseText = `✅ 已生成${getChartTypeName(finalChartType)}，包含${data.length}行数据，${schema.length}个字段\n\n📊 图表类型: ${getChartTypeName(finalChartType)}\n📈 数据: ${data.length}行 × ${schema.length}列\n🎯 标题: ${title || '数据可视化图表'}`;

      if (panelUrl) {
        responseText += `\n\n**点击查看可视化图表**: ${panelUrl}\nPANEL_ID: ${panelId}\nPANEL_URL: ${panelUrl}\n\n💡 提示: 点击上方链接即可在浏览器中查看交互式图表`;
      } else if (finalUrl.startsWith('file://')) {
        responseText += `\n\n🔗 本地文件路径: ${finalUrl.replace('file://', '')}\n\n💡 提示: 文件已自动在浏览器中打开`;
      }

      return {
        content: [{ type: 'text', text: responseText }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `错误: ${error}` }],
        isError: true,
      };
    }
  }

  /**
   * 处理添加 Panel
   */
  private async handleAddPanel(args: any, user: User) {
    const { osspath, ttl = 24 * 60 * 60 * 7, title, description, is_public } = args as unknown as AddPanelArgs;

    try {
      if (!this.panelManager) {
        throw new Error('PanelManager未初始化，请先启动服务器');
      }

      const result = await this.panelManager.addPanel(osspath, {
        user_id: user.id,
        title,
        description,
        is_public,
        ttl
      });

      // 扣减配额
      if (this.userManager) {
        await this.userManager.incrementQuotaUsage(user.id);
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
        content: [{ type: 'text', text: `错误: ${error}` }],
        isError: true,
      };
    }
  }

  /**
   * 处理获取 Panel 信息
   */
  private async handleGetPanelInfo(args: any) {
    const { id } = args as unknown as GetPanelInfoArgs;

    try {
      if (!this.panelManager) {
        throw new Error('PanelManager未初始化，请先启动服务器');
      }

      const panelInfo = await this.panelManager.getPanelInfo(id);

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
        content: [{ type: 'text', text: `错误: ${error}` }],
        isError: true,
      };
    }
  }

  /**
   * 保存到本地文件
   */
  private saveToLocalFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`HTML 文件已保存到: ${filePath}`);
  }

  /**
   * 在浏览器中打开
   */
  private openInBrowser(url: string): void {
    const command = process.platform === 'win32' ? 'start' :
      process.platform === 'darwin' ? 'open' : 'xdg-open';

    exec(`${command} "${url}"`, (error) => {
      if (error) {
        console.warn(`无法自动打开浏览器: ${error.message}`);
      }
    });
  }
}
