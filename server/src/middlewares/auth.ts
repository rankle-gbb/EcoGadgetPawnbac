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
    /^\/api\/users\/register/,
    /^\/api\/users\/login/,
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

export const requireLoginToken = async (ctx: AppContext, next: Next): Promise<void> => {
  if (!ctx.state.user) {
    throw new AppError('未登录或登录已过期', 401);
  }

  if (ctx.state.user.tokenType !== 'login') {
    throw new AppError('需要登录后才能访问', 401);
  }

  await next();
};

// 超管权限验证中间件
export const requireSuperAdmin = async (ctx: AppContext, next: Next): Promise<void> => {
  if (!ctx.user) {
    throw new AppError('未登录或登录已过期', 401);
  }

  if (!ctx.user.isSuperAdmin || ctx.user.role !== 'superAdmin') {
    throw new AppError('需要超级管理员权限', 403);
  }

  await next();
};