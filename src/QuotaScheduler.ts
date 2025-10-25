import { UserManager } from './UserManager.js';
import { getSmsService } from './SmsService.js';

export class QuotaScheduler {
  private userManager: UserManager;
  private dailyResetInterval: NodeJS.Timeout | null = null;
  private monthlyResetInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastDailyReset: Date | null = null;
  private lastMonthlyReset: Date | null = null;
  private lastCleanup: Date | null = null;

  constructor(userManager: UserManager) {
    this.userManager = userManager;
  }

  public start(): void {
    if (this.isRunning) {
      console.log('配额重置调度器已经在运行中');
      return;
    }

    this.isRunning = true;
    console.log('启动配额重置调度器...');

    // 启动日配额重置任务（每天0点执行）
    this.scheduleDailyReset();

    // 启动月配额重置任务（每月1号0点执行）
    this.scheduleMonthlyReset();

    // 启动定时清理任务（每小时执行一次）
    this.scheduleCleanup();

    console.log('配额重置调度器启动成功');
  }

  /**
   * 停止配额重置调度器
   */
  public stop(): void {
    if (this.dailyResetInterval) {
      clearTimeout(this.dailyResetInterval);
      this.dailyResetInterval = null;
    }

    if (this.monthlyResetInterval) {
      clearTimeout(this.monthlyResetInterval);
      this.monthlyResetInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.isRunning = false;
    console.log('配额重置调度器已停止');
  }

  /**
   * 调度日配额重置任务
   */
  private scheduleDailyReset(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // 明天0点（本地时区）

    let timeUntilReset = tomorrow.getTime() - now.getTime();
    // 防止因时区/系统时间导致的负值或0，避免紧急循环
    if (!Number.isFinite(timeUntilReset) || timeUntilReset <= 0) {
      timeUntilReset = 60 * 1000; // 至少等待1分钟
    }

    console.log(`下次日配额重置时间: ${tomorrow.toLocaleString()}`);

    this.dailyResetInterval = setTimeout(async () => {
      await this.executeDailyReset();
      this.scheduleDailyReset();
    }, timeUntilReset);
  }

  /**
   * 调度月配额重置任务
   */
  private scheduleMonthlyReset(): void {
    // 采用“每天0点检查是否为月初”的方式，避免 setTimeout 超过 2^31-1 ms 被立即触发
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    let timeUntilCheck = nextMidnight.getTime() - now.getTime();
    if (!Number.isFinite(timeUntilCheck) || timeUntilCheck <= 0) {
      timeUntilCheck = 60 * 1000; // 至少等待1分钟
    }

    console.log(`下次月配额重置检查时间: ${nextMidnight.toLocaleString()}`);

    this.monthlyResetInterval = setTimeout(async () => {
      const today = new Date();
      if (today.getDate() === 1) {
        await this.executeMonthlyReset();
      }
      this.scheduleMonthlyReset();
    }, timeUntilCheck);
  }

  /**
   * 执行日配额重置
   */
  private async executeDailyReset(): Promise<void> {
    try {
      console.log('开始执行日配额重置...');
      const result = await this.userManager.resetDailyQuota();
      this.lastDailyReset = new Date();
      console.log(`日配额重置完成，影响用户数: ${result.affectedUsers}`);
    } catch (error) {
      console.error('日配额重置失败:', error);
    }
  }

  /**
   * 执行月配额重置
   */
  private async executeMonthlyReset(): Promise<void> {
    try {
      console.log('开始执行月配额重置...');
      const result = await this.userManager.resetMonthlyQuota();
      this.lastMonthlyReset = new Date();
      console.log(`月配额重置完成，影响用户数: ${result.affectedUsers}`);
    } catch (error) {
      console.error('月配额重置失败:', error);
    }
  }

  /**
   * 手动触发日配额重置
   */
  public async manualDailyReset(): Promise<{ affectedUsers: number }> {
    console.log('手动触发日配额重置');
    const result = await this.userManager.resetDailyQuota();
    this.lastDailyReset = new Date();
    return result;
  }

  /**
   * 手动触发月配额重置
   */
  public async manualMonthlyReset(): Promise<{ affectedUsers: number }> {
    console.log('手动触发月配额重置');
    const result = await this.userManager.resetMonthlyQuota();
    this.lastMonthlyReset = new Date();
    return result;
  }

  /**
   * 调度清理任务（每小时执行一次）
   */
  private scheduleCleanup(): void {
    // 立即执行一次
    this.executeCleanup();

    // 每小时执行一次
    this.cleanupInterval = setInterval(async () => {
      await this.executeCleanup();
    }, 60 * 60 * 1000); // 1小时

    console.log('定时清理任务已启动（每小时执行一次）');
  }

  /**
   * 执行清理任务
   */
  private async executeCleanup(): Promise<void> {
    try {
      // 清理过期的短信验证码
      try {
        const smsService = getSmsService();
        const smsCount = await smsService.cleanupExpiredCodes();
        if (smsCount > 0) {
          console.log(`已清理 ${smsCount} 条过期的短信验证码`);
        }
      } catch (error) {
        console.error('清理短信验证码时出错:', error);
      }

      // 清理过期的密码重置令牌
      try {
        const tokenCount = await this.userManager.cleanupExpiredResetTokens();
        if (tokenCount > 0) {
          console.log(`已清理 ${tokenCount} 条过期的密码重置令牌`);
        }
      } catch (error) {
        console.error('清理密码重置令牌时出错:', error);
      }

      this.lastCleanup = new Date();
      console.log('定时清理任务执行完成');
    } catch (error) {
      console.error('定时清理任务执行失败:', error);
    }
  }

  /**
   * 获取调度器状态
   */
  public getStatus(): {
    running: boolean;
    lastDailyReset: Date | null;
    lastMonthlyReset: Date | null;
    lastCleanup: Date | null;
    nextDailyReset: Date;
    nextMonthlyReset: Date;
  } {
    const now = new Date();

    // 计算下次日重置时间
    const nextDailyReset = new Date(now);
    nextDailyReset.setDate(nextDailyReset.getDate() + 1);
    nextDailyReset.setHours(0, 0, 0, 0);

    // 计算下次月重置时间
    const nextMonthlyReset = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    return {
      running: this.isRunning,
      lastDailyReset: this.lastDailyReset,
      lastMonthlyReset: this.lastMonthlyReset,
      lastCleanup: this.lastCleanup,
      nextDailyReset,
      nextMonthlyReset
    };
  }
}
