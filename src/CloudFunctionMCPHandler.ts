// 云函数专用 MCP 处理器
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';
import express from 'express';

export class CloudFunctionMCPHandler {
  private mcpServer: Server;

  constructor(mcpServer: Server) {
    this.mcpServer = mcpServer;
  }

  /**
   * 处理云函数环境下的 MCP 请求
   * 每次请求都创建新的传输，适应无状态环境
   */
  async handleMCPRequest(req: express.Request, res: express.Response): Promise<void> {
    if (!this.mcpServer) {
      console.error('MCP Server not initialized');
      res.status(503).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'MCP Server not initialized',
        },
        id: req.body?.id || null,
      });
      return;
    }

    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      // 将上游已通过的认证用户透传到 transport，便于工具处理阶段读取
      (transport as any).authenticatedUser = (req as any).authenticatedUser;
      // 兜底：也把请求头透传到 transport，便于工具端从 headers 重鉴权
      (transport as any).requestHeaders = req.headers;
      // 进一步兜底：将本次请求的认证用户与头部挂载到 Server 对象，供 handler 无法访问 transport 时读取
      try {
        (this.mcpServer as any).__latestAuthenticatedUser = (req as any).authenticatedUser;
        (this.mcpServer as any).__latestHeaders = req.headers;
      } catch {}

      await this.mcpServer.connect(transport);

      // 云函数环境特殊处理：如果不是初始化请求，先自动初始化
      if (!isInitializeRequest(req.body)) {

        const initRequest = {
          jsonrpc: '2.0',
          id: 0,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
              name: 'cloud-function-auto-client',
              version: '1.0.0'
            }
          }
        };

        try {
          const originalWrite = res.write;
          const originalEnd = res.end;
          const originalWriteHead = res.writeHead;

          res.write = () => true;
          res.end = () => res;
          res.writeHead = () => res;

          await transport.handleRequest(req, res, initRequest);

          // 恢复原始方法
          res.write = originalWrite;
          res.end = originalEnd;
          res.writeHead = originalWriteHead;
        } catch (initError) {
          const errorMessage = initError instanceof Error ? initError.message : 'Unknown error';
          // 初始化失败，继续处理
        }
      }

      // 统一规范 Accept：必须同时包含 application/json 与 text/event-stream 才能通过 SDK 校验
      const currentAccept = (req.headers.accept as string) || '';
      if (!currentAccept.includes('application/json') || !currentAccept.includes('text/event-stream')) {
        req.headers.accept = 'application/json, text/event-stream';
      }

      // 防护：避免底层在响应结束后继续写（SSE 场景下常见），拦截 write-after-end
      const originalWrite = res.write.bind(res);
      const originalEnd = res.end.bind(res);
      let responseEnded = false;
      res.end = ((...args: any[]) => {
        responseEnded = true;
        return (originalEnd as any)(...args);
      }) as any;
      res.write = ((chunk: any, encoding?: any, cb?: any) => {
        if (responseEnded) {
          try { cb && cb(); } catch {}
          return true;
        }
        return (originalWrite as any)(chunk, encoding, cb);
      }) as any;

      await transport.handleRequest(req, res, req.body);

    } catch (error) {
      console.error('Cloud Function MCP Request Error:', error);

      if (!res.headersSent) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;

        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
            data: {
              error: errorMessage,
              ...(errorStack && { stack: errorStack })
            }
          },
          id: req.body?.id || null,
        });
      }
    }
  }

  createRouteHandler() {
    return async (req: express.Request, res: express.Response) => {
      await this.handleMCPRequest(req, res);
    };
  }

  static isValidMCPRequest(body: any): boolean {
    return (
      body &&
      body.jsonrpc === '2.0' &&
      typeof body.method === 'string' &&
      (body.id !== undefined)
    );
  }

  static createErrorResponse(code: number, message: string, id: any = null, data?: any) {
    return {
      jsonrpc: '2.0',
      error: {
        code,
        message,
        ...(data && { data })
      },
      id
    };
  }
}
