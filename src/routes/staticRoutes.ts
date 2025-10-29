import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

export function setupStaticRoutes(app: express.Application) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // 静态文件服务
  const staticRoot = process.env.STATIC_DIR || path.join(process.cwd(), 'web-dist');
  const legacyStatic = path.join(__dirname, '..', '..', 'web', 'dist');

  // Primary static root
  app.use(express.static(staticRoot));

  // Legacy fallback
  if (staticRoot !== legacyStatic) {
    app.use(express.static(legacyStatic));
  }

  // 前端路由 fallback - 所有非 API/MCP/Panel 的路由都返回 index.html
  app.get(/^(?!\/api|\/mcp|\/panel).*/, (req, res, next) => {
    const indexPath = path.join(staticRoot, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        // fallback to legacy path
        res.sendFile(path.join(legacyStatic, 'index.html'), (err2) => {
          if (err2) next(err2);
        });
      }
    });
  });
}
