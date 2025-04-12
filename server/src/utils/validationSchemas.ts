import Joi from 'joi';

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

export const updateUserSchema = Joi.object({
  email: Joi.string()
  .email()
  .messages({
    'string.email': '邮箱格式不正确'
  }),

  mobile: Joi.string()
  .pattern(/^(?:(?:\+|00)86)?1[3-9]\d{9}$/)
  .messages({
    'string.pattern.base': '手机号格式不正确'
  }),

  nickname: Joi.string()
  .min(1)
  .max(8)
  .messages({
    'string.max': '昵称不能超过8个字符'
  }),

  isAdmin: Joi.boolean()
  .messages({
    'boolean.base': 'isAdmin必须是布尔值'
  })
}).min(1).messages({
  'object.min': '至少需要修改一个字段'
});
