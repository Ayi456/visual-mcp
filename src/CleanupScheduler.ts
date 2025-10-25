import { CleanupConfig } from './types.js';
import { cleanupExpiredPanels } from './database.js';

/**
 * 数据库清理调度器
 * 负责定期执行过期Panel的清理任务
 */
export class CleanupScheduler {
  private config: CleanupConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastRunTime: Date | null = null;
  private consecutiveFailures: number = 0;
  private readonly maxConsecutiveFailures = 5;

  constructor(config: CleanupConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * 验证配置参数
   */
  private validateConfig(): void {
    if (this.config.intervalHours < 1) {
      throw new Error('清理间隔不能小于1小时');
    }
    if (this.config.retentionDays < 1) {
      throw new Error('数据保留天数不能小于1天');
    }
    if (this.config.batchSize < 100 || this.config.batchSize > 10000) {
      throw new Error('批量大小必须在100-10000之间');
    }
  }

  /**
   * 启动定时清理任务
   */
  public start(): void {
    if (!this.config.enabled) {
      console.log('数据库清理功能已禁用');
      return;
    }

    if (this.intervalId) {
      console.log('清理调度器已经在运行中');
      return;
    }

    const intervalMs = this.config.intervalHours * 60 * 60 * 1000;
    
    console.log(`启动数据库清理调度器，间隔: ${this.config.intervalHours}小时，数据保留: ${this.config.retentionDays}天`);
    
    // 立即执行一次清理（可选）
    this.executeCleanup().catch(error => {
      console.error('初始清理执行失败:', error);
    });

    // 设置定时器
    this.intervalId = setInterval(() => {
      this.executeCleanup().catch(error => {
        console.error('定时清理执行失败:', error);
      });
    }, intervalMs);
  }

  /**
   * 停止定时清理任务
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('数据库清理调度器已停止');
    }
  }

  /**
   * 手动触发清理任务
   */
  public async manualCleanup(): Promise<{
    markedCount: number;
    deletedCount: number;
    duration: number;
  }> {
    console.log('手动触发数据库清理任务');
    return await this.executeCleanup();
  }

  /**
   * 执行清理任务
   */
  private async executeCleanup(): Promise<{
    markedCount: number;
    deletedCount: number;
    duration: number;
  }> {
    // 防止并发执行
    if (this.isRunning) {
      console.log('清理任务正在执行中，跳过本次调度');
      throw new Error('清理任务正在执行中');
    }

    // 检查连续失败次数
    if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
      console.error(`连续失败次数达到${this.maxConsecutiveFailures}次，暂停自动清理`);
      this.stop();
      throw new Error('连续失败次数过多，已暂停自动清理');
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      const result = await cleanupExpiredPanels(
        this.config.retentionDays,
        this.config.batchSize
      );

      this.lastRunTime = new Date();
      this.consecutiveFailures = 0; // 重置失败计数
      
      console.log(`清理任务执行成功: 标记${result.markedCount}个，删除${result.deletedCount}个，耗时${result.duration}ms`);
      
      return result;
    } catch (error) {
      this.consecutiveFailures++;
      console.error(`清理任务执行失败 (第${this.consecutiveFailures}次):`, error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 获取调度器状态
   */
  public getStatus(): {
    enabled: boolean;
    running: boolean;
    lastRunTime: Date | null;
    consecutiveFailures: number;
    config: CleanupConfig;
  } {
    return {
      enabled: this.config.enabled && this.intervalId !== null,
      running: this.isRunning,
      lastRunTime: this.lastRunTime,
      consecutiveFailures: this.consecutiveFailures,
      config: { ...this.config }
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<CleanupConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    try {
      this.validateConfig();
      console.log('清理调度器配置已更新:', newConfig);
      
      // 如果间隔时间改变了，需要重启调度器
      if (newConfig.intervalHours && newConfig.intervalHours !== oldConfig.intervalHours) {
        if (this.intervalId) {
          this.stop();
          this.start();
        }
      }
    } catch (error) {
      // 恢复旧配置
      this.config = oldConfig;
      throw error;
    }
  }
}
