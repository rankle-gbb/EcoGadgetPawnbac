import { Context } from 'koa';
import * as authService from '../services/authService';
import { AppError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { registerSchema, loginSchema } from '../utils/validationSchemas';

/**
 * 用户注册控制器
 * 处理用户注册请求，包含数据验证、用户创建和错误处理
 * 
 * @param ctx Koa 上下文对象
 * @returns Promise<void>
 * 
 * @throws {ValidationError} 当请求数据验证失败时
 * @throws {DuplicateError} 当用户信息（邮箱/手机号/用户名/昵称）已存在时
 * @throws {Error} 其他服务器内部错误
 * 
 * @example
 * 成功响应:
 * {
 *   code: 200,
 *   data: {
 *     id: string,
 *     username: string,
 *     nickname: string,
 *     email: string,
 *     mobile: string, // 部分隐藏的手机号
 *     role: string,
 *     token: string
 *   }
 * }
 */
export const register = async (ctx: Context): Promise<void> => {
  try {
    // 使用 Joi 验证请求数据
    const validatedData = await registerSchema.validateAsync(ctx.request.body, {
      abortEarly: false,
      stripUnknown: true
    });

    // 调用服务层注册逻辑
    const { user, token } = await authService.register(validatedData);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        mobile: user.mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
        role: user.role,
        token
      }
    };
    
  } catch (error: any) {
    // 打印详细错误信息
    console.error('Registration error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      details: error.details, // For Joi errors
      code: error.code      // For MongoDB errors
    });

    if (error.isJoi) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '参数验证失败',
        errors: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
      return;
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldMap: { [key: string]: string } = {
        email: '邮箱',
        mobile: '手机号',
        username: '用户名',
        nickname: '昵称'
      };
      
      ctx.status = 409;
      ctx.body = {
        code: 409,
        message: `${fieldMap[field] || field}已被注册`
      };
      return;
    }
    
    ctx.status = 500;
    ctx.body = { 
      code: 500, 
      message: '注册服务暂时不可用',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
};

export const login = async (ctx: Context): Promise<void> => {
  try {

    // 验证请求数据
    const validatedData = await loginSchema.validateAsync(ctx.request.body, {
      abortEarly: false,
      stripUnknown: true
    });

    // 调用服务层登录逻辑
    const { user, token } = await authService.login(validatedData.username, validatedData.password);

    // 构造响应数据
    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        isAdmin: user.isAdmin,
        token
      }
    };
    
  } catch (error: any) {
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if(error.isJoi) {
      // 参数验证错误
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '参数验证失败',
        errors: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      }
      return
    }

    if (error instanceof AppError) {
      // 业务逻辑错误
      ctx.status = error.status;
      ctx.body = {
        code: error.status,
        message: error.message
      };
      return;
    }

    // 其他服务器错误
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '登录服务暂时不可用',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

