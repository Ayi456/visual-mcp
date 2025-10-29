import { randomUUID } from 'crypto';
import { executeMysqlQuery } from '../../database.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';
import { User } from '../../types.js';
import { AuthService } from './AuthService.js';

export class PasswordResetService {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  async sendPasswordResetCode(phoneOrEmail: string): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      const isEmail = ValidationUtils.validateEmail(phoneOrEmail);
      const isPhone = ValidationUtils.validatePhone(phoneOrEmail);

      if (!isEmail && !isPhone) {
        return { success: false, message: '请输入有效的手机号或邮箱' };
      }

      const query = isEmail
        ? 'SELECT id, phone, email, username FROM users WHERE email = ? AND status = "active" LIMIT 1'
        : 'SELECT id, phone, email, username FROM users WHERE phone = ? AND status = "active" LIMIT 1';

      const users = await executeMysqlQuery<User[]>(query, [phoneOrEmail]);

      if (users.length === 0) {
        return { success: false, message: '该账号不存在' };
      }

      const user = users[0];

      const recentTokens = await executeMysqlQuery<any[]>(
        `SELECT id FROM password_reset_tokens
         WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
         LIMIT 1`,
        [user.id]
      );

      if (recentTokens.length > 0) {
        return { success: false, message: '请求过于频繁，请稍后再试' };
      }

      if (isPhone && user.phone) {
        try {
          const { getSmsService } = await import('../../SmsService.js');
          const smsService = getSmsService();
          const result = await smsService.sendVerifyCode(user.phone, 15);

          if (result.success && result.code) {
            const verifyCode = result.code;

            const tokenId = randomUUID();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

            await executeMysqlQuery(
              `UPDATE password_reset_tokens
               SET verified = 1
               WHERE user_id = ? AND verified = 0`,
              [user.id]
            );

            await executeMysqlQuery(
              `INSERT INTO password_reset_tokens (id, user_id, identifier, token, expires_at, created_at, verified, attempts)
               VALUES (?, ?, ?, ?, ?, NOW(), 0, 0)`,
              [tokenId, user.id, phoneOrEmail, verifyCode, expiresAt]
            );

            console.log('密码重置令牌已创建:', {
              tokenId,
              userId: user.id,
              phoneOrEmail,
              tokenLength: verifyCode.length
            });

            return {
              success: true,
              message: '验证码发送成功',
              code: process.env.NODE_ENV === 'development' ? verifyCode : undefined
            };
          }

          return result;
        } catch (error) {
          console.error('短信服务错误:', error);
          return { success: false, message: '短信服务暂不可用，请稍后再试' };
        }
      }

      return { success: false, message: '暂不支持邮箱重置密码，请使用手机号' };

    } catch (error: any) {
      console.error('发送密码重置验证码失败:', error);
      return { success: false, message: '系统错误，请稍后再试' };
    }
  }

  async verifyPasswordResetCode(phoneOrEmail: string, code: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const isPhone = ValidationUtils.validatePhone(phoneOrEmail);
      const isEmail = ValidationUtils.validateEmail(phoneOrEmail);

      if (!isPhone && !isEmail) {
        return { success: false, message: '请输入有效的手机号或邮箱' };
      }

      const query = isEmail
        ? 'SELECT id FROM users WHERE email = ? AND status = "active" LIMIT 1'
        : 'SELECT id FROM users WHERE phone = ? AND status = "active" LIMIT 1';

      const users = await executeMysqlQuery<User[]>(query, [phoneOrEmail]);

      if (users.length === 0) {
        return { success: false, message: '用户不存在' };
      }

      const userId = users[0].id;

      const tokens = await executeMysqlQuery<any[]>(
        `SELECT id FROM password_reset_tokens
         WHERE user_id = ? AND identifier = ? AND token = ?
         AND verified = 0 AND expires_at > NOW() AND attempts < 5
         ORDER BY created_at DESC LIMIT 1`,
        [userId, phoneOrEmail, code]
      );

      if (tokens.length === 0) {
        await executeMysqlQuery(
          `UPDATE password_reset_tokens
           SET attempts = attempts + 1
           WHERE user_id = ? AND identifier = ?
           AND verified = 0 AND expires_at > NOW()`,
          [userId, phoneOrEmail]
        );
        return { success: false, message: '验证码错误或已过期' };
      }

      const tokenRecord = tokens[0];

      return {
        success: true,
        message: '验证成功',
        token: tokenRecord.id
      };

    } catch (error: any) {
      console.error('验证密码重置验证码失败:', error);
      return { success: false, message: '验证失败，请重试' };
    }
  }

  async resetPasswordWithCode(phoneOrEmail: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      if (newPassword.length < 6) {
        return { success: false, message: '密码长度至少6位' };
      }

      const isPhone = ValidationUtils.validatePhone(phoneOrEmail);
      const isEmail = ValidationUtils.validateEmail(phoneOrEmail);

      if (!isPhone && !isEmail) {
        return { success: false, message: '请输入有效的手机号或邮箱' };
      }

      const query = isEmail
        ? 'SELECT id FROM users WHERE email = ? AND status = "active" LIMIT 1'
        : 'SELECT id FROM users WHERE phone = ? AND status = "active" LIMIT 1';

      const users = await executeMysqlQuery<User[]>(query, [phoneOrEmail]);

      if (users.length === 0) {
        return { success: false, message: '用户不存在' };
      }

      const userId = users[0].id;

      const tokens = await executeMysqlQuery<any[]>(
        `SELECT id FROM password_reset_tokens
         WHERE user_id = ? AND identifier = ? AND token = ?
         AND verified = 0 AND expires_at > NOW() AND attempts < 5
         ORDER BY created_at DESC LIMIT 1`,
        [userId, phoneOrEmail, code]
      );

      if (tokens.length === 0) {
        await executeMysqlQuery(
          `UPDATE password_reset_tokens
           SET attempts = attempts + 1
           WHERE user_id = ? AND identifier = ?
           AND verified = 0 AND expires_at > NOW()`,
          [userId, phoneOrEmail]
        );
        return { success: false, message: '验证码无效或已过期，请重新获取' };
      }

      const tokenId = tokens[0].id;

      const newPasswordHash = await this.authService.hashPassword(newPassword);
      await executeMysqlQuery(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newPasswordHash, userId]
      );

      await executeMysqlQuery(
        `UPDATE password_reset_tokens
         SET verified = 1
         WHERE id = ?`,
        [tokenId]
      );

      await executeMysqlQuery(
        `UPDATE password_reset_tokens
         SET verified = 1
         WHERE user_id = ? AND verified = 0`,
        [userId]
      );

      console.log(`用户 ${userId} 密码重置成功`);

      return { success: true, message: '密码重置成功' };

    } catch (error: any) {
      console.error('重置密码失败:', error);
      return { success: false, message: '密码重置失败，请重试' };
    }
  }

  async cleanupExpiredResetTokens(): Promise<number> {
    try {
      const result = await executeMysqlQuery<any>(
        `DELETE FROM password_reset_tokens
         WHERE expires_at < NOW() OR verified = 1`
      );

      const deletedCount = result.affectedRows || 0;
      if (deletedCount > 0) {
        console.log(`已清理 ${deletedCount} 条过期的密码重置令牌`);
      }

      return deletedCount;
    } catch (error) {
      console.error('清理过期密码重置令牌失败:', error);
      return 0;
    }
  }
}
