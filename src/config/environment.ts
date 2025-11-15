import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DatabaseConfig,
  RedisConfig,
  HttpServerConfig,
  CleanupConfig
} from '../types.js';
import { OSSConfig } from '../core/OssUploader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// 加载环境变量
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

/**
 * 应用配置接口
 */
export interface AppConfig {
  projectRoot: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  http: HttpServerConfig;
  cleanup: CleanupConfig;
  oss: OSSConfig;
}

/**
 * 从环境变量加载配置
 */
export function loadConfig(): AppConfig {
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

  return {
    projectRoot: PROJECT_ROOT,
    database: databaseConfig,
    redis: redisConfig,
    http: httpConfig,
    cleanup: cleanupConfig,
    oss: ossConfig
  };
}

/**
 * 检查是否是云函数环境
 */
export function isCloudFunctionEnvironment(): boolean {
  return !!(
    process.env.SERVERLESS ||
    process.env.SCF_RUNTIME_API ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.TENCENTCLOUD_RUNENV ||
    process.env.SCF_NAMESPACE ||
    process.env._SCF_SERVER_PORT ||
    process.env.FORCE_CLOUD_FUNCTION === 'true'
  );
}

/**
 * 获取公网访问地址
 */
export function getPublicBaseUrl(httpConfig: HttpServerConfig): string {
  const isCloudFunction = isCloudFunctionEnvironment();

  return isCloudFunction
    ? `${httpConfig.baseUrl}`
    : `${httpConfig.baseUrl}:${httpConfig.port}`;
}

/**
 * 验证必需的配置项
 */
export function validateConfig(config: AppConfig): void {
  const errors: string[] = [];

  // 验证数据库配置
  if (!config.database.host) errors.push('MYSQL_HOST is required');
  if (!config.database.user) errors.push('MYSQL_USER is required');
  if (!config.database.database) errors.push('MYSQL_DATABASE is required');

  // 验证 Redis 配置
  if (!config.redis.host) errors.push('REDIS_HOST is required');

  // 验证 HTTP 配置
  if (!config.http.baseUrl) errors.push('BASE_URL is required');
  if (config.http.port < 1 || config.http.port > 65535) {
    errors.push('HTTP_PORT must be between 1 and 65535');
  }

  if (errors.length > 0) {
    throw new Error(`配置验证失败:\n${errors.join('\n')}`);
  }
}
