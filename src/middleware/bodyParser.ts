import express from 'express';

/**
 * 配置请求体解析中间件
 */
export function configureBodyParser(app: express.Application): void {
  const jsonLimitMb = parseInt(process.env.JSON_BODY_LIMIT_MB || '10');
  const limitStr = `${isNaN(jsonLimitMb) ? 10 : Math.min(Math.max(jsonLimitMb, 1), 100)}mb`;

  app.use(express.json({ limit: limitStr }));
  app.use(express.urlencoded({ extended: true, limit: limitStr }));
}
