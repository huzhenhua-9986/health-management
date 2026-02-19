# 健康管理系统

一个完整的健康数据管理系统，包含管理后台和微信小程序端。

> 使用 Vue 3 + TypeScript + Element Plus + Supabase 构建

## 🌟 功能特性

### 管理后台

- 📊 **数据监控** - 实时监控用户活跃度、数据采集量和系统指标
- 👥 **用户管理** - 用户信息管理、状态控制、批量操作
- 📈 **数据分析** - 多维度数据分析、趋势图表、数据质量评估
- 📋 **报告管理** - 报告生成、预览、下载和管理
- ⚙️ **系统设置** - 系统参数配置、预警阈值设置、权限管理
- 📝 **日志审计** - 操作日志记录、查询和分析

### 小程序端

- 📱 **数据录入** - 健康数据、运动、睡眠、饮食快速录入
- 📊 **数据查看** - 个人健康数据查看和趋势分析
- 📋 **健康报告** - 报告生成、查看和分享
- 👤 **个人中心** - 用户信息管理和设置

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd health-management
```

### 2. 配置 Supabase 数据库

**详细步骤请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

简要步骤：
1. 访问 [Supabase](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `database/init.sql`
3. 获取 Project URL 和 anon key
4. 创建管理员用户

### 3. 配置环境变量

```bash
cd health-admin
cp .env.example .env
```

编辑 `.env` 文件：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key
```

### 4. 安装依赖

```bash
cd health-admin
npm install
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看管理后台。

## 📦 项目结构

```
health-management/
├── health-admin/              # 管理后台 (Vue 3)
│   ├── src/
│   │   ├── api/               # API 接口
│   │   ├── assets/            # 静态资源
│   │   ├── components/        # 公共组件
│   │   ├── router/            # 路由配置
│   │   ├── stores/            # Pinia 状态管理
│   │   ├── utils/             # 工具函数
│   │   └── views/             # 页面组件
│   ├── .env                   # 环境变量
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json            # Vercel 部署配置
│
├── health-miniprogram/        # 微信小程序
│   ├── pages/                 # 页面
│   │   ├── index/             # 首页
│   │   ├── data/              # 数据查看
│   │   ├── input/             # 数据录入
│   │   ├── report/            # 健康报告
│   │   ├── profile/           # 个人中心
│   │   └── login/             # 登录
│   ├── utils/                 # 工具函数
│   ├── images/                # 图片资源
│   ├── app.js
│   └── app.json
│
├── database/                  # 数据库脚本
│   └── init.sql               # 初始化脚本
│
├── DEPLOYMENT_GUIDE.md        # 部署指南
└── README.md                  # 项目说明
```

## 🛠️ 技术栈

### 管理后台

| 技术 | 说明 |
|------|------|
| Vue 3 | 渐进式 JavaScript 框架 |
| TypeScript | 类型安全 |
| Vite | 快速构建工具 |
| Element Plus | UI 组件库 |
| Pinia | 状态管理 |
| Vue Router | 路由管理 |
| ECharts | 数据可视化 |
| Supabase | 后端服务 (PostgreSQL + Auth + Storage) |

### 小程序端

| 技术 | 说明 |
|------|------|
| 微信小程序原生 | 小程序框架 |
| 微信云开发 | 云服务 |
| Supabase JS | 数据库连接 |

## 📱 页面说明

### 管理后台页面

| 路由 | 页面 | 功能 |
|------|------|------|
| `/login` | 登录页 | 用户登录认证 |
| `/dashboard` | 数据监控 | 系统概览和数据监控 |
| `/users` | 用户管理 | 用户信息管理 |
| `/users/:id` | 用户详情 | 查看用户详细信息和数据 |
| `/health-data` | 健康数据 | 管理健康数据记录 |
| `/analysis` | 数据分析 | 数据统计和分析 |
| `/reports` | 报告管理 | 健康报告生成和管理 |
| `/settings` | 系统设置 | 系统配置和权限管理 |
| `/logs` | 日志审计 | 操作日志查询 |

### 小程序页面

| 页面 | 功能 |
|------|------|
| 首页 | 今日数据概览、快捷入口 |
| 数据 | 健康数据查看和趋势 |
| 录入 | 各类健康数据录入 |
| 报告 | 健康报告查看和生成 |
| 我的 | 个人中心和设置 |
| 登录 | 用户登录 |

## 🔐 安全特性

- **传输加密**: TLS 1.3
- **存储加密**: AES-256
- **认证**: Supabase Auth (JWT)
- **授权**: 基于角色的访问控制 (RBAC)
- **行级安全**: PostgreSQL RLS 策略
- **SQL 注入防护**: 参数化查询
- **XSS 防护**: 前端输入验证和转义

## 📊 数据库设计

### 核心数据表

- `users` - 用户表
- `health_data` - 健康数据表
- `exercise_data` - 运动数据表
- `sleep_data` - 睡眠数据表
- `diet_data` - 饮食记录表
- `health_reports` - 健康报告表
- `system_logs` - 系统日志表

详细表结构请参考 `database/init.sql`

## 🚢 部署

### 管理后台部署

支持一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

或手动部署：

```bash
cd health-admin
npm run build
vercel deploy --prod
```

详细步骤请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 小程序部署

1. 使用微信开发者工具打开 `health-miniprogram`
2. 配置 `app.js` 中的 Supabase 配置
3. 上传代码并提交审核

## 📖 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 使用 ESLint 和 Prettier 保持代码风格一致

### API 调用

API 调用统一使用 `src/api/index.ts` 中的方法：

```typescript
import { userApi, healthDataApi } from '@/api'

// 获取用户列表
const { data, error } = await userApi.getList({ page: 1, page_size: 20 })

// 添加健康数据
await healthDataApi.create({ data_type: 'blood_pressure', data_value: 120 })
```

## 🐛 故障排除

### 常见问题

<details>
<summary>登录后提示"未授权"</summary>

1. 检查 `.env` 配置是否正确
2. 确认用户在 `users` 表中且 `role='admin'`
3. 清除浏览器缓存后重试
</details>

<details>
<summary>图表不显示</summary>

1. 确认 ECharts 已正确安装
2. 检查数据格式是否正确
3. 查看浏览器控制台错误信息
</details>

<details>
<summary>部署后页面空白</summary>

1. 检查 Vercel 环境变量配置
2. 查看部署日志
3. 确认构建成功无错误
</details>

更多问题请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📝 更新日志

### v1.0.0 (2024-01-01)

- ✨ 初始版本发布
- ✅ 完成管理后台所有功能
- ✅ 完成小程序核心功能
- ✅ Supabase 数据库配置
- ✅ Vercel 部署支持

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。

---

**让健康管理更简单** 🏥💪
