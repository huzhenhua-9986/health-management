# Supabase 配置指南

本指南将帮助您配置 Supabase 作为健康管理系统的后端服务。

## 目录

1. [创建 Supabase 项目](#1-创建-supabase-项目)
2. [执行数据库初始化脚本](#2-执行数据库初始化脚本)
3. [配置微信登录](#3-配置微信登录)
4. [部署 Edge Functions](#4-部署-edge-functions)
5. [配置环境变量](#5-配置环境变量)
6. [配置 Row Level Security (RLS)](#6-配置-row-level-security-rls)

---

## 1. 创建 Supabase 项目

### 步骤 1: 注册/登录 Supabase

访问 [https://supabase.com](https://supabase.com) 并注册或登录账号。

### 步骤 2: 创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: `health-management` (或其他名称)
   - **Database Password**: 设置强密码并保存
   - **Region**: 选择距离用户最近的区域
3. 点击 "Create new project"，等待项目创建完成

### 步骤 3: 获取 API 密钥

项目创建后，进入 **Settings > API**，保存以下信息：

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. 执行数据库初始化脚本

### 方法 1: 使用 Supabase Dashboard

1. 进入项目，点击左侧菜单 **SQL Editor**
2. 点击 "New query"
3. 复制 `database/init.sql` 文件的全部内容
4. 粘贴到编辑器中
5. 点击 **Run** 执行脚本

### 方法 2: 使用 Supabase CLI

```bash
# 安装 Supabase CLI (如果未安装)
npm install -g supabase

# 登录
supabase login

# 链接到项目
supabase link --project-ref YOUR_PROJECT_REF

# 执行初始化脚本
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres < database/init.sql
```

### 验证数据库创建

执行后，在 **Table Editor** 中应该能看到以下表：

- `users` - 用户表
- `health_data` - 健康数据表
- `exercise_data` - 运动数据表
- `sleep_data` - 睡眠数据表
- `diet_data` - 饮食记录表
- `health_reports` - 健康报告表
- `system_logs` - 系统日志表

---

## 3. 配置微信登录

### 步骤 1: 获取微信小程序信息

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 获取以下信息：
   - **AppID**: 小程序ID
   - **AppSecret**: 小程序密钥

### 步骤 2: 在 Supabase 中配置微信登录

#### 方案 A: 使用 Supabase Auth (推荐)

1. 进入 **Authentication > Providers**
2. 找到 "WeChat" 并启用
3. 填入从微信公众平台获取的 AppID 和 AppSecret
4. 设置回调 URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

#### 方案 B: 使用自定义 Edge Function

部署 `wx-login` Edge Function (见下文 Edge Functions 部分)

### 步骤 3: 配置允许的回调 URL

在 **Authentication > URL Configuration** 中添加：

```
https://YOUR_PROJECT.supabase.co/auth/v1/callback
```

---

## 4. 部署 Edge Functions

Edge Functions 用于处理微信登录和数据分析等复杂业务逻辑。

### 安装 Supabase CLI

```bash
npm install -g supabase
```

### 登录并链接项目

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 部署函数

```bash
# 部署所有函数
cd database/supabase/functions
supabase functions deploy .

# 或部署单个函数
supabase functions deploy wx-login
supabase functions deploy health-analysis
```

### 可用的 Edge Functions

| 函数名 | 功能 | 端点 |
|--------|------|------|
| wx-login | 微信小程序登录 | `/functions/v1/wx-login` |
| health-analysis | 健康数据分析 | `/functions/v1/health-analysis` |
| report-generator | 健康报告生成 | `/functions/v1/report-generator` |

---

## 5. 配置环境变量

### 管理后台配置

编辑 `health-admin/.env`:

```env
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key

# 邮件服务配置 (可选)
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key
```

### 小程序配置

编辑 `health-miniprogram/app.js`:

```javascript
globalData: {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-anon-key',
  // ...
}
```

---

## 6. 配置 Row Level Security (RLS)

数据库初始化脚本已包含 RLS 策略。你可以验证：

### 验证 RLS 状态

在 SQL Editor 中执行：

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- 查看 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

### 测试 RLS

1. 使用普通用户登录，确保只能访问自己的数据
2. 使用管理员登录，确保可以访问所有数据

---

## 常见问题

### Q1: 如何获取 service_role key?

A: 在 Supabase Dashboard 中，进入 **Settings > API**，找到 `service_role` 密钥。

⚠️ **警告**: `service_role` key 绕过 RLS，仅在后端服务中使用！

### Q2: 微信登录失败怎么办?

A: 检查以下项目：
- 微信小程序 AppID 和 AppSecret 是否正确
- Supabase 项目 URL 是否正确
- Edge Function 是否已部署

### Q3: 如何查看数据库日志?

A: 在 Supabase Dashboard 中，进入 **Database > Logs**。

### Q4: 数据库连接失败怎么办?

A: 检查：
- 项目是否已激活（未激活的项目会在 14 天后暂停）
- 数据库密码是否正确
- 网络连接是否正常

---

## 安全建议

1. **保护密钥**: 永远不要在前端代码中暴露 `service_role` key
2. **RLS 策略**: 确保所有表都启用了 RLS
3. **API 限制**: 在 Supabase Dashboard 中配置 API 速率限制
4. **定期备份**: 启用数据库自动备份

---

## 下一步

配置完成后，请参考以下文档：

- [API 文档](./API_DOCUMENTATION.md) - 查看所有可用的 API
- [部署指南](../DEPLOYMENT_GUIDE.md) - 部署应用到生产环境

---

## 技术支持

如有问题，请联系技术团队或查阅：
- [Supabase 官方文档](https://supabase.com/docs)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
