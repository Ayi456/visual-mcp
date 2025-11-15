/**
 * 基础应用错误类
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super('VALIDATION_ERROR', message, 400);
    this.field = field;
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super('AUTHENTICATION_ERROR', message, 401);
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends AppError {
  constructor(message: string = '无权限访问') {
    super('AUTHORIZATION_ERROR', message, 403);
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super('NOT_FOUND', `${resource}不存在`, 404);
  }
}

/**
 * 配额不足错误
 */
export class QuotaExceededError extends AppError {
  constructor(message: string = '配额不足') {
    super('QUOTA_EXCEEDED', message, 429);
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super('DATABASE_ERROR', message, 500, false);
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * 外部服务错误
 */
export class ExternalServiceError extends AppError {
  public readonly serviceName: string;

  constructor(serviceName: string, message: string) {
    super('EXTERNAL_SERVICE_ERROR', `${serviceName}服务错误: ${message}`, 503);
    this.serviceName = serviceName;
  }
}

