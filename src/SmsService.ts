import * as tencentcloud from "tencentcloud-sdk-nodejs-sms";
import { executeMysqlQuery, executeRedisCommand, getRedisClient } from './database.js';
import crypto from 'crypto';

const SmsClient = tencentcloud.sms.v20210111.Client;

// 短信配置接口
export interface SmsConfig {
  secretId: string;
  secretKey: string;
  region: string;
  sdkAppId: string;
  signName: string;
  templateId: string;
}

// 验证码信息接口
export interface VerifyCodeInfo {
  phone: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
}

/**
 * 短信服务管理器
 */
export class SmsService {
  private smsClient: any;
  private config: SmsConfig;
  private codeExpireMinutes: number = 15; // 验证码过期时间（分钟）
  private maxAttempts: number = 5; // 最大尝试次数
  
  constructor(config?: Partial<SmsConfig>) {
    this.config = {
      secretId: config?.secretId || process.env.TENCENT_SECRET_ID || '',
      secretKey: config?.secretKey || process.env.TENCENT_SECRET_KEY || '',
      region: config?.region || process.env.TENCENT_REGION || 'ap-guangzhou',
      sdkAppId: config?.sdkAppId || process.env.SMS_SDK_APP_ID || '1400535378',
      signName: config?.signName || process.env.SMS_SIGN_NAME || '札记网络科技',
      templateId: config?.templateId || process.env.SMS_TEMPLATE_ID || '1106723',
    };
    
    this.initClient();
  }
  
  /**
   * 初始化腾讯云短信客户端
   */
  private initClient(): void {
    const clientConfig = {
      credential: {
        secretId: this.config.secretId,
        secretKey: this.config.secretKey,
      },
      region: this.config.region,
      profile: {
        httpProfile: {
          endpoint: "sms.tencentcloudapi.com",
        },
      },
    };
    
    this.smsClient = new SmsClient(clientConfig);
  }
  
  /**
   * 生成随机验证码
   */
  private generateCode(length: number = 6): string {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return code;
  }
  
  /**
   * 发送验证码
   */
  public async sendVerifyCode(phone: string, minute?: number): Promise<{ success: boolean; message: string; code?: string }> {
    try {
      // 检查手机号格式
      if (!this.isValidPhoneNumber(phone)) {
        return { success: false, message: '无效的手机号码' };
      }
      
      // 检查发送频率限制（60秒内只能发送一次）
      const rateLimitKey = `sms:rate:${phone}`;
      const isRateLimited = await executeRedisCommand(async () => {
        const client = getRedisClient();
        const exists = await client.exists(rateLimitKey);
        if (exists) {
          return true;
        }
        await client.setEx(rateLimitKey, 60, '1');
        return false;
      });
      
      if (isRateLimited) {
        return { success: false, message: '发送过于频繁，请稍后再试' };
      }
      
      // 生成验证码
      const code = this.generateCode();
      const expireMinutes = minute || this.codeExpireMinutes;
      
      // 调用腾讯云API发送短信
      const params = {
        PhoneNumberSet: [`+86${phone}`],
        SmsSdkAppId: this.config.sdkAppId,
        SignName: this.config.signName,
        TemplateId: this.config.templateId,
        TemplateParamSet: [code, String(expireMinutes)],
      };
      
      const response = await this.smsClient.SendSms(params);

      if (response.SendStatusSet && response.SendStatusSet[0].Code === "Ok") {
        // 保存验证码到数据库
        await this.saveVerifyCode(phone, code, expireMinutes);

        // 同时缓存到Redis（用于快速验证）
        const cacheKey = `sms:code:${phone}`;
        await executeRedisCommand(async () => {
          const client = getRedisClient();
          await client.setEx(cacheKey, expireMinutes * 60, code);
        });

        console.log('验证码已发送并保存:', { phone, codeLength: code.length, expireMinutes });

        return {
          success: true,
          message: '验证码发送成功',
          code: code  // 内部始终返回验证码供系统使用，API层可以根据环境决定是否暴露
        };
      } else {
        console.error('短信发送失败:', response);
        return { success: false, message: '短信发送失败，请稍后再试' };
      }
    } catch (error) {
      console.error('发送验证码失败:', error);
      return { success: false, message: '系统错误，请稍后再试' };
    }
  }
  
  /**
   * 验证验证码
   */
  public async verifyCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      // 先从Redis缓存中查找
      const cacheKey = `sms:code:${phone}`;
      const cachedCode = await executeRedisCommand(async () => {
        const client = getRedisClient();
        return await client.get(cacheKey);
      });
      
      if (cachedCode === code) {
        // 验证成功，删除缓存
        await executeRedisCommand(async () => {
          const client = getRedisClient();
          await client.del(cacheKey);
        });
        
        // 标记数据库中的验证码为已使用
        await this.markCodeAsUsed(phone, code);
        
        return { success: true, message: '验证成功' };
      }
      
      // 如果缓存中没有，从数据库查找
      const result = await executeMysqlQuery<any[]>(
        `SELECT * FROM sms_codes 
         WHERE phone = ? AND code = ? AND verified = 0 
         AND expires_at > NOW() AND attempts < ?
         ORDER BY created_at DESC LIMIT 1`,
        [phone, code, this.maxAttempts]
      );
      
      if (result.length > 0) {
        // 验证成功
        await this.markCodeAsUsed(phone, code);
        return { success: true, message: '验证成功' };
      } else {
        // 增加尝试次数
        await this.incrementAttempts(phone);
        return { success: false, message: '验证码错误或已过期' };
      }
    } catch (error) {
      console.error('验证码验证失败:', error);
      return { success: false, message: '验证失败，请重试' };
    }
  }
  
  /**
   * 保存验证码到数据库
   */
  private async saveVerifyCode(phone: string, code: string, expireMinutes: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expireMinutes * 60 * 1000);
    
    await executeMysqlQuery(
      `INSERT INTO sms_codes (phone, code, expires_at, created_at, verified, attempts)
       VALUES (?, ?, ?, NOW(), 0, 0)`,
      [phone, code, expiresAt]
    );
  }
  
  /**
   * 标记验证码为已使用
   */
  private async markCodeAsUsed(phone: string, code: string): Promise<void> {
    await executeMysqlQuery(
      `UPDATE sms_codes SET verified = 1 WHERE phone = ? AND code = ?`,
      [phone, code]
    );
  }
  
  /**
   * 增加尝试次数
   */
  private async incrementAttempts(phone: string): Promise<void> {
    await executeMysqlQuery(
      `UPDATE sms_codes 
       SET attempts = attempts + 1 
       WHERE phone = ? AND verified = 0 AND expires_at > NOW()`,
      [phone]
    );
  }
  
  /**
   * 验证手机号格式
   */
  private isValidPhoneNumber(phone: string): boolean {
    // 中国手机号正则
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
  
  /**
   * 清理过期验证码
   */
  public async cleanupExpiredCodes(): Promise<number> {
    try {
      const result = await executeMysqlQuery<any>(
        `DELETE FROM sms_codes WHERE expires_at < NOW() OR verified = 1`
      );
      return result.affectedRows || 0;
    } catch (error) {
      console.error('清理过期验证码失败:', error);
      return 0;
    }
  }
}

// 导出单例
let smsServiceInstance: SmsService | null = null;

export function initSmsService(config?: Partial<SmsConfig>): SmsService {
  if (!smsServiceInstance) {
    smsServiceInstance = new SmsService(config);
  }
  return smsServiceInstance;
}

export function getSmsService(): SmsService {
  if (!smsServiceInstance) {
    throw new Error('SmsService未初始化');
  }
  return smsServiceInstance;
}