import express from 'express';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { CloudFunctionMCPHandler } from '../CloudFunctionMCPHandler.js';
import { authenticateUser } from '../middleware/authentication.js';
import { UserManager } from '../UserManager.js';
import { User } from '../types.js';

/**
 * 设置 MCP 协议相关路由
 */
export function setupMcpRoutes(
  app: express.Application,
  mcpServer: Server | null,
  mcpTransports: { [sessionId: string]: StreamableHTTPServerTransport },
  sessionUserMap: Map<string, User>,
  userManager: UserManager
) {
  // MCP 协议端点 - POST 请求处理客户端到服务器的通信
  app.post(['/mcp', '/mcp/'], async (req, res) => {
    if (!mcpServer) {
      return res.status(503).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'MCP Server not initialized'
        },
        id: null
      });
    }

    // 尝试验证用户身份（保持向后兼容）
    const authResult = await authenticateUser(req, userManager);
    const authenticatedUser = authResult.user;
    const isInitRequest = req.body?.method === 'initialize';

    // 检测云函数环境
    const isCloudFunction = !!(
      process.env.SERVERLESS ||
      process.env.SCF_RUNTIME_API ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.TENCENTCLOUD_RUNENV ||
      process.env.SCF_NAMESPACE ||
      process.env._SCF_SERVER_PORT ||
      req.headers['x-scf-request-id'] ||
      req.headers['x-scf-region'] ||
      process.env.FORCE_CLOUD_FUNCTION === 'true'
    );

    if (isCloudFunction) {
      // 云函数环境：使用专门的处理器
      const cloudHandler = new CloudFunctionMCPHandler(mcpServer);
      return await cloudHandler.handleMCPRequest(req, res);
    }

    // 本地环境：使用传统的会话管理
    try {
      // 修复 Accept 头部
      if (!req.headers.accept || !req.headers.accept.includes('text/event-stream')) {
        req.headers.accept = 'application/json, text/event-stream';
      }

      // 检查现有会话ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      let transport: StreamableHTTPServerTransport;

      if (!isCloudFunction && sessionId && mcpTransports[sessionId]) {
        transport = mcpTransports[sessionId];
      } else if (isInitializeRequest(req.body) || isCloudFunction) {
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (sessionId) => {
            if (!isCloudFunction) {
              mcpTransports[sessionId] = transport;
            }

            // 存储认证用户信息
            const pendingUser = req.pendingUser;
            if (pendingUser) {
              sessionUserMap.set(sessionId, pendingUser);
              console.log('待处理用户信息已存储到新会话:', { sessionId, userId: pendingUser.id });
              delete req.pendingUser;
            }
          }
        });

        // 传输关闭时清理
        if (!isCloudFunction) {
          transport.onclose = () => {
            if (transport.sessionId) {
              console.log('Cleaning up transport for session:', transport.sessionId);
              delete mcpTransports[transport.sessionId];
              sessionUserMap.delete(transport.sessionId);
            }
          };
        }

        // 连接到 MCP 服务器
        await mcpServer.connect(transport);
      } else {
        const errorDetails = {
          hasSessionId: !!sessionId,
          sessionIdExists: sessionId ? !!mcpTransports[sessionId] : false,
          isInitialize: isInitializeRequest(req.body),
          requestMethod: req.body?.method,
          requestId: req.body?.id
        };

        console.log('Invalid MCP request:', errorDetails);

        return res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: `Bad Request: ${!sessionId ? 'No session ID provided and not an initialize request' : 'Invalid session ID'}`,
            data: errorDetails
          },
          id: req.body?.id || null
        });
      }

      // 将认证用户信息存储到会话中
      if (authenticatedUser) {
        let currentSessionId = sessionId;
        if (!currentSessionId && isInitRequest) {
          req.pendingUser = authenticatedUser;
        } else if (currentSessionId) {
          sessionUserMap.set(currentSessionId, authenticatedUser);
          console.log('用户信息已存储到会话:', { sessionId: currentSessionId, userId: authenticatedUser.id });
        }
      }

      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('MCP 请求处理错误:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error'
          },
          id: null
        });
      }
    }
  });

  // MCP 协议端点 - GET 请求处理服务器到客户端的通知（SSE）
  app.get(['/mcp', '/mcp/'], async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !mcpTransports[sessionId]) {
      return res.status(400).send('Invalid or missing session ID');
    }

    const transport = mcpTransports[sessionId];
    await transport.handleRequest(req, res);
  });

  // MCP 协议端点 - DELETE 请求处理会话终止
  app.delete(['/mcp', '/mcp/'], async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !mcpTransports[sessionId]) {
      return res.status(400).send('Invalid or missing session ID');
    }

    const transport = mcpTransports[sessionId];
    await transport.handleRequest(req, res);
  });
}
