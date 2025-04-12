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

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .min(6)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,30}$/)
    .messages({
      'string.pattern.base': '密码必须包含大小写字母、数字和特殊字符',
      'string.min': '密码长度不能小于6位',
      'string.max': '密码长度不能超过30位',
      'any.required': '原密码不能为空'
    }),
  newPassword: Joi.string()
    .required()
    .min(6)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,30}$/)
    .invalid(Joi.ref('oldPassword'))
    .messages({
      'string.pattern.base': '密码必须包含大小写字母、数字和特殊字符',
      'string.min': '密码长度不能小于6位',
      'string.max': '密码长度不能超过30位',
      'any.required': '新密码不能为空',
      'any.invalid': '新密码不能与原密码相同'
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .messages({
      'any.only': '确认密码与新密码不匹配',
      'any.required': '确认密码不能为空'
    })
});
