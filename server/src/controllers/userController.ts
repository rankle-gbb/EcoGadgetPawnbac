import { Context } from 'koa';
import * as userService from '../services/userService';
import { AppError } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validation';
import { UpdateUserData } from '../types';
import { maskMobile } from '../utils/maskUtils'; 
import { registerSchema, loginSchema, updateUserSchema, changePasswordSchema, resetPasswordSchema } from '../utils/validationSchemas';
import type { AnyExpression } from 'mongoose'

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
 *     userId: string,
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
    const { user, token } = await userService.register(validatedData);

    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: {
        userId: user._id,
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

/**
 * 用户登录控制器
 * 处理用户登录请求，验证用户凭据并返回用户信息和访问令牌
 *
 * @param ctx Koa 上下文对象
 * @returns Promise<void>
 *
 * @throws {ValidationError} 当请求参数验证失败时
 * @throws {AppError} 当业务逻辑出现错误时
 * @throws {Error} 当服务器发生未知错误时
 *
 * @example
 * // 成功响应
 * {
 *   code: 200,
 *   data: {
 *     userId: string,
 *     username: string,
 *     nickname: string,
 *     role: string,
 *     email: string,
 *     createdAt: string,
 *     isAdmin: boolean,
 *     token: string
 *   }
 * }
 */
export const login = async (ctx: Context): Promise<void> => {
  try {

    // 验证请求数据
    const validatedData = await loginSchema.validateAsync(ctx.request.body, {
      abortEarly: false,
      stripUnknown: true
    });

    // 调用服务层登录逻辑
    const { user, token } = await userService.login(validatedData.username, validatedData.password);

    // 构造响应数据
    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        createdAt: new Date(),
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

/**
 * 获取用户个人资料的控制器方法
 * 
 * @param ctx Koa 上下文对象
 * @returns Promise<void>
 * 
 * @description
 * 该方法从请求上下文中获取已认证用户的 ID，并返回用户的详细信息。
 * 返回的用户信息包括：用户ID、用户名、昵称、邮箱、手机号(已脱敏)、角色和管理员状态。
 * 
 * @throws {AppError} 当发生业务逻辑错误时
 * @throws {Error} 当发生其他服务器错误时
 * 
 * @example
 * 成功响应:
 * {
 *   code: 200,
 *   data: {
 *     userId: string,
 *     username: string,
 *     nickname: string,
 *     email: string,
 *     mobile: string,
 *     role: string,
 *     isAdmin: boolean
 *   }
 * }
 */
export const getUserProfile = async (ctx: Context): Promise<void> => {
  try {
    // 从上下文中获取用户ID
    const userId = (ctx.state.user?.userId || ctx.state.user?.id);

    if (!userId) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '未获取到用户ID'
      };
      return;
    }

    // 调用服务层获取用户信息
    const user = await userService.getUserById(userId);

    // 构造响应数据
    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        mobile: maskMobile(user.mobile),
        role: user.role,
        isAdmin: user.isAdmin
      }
    };
  } catch (error: any) {
    console.error('Get user profile error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error instanceof AppError) {
      // 业务错误
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
      message: '获取用户信息失败',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

/**
 * 更新用户信息的控制器方法
 * 
 * @description 处理用户信息更新请求，包括验证用户登录状态、请求数据验证、调用服务更新信息等
 * @param {Context} ctx - Koa 上下文对象，包含请求和响应信息
 * @throws {AppError} 当用户未登录、验证失败或更新操作失败时抛出相应错误
 * @returns {Promise<void>} 返回更新后的用户信息或错误信息
 * 
 * @example
 * 成功响应:
 * {
 *   code: 200,
 *   data: {
 *     userId: string,
 *     username: string,
 *     nickname: string,
 *     email: string,
 *     mobile: string,
 *     role: string,
 *     isAdmin: boolean,
 *     updatedAt: Date
 *   }
 * }
 */
export const updateUserInfo = async (ctx: Context): Promise<void> => {
  try {
    const userId = ctx.params.id; 

    // 验证请求数据
    let updateData: UpdateUserData;
    try {
      // 检查请求体是否为空
      if (!ctx.request.body || Object.keys(ctx.request.body).length === 0) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '请求体不能为空'
        };
        return;
      }

      const value = await updateUserSchema.validateAsync(
        ctx.request.body,
        {
          abortEarly: false,
          stripUnknown: true
        }
      );
      // 确保验证后的值不为空
      if (!value || Object.keys(value).length === 0) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '没有有效的更新字段'
        };
        return;
      }

      

      updateData = value;


    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '参数验证失败',
        errors: validationError.details?.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
      return;
    }

    // 调用service 更新用户信息
    const updatedUser = await userService.updateUser(
    userId,
    updateData, 
    ctx.state.user // 从JWT中获取的当前登录用户信息

    );

    // 返回更新后的用户信息
    ctx.status = 200;
    ctx.body = {
      code: 200,
      data: {
        userId: updatedUser._id,
        username: updatedUser.username,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        mobile: maskMobile(updatedUser.mobile),
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
        updatedAt: updatedUser.updatedAt
      }
    };
    
  } catch (error: AnyExpression) {
    // 增强错误日志
    console.error('Update user error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        status: error.status,
        code: error.code
      },
      requestBody: ctx.request.body,
      userId: ctx.params.id,
      currentUser: ctx.state.user
    });
    
    if (error instanceof AppError) {
      ctx.status = error.status;
      ctx.body = {
        code: error.status,
        message: error.message
      };
      return;
    }

    // MongoDB duplicate key error
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
        message: `${fieldMap[field] || field}已被使用`
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '修改用户信息失败',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}

/**
 * 修改用户密码控制器
 * @param ctx Koa 上下文对象
 * @returns Promise<void>
 */
export const changePassword = async (ctx: Context): Promise<void> => {
  
  try {
    // 验证请求数据
    let validatedData;
    try {
      validatedData = await changePasswordSchema.validateAsync(
        ctx.request.body,
        {
          abortEarly: false,
          stripUnknown: true
        }
      );
    } catch (validationError: any) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '参数验证失败',
        errors: validationError.details?.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
      return;
    }

    // 调用service修改密码
    await userService.changePassword(
      ctx.state.user.id,
      validatedData.oldPassword,
      validatedData.newPassword
    );

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '密码修改成功'
    };
  } catch (error: AnyExpression) {
    // 增强错误日志
    console.error('Change password error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        status: error.status
      },
      userId: ctx.state.user?.userId
    });
    
    if (error instanceof AppError) {
      ctx.status = error.status;
      ctx.body = {
        code: error.status,
        message: error.message
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '密码修改失败'
    };
  }
}

/**
 * 超级管理员重置管理员密码
 * @param ctx Koa 上下文对象
 */
export const resetAdminPassword = async (ctx: Context): Promise<void> => {
  try {
    const { id } = ctx.params;
    // Explicitly type or cast ctx.request.body
        const { newPassword, confirmPassword, reason } = ctx.request.body as { newPassword: string; confirmPassword: string; reason?: string };

    // 验证密码
    if (newPassword !== confirmPassword) {
      throw new AppError('两次输入的密码不一致', 400);
    }

    // 验证密码强度
    const passwordValidation = await resetPasswordSchema.validateAsync(
      { newPassword },
      { abortEarly: false }
    );

    await userService.resetAdminPassword(
      id,
      passwordValidation.newPassword,
      ctx.state.user,
      ctx
    );

    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: '管理员密码重置成功'
    };
  } catch (error: AnyExpression) {
    console.error('Reset admin password error:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      adminId: ctx.params.id,
      operatorId: ctx.state.user?.id
    });

    if (error instanceof AppError) {
      ctx.status = error.status;
      ctx.body = {
        code: error.status,
        message: error.message
      };
      return;
    }

    if (error.isJoi) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '密码格式不正确',
        errors: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: '重置密码失败'
    };
  }
};

