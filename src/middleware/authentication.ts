import express from 'express';
import { UserManager } from '../UserManager.js';
import { User } from '../types.js';
declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: User;
      pendingUser?: User;
    }
  }
}

export async function authenticateUser(
  req: express.Request,
  userManager: UserManager
): Promise<{ user: User | null; errorType?: string; errorMessage?: string }> {
  try {
    const accessId = req.get('AccessID') as string | undefined;
    const authHeader = req.get('AccessKey') as string | undefined;

    if (!accessId || !authHeader) {
      console.error('缺少认证头:', {
        hasAccessId: !!accessId,
        hasAuthHeader: !!authHeader
      });
      return {
        user: null,
        errorType: 'MISSING_CREDENTIALS',
        errorMessage: !accessId && !authHeader
          ? '缺少 AccessID 和 AccessKey'
          : !accessId
          ? '缺少 AccessID'
          : '缺少 AccessKey'
      };
    }

    // 提取 Bearer token 并清理空白字符
    let accessKey = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // 清理 AccessKey，去除所有空白字符和换行符
    accessKey = accessKey.trim().replace(/[\r\n\t\s]/g, '');
    // 去除可能包裹的引号
    accessKey = accessKey.replace(/^[\"']+|[\"']+$/g, '');

    if (!accessKey) {
      console.error('无效的 Authorization 头格式');
      return {
        user: null,
        errorType: 'INVALID_FORMAT',
        errorMessage: 'AccessKey 格式无效'
      };
    }

    console.log('开始验证用户:', {
      accessId: accessId.trim(),
      accessKeyLength: accessKey.length,
      rawKeyLength: authHeader.length,
      hasBearer: authHeader.startsWith('Bearer ')
    });

    // 验证用户凭据
    const user = await userManager.validateUserCredentials(accessId, accessKey);

    if (user) {
      console.log('用户验证成功:', {
        userId: user.id,
        username: user.username,
        plan: user.plan
      });
      return { user };
    } else {
      console.error('用户验证失败:', { accessId });
      return {
        user: null,
        errorType: 'INVALID_CREDENTIALS',
        errorMessage: 'AccessID 或 AccessKey 无效或已过期'
      };
    }

  } catch (error) {
    console.error('用户身份验证过程中出错:', error);
    return {
      user: null,
      errorType: 'AUTH_ERROR',
      errorMessage: '身份验证过程出错'
    };
  }
}

/**
 * 创建 SQL API 认证中间件
 */
export function createSqlAuthMiddleware(userManager: UserManager) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      // 尝试验证用户身份
      const authResult = await authenticateUser(req, userManager);

      if (!authResult.user) {
        // 根据不同的错误类型返回更详细的错误信息
        let message = authResult.errorMessage || '未授权：请提供有效的 AccessID 和 AccessKey';
        let errorCode = authResult.errorType || 'UNAUTHORIZED';

        // 为过期或无效凭据提供更友好的提示
        if (authResult.errorType === 'INVALID_CREDENTIALS') {
          message = 'AccessKey 无效或已过期，请在个人中心刷新 AccessKey 后重试';
          errorCode = 'INVALID_OR_EXPIRED_KEY';
        }

        return res.status(401).json({
          success: false,
          message,
          errorCode,
          hint: authResult.errorType === 'INVALID_CREDENTIALS'
            ? '💡 提示：您可以在个人中心页面刷新 AccessKey'
            : undefined
        });
      }

      // 将认证用户信息附加到请求对象
      req.authenticatedUser = authResult.user;

      console.log(`SQL API 认证成功: userId=${authResult.user.id}, username=${authResult.user.username}`);
      next();
    } catch (error) {
      console.error('SQL API 认证错误:', error);
      res.status(500).json({
        success: false,
        message: '认证过程出错',
        errorCode: 'AUTH_ERROR'
      });
    }
  };
}
