import Joi from 'joi';

// User registration schema
// export const registerSchema = Joi.object({
//   username: Joi.string().min(3).max(30).required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
// });

export const registerSchema = Joi.object({
  username: Joi.string()
    .max(30)
    .required()
    .messages({
      'string.min': '用户名至少需要3个字符',
      'string.max': '用户名不能超过30个字符',
      'any.required': '用户名是必填项'
    }),
  
  nickname: Joi.string()
    .max(8)
    .required()
    .messages({
      'any.required': '昵称是必填项'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱是必填项'
    }),

  mobile: Joi.string()
    .pattern(/^(?:(?:\+|00)86)?1[3-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': '手机号格式不正确',
      'any.required': '手机号是必填项'
    }),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': '密码至少需要6个字符',
      'any.required': '密码是必填项'
    }),

  role: Joi.string()
    .valid('user', 'admin')
    .default('user')
    .messages({
      'any.only': '角色只能是 user 或 admin'
    })
});

export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': '用户名是必填项'
    }),

    password: Joi.string()
    .required()
    .messages({
      'any.required': '密码是必填项'
    }),

})
// User login schema
// export const loginSchema = Joi.object({
//   username: Joi.string().required(),
//   password: Joi.string().required(),
// });
