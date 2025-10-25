import express from 'express';
import { UserManager } from '../UserManager.js';
import { getSmsService } from '../SmsService.js';

export class SmsController {
  constructor(private userManager: UserManager) {}

  sendCode = async (req: express.Request, res: express.Response) => {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: '手机号不能为空'
        });
      }

      const existingUser = await this.userManager.getUserByPhone(phone);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该手机号已注册'
        });
      }

      const smsService = getSmsService();
      const result = await smsService.sendVerifyCode(phone);

      res.json(result);
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '发送验证码失败'
      });
    }
  };

  /**
   * 验证短信验证码
   */
  verifyCode = async (req: express.Request, res: express.Response) => {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          message: '手机号和验证码不能为空'
        });
      }

      // 验证验证码
      const smsService = getSmsService();
      const result = await smsService.verifyCode(phone, code);

      res.json(result);
    } catch (error: any) {
      console.error('验证码验证失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '验证失败'
      });
    }
  };
}
