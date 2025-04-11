import { Context, Next } from 'koa';
import { AppContext, ErrorResponse } from '../types';

// Custom error class
export class AppError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = async (ctx: AppContext, next: Next): Promise<void> => {
  try {
    await next();
  } catch (err) {
    const error = err as Error;
    const status = err instanceof AppError ? (err as AppError).status : 500;
    
    const errorResponse: ErrorResponse = {
      status,
      message: error.message || 'Internal Server Error',
    };
    
    // Add stack trace in development mode
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }
    
    ctx.status = status;
    ctx.body = errorResponse;
    
    // Log error
    console.error(`[${new Date().toISOString()}] Error:`, {
      status,
      message: error.message,
      stack: error.stack,
      path: ctx.path,
      method: ctx.method,
    });
  }
};
