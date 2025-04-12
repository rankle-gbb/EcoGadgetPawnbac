import { Context, Next } from 'koa';
import { AppError } from './errorHandler';

// 使用Map存储请求记录
const requestStore = new Map<string, { count: number; resetTime: number }>();

// 清理过期的记录
const cleanupStore = () => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (now >= value.resetTime) {
      requestStore.delete(key);
    }
  }
};

// 每5分钟清理一次过期记录
setInterval(cleanupStore, 5 * 60 * 1000);

export const rateLimiter = (
  prefix: string,
  maxAttempts: number,
  windowMs: number
) => {
  return async (ctx: Context, next: Next) => {
    const key = `${prefix}:${ctx.ip}`;
    const now = Date.now();

    let record = requestStore.get(key);
    if (!record || now >= record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    record.count++;
    requestStore.set(key, record);

    if (record.count > maxAttempts) {
      throw new AppError('操作过于频繁，请稍后再试', 429);
    }

    await next();
  };
};

// 导出清理方法（用于测试）
export const clearRequestStore = () => requestStore.clear();