# 健康管理系统 - Vercel 部署完整指南

## 部署前准备

### 1. 注册 Vercel 账号

1. **访问 Vercel 官网**
   - 打开浏览器，访问: https://vercel.com

2. **注册账号**
   - 点击右上角 "Sign Up"
   - 选择注册方式：
     * ✅ **推荐**: 使用 GitHub 账号登录（需要 GitHub 账号）
     * 或使用邮箱注册

3. **完成注册**
   - 填写用户名
   - 选择个人/团队账号（选择个人免费即可）

---

## 部署管理后台

### 步骤 1: 准备项目

确保项目路径正确：
```
/Users/huzhenhua/Desktop/health-management/health-admin
```

### 步骤 2: 推送代码到 GitHub（推荐）

Vercel 最简单的方式是从 GitHub 导入项目。

**如果你还没有 GitHub 账号：**
1. 访问 https://github.com
2. 注册账号
3. 创建新仓库，命名为 `health-management`

**推送代码到 GitHub：**
```bash
# 在项目根目录执行
cd /Users/huzhenhua/Desktop/health-management

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Health Management System"

# 添加远程仓库
git remote add origin https://github.com/你的用户名/health-management.git

# 推送代码
git push -u origin main
```

### 步骤 3: 在 Vercel 导入项目

1. **登录 Vercel 后**
   - 点击 "Add New Project"
   - 选择 "Import Git Repository"

2. **选择仓库**
   - 找到 `health-management` 仓库
   - 点击 "Import"

3. **配置项目**
   ```
   Project Name: health-admin
   Framework Preset: Vite
   Root Directory: health-admin
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **添加环境变量**（重要！）
   点击 "Environment Variables" 添加：
   ```
   Name: VITE_API_BASE_URL
   Value: http://localhost:3002/api
   ```
   > 注意：部署后端后，改为真实的后端API地址

5. **点击 Deploy**
   - 点击 "Deploy" 按钮
   - 等待部署完成（约2-3分钟）

6. **获取部署地址**
   - 部署完成后会显示地址，例如：
   ```
   https://health-admin-xxx.vercel.app
   ```

---

## 替代方案：直接拖拽部署（无需 GitHub）

如果不想使用 GitHub，可以使用 Vercel CLI：

### 安装 Vercel CLI

```bash
# 使用管理员权限安装
sudo npm install -g vercel
```

### 部署

```bash
# 进入管理后台目录
cd /Users/huzhenhua/Desktop/health-management/health-admin

# 登录 Vercel（会打开浏览器）
vercel login

# 部署
vercel --prod
```

按照提示操作即可！

---

## 部署后验证

### 1. 访问你的网站

部署成功后，访问 Vercel 给你的地址：
```
https://你的项目名.vercel.app
```

### 2. 测试登录

使用演示账号登录：
```
邮箱: admin@health.com
密码: Admin@123
```

### 3. 检查功能

- ✅ 能否正常登录
- ✅ 仪表盘数据是否显示
- ✅ 页面跳转是否正常

---

## 常见问题

### Q1: 部署后无法连接后端 API？

**A**: 这是因为管理后台配置的是本地 API 地址。你需要：

1. **部署后端服务**到云服务器
2. **更新环境变量** `VITE_API_BASE_URL` 为真实地址
3. **重新部署**管理后台

### Q2: 如何更新已部署的网站？

**A**:
- 如果使用 GitHub：推送代码后 Vercel 自动部署
- 如果使用 CLI：运行 `vercel --prod`

### Q3: 免费版有什么限制？

**A**: Vercel 免费版：
- ✅ 无限项目
- ✅ 100GB 带宽/月
- ✅ 自定义域名
- ⚠️ Serverless Functions 有执行时间限制

---

## 下一步

部署管理后台后，你还需要：

### 1. 部署后端 API
- 选择云服务器（阿里云/腾讯云等）
- 配置 Node.js 环境
- 部署 health-backend

### 2. 配置 Supabase 数据库
- 创建 Supabase 项目
- 执行数据库初始化脚本
- 获取数据库连接信息

### 3. 更新前端配置
- 在 Vercel 项目设置中更新环境变量
- 重新部署

---

## 快速检查清单

部署前请确认：
- [ ] 已注册 Vercel 账号
- [ ] 项目代码已准备好
- [ ] 知道后端 API 地址（或暂时用演示模式）
- [ ] 测试过本地构建 `npm run build`

---

**需要帮助？**

如果遇到问题，检查：
1. Vercel 部署日志
2. 本地是否可以正常运行
3. 环境变量是否正确配置

祝你部署顺利！🚀
