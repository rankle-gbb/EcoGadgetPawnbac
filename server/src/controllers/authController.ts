import { Context } from 'koa';
import { AuthService } from '../services/authService';
import { AppError } from '../middlewares/errorHandler';

export class AuthController {
  /**
   * 刷新访问令牌
   */
  static async refreshToken(ctx: Context): Promise<void> {
    try {
      const oldToken = ctx.request.body.token || ctx.headers.authorization?.split(' ')[1];
      
      if (!oldToken) {
        throw new AppError('需要提供token', 400);
      }

      const newToken = AuthService.refreshToken(oldToken);
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        data: { token: newToken }
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        ctx.status = error.status;
        ctx.body = { code: error.status, message: error.message };
        return;
      }

      ctx.status = 500;
      ctx.body = { 
        code: 500, 
        message: '刷新token失败',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * 登出
   */
  static async logout(ctx: Context): Promise<void> {
    try {
      // 这里可以实现token黑名单等逻辑
      // 如果使用Redis，可以将当前token加入黑名单
      
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: '登出成功'
      };
    } catch (error: any) {
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '登出失败',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
}