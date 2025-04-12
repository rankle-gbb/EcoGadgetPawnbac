import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import config from '../config';
import { UpdateUserData } from '../types';

/**
 * 用户注册服务
 *
 * @param userData - 用户注册信息
 * @param userData.username - 用户名
 * @param userData.nickname - 昵称
 * @param userData.password - 密码
 * @param userData.email - 电子邮箱
 * @param userData.mobile - 手机号码
 * @param userData.role - 用户角色
 *
 * @returns {Promise<{user: User, token: string}>} 返回创建的用户信息和JWT令牌
 *   - user: 创建的用户对象
 *   - token: JWT身份验证令牌
 *
 * @throws {Error} 当用户创建失败或token生成失败时抛出错误
 */
export const register = async (userData: {
  username: string;
  nickname: string;
  password: string;
  email: string;
  mobile: string;
  role: string;
}) => {
  try {
    console.log('Register service called with data:', {
      ...userData,
      password: '******' // 不输出密码
    });

    // 密码加密
    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(userData.password, saltRounds);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      throw new Error('密码加密失败');
    }

    // 创建用户
    let user;
    try {
      user = await User.create({
        ...userData,
        password: hashedPassword,
        isAdmin: userData.role === 'admin'  // 根据实际业务逻辑调整
      });
    } catch (dbError: any) {
      console.error('User creation error:', dbError);
      if (dbError.code === 11000) {
        // 重复键错误
        const field = Object.keys(dbError.keyPattern)[0];
        throw dbError; // 保留原始错误以便控制器可以识别重复键错误
      }
      throw new Error(`用户创建失败: ${dbError.message}`);
    }

    // 生成JWT
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, role: user.role, tokenType: 'register' },
        config.jwt.secret as string,
        { algorithm: 'HS256', expiresIn: '24h'}  // 注册 token 有效期设置短一些 
      );
    } catch (jwtError) {
      console.error('JWT generation error:', jwtError);
      throw new Error('Token 生成失败');
    }

    console.log('User registered successfully:', { id: user._id, username: user.username });
    return { user, token };
  } catch (error) {
    console.error('User registration error:', error);
    throw error;
  }
};


/**
 * 用户登录认证服务
 *
 * @param username - 用户名
 * @param password - 密码
 * @returns Promise<{user: IUser, token: string}> - 返回用户信息和JWT令牌
 * @throws {AppError} 401 - 当用户名不存在或密码错误时抛出认证错误
 *
 * @description
 * 验证用户凭据并生成JWT令牌。流程如下：
 * 1. 根据用户名查找用户
 * 2. 验证密码是否匹配
 * 3. 生成包含用户ID、用户名和角色的JWT令牌
 */
export const login = async (
  username: string,
  password: string
): Promise<{ user: IUser; token: string }> => {
  // Find user
  const user = await User.findOne({ username });

  if (!user) {
    throw new AppError('用户名或密码错误', 401);
  }

  // 验证密码
  // const hashedPassword = await bcrypt.hash(password, user.salt);
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError('用户名或密码错误', 401);
  }

  // 生成 JWT token
  const token = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      role: user.role,
      tokenType: 'login'  // 登录 token
    },
    config.jwt.secret as string,
    {
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );

  return { user, token };
};

/**
 * 根据用户ID获取用户信息
 *
 * @param userId - 用户ID
 * @returns Promise<IUser> - 返回用户信息
 * @throws {AppError} 404 - 当用户不存在时抛出错误
 */
export const getUserById = async (userId: string): Promise<IUser> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return user;
  } catch (error: any) {
    // 处理 MongoDB 的 CastError（无效的 ObjectId）
    if (error.name === 'CastError') {
      throw new AppError('无效的用户ID', 400);
    }
    throw error;
  }
};

export const updateUser = async (userId: string, 
  updateData: UpdateUserData,
  currentUser: IUser
): Promise<IUser> => {
   try {
    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      throw new AppError('用户不存在', 404);
    }

    console.log('current', currentUser);
    

    // 只允许用户修改自己的信息
    if (currentUser.userId !== userId) {
      throw new AppError('只能修改自己的信息', 403);
    }

    // 移除管理员相关字段，这部分留待后台管理系统实现
    // const { isAdmin, role, ...safeUpdateData } = updateData;

    // 如果是修改 isAdmin 字段 检查是不是超级管理员权限
    // if (updateData.isAdmin !== undefined && !currentUser.isAdmin) {
    //   throw new AppError('只有管理员可以修改用户角色', 403);
    // }

    // 只保留发生变化的字段
    const changedFields = Object.entries(updateData).reduce((acc, [key, value]) => {
      // 只有当值存在且与当前值不同时才包含该字段
      if (value !== undefined && value !== (userToUpdate as any)[key]) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    // 如果没有任何字段发生变化
    if (Object.keys(changedFields).length === 0) {
      return userToUpdate;
    }

     // 只对发生变化的字段进行唯一性检查
    if (changedFields.email) {
      const emailExists = await User.findOne({ 
        email: changedFields.email, 
        _id: { $ne: userId } 
      });
      if (emailExists) {
        throw new AppError('该邮箱已被使用', 409);
      }
    }

    if (changedFields.mobile) {
      const mobileExists = await User.findOne({
        mobile: changedFields.mobile,
        _id: { $ne: userId }
      });
      if (mobileExists) {
        throw new AppError('该手机号已被使用', 409);
      }
    }

   // 只更新发生变化的字段
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...changedFields,
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true,
        select: '-password -salt'
      }
    );

    if (!updatedUser) {
      throw new AppError('更新用户信息失败', 500);
    }
    return updatedUser;
  } catch (error: any) {
    // 处理 MongoDB 的 CastError（无效的 ObjectId）
    if (error.name === 'CastError') {
      throw new AppError('无效的用户ID', 400);
    }
    throw error;
  }
}

/**
 * 修改用户密码
 * @param userId 用户ID
 * @param oldPassword 原密码
 * @param newPassword 新密码
 */
export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<void> => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 验证原密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new AppError('原密码不正确', 401);
    }

    // 加密新密码
    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      throw new Error('密码加密失败');
    }

    // 更新密码
    await User.findByIdAndUpdate(userId, { 
      password: hashedPassword,
      updatedAt: new Date()
    });

  } catch (error) {
     if (error instanceof AppError) {
      throw error;
    }
    console.error('Password change error:', error);
    throw new AppError('密码修改失败', 500);
  
  }
}
