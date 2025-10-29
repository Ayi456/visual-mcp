import {
  User,
  UserInfo,
  UserQuotaInfo,
  CreateUserArgs,
  LoginUserArgs
} from './types.js';
import { AuthService, UserService, QuotaService, PasswordResetService } from './services/user/index.js';

/**
 * 用户管理器（外观模式）
 * 处理用户注册、登录、配额管理等功能
 * 将具体实现委托给各个专门的服务类
 */
export class UserManager {
  private authService: AuthService;
  private userService: UserService;
  private quotaService: QuotaService;
  private passwordResetService: PasswordResetService;

  constructor() {
    this.authService = new AuthService();
    this.quotaService = new QuotaService();
    this.userService = new UserService(this.authService, this.quotaService);
    this.passwordResetService = new PasswordResetService(this.authService);
  }

  async rotateAccessKey(email: string, password: string): Promise<{ accessKey: string }> {
    return this.authService.rotateAccessKey(email, password);
  }

  async createUser(args: CreateUserArgs): Promise<UserInfo> {
    return this.userService.createUser(args);
  }

  async loginUser(args: LoginUserArgs): Promise<{ user: UserInfo; accessKey?: string } | null> {
    return this.authService.loginUser(args);
  }

  async getUserByAccessId(accessId: string): Promise<User | null> {
    return this.userService.getUserByAccessId(accessId);
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    return this.userService.getUserByPhone(phone);
  }

  async verifyAccessKey(accessId: string, accessKey: string): Promise<boolean> {
    return this.authService.verifyAccessKey(accessId, accessKey);
  }

  async getUserQuota(userId: string): Promise<UserQuotaInfo | null> {
    return this.quotaService.getUserQuota(userId);
  }

  async validateUserCredentials(accessId: string, accessKey: string): Promise<User | null> {
    return this.authService.validateUserCredentials(accessId, accessKey);
  }

  async getUserSettings(userId: string): Promise<any | null> {
    return this.userService.getUserSettings(userId);
  }

  async updateUserSettings(userId: string, settingsData: any): Promise<any> {
    return this.userService.updateUserSettings(userId, settingsData);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    return this.userService.changePassword(userId, currentPassword, newPassword);
  }

  async updateLastApiCallTime(userId: string): Promise<void> {
    return this.userService.updateLastApiCallTime(userId);
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userService.getUserById(userId);
  }

  async checkQuotaAvailable(userId: string): Promise<{ available: boolean; reason?: string }> {
    return this.quotaService.checkQuotaAvailable(userId);
  }

  async incrementQuotaUsage(userId: string): Promise<void> {
    return this.quotaService.incrementQuotaUsage(userId);
  }

  async resetDailyQuota(): Promise<{ affectedUsers: number }> {
    return this.quotaService.resetDailyQuota();
  }

  async resetMonthlyQuota(): Promise<{ affectedUsers: number }> {
    return this.quotaService.resetMonthlyQuota();
  }

  async getQuotaUsageStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    dailyUsageTotal: number;
    monthlyUsageTotal: number;
  }> {
    return this.quotaService.getQuotaUsageStats();
  }

  async sendPasswordResetCode(phoneOrEmail: string): Promise<{ success: boolean; message: string; code?: string }> {
    return this.passwordResetService.sendPasswordResetCode(phoneOrEmail);
  }

  async verifyPasswordResetCode(phoneOrEmail: string, code: string): Promise<{ success: boolean; message: string; token?: string }> {
    return this.passwordResetService.verifyPasswordResetCode(phoneOrEmail, code);
  }

  async resetPasswordWithCode(phoneOrEmail: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.passwordResetService.resetPasswordWithCode(phoneOrEmail, code, newPassword);
  }

  async cleanupExpiredResetTokens(): Promise<number> {
    return this.passwordResetService.cleanupExpiredResetTokens();
  }
}
