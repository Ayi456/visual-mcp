import { executeMysqlQuery } from '../../database.js';
import { User, UserQuotaInfo } from '../../types.js';

export class QuotaService {
  private async ensureQuotaWindowFresh(userId: string): Promise<void> {
    try {
      await executeMysqlQuery(
        `UPDATE users SET
          quota_used_today = CASE
            WHEN last_api_call_at IS NULL THEN quota_used_today
            WHEN DATE(last_api_call_at) < CURDATE() THEN 0
            ELSE quota_used_today
          END,
          quota_used_month = CASE
            WHEN quota_reset_date IS NULL THEN quota_used_month
            WHEN DATE_FORMAT(quota_reset_date, '%Y-%m') <> DATE_FORMAT(CURDATE(), '%Y-%m') THEN 0
            ELSE quota_used_month
          END,
          quota_reset_date = CASE
            WHEN quota_reset_date IS NULL THEN CURDATE()
            WHEN DATE_FORMAT(quota_reset_date, '%Y-%m') <> DATE_FORMAT(CURDATE(), '%Y-%m') THEN CURDATE()
            ELSE quota_reset_date
          END
        WHERE id = ? AND status = 'active'`,
        [userId]
      );
    } catch (error) {
      throw new Error(`刷新配额窗口失败: ${error}`);
    }
  }

  getQuotaByPlan(plan: string): { daily: number; monthly: number } {
    const quotaMap = {
      free: { daily: 100, monthly: 3000 },
      basic: { daily: 500, monthly: 15000 },
      premium: { daily: 2000, monthly: 60000 },
      enterprise: { daily: 10000, monthly: 300000 }
    };

    return quotaMap[plan as keyof typeof quotaMap] || quotaMap.free;
  }

  async getUserQuota(userId: string): Promise<UserQuotaInfo | null> {
    try {
      await this.ensureQuotaWindowFresh(userId);
      const users = await executeMysqlQuery<User[]>(
        'SELECT quota_daily, quota_monthly, quota_used_today, quota_used_month, quota_reset_date FROM users WHERE id = ? LIMIT 1',
        [userId]
      );

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      return {
        quota_daily: user.quota_daily,
        quota_monthly: user.quota_monthly,
        quota_used_today: user.quota_used_today,
        quota_used_month: user.quota_used_month,
        quota_remaining_today: Math.max(0, user.quota_daily - user.quota_used_today),
        quota_remaining_month: Math.max(0, user.quota_monthly - user.quota_used_month),
        quota_reset_date: user.quota_reset_date
      };
    } catch (error) {
      throw new Error(`获取用户配额失败: ${error}`);
    }
  }

  async checkQuotaAvailable(userId: string): Promise<{ available: boolean; reason?: string }> {
    try {
      const quotaInfo = await this.getUserQuota(userId);

      if (!quotaInfo) {
        return { available: false, reason: '用户不存在' };
      }

      if (quotaInfo.quota_remaining_today <= 0) {
        return { available: false, reason: '今日配额已用尽' };
      }

      if (quotaInfo.quota_remaining_month <= 0) {
        return { available: false, reason: '本月配额已用尽' };
      }

      return { available: true };
    } catch (error) {
      throw new Error(`检查用户配额失败: ${error}`);
    }
  }

  async incrementQuotaUsage(userId: string): Promise<void> {
    try {
      await this.ensureQuotaWindowFresh(userId);
      await executeMysqlQuery(
        `UPDATE users SET
          quota_used_today = quota_used_today + 1,
          quota_used_month = quota_used_month + 1,
          last_api_call_at = NOW()
        WHERE id = ? AND status = 'active'`,
        [userId]
      );
    } catch (error) {
      throw new Error(`增加用户配额使用量失败: ${error}`);
    }
  }

  async resetDailyQuota(): Promise<{ affectedUsers: number }> {
    try {
      const result = await executeMysqlQuery(
        `UPDATE users SET
          quota_used_today = 0
        WHERE status = 'active'`
      );

      console.log(`日配额重置完成，影响用户数: ${result.affectedRows || 0}`);
      return { affectedUsers: result.affectedRows || 0 };
    } catch (error) {
      throw new Error(`重置日配额失败: ${error}`);
    }
  }

  async resetMonthlyQuota(): Promise<{ affectedUsers: number }> {
    try {
      const result = await executeMysqlQuery(
        `UPDATE users SET
          quota_used_month = 0,
          quota_reset_date = CURDATE()
        WHERE status = 'active'`
      );

      console.log(`月配额重置完成，影响用户数: ${result.affectedRows || 0}`);
      return { affectedUsers: result.affectedRows || 0 };
    } catch (error) {
      throw new Error(`重置月配额失败: ${error}`);
    }
  }

  async getQuotaUsageStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    dailyUsageTotal: number;
    monthlyUsageTotal: number;
  }> {
    try {
      const stats = await executeMysqlQuery<any[]>(
        `SELECT
          COUNT(*) as totalUsers,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as activeUsers,
          SUM(CASE WHEN DATE(last_api_call_at) = CURDATE() THEN quota_used_today ELSE 0 END) as dailyUsageTotal,
          SUM(quota_used_month) as monthlyUsageTotal
        FROM users`
      );

      return stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        dailyUsageTotal: 0,
        monthlyUsageTotal: 0
      };
    } catch (error) {
      throw new Error(`获取配额统计失败: ${error}`);
    }
  }
}
