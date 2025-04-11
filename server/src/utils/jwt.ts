import jwt from 'jsonwebtoken';
import config from '../config';

// 生成令牌
export const generateToken = (payload: any): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

// 验证令牌
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('无效的令牌');
  }
};
