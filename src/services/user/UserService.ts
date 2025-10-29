import { randomUUID } from 'crypto';
import { executeMysqlQuery } from '../../database.js';
import { ValidationError } from '../../utils/errors.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';
import { UserUtils } from '../../utils/UserUtils.js';
import { User, UserInfo, CreateUserArgs } from '../../types.js';
import { AuthService } from './AuthService.js';
import { QuotaService } from './QuotaService.js';

interface UserProfile {
  emailNotifications?: boolean;
  quotaReminders?: boolean;
  autoSave?: boolean;
  [key: string]: any;
}

export class UserService {
  private authService: AuthService;
  private quotaService: QuotaService;

  constructor(authService: AuthService, quotaService: QuotaService) {
    this.authService = authService;
    this.quotaService = quotaService;
  }

  async createUser(args: CreateUserArgs): Promise<UserInfo> {
    if (!ValidationUtils.validateEmail(args.email)) {
      throw new Error('邮箱格式无效');
    }

    if (!ValidationUtils.validateUsername(args.username)) {
      throw new Error('用户名格式无效（3-50字符，支持中英文、数字、下划线）');
    }

    if (args.password.length < 6) {
      throw new Error('密码长度至少6位');
    }

    if (args.phone && !ValidationUtils.validatePhone(args.phone)) {
      throw new Error('手机号格式无效');
    }

    try {
      let query = 'SELECT id FROM users WHERE email = ? OR username = ?';
      const params: any[] = [args.email, args.username];

      if (args.phone) {
        query += ' OR phone = ?';
        params.push(args.phone);
      }
      query += ' LIMIT 1';

      const existingUser = await executeMysqlQuery<User[]>(query, params);

      if (existingUser.length > 0) {
        throw new Error('邮箱、用户名或手机号已存在');
      }

      const userId = randomUUID();
      const accessId = UserUtils.generateAccessId();
      const accessKey = UserUtils.generateAccessKey();
      const passwordHash = await this.authService.hashPassword(args.password);
      const accessKeyHash = await this.authService.hashPassword(accessKey);

      const quotaConfig = this.quotaService.getQuotaByPlan(args.plan || 'free');

      await executeMysqlQuery(
        `INSERT INTO users (
          id, username, email, phone, password_hash, access_id, access_key_hash,
          plan, quota_daily, quota_monthly, display_name, quota_reset_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [
          userId,
          args.username,
          args.email,
          args.phone || null,
          passwordHash,
          accessId,
          accessKeyHash,
          args.plan || 'free',
          quotaConfig.daily,
          quotaConfig.monthly,
          args.display_name || args.username
        ]
      );

      return {
        id: userId,
        username: args.username,
        email: args.email,
        access_id: accessId,
        plan: args.plan || 'free',
        quota_daily: quotaConfig.daily,
        quota_monthly: quotaConfig.monthly,
        quota_used_today: 0,
        quota_used_month: 0,
        status: 'active',
        email_verified: false,
        display_name: args.display_name || args.username,
        created_at: new Date(),
        // @ts-ignore: include one-time plaintext key for registration response
        accessKey: accessKey
      } as any;

    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`创建用户失败: ${error}`);
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const users = await executeMysqlQuery<User[]>(
        'SELECT * FROM users WHERE id = ? AND status = "active" LIMIT 1',
        [userId]
      );

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw new Error(`查询用户失败: ${error}`);
    }
  }

  async getUserByAccessId(accessId: string): Promise<User | null> {
    try {
      const users = await executeMysqlQuery<User[]>(
        'SELECT * FROM users WHERE access_id = ? AND status = "active" LIMIT 1',
        [accessId]
      );

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw new Error(`查询用户失败: ${error}`);
    }
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    try {
      const users = await executeMysqlQuery<User[]>(
        'SELECT * FROM users WHERE phone = ? LIMIT 1',
        [phone]
      );

      return users.length > 0 ? users[0] : null;
    } catch (error) {
      throw new Error(`根据手机号查询用户失败: ${error}`);
    }
  }

  async getUserSettings(userId: string): Promise<any | null> {
    try {
      const users = await executeMysqlQuery<any[]>(
        'SELECT id, display_name, profile FROM users WHERE id = ? AND status = "active" LIMIT 1',
        [userId]
      );

      if (users.length === 0) {
        return null;
      }

      const user = users[0];

      let profileSettings: UserProfile = {};
      if (user.profile) {
        try {
          profileSettings = typeof user.profile === 'string'
            ? JSON.parse(user.profile)
            : user.profile;
        } catch (error) {
          console.warn('解析用户profile失败:', error);
          profileSettings = {};
        }
      }

      return {
        displayName: user.display_name || '',
        emailNotifications: profileSettings.emailNotifications ?? true,
        quotaReminders: profileSettings.quotaReminders ?? true,
        autoSave: profileSettings.autoSave ?? true
      };

    } catch (error) {
      console.error('获取用户设置失败:', error);
      throw new Error(`获取用户设置失败: ${error}`);
    }
  }

  async updateUserSettings(userId: string, settingsData: any): Promise<any> {
    try {
      const users = await executeMysqlQuery<any[]>(
        'SELECT id, display_name, profile FROM users WHERE id = ? AND status = "active" LIMIT 1',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('用户不存在');
      }

      const user = users[0];

      let currentProfile: UserProfile = {};
      if (user.profile) {
        try {
          currentProfile = typeof user.profile === 'string'
            ? JSON.parse(user.profile)
            : user.profile;
        } catch (error) {
          console.warn('解析用户profile失败，使用默认设置', error);
          currentProfile = {};
        }
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (settingsData.displayName !== undefined) {
        updateFields.push('display_name = ?');
        updateValues.push(settingsData.displayName);
      }

      const newProfile: UserProfile = { ...currentProfile };
      let profileUpdated = false;

      if (settingsData.emailNotifications !== undefined) {
        newProfile.emailNotifications = settingsData.emailNotifications;
        profileUpdated = true;
      }
      if (settingsData.quotaReminders !== undefined) {
        newProfile.quotaReminders = settingsData.quotaReminders;
        profileUpdated = true;
      }
      if (settingsData.autoSave !== undefined) {
        newProfile.autoSave = settingsData.autoSave;
        profileUpdated = true;
      }

      if (profileUpdated) {
        updateFields.push('profile = ?');
        updateValues.push(JSON.stringify(newProfile));
      }

      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        updateValues.push(userId);

        await executeMysqlQuery(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
          updateValues
        );
      }

      return await this.getUserSettings(userId);

    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('更新用户设置失败:', error);
      throw new Error(`更新用户设置失败: ${error}`);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!userId) {
      throw new Error('用户ID不能为空');
    }
    if (!currentPassword || !newPassword) {
      throw new Error('当前密码与新密码均不能为空');
    }
    if (newPassword.length < 6) {
      throw new Error('新密码长度至少6位');
    }

    try {
      const users = await executeMysqlQuery<User[]>(
        'SELECT id, password_hash FROM users WHERE id = ? AND status = "active" LIMIT 1',
        [userId]
      );

      if (users.length === 0) {
        throw new Error('用户不存在');
      }
      const user = users[0];

      const ok = await this.authService.verifyPassword(currentPassword, (user as any).password_hash);
      if (!ok) {
        throw new Error('当前密码错误');
      }

      const newHash = await this.authService.hashPassword(newPassword);
      await executeMysqlQuery(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ? LIMIT 1',
        [newHash, userId]
      );
      return;
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new Error(`修改密码失败: ${error}`);
    }
  }

  async updateLastApiCallTime(userId: string): Promise<void> {
    try {
      await executeMysqlQuery(
        'UPDATE users SET last_api_call_at = NOW() WHERE id = ?',
        [userId]
      );
    } catch (error) {
      console.error('更新最后API调用时间失败:', error);
    }
  }
}
