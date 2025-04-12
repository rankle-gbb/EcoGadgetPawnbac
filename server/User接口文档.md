### 用户管理接口文档（RESTful API）

#### 接口概览
| 功能模块       | 接口路径                | 方法   | 鉴权要求         | 数据敏感等级 |
|----------------|-------------------------|--------|------------------|--------------|
| 用户认证       | /api/auth/*            | POST   | 无               | 高           |
| 用户资料管理   | /api/users/profile     | GET    | 用户/管理员      | 中           |
| 用户管理       | /api/users[/:id]       | GET/PUT/DELETE | 管理员      | 高           |

---

### 接口明细说明

#### 1. 用户注册（公共接口）
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "eco_user_001",
  "nickname": "小爱",
  "password": "Eco@2023Pwd",
  "email": "user001@ecogadget.com",
  "mobile": "13800138001",
  "role": "user"
}

响应示例：
{
  "code": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "eco_user_001",
    "nickname": "小爱",
    "email": "user001@ecogadget.com",
    "mobile": "13800138001",
    "role": "user",
    "isAdmin": false,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. 用户登录（公共接口）
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "eco_admin",
  "password": "Admin@2023!"
}

响应示例：
{
  "code": 200,
  "data": {
    "id": "3d58a440-e29b-41d4-a716-446655440000",
    "username": "eco_admin",
    "nickname": "小爱",
    "role": "admin",
    "isAdmin": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. 用户资料管理

##### 3.1 获取当前用户资料

**接口说明**：获取当前登录用户的详细信息，包括用户名、昵称、邮箱、手机号（脱敏）、角色等。

**请求方法**：GET

**请求URL**：`/api/users/profile`

**请求头**：
```
Authorization: Bearer <token>
```

**请求参数**：无（用户信息从 JWT token 中获取）

**响应状态码**：
- `200 OK`：请求成功
- `401 Unauthorized`：未登录或登录已过期
- `404 Not Found`：用户不存在
- `500 Internal Server Error`：服务器内部错误

**成功响应示例**：
```json
{
  "code": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "eco_user_001",
    "nickname": "小爱",
    "email": "user001@ecogadget.com",
    "mobile": "138****8001",  // 手机号脱敏
    "role": "user",
    "isAdmin": false
  }
}
```

**错误响应示例**：

1. 未登录或登录已过期：
```json
{
  "code": 401,
  "message": "未登录或登录已过期"
}
```

2. 用户不存在：
```json
{
  "code": 404,
  "message": "用户不存在"
}
```

3. 服务器内部错误：
```json
{
  "code": 500,
  "message": "获取用户信息失败"
}
```

**安全性说明**：
- 此接口需要用户登录后才能访问
- 返回的手机号会进行脱敏处理，中间四位数字使用星号代替
- 只能获取当前登录用户的信息，不能获取其他用户的信息

##### 3.2 修改用户信息
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

// 用户可修改字段（需验证原密码）
{
  "email": "new_email@ecogadget.com",
  "mobile": "13912345678",
  "nickname": "小爱"
}

// 管理员专用字段
{
  "isAdmin": true
}

响应示例：
{
  "code": 200,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "isAdmin": true,
    "updateTime": "2023-11-23 15:30:00"
  }
}
```

#### 4. 用户管理（管理员专用）
##### 4.1 用户列表查询
```http
GET /api/users?page=1&size=10
Authorization: Bearer <admin_token>

响应示例：
{
  "code": 200,
  "data": {
    "total": 150,
    "list": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "eco_user_001",
        "nickname": "小爱",
        "email": "u***@ecogadget.com",  // 邮箱脱敏
        "mobile": "138****8001",
        "role": "user",
        "isAdmin": false
      }
    ]
  }
}
```

##### 4.2 删除用户
```http
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <admin_token>

响应示例：
{
  "code": 200,
  "data": {
    "deletedId": "550e8400-e29b-41d4-a716-446655440000",
    "deleteTime": "2023-11-23 16:00:00"
  }
}
```

---

### 权限控制规则
| 操作类型       | 用户权限                | 管理员权限         |
|----------------|-------------------------|--------------------|
| 查看他人信息   | 禁止                    | 允许（脱敏显示）   |
| 修改用户角色   | 禁止                    | 需要超级管理员权限 |
| 删除用户       | 禁止                    | 需二级审批         |

---

### 错误代码表
| 状态码 | 说明                     | 触发场景                         |
|--------|--------------------------|----------------------------------|
| 400    | 参数校验失败             | 邮箱/手机号格式错误               |
| 401    | 未授权访问               | Token缺失或过期                  |
| 403    | 权限不足                 | 普通用户尝试管理员操作            |
| 404    | 用户不存在               | 操作不存在的用户ID               |
| 409    | 数据冲突                 | 邮箱/手机号已被注册               |
| 500    | 服务器内部错误           | 数据库连接失败等系统错误          |

---

### 数据安全规范
1. **敏感字段存储**
   - 密码：bcrypt加密存储
   - 手机号：AES-256加密存储

2. **返回数据脱敏规则**
   ```javascript
   // 手机号脱敏
   const maskMobile = mobile => mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")

   // 邮箱脱敏
   const maskEmail = email => email.replace(/(.).+@(.+)/, "$1***@$2")
   、、、