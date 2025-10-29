import mysql from 'mysql2/promise';
import { createClient, RedisClientType } from 'redis';
import { DatabaseConfig, RedisConfig } from './types.js';
import { retry } from './utils.js';

// MySQL 连接池
let mysqlPool: mysql.Pool | null = null;

// Redis 客户端
let redisClient: RedisClientType | null = null;

/**
 * 初始化MySQL连接池
 */
export async function initMysqlPool(config: DatabaseConfig): Promise<mysql.Pool> {
  try {
    mysqlPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 测试连接
    const connection = await mysqlPool.getConnection();
    await connection.ping();
    connection.release();

    console.log('MySQL连接池初始化成功');
    return mysqlPool;
  } catch (error) {
    throw new Error(`MySQL连接池初始化失败: ${error}`);
  }
}

/**
 * 初始化Redis客户端
 */
export async function initRedisClient(config: RedisConfig): Promise<RedisClientType> {
  try {
    redisClient = createClient({
      socket: {
        host: config.host,
        port: config.port,
      },
      password: config.password,
    });

    redisClient.on('error', (err) => {
      console.error('Redis客户端错误:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis客户端连接成功');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis客户端重连中...');
    });

    await redisClient.connect();
    
    // 测试连接
    await redisClient.ping();
    
    console.log('Redis客户端初始化成功');
    return redisClient;
  } catch (error) {
    throw new Error(`Redis客户端初始化失败: ${error}`);
  }
}

/**
 * 获取MySQL连接池
 */
export function getMysqlPool(): mysql.Pool {
  if (!mysqlPool) {
    throw new Error('MySQL连接池未初始化');
  }
  return mysqlPool;
}

/**
 * 获取Redis客户端
 */
export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis客户端未初始化');
  }
  return redisClient;
}

/**
 * 执行MySQL查询（带重试）
 */
export async function executeMysqlQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T> {
  return retry(async () => {
    const pool = getMysqlPool();
    const [rows] = await pool.execute(query, params);
    return rows as T;
  }, 3, 1000);
}

/**
 * 执行Redis命令（带重试）
 */
export async function executeRedisCommand<T = any>(
  command: () => Promise<T>
): Promise<T> {
  return retry(async () => {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    return await command();
  }, 3, 1000);
}

/**
 * 标记过期的Panel记录
 */
export async function markExpiredPanels(): Promise<number> {
  try {
    const result = await executeMysqlQuery<mysql.ResultSetHeader>(
      'UPDATE panels SET status = "expired" WHERE status = "active" AND expires_at < NOW()'
    );

    const affectedRows = result.affectedRows || 0;
    console.log(`标记了 ${affectedRows} 个过期Panel`);

    // 清理对应的Redis缓存
    if (affectedRows > 0) {
      await clearExpiredPanelsFromCache();
    }

    return affectedRows;
  } catch (error) {
    throw new Error(`标记过期Panel失败: ${error}`);
  }
}

/**
 * 物理删除过期的Panel记录
 */
export async function deleteExpiredPanels(retentionDays: number, batchSize: number = 1000): Promise<number> {
  try {
    let totalDeleted = 0;
    let batchDeleted = 0;

    do {
      const result = await executeMysqlQuery<mysql.ResultSetHeader>(
        `DELETE FROM panels WHERE status = "expired" AND created_at < DATE_SUB(NOW(), INTERVAL ${retentionDays} DAY) LIMIT ${batchSize}`
      );

      batchDeleted = result.affectedRows || 0;
      totalDeleted += batchDeleted;

      // 如果删除了记录，稍微等待一下避免过度占用资源
      if (batchDeleted > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (batchDeleted === batchSize);

    console.log(`物理删除了 ${totalDeleted} 个过期Panel记录`);
    return totalDeleted;
  } catch (error) {
    throw new Error(`删除过期Panel失败: ${error}`);
  }
}

/**
 * 清理过期Panel的Redis缓存
 */
async function clearExpiredPanelsFromCache(): Promise<void> {
  try {
    await executeRedisCommand(async () => {
      const client = getRedisClient();
      // 获取所有panel相关的key
      const keys = await client.keys('panel:*');

      if (keys.length > 0) {
        // 批量删除，但这里我们只是清理，具体的过期缓存会自然过期
        console.log(`发现 ${keys.length} 个Panel缓存key，Redis TTL会自然处理过期`);
      }
    });
  } catch (error) {
    console.error('清理过期Panel缓存失败:', error);
    // 缓存清理失败不应该影响主流程
  }
}

/**
 * 主清理函数 - 执行完整的清理流程
 */
export async function cleanupExpiredPanels(retentionDays: number, batchSize: number = 1000): Promise<{
  markedCount: number;
  deletedCount: number;
  duration: number;
}> {
  const startTime = Date.now();

  try {
    console.log(`开始清理过期Panel，数据保留天数: ${retentionDays}，批量大小: ${batchSize}`);

    // 第一阶段：标记过期的Panel
    const markedCount = await markExpiredPanels();

    // 第二阶段：物理删除超过保留期的Panel
    const deletedCount = await deleteExpiredPanels(retentionDays, batchSize);

    const duration = Date.now() - startTime;

    console.log(`清理完成，标记: ${markedCount}，删除: ${deletedCount}，耗时: ${duration}ms`);

    return {
      markedCount,
      deletedCount,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`清理过期Panel失败，耗时: ${duration}ms，错误:`, error);
    throw error;
  }
}



/**
 * 关闭所有数据库连接
 */
export async function closeAllConnections(): Promise<void> {
  const promises: Promise<void>[] = [];

  if (mysqlPool) {
    promises.push(mysqlPool.end());
    mysqlPool = null;
  }

  if (redisClient) {
    promises.push(redisClient.quit().then(() => {}));
    redisClient = null;
  }

  await Promise.all(promises);
  console.log('所有数据库连接已关闭');
}

/**
 * 优雅关闭所有服务（包括清理调度器）
 */
export async function gracefulShutdown(cleanupScheduler?: any): Promise<void> {
  console.log('开始优雅关闭服务...');

  // 停止清理调度器
  if (cleanupScheduler) {
    cleanupScheduler.stop();
    console.log('清理调度器已停止');
  }

  // 关闭数据库连接
  await closeAllConnections();

  console.log('所有服务已优雅关闭');
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<{ mysql: boolean; redis: boolean }> {
  const result = { mysql: false, redis: false };

  try {
    if (mysqlPool) {
      const connection = await mysqlPool.getConnection();
      await connection.ping();
      connection.release();
      result.mysql = true;
    }
  } catch (error) {
    console.error('MySQL健康检查失败:', error);
  }

  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.ping();
      result.redis = true;
    }
  } catch (error) {
    console.error('Redis健康检查失败:', error);
  }

  return result;
}
