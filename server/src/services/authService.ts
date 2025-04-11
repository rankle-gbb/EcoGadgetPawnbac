import jwt, { type Secret } from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import { AppError } from '../middlewares/errorHandler';
import config from '../config';

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
  // 密码加密
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

  // 创建用户
  const user = await User.create({
    ...userData,
    password: hashedPassword,
    isAdmin: userData.role === 'admin'  // 根据实际业务逻辑调整
  });

  // 生成JWT
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  return { user, token };
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
      role: user.role
    },
     config.jwt.secret as Secret,
    { expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256'  
     }
  );
  
  return { user, token };
};

// // Get user by ID
// export const getUserById = async (id: string): Promise<IUser> => {
//   const user = await User.findById(id);
  
//   if (!user) {
//     throw new AppError('User not found', 404);
//   }
  
//   return user;
// };
