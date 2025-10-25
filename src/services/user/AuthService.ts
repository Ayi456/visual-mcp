import argon2 from 'argon2';
import { executeMysqlQuery } from '../../database.js';
import { ValidationError } from '../../utils/errors.js';
import { ValidationUtils } from '../../utils/ValidationUtils.js';
import { UserUtils } from '../../utils/UserUtils.js';
import { User, UserInfo, LoginUserArgs } from '../../types.js';

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1,
      });
    } catch (error) {
      throw new Error(`密码哈希失败: ${error}`);
    }
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      throw new Error(`密码验证失败: ${error}`);
    }
  }

  async loginUser(args: LoginUserArgs): Promise<{ user: UserInfo; accessKey?: string } | null> {
    try {
      const isEmail = ValidationUtils.validateEmail(args.phone);
      const isPhone = ValidationUtils.validatePhone(args.phone);

      if (!isEmail && !isPhone) {
        throw new ValidationError('请输入有效的手机号或邮箱地址');
      }

      const query = isEmail
        ? 'SELECT * FROM users WHERE email = ? LIMIT 1'
        : 'SELECT * FROM users WHERE phone = ? LIMIT 1';

      const users = await executeMysqlQuery<User[]>(query, [args.phone]);

      if (users.length === 0) {
        throw new ValidationError('用户不存在');
      }

      const user = users[0];

      if (user.status !== 'active') {
        throw new Error('账户已被停用或删除');
      }

      if (user.locked_until && new Date() < user.locked_until) {
        throw new Error('账户已被锁定，请稍后再试');
      }

      const isValidPassword = await this.verifyPassword(args.password, user.password_hash);

      if (!isValidPassword) {
        await this.incrementLoginAttempts(user.id);
        throw new ValidationError('密码错误');
      }

      await executeMysqlQuery(
        'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
        [user.id]
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          access_id: user.access_id,
          plan: user.plan,
          quota_daily: user.quota_daily,
          quota_monthly: user.quota_monthly,
          quota_used_today: user.quota_used_today,
          quota_used_month: user.quota_used_month,
          status: user.status,
          email_verified: user.email_verified,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          bio: user.bio,
          created_at: user.created_at,
          last_login_at: new Date()
        }
      };

    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error(`用户登录失败: ${error}`);
    }
  }

  async incrementLoginAttempts(userId: string): Promise<void> {
    await executeMysqlQuery(
      `UPDATE users SET
        login_attempts = login_attempts + 1,
        locked_until = CASE
          WHEN login_attempts >= 4 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
          ELSE locked_until
        END
      WHERE id = ?`,
      [userId]
    );
  }

  async verifyAccessKey(accessId: string, accessKey: string): Promise<boolean> {
    try {
      const users = await executeMysqlQuery<User[]>(
        'SELECT * FROM users WHERE access_id = ? AND status = "active" LIMIT 1',
        [accessId]
      );

      if (users.length === 0) {
        return false;
      }

      return await this.verifyPassword(accessKey, users[0].access_key_hash);
    } catch (error) {
      throw new Error(`验证AccessKey失败: ${error}`);
    }
  }

  async rotateAccessKey(email: string, password: string): Promise<{ accessKey: string }> {
    if (!ValidationUtils.validateEmail(email)) {
      throw new Error('邮箱格式无效');
    }
    if (!password || password.length < 6) {
      throw new Error('密码无效');
    }

    try {
      const users = await executeMysqlQuery<User[]>(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      if (users.length === 0) {
        throw new Error('用户不存在');
      }

      const user = users[0];
      const ok = await this.verifyPassword(password, user.password_hash);
      if (!ok) {
        throw new Error('密码错误');
      }

      const newKey = UserUtils.generateAccessKey();
      const newKeyHash = await this.hashPassword(newKey);
      await executeMysqlQuery(
        'UPDATE users SET access_key_hash = ?, updated_at = NOW() WHERE id = ? LIMIT 1',
        [newKeyHash, user.id]
      );

      return { accessKey: newKey };
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new Error(`刷新 Access Key 失败: ${error}`);
    }
  }

  async validateUserCredentials(accessId: string, accessKey: string): Promise<User | null> {
    try {
      if (!accessId || !accessKey) {
        console.log('缺少凭据:', { hasAccessId: !!accessId, hasAccessKey: !!accessKey });
        return null;
      }

      const cleanAccessId = accessId.trim();
      let cleanAccessKey = accessKey.trim().replace(/\s/g, '');
      cleanAccessKey = cleanAccessKey.replace(/^[\"']+|[\"']+$/g, '');
      
      if (cleanAccessKey.length !== 64) {
        console.error('AccessKey 长度不正确:', {
          accessId: cleanAccessId,
          expectedLength: 64,
          actualLength: cleanAccessKey.length,
          rawLength: accessKey.length,
          first10Chars: cleanAccessKey.substring(0, 10),
          last10Chars: cleanAccessKey.substring(cleanAccessKey.length - 10)
        });
      }
      
      if (!/^[a-f0-9]{64}$/i.test(cleanAccessKey)) {
        console.error('AccessKey 格式不正确（应为64位十六进制字符串）:', {
          accessId: cleanAccessId,
          pattern: 'Expected: /^[a-f0-9]{64}$/i'
        });
      }

      const users = await executeMysqlQuery<User[]>(
        'SELECT * FROM users WHERE access_id = ? AND status = "active" LIMIT 1',
        [cleanAccessId]
      );

      if (users.length === 0) {
        console.error('用户不存在', cleanAccessId);
        return null;
      }

      const user = users[0];
      const isValidKey = await this.verifyPassword(cleanAccessKey, user.access_key_hash);
      if (!isValidKey) {
        console.error('AccessKey 验证失败:', {
          accessId: cleanAccessId,
          keyLength: cleanAccessKey.length
        });
        return null;
      }

      await executeMysqlQuery(
        'UPDATE users SET last_api_call_at = NOW() WHERE id = ?',
        [user.id]
      );

      console.log('用户验证成功:', { userId: user.id, username: user.username, accessId });
      return user;

    } catch (error) {
      console.error('验证用户凭据失败:', error);
      return null;
    }
  }
}
