import { Context, Next } from 'koa';
import Joi from 'joi';
import { AppError } from './errorHandler';

// Validation middleware factory
export const validate = (schema: Joi.Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return async (ctx: Context, next: Next): Promise<void> => {
    const data = ctx.request[property];
    
    try {
      const validatedData = await schema.validateAsync(data, {
        abortEarly: false,
        stripUnknown: true,
      });
      
      // Replace request data with validated data
      ctx.request[property] = validatedData;
      
      await next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        const errorDetails = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        
        throw new AppError(`Validation error: ${JSON.stringify(errorDetails)}`, 400);
      }
      
      throw error;
    }
  };
};
