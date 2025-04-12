import jwt from 'jsonwebtoken';
import { Secret, SignOptions } from 'jsonwebtoken';
import config from '../config';
import { AppError } from '../middlewares/errorHandler';

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  tokenType: 'register' | 'login';  // 添加 token 类型
}

export class AuthService {
  /**
   * 生成 JWT Token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      config.jwt.secret as Secret,
      { 
        expiresIn: config.jwt.expiresIn,
        algorithm: 'HS256'
      } as SignOptions
    );
  }

  /**
   * 验证 JWT Token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwt.secret as Secret) as TokenPayload;
    } catch (error) {
      throw new AppError('无效的token', 401);
    }
  }

  /**
   * 刷新 Token
   */
  static refreshToken(oldToken: string): string {
    const decoded = this.verifyToken(oldToken);
    return this.generateToken({
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      tokenType: 'login'  // 刷新后的token应该是登录token
    });
  }

  /**
   * 检查权限
   */
  static checkPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }
}