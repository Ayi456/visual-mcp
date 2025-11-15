/**
 * Redis 缓存辅助工具
 * 提供统一的缓存操作接口
 */

import { getRedisClient } from '../config/database.js';

export interface CacheOptions {
  ttl?: number; // 过期时间（秒）
  prefix?: string; // 缓存键前缀
}

export class CacheHelper {
  /**
   * 获取 Redis 客户端（延迟初始化）
   */
  private static getRedis() {
    return getRedisClient();
  }

  /**
   * 生成缓存键
   */
  private static generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  /**
   * 获取缓存
   */
  static async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    try {
      const fullKey = this.generateKey(key, options?.prefix);
      const redis = this.getRedis();
      const value = await redis.get(fullKey);

      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * 设置缓存
   */
  static async set(
    key: string,
    value: any,
    options?: CacheOptions
  ): Promise<boolean> {
    try {
      const fullKey = this.generateKey(key, options?.prefix);
      const serialized = JSON.stringify(value);
      const redis = this.getRedis();

      if (options?.ttl) {
        await redis.setEx(fullKey, options.ttl, serialized);
      } else {
        await redis.set(fullKey, serialized);
      }

      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * 删除缓存
   */
  static async del(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.generateKey(key, options?.prefix);
      const redis = this.getRedis();
      await redis.del(fullKey);
      return true;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  /**
   * 批量删除缓存（按模式匹配）
   */
  static async delPattern(pattern: string, options?: CacheOptions): Promise<number> {
    try {
      const fullPattern = this.generateKey(pattern, options?.prefix);
      const redis = this.getRedis();
      const keys = await redis.keys(fullPattern);

      if (keys.length === 0) return 0;

      await redis.del(keys);
      return keys.length;
    } catch (error) {
      console.error('Redis delPattern error:', error);
      return 0;
    }
  }

  /**
   * 检查缓存是否存在
   */
  static async exists(key: string, options?: CacheOptions): Promise<boolean> {
    try {
      const fullKey = this.generateKey(key, options?.prefix);
      const redis = this.getRedis();
      const result = await redis.exists(fullKey);
      return result > 0;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * 使用缓存包装函数
   * 如果缓存存在则返回缓存，否则执行函数并缓存结果
   */
  static async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // 执行函数获取数据
    const result = await fn();

    // 缓存结果
    await this.set(key, result, options);

    return result;
  }
}

/**
 * 缓存键前缀常量
 */
export const CACHE_PREFIXES = {
  DASHBOARD: 'dashboard',
  DASHBOARD_LIST: 'dashboard:list',
  PANEL: 'panel',
  USER: 'user',
  STATS: 'stats'
} as const;

/**
 * 缓存过期时间常量（秒）
 */
export const CACHE_TTL = {
  SHORT: 60,           // 1分钟
  MEDIUM: 300,         // 5分钟
  LONG: 1800,          // 30分钟
  VERY_LONG: 3600,     // 1小时
  DAY: 86400           // 24小时
} as const;
