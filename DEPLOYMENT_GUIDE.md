# 健康管理系统部署指南

本文档指导您完成健康管理系统的完整部署，包括后端 API、管理后台和微信小程序。

---

## 📋 目录

1. [部署架构概览](#部署架构概览)
2. [Supabase 数据库配置](#2-supabase-数据库配置)
3. [后端 API 部署](#3-后端-api-部署)
4. [管理后台部署](#4-管理后台部署)
5. [微信小程序部署](#5-微信小程序部署)
6. [测试验证](#6-测试验证)
7. [常见问题](#7-常见问题)

---

## 部署架构概览

```
┌─────────────┐      ┌─────────────┐
│ 微信小程序  │─────▶│             │
└─────────────┘      │             │
                     │  后端 API   │─────▶ Supabase PostgreSQL
┌─────────────┐      │ (Node.js)   │
│  管理后台   │─────▶│   PM2       │
│   (Vue3)    │      │   Nginx     │
└─────────────┘      │             │
                     └─────────────┘
```

---

## 2. Supabase 数据库配置

---

## 1. Supabase 数据库配置

### 1.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录/注册
2. 点击 **"New Project"** 创建新项目
3. 填写项目信息：
   - **Name**: `health-management`
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择 `Southeast Asia (Singapore)` 或离你最近的区域
4. 等待项目创建完成（约 2-3 分钟）

### 1.2 获取项目凭证

创建完成后，在项目控制台获取以下信息：

1. 点击左侧 **Settings** -> **API**
2. 复制以下信息：
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...（一大串字符）
   ```

### 1.3 执行数据库初始化脚本

1. 在 Supabase 控制台，点击左侧 **SQL Editor**
2. 点击 **"New Query"**
3. 将 `database/init.sql` 文件的完整内容复制粘贴到编辑器中
4. 点击 **"Run"** 执行脚本
5. 等待执行完成，你应该看到 "Success. No rows returned" 的提示

### 1.4 创建管理员用户

由于我们使用 Supabase Auth，需要通过以下方式创建管理员：

**方式一：通过 Supabase Dashboard（推荐）**

1. 在 Supabase 控制台，点击左侧 **Authentication** -> **Users**
2. 点击 **"Add user"** -> **"Create new user"**
3. 填写管理员信息：
   - **Email**: `admin@health.com`（或你的邮箱）
   - **Password**: 设置强密码
   - **Auto Confirm User**: 勾选（自动确认）
4. 点击 **"Create user"**

5. 然后在 **SQL Editor** 中执行以下 SQL，将该用户设为管理员：

```sql
-- 将用户设为管理员（替换 UUID 为刚创建用户的 ID）
UPDATE users
SET role = 'admin'
WHERE id = '刚才创建的用户UUID';
```

**方式二：通过管理后台注册（需要先配置）**

1. 启动管理后台
2. 访问注册页面
3. 使用邮箱注册
4. 在 Supabase 控制台的 **Authentication** -> **Users** 中找到该用户
5. 在 **Table Editor** -> **users** 表中修改 `role` 字段为 `admin`

### 1.5 验证数据库配置

1. 在 Supabase 控制台，点击 **Table Editor**
2. 你应该能看到以下表：
   - `users` - 用户表
   - `health_data` - 健康数据表
   - `exercise_data` - 运动数据表
   - `sleep_data` - 睡眠数据表
   - `diet_data` - 饮食记录表
   - `health_reports` - 健康报告表
   - `system_logs` - 系统日志表

---

## 3. 后端 API 部署

### 3.1 服务器准备

推荐配置：
- **CPU**: 2核+
- **内存**: 2GB+
- **存储**: 20GB+
- **系统**: Ubuntu 20.04 / CentOS 8+

### 3.2 安装 Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 3.3 上传项目代码

```bash
# 方式一：使用 git
cd /var/www
git clone <your-repo-url> health-management
cd health-management/health-backend

# 方式二：使用 scp 上传
scp -r health-backend user@server:/var/www/health-management/
```

### 3.4 执行数据库迁移

在 Supabase SQL Editor 中执行：

```sql
-- 添加 password_hash 字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
```

或使用迁移脚本：

```bash
psql -h db.xxx.supabase.co -U postgres -d postgres -f database/migrations/add_password_hash.sql
```

### 3.5 配置环境变量

```bash
cd /var/www/health-management/health-backend
cp .env.example .env
nano .env
```

填入实际配置：

```env
# 数据库配置（从 Supabase 获取）
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# 微信小程序配置
WECHAT_APP_ID=your-wechat-appid
WECHAT_APP_SECRET=your-wechat-appsecret

# 服务器配置
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

### 3.6 安装依赖

```bash
npm install
```

### 3.7 安装 PM2

```bash
npm install -g pm2
```

### 3.8 启动服务

```bash
pm2 start src/app.js --name health-api
pm2 save
pm2 startup
```

### 3.9 配置 Nginx 反向代理

创建 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/health-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/health-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.10 配置 SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 3.11 PM2 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs health-api

# 重启服务
pm2 restart health-api

# 停止服务
pm2 stop health-api

# 监控
pm2 monit
```

---

## 4. 管理后台部署

### 2.1 配置环境变量

1. 复制环境变量模板：
```bash
cd health-admin
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的 Supabase 配置：

```env
# Supabase 配置 - 替换为你的实际配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key
```

### 2.2 安装依赖

```bash
cd health-admin
npm install
```

### 2.3 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 2.4 登录测试

1. 访问 `http://localhost:3000/login`
2. 使用管理员账号登录
3. 验证各页面功能是否正常

---

## 3. 部署到 Vercel

### 3.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3.2 登录 Vercel

```bash
vercel login
```

按照提示登录你的 Vercel 账号（如果没有，需要先注册）。

### 3.3 构建项目

```bash
cd health-admin
npm run build
```

构建完成后，会在 `dist` 目录生成静态文件。

### 3.4 部署项目

```bash
vercel deploy --prod
```

按照提示完成部署：
1. 首次部署会询问是否要设置项目，选择 `Yes`
2. 项目名称可以设置为 `health-admin` 或自定义
3. Vercel 会自动检测这是 Vite 项目并配置构建设置

### 3.5 配置环境变量

部署完成后，需要在 Vercel 控制台配置环境变量：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目 `health-admin`
3. 点击项目 -> **Settings** -> **Environment Variables**
4. 添加以下环境变量：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | 你的 Supabase Project URL |
| `VITE_SUPABASE_KEY` | 你的 Supabase anon public key |

5. 点击 **Save** 保存
6. 点击 **Deployments** -> **Redeploy** 重新部署以应用环境变量

### 3.6 配置自定义域名（可选）

1. 在 Vercel 项目中，点击 **Settings** -> **Domains**
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

---

## 4. 测试系统功能

### 4.1 测试管理后台

访问你部署的管理后台 URL（如 `https://health-admin.vercel.app`）：

1. **登录测试**
   - 使用管理员账号登录
   - 检查登录状态保持

2. **数据监控测试**
   - 访问数据监控页面
   - 检查统计卡片和图表是否正常显示

3. **用户管理测试**
   - 创建新用户
   - 编辑用户信息
   - 启用/禁用用户
   - 删除用户

4. **健康数据测试**
   - 添加健康数据记录
   - 查看数据列表
   - 筛选和搜索数据

5. **数据分析测试**
   - 查看趋势图表
   - 切换数据类型
   - 查看排行榜和质量分析

6. **报告管理测试**
   - 生成测试报告
   - 预览报告
   - 下载报告

7. **系统设置测试**
   - 修改系统参数
   - 设置预警阈值
   - 查看角色权限

8. **日志审计测试**
   - 查看操作日志
   - 筛选日志记录

### 4.2 测试数据库连接

在 Supabase 控制台验证：

1. **Table Editor** 中查看数据是否正确存储
2. **SQL Editor** 中执行查询测试：
```sql
-- 查看用户数
SELECT COUNT(*) FROM users;

-- 查看健康数据
SELECT * FROM health_data ORDER BY created_at DESC LIMIT 10;

-- 查看用户统计
SELECT * FROM user_statistics;
```

---

## 5. 常见问题

### Q1: 登录后提示"未授权"？

**A**: 检查以下几点：
1. 确认 `.env` 文件中的 Supabase URL 和 Key 正确
2. 确认用户已在 `users` 表中，且 `role` 字段为 `admin`
3. 清除浏览器缓存和 LocalStorage 后重试
4. 检查浏览器控制台是否有错误信息

### Q2: 数据无法保存？

**A**:
1. 检查 RLS 策略是否正确配置
2. 确认用户已通过 Supabase Auth 认证
3. 在 Supabase 控制台检查表权限

### Q3: 部署后页面空白？

**A**:
1. 检查 Vercel 部署日志
2. 确认环境变量已正确配置
3. 检查浏览器控制台的错误信息
4. 确认 `npm run build` 构建成功

### Q4: 图表不显示？

**A**:
1. 确认 ECharts 已正确安装
2. 检查数据格式是否正确
3. 查看浏览器控制台是否有 JavaScript 错误

### Q5: API 请求失败？

**A**:
1. 确认 Supabase 项目已启动
2. 检查 API URL 是否正确
3. 检查网络请求的 CORS 配置
4. 查看 Supabase Logs 获取详细错误信息

### Q6: 如何重置数据库？

**A**:
1. 在 Supabase 控制台，点击 **Database** -> **Reset database password**
2. 或者在 **SQL Editor** 中执行：
```sql
-- 警告：这将删除所有数据！
TRUNCATE health_data CASCADE;
TRUNCATE exercise_data CASCADE;
TRUNCATE sleep_data CASCADE;
TRUNCATE diet_data CASCADE;
TRUNCATE health_reports CASCADE;
TRUNCATE system_logs CASCADE;
```

### Q7: 如何备份数据？

**A**:
1. Supabase 自动提供每日备份
2. 手动备份：在 **Database** -> **Backups** 中创建
3. 导出数据：使用 **SQL Editor** 执行导出查询

---

## 6. 下一步：小程序配置

管理后台部署完成后，下一步是配置微信小程序。

小程序配置指南请参考：`health-miniprogram/README.md`

---

## 7. 技术支持

如遇到问题，可以通过以下方式获取帮助：

- **Supabase 文档**: https://supabase.com/docs
- **Vercel 文档**: https://vercel.com/docs
- **Vue 3 文档**: https://vuejs.org
- **Element Plus 文档**: https://element-plus.org

---

**祝您部署顺利！** 🎉
