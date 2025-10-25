import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * 设置健康检查和调试路由
 */
export function setupHealthRoutes(app: express.Application, mcpServer: Server | null, mcpTransports: any) {
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'panel-redirect-server',
      mcpEnabled: !!mcpServer
    });
  });

  // 获取客户端IP端点
  app.get('/api/client-ip', (req, res) => {
    const ip = req.headers['x-forwarded-for'] ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             '127.0.0.1';
    res.json({ ip: Array.isArray(ip) ? ip[0] : ip });
  });

  // MCP 调试端点
  app.get('/mcp/debug', (req, res) => {
    res.json({
      mcpServerInitialized: !!mcpServer,
      activeSessions: Object.keys(mcpTransports),
      sessionCount: Object.keys(mcpTransports).length,
      timestamp: new Date().toISOString()
    });
  });

  // MCP 初始化测试端点
  app.post('/mcp/test', async (req, res) => {
    const testInitializeRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.1.0'
        }
      }
    };

    res.json({
      message: 'Use this request body for MCP initialization',
      testRequest: testInitializeRequest,
      endpoint: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      }
    });
  });
}
