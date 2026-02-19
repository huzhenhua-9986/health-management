# 健康管理系统 - 管理后台

基于 Vue 3 + TypeScript + Element Plus 构建的现代化健康管理系统管理后台。

## ✨ 特性

- 🎨 **现代化 UI**：精美的界面设计，流畅的用户体验
- 📧 **邮箱注册**：支持邮箱验证码注册
- 👥 **用户管理**：完整的用户管理系统
- 📊 **数据可视化**：丰富的图表展示
- 🔐 **权限管理**：超级管理员和普通用户角色
- 💾 **本地存储**：基于 localStorage 的数据存储（演示版本）

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3001

### 构建生产版本

```bash
npm run build
```

## 👤 账号系统

### 超级管理员

- **邮箱**：admin@health.com
- **密码**：Admin@123
- **权限**：管理所有用户，查看所有数据

### 普通用户

- 通过邮箱注册功能创建
- 默认角色：普通用户
- 可被管理员禁用或删除

## 📧 邮件服务配置

系统使用 EmailJS 发送验证码邮件，配置步骤如下：

### 1. 注册 EmailJS

访问 [https://www.emailjs.com/](https://www.emailjs.com/) 免费注册

### 2. 配置邮件服务

1. 在 EmailJS 控制台添加邮件服务（推荐使用 Gmail）
2. 创建邮件模板（验证码模板）
3. 获取 Service ID、Template ID 和 Public Key

### 3. 配置环境变量

编辑 `.env` 文件：

```bash
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_TEMPLATE_ID=your-template-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key
```

### 4. 重启服务

```bash
npm run dev
```

详细配置请查看 [EMAIL_SETUP.md](./EMAIL_SETUP.md)

## 📁 项目结构

```
health-admin/
├── src/
│   ├── api/              # API 接口
│   ├── assets/           # 静态资源
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   │   ├── auth.ts       # 认证相关
│   │   ├── email.ts      # 邮件服务
│   │   └── supabase.ts   # Supabase 配置
│   └── views/            # 页面组件
│       ├── Auth.vue      # 登录/注册
│       ├── Dashboard.vue # 仪表盘
│       ├── Users.vue     # 用户管理
│       └── ...
├── public/               # 公共资源
├── .env                  # 环境变量
├── index.html            # HTML 模板
├── package.json          # 项目配置
└── vite.config.ts        # Vite 配置
```

## 🎯 核心功能

### 用户认证

- ✅ 邮箱 + 密码登录
- ✅ 邮箱验证码注册
- ✅ 超级管理员预设账号
- ✅ 用户状态管理（启用/禁用）
- ✅ 注册用户存储在 localStorage

### 用户管理

- ✅ 用户列表展示
- ✅ 邮箱/昵称搜索
- ✅ 状态筛选（正常/禁用）
- ✅ 用户详情查看
- ✅ 启用/禁用用户
- ✅ 删除用户
- ✅ 超级管理员保护（不可删除/禁用）

### 数据展示

- ✅ 仪表盘统计卡片
- ✅ 图表数据可视化
- ✅ 响应式布局

## 🔒 安全说明

### 当前实现（演示版本）

- 用户数据存储在浏览器 localStorage
- 密码未加密存储
- 仅适用于演示和开发

### 生产环境建议

如需用于生产环境，建议：

1. **对接真实后端**
   - 使用 Supabase 或自建后端服务
   - 实现真实的数据库存储
   - 密码加密存储（bcrypt）

2. **增强安全性**
   - 实现 JWT token 认证
   - 添加请求签名验证
   - 实施 CSRF 防护
   - API 请求限流

3. **数据持久化**
   - 使用云数据库（Supabase PostgreSQL）
   - 实现数据备份机制
   - 添加数据导出功能

## 🛠️ 技术栈

- **框架**：Vue 3 (Composition API)
- **语言**：TypeScript
- **UI 库**：Element Plus
- **状态管理**：Pinia
- **路由**：Vue Router
- **构建工具**：Vite
- **HTTP 客户端**：Axios
- **图表库**：ECharts
- **日期处理**：Day.js
- **邮件服务**：EmailJS

## 📝 开发说明

### 本地存储数据结构

```typescript
// 注册用户列表 (localStorage: 'registered_users')
interface User {
  id: string              // 用户 ID
  email: string           // 邮箱地址
  password: string        // 密码（演示版本未加密）
  nickname: string        // 昵称
  role: 'user' | 'admin'  // 角色
  status: 'active' | 'inactive'  // 状态
  created_at: string      // 创建时间
}

// 验证码存储 (localStorage: 'verify_code_{email}')
interface VerifyCode {
  code: string            // 6位验证码
  time: number            // 发送时间戳
}
```

### 清除演示数据

如需清除所有注册用户数据：

```javascript
localStorage.removeItem('registered_users')
```

清除验证码：

```javascript
// 清除特定邮箱验证码
localStorage.removeItem('verify_code_user@example.com')
localStorage.removeItem('verify_code_time_user@example.com')
```

## 🎨 自定义主题

在 `src/styles/global.css` 中修改 CSS 变量：

```css
:root {
  --primary-gradient: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
  --primary-light: #48cae4;
  --primary: #0077b6;
  --primary-dark: #023e8a;
  /* ... 更多变量 */
}
```

## 📄 相关文档

- [EMAIL_SETUP.md](./EMAIL_SETUP.md) - 邮件服务配置指南
- [AUTH_SETUP.md](./AUTH_SETUP.md) - 认证系统配置指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📜 许可证

MIT License

---

**注意**：当前版本为演示版本，用户数据存储在浏览器本地。生产环境请对接真实的后端服务。
