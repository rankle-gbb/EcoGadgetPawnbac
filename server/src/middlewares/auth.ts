import jwt from 'koa-jwt';
import { Context, Next } from 'koa';
import { AppContext } from '../types';
import { AppError } from './errorHandler';
import config from '../config';

// JWT middleware
export const jwtMiddleware = jwt({
  secret: config.jwt.secret,
}).unless({
  path: [
    /^\/api\/auth\/login/,
    /^\/api\/auth\/register/,
    /^\/api\/health/,
    /^\/api\/docs/,
  ],
});

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return async (ctx: AppContext, next: Next): Promise<void> => {
    if (!ctx.user) {
      throw new AppError('Unauthorized - No user found', 401);
    }
    
    if (!roles.includes(ctx.user.role)) {
      throw new AppError('Forbidden - Insufficient permissions', 403);
    }
    
    await next();
  };
};

// Extract user from JWT token
/**
 * 提取用户信息的中间件函数
 * 从 ctx.state.user 中获取用户信息并存储到 ctx.user 中
 * 
 * @param ctx - Koa 应用上下文对象
 * @param next - 下一个中间件函数
 * @returns Promise<void>
 * 
 * @example
 * app.use(extractUser);
 */
export const extractUser = async (ctx: AppContext, next: Next): Promise<void> => {
  if (ctx.state.user) {
    ctx.user = {
      id: ctx.state.user.id,
      username: ctx.state.user.username,
      role: ctx.state.user.role,
    };
  }
  
  await next();
};
