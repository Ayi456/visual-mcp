#!/usr/bin/env node

/**
 * Visualization Chart MCP Server
 *
 * 数据可视化和面板管理 MCP 服务器
 * 提供图表生成、Panel 链接管理、用户认证等功能
 *
 * @version 1.1.0
 */

import { Application } from './server/Application.js';

/**
 * 应用启动入口
 */
async function main() {
  try {
    const app = new Application();
    await app.start();
  } catch (error) {
    console.error('应用启动失败:', error);
    process.exit(1);
  }
}

// 启动应用
main().catch((error) => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
