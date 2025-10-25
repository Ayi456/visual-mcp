import express from 'express';
import { UserManager } from '../UserManager.js';
import { getSmsService } from '../SmsService.js';
import { ValidationError } from '../utils/errors.js';


export class AuthController {
  constructor(private userManager: UserManager) {}
  register = async (req: express.Request, res: express.Response) => {
    try {
      const { username, email, phone, password, display_name } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名、邮箱和密码不能为空'
        });
      }

      const userInfo = await this.userManager.createUser({
        username,
        email,
        phone,
        password,
        display_name,
        plan: 'free'
      });

      res.json({
        success: true,
        message: '注册成功',
        data: userInfo
      });
    } catch (error: any) {
      console.error('用户注册错误:', error);
      res.status(400).json({
        success: false,
        message: error.message || '注册失败'
      });
    }
  };

  login = async (req: express.Request, res: express.Response) => {
    try {
      const { phone, identifier, password, ip_address, user_agent } = req.body;
      const loginIdentifier = identifier || phone;

      if (!loginIdentifier || !password) {
        return res.status(400).json({
          success: false,
          message: '手机号/邮箱和密码不能为空'
        });
      }

      const loginResult = await this.userManager.loginUser({
        phone: loginIdentifier,
        password,
        ip_address: ip_address || req.ip,
        user_agent: user_agent || req.get('User-Agent')
      });

      if (!loginResult) {
        return res.status(401).json({
          success: false,
          message: '手机号/邮箱或密码错误'
        });
      }

      res.json({
        success: true,
        message: '登录成功',
        data: loginResult
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return res.status(401).json({
          success: false,
          message: error.message || '登录失败'
        });
      }
      console.error('用户登录错误(非预期):', error);
      res.status(400).json({
        success: false,
        message: error?.message || '登录失败'
      });
    }
  };

  changePassword = async (req: express.Request, res: express.Response) => {
    try {
      const { userId, currentPassword, newPassword } = req.body || {};
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: '参数不完整' });
      }
      await this.userManager.changePassword(userId, currentPassword, newPassword);
      return res.json({ success: true, message: '密码修改成功' });
    } catch (error: any) {
      const msg = error?.message || '修改密码失败';
      const isValidation = /密码|用户|参数/.test(msg);
      return res.status(isValidation ? 400 : 500).json({ success: false, message: msg });
    }
  };

  
  rotateAccessKey = async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ success: false, message: '邮箱与密码不能为空' });
      }

      const result = await this.userManager.rotateAccessKey(email, password);
      return res.json({ success: true, message: 'Access Key 已刷新', data: result });
    } catch (error: any) {
      const msg = error?.message || '刷新 Access Key 失败';
      const isValidation = /邮箱|密码|不存在/.test(msg);
      return res.status(isValidation ? 400 : 500).json({ success: false, message: msg });
    }
  };

  sendPasswordResetCode = async (req: express.Request, res: express.Response) => {
    try {
      const { phoneOrEmail } = req.body;

      if (!phoneOrEmail) {
        return res.status(400).json({
          success: false,
          message: '请输入手机号或邮箱'
        });
      }

      const result = await this.userManager.sendPasswordResetCode(phoneOrEmail);
      res.json(result);
    } catch (error: any) {
      console.error('发送密码重置验证码错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '发送验证码失败'
      });
    }
  };


  verifyPasswordResetCode = async (req: express.Request, res: express.Response) => {
    try {
      const { phoneOrEmail, code } = req.body;

      if (!phoneOrEmail || !code) {
        return res.status(400).json({
          success: false,
          message: '手机号/邮箱和验证码不能为空'
        });
      }

      const result = await this.userManager.verifyPasswordResetCode(phoneOrEmail, code);
      res.json(result);
    } catch (error: any) {
      console.error('验证密码重置验证码错误:', error);
      res.status(500).json({
        success: false,
        message: error.message || '验证失败'
      });
    }
  };

  resetPassword = async (req: express.Request, res: express.Response) => {
    try {
      const { phoneOrEmail, code, newPassword } = req.body;

      if (!phoneOrEmail || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '参数不完整'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '密码长度至少6位'
        });
      }

      const result = await this.userManager.resetPasswordWithCode(phoneOrEmail, code, newPassword);
      res.json(result);
    } catch (error: any) {
      console.error('重置密码错误:', error);
      res.status(400).json({
        success: false,
        message: error.message || '密码重置失败'
      });
    }
  };
}
