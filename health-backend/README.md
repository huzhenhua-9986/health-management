# 健康管理系统后端 API

基于 Node.js + Express + PostgreSQL 的健康管理系统后端服务。

## 技术栈

- **框架**: Express.js
- **数据库**: PostgreSQL (连接到 Supabase)
- **认证**: JWT
- **验证**: Joi
- **日志**: Winston
- **安全**: Helmet, CORS, Rate Limiting

## 项目结构

```
health-backend/
├── src/
│   ├── config/         # 配置文件
│   │   ├── index.js    # 主配置
│   │   └── database.js # 数据库配置
│   ├── controllers/    # 控制器
│   ├── models/         # 数据模型
│   ├── middlewares/    # 中间件
│   ├── routes/         # 路由
│   ├── utils/          # 工具函数
│   └── app.js          # 入口文件
├── package.json
├── .env.example
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd health-backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置（从 Supabase 获取）
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 微信小程序配置
WECHAT_APP_ID=your-wechat-appid
WECHAT_APP_SECRET=your-wechat-appsecret

# 服务器配置
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### 3. 更新数据库表

由于需要使用密码登录，需要给 `users` 表添加 `password_hash` 字段。

在 Supabase SQL Editor 中执行：

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
```

### 4. 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3000` 启动。

## API 文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)

### 认证模块

| 接口 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/auth/register` | POST | 用户注册 | 否 |
| `/api/auth/login` | POST | 用户登录 | 否 |
| `/api/auth/wx-login` | POST | 微信登录 | 否 |
| `/api/auth/refresh` | POST | 刷新令牌 | 否 |
| `/api/auth/me` | GET | 获取当前用户 | 是 |
| `/api/auth/logout` | POST | 登出 | 是 |

### 健康数据模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/health-data` | GET | 获取健康数据列表 |
| `/api/health-data` | POST | 创建健康数据 |
| `/api/health-data/:id` | GET | 获取单条数据 |
| `/api/health-data/:id` | PUT | 更新健康数据 |
| `/api/health-data/:id` | DELETE | 删除健康数据 |
| `/api/health-data/statistics` | GET | 获取统计数据 |
| `/api/health-data/trends` | GET | 获取趋势数据 |

### 运动数据模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/exercise` | GET | 获取运动数据 |
| `/api/exercise` | POST | 创建运动记录 |
| `/api/exercise/:id` | GET | 获取单条记录 |
| `/api/exercise/:id` | PUT | 更新运动记录 |
| `/api/exercise/:id` | DELETE | 删除运动记录 |

### 睡眠数据模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/sleep` | GET | 获取睡眠数据 |
| `/api/sleep` | POST | 创建睡眠记录 |
| `/api/sleep/:id` | GET | 获取单条记录 |
| `/api/sleep/:id` | PUT | 更新睡眠记录 |
| `/api/sleep/:id` | DELETE | 删除睡眠记录 |

### 饮食记录模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/diet` | GET | 获取饮食记录 |
| `/api/diet` | POST | 创建饮食记录 |
| `/api/diet/:id` | GET | 获取单条记录 |
| `/api/diet/:id` | PUT | 更新饮食记录 |
| `/api/diet/:id` | DELETE | 删除饮食记录 |

### 报告模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/reports` | GET | 获取报告列表 |
| `/api/reports/generate` | POST | 生成报告 |
| `/api/reports/:id` | DELETE | 删除报告 |

### 用户管理模块（管理员）

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/users` | GET | 获取用户列表 |
| `/api/users/:id` | GET | 获取用户详情 |
| `/api/users/:id` | PUT | 更新用户 |
| `/api/users/:id` | DELETE | 删除用户 |
| `/api/users/statistics` | GET | 获取用户统计 |
| `/api/users/batch-status` | PATCH | 批量更新状态 |

### 日志模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/logs` | GET | 获取系统日志 |

### 仪表盘模块

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/dashboard/overview` | GET | 获取概览数据 |
| `/api/dashboard/user-activity-trend` | GET | 获取用户活跃度趋势 |
| `/api/dashboard/data-collection-trend` | GET | 获取数据采集趋势 |

## 请求示例

### 注册

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456",
    "nickname": "张三"
  }'
```

### 登录

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "13800138000",
    "password": "123456"
  }'
```

### 创建健康数据

```bash
curl -X POST http://localhost:3000/api/health-data \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "data_type": "blood_sugar",
    "data_value": 5.5,
    "unit": "mmol/L"
  }'
```

### 获取健康数据

```bash
curl -X GET "http://localhost:3000/api/health-data?page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 分页响应

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

## 数据权限

- **普通用户**: 只能访问自己创建的数据
- **管理员**: 可以访问所有数据，并拥有用户管理权限

## 错误代码

| 代码 | HTTP 状态 | 描述 |
|------|-----------|------|
| VALIDATION_ERROR | 400 | 请求参数验证失败 |
| UNAUTHORIZED | 401 | 未授权，需要登录 |
| FORBIDDEN | 403 | 禁止访问，权限不足 |
| NOT_FOUND | 404 | 资源不存在 |
| DUPLICATE | 409 | 数据重复 |
| RATE_LIMIT_EXCEEDED | 429 | 请求频率超限 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

## 部署

### 使用 PM2

```bash
npm install -g pm2
pm2 start src/app.js --name health-api
pm2 save
pm2 startup
```

### 使用 Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 3000

CMD ["node", "src/app.js"]
```

## 开发

### 添加新的 API

1. 在 `src/models/` 创建数据模型
2. 在 `src/controllers/` 创建控制器
3. 在 `src/routes/` 创建路由
4. 在 `src/routes/index.js` 注册路由

### 添加中间件

在 `src/middlewares/` 创建中间件文件，然后在需要的地方引用。

## License

MIT
