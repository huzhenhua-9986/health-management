# 认证系统配置指南

## 📋 概述

健康管理系统支持多种认证方式：
- 🔐 **密码登录**：使用手机号 + 密码登录
- 📱 **验证码登录**：使用手机号 + 短信验证码登录
- 🏠 **微信登录**：小程序端微信一键登录

## 🚀 快速开始

### 方案一：演示模式（快速体验）

无需任何配置，系统已内置演示模式：

1. **启动项目**
   ```bash
   cd ~/Desktop/health-management/health-admin
   npm run dev
   ```

2. **访问登录页**
   - 打开 http://localhost:3001/login
   - 输入任意手机号（如：13800138000）
   - 输入任意密码（如：123456）
   - 点击登录即可体验

3. **验证码演示**
   - 点击"获取验证码"按钮
   - 系统会在提示框中显示模拟验证码
   - 输入验证码完成登录

### 方案二：生产环境配置（完整功能）

#### 步骤 1：创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - **Name**: `health-management`
   - **Database Password**: 设置强密码（请妥善保管）
   - **Region**: 选择就近区域（如 Singapore）
5. 等待项目创建（约 2 分钟）

#### 步骤 2：配置数据库

1. 进入 Supabase 项目 → **SQL Editor**
2. 点击 "New Query"
3. 执行以下初始化脚本：

```sql
-- ============================================
-- 启用 UUID 扩展
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  openid VARCHAR(100) UNIQUE,
  nickname VARCHAR(50),
  avatar_url TEXT,
  gender VARCHAR(10),
  birth_date DATE,
  height DECIMAL(5,2),
  weight DECIMAL(5,2),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- 创建管理员账号（示例）
INSERT INTO users (phone, nickname, role, status)
VALUES ('13800138000', '系统管理员', 'admin', 'active');

-- ============================================
-- 其他数据表（按需创建）
-- ============================================
-- health_data, exercise_data, sleep_data, diet_data 等
-- 请参考 database/init.sql 获取完整脚本

-- ============================================
-- 启用行级安全（可选，生产环境推荐）
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许所有用户查看用户信息
CREATE POLICY "Public can view users"
ON users FOR SELECT
TO public
USING (true);

-- 允许认证用户更新自己的信息
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = phone);
```

#### 步骤 3：获取 API 密钥

1. 进入 **Project Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 步骤 4：配置环境变量

1. 在 `health-admin` 目录下创建 `.env` 文件：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

2. 重启开发服务器：
```bash
npm run dev
```

#### 步骤 5：创建管理员账号

**方法一：通过 SQL 直接插入**
```sql
INSERT INTO users (phone, nickname, password_hash, role, status)
VALUES ('13800138000', '管理员', 'hashed_password', 'admin', 'active');
```

**方法二：通过 Supabase Auth**

1. 进入 **Authentication** → **Users**
2. 点击 "Add user"
3. 输入邮箱和密码
4. 创建后，在 `users` 表中添加对应记录并设置 `role='admin'`

## 🔐 认证流程

### 密码登录流程

```
用户输入手机号和密码
    ↓
前端验证格式
    ↓
调用 Supabase Auth.signInWithPassword()
    ↓
验证成功，返回 session token
    ↓
查询 users 表获取用户详细信息
    ↓
检查用户角色（管理后台需要 admin 角色）
    ↓
存储 token 到本地存储和 Pinia store
    ↓
跳转到首页
```

### 验证码登录流程

```
用户输入手机号
    ↓
调用 sendVerificationCode()
    ↓
发送验证码（演示模式：存储到 localStorage）
    ↓
用户输入验证码
    ↓
验证验证码正确性和有效期
    ↓
查询或创建用户记录
    ↓
检查用户角色
    ↓
生成临时 token
    ↓
存储 token 并跳转
```

### 注册流程

```
用户填写注册信息
    ↓
前端验证（手机号、密码强度等）
    ↓
发送并验证验证码
    ↓
调用 Supabase Auth.signUp()
    ↓
创建 auth.users 记录
    ↓
创建自定义 users 表记录
    ↓
自动登录并跳转
```

## 📱 小程序端认证

小程序端的认证配置在 `health-miniprogram/app.js`：

```javascript
App({
  globalData: {
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseKey: 'your-anon-key'
  }
})
```

### 微信一键登录

1. 获取微信授权
2. 获取用户 openid
3. 查询或创建用户记录
4. 存储登录状态

## 🔧 故障排除

### 问题 1：登录后立即退出

**原因**：用户角色不是 `admin`
**解决**：在数据库中更新用户角色：
```sql
UPDATE users SET role = 'admin' WHERE phone = '13800138000';
```

### 问题 2：Supabase 连接失败

**原因**：API 密钥配置错误
**解决**：
1. 检查 `.env` 文件是否存在
2. 确认 API URL 和 Key 正确
3. 检查网络连接
4. 查看 Console 是否有 CORS 错误

### 问题 3：验证码无法发送

**演示模式**：验证码会在提示框中显示
**生产模式**：需要对接短信服务 API

### 问题 4：注册时提示邮箱已存在

**原因**：Supabase Auth 使用邮箱作为唯一标识
**解决**：使用 `手机号@health.temp` 格式作为临时邮箱

## 🎯 下一步

认证系统配置完成后，可以：

1. ✅ 实现完整的用户注册/登录
2. ✅ 添加权限控制（RBAC）
3. ✅ 集成第三方登录（微信、支付宝等）
4. ✅ 添加短信验证码服务
5. ✅ 实现密码找回功能

## 📚 相关文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Vue Router 路由守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
- [Pinia 状态管理](https://pinia.vuejs.org/zh/)

## 💡 提示

- 演示模式适合快速开发和测试
- 生产环境务必配置真实的 Supabase
- 定期备份用户数据
- 注意保护用户隐私信息
