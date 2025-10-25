import express from 'express';

/**
 * 404 处理中间件
 */
export function notFoundHandler(
  req: express.Request,
  res: express.Response
): void {
  res.status(404).json({
    error: 'Not Found',
    message: '请求的资源不存在',
    path: req.path
  });
}

/**
 * 全局错误处理中间件
 */
export function globalErrorHandler(
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  console.error('全局错误处理:', err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(status).json({
    error: 'Internal Server Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}
