# 健康管理系统 - 管理后台

基于 Vue 3 + TypeScript + Element Plus + ECharts 开发的现代化健康管理后台系统。

## 技术栈

- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **开发语言**: TypeScript
- **UI 组件库**: Element Plus
- **图表库**: ECharts
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **构建工具**: Vite
- **后端服务**: Supabase

## 项目结构

```
health-admin/
├── src/
│   ├── api/                 # API 接口
│   │   └── index.ts         # 统一 API 管理
│   ├── assets/              # 静态资源
│   ├── components/          # 公共组件
│   ├── router/              # 路由配置
│   │   └── index.ts
│   ├── stores/              # 状态管理
│   │   └── user.ts          # 用户状态
│   ├── styles/              # 全局样式
│   │   └── global.css
│   ├── utils/               # 工具函数
│   │   ├── auth.ts          # 认证相关
│   │   ├── demoAuth.ts      # 演示模式认证
│   │   ├── email.ts         # 邮件发送
│   │   ├── request.ts       # 请求封装
│   │   ├── sms.ts           # 短信发送
│   │   └── supabase.ts      # Supabase 配置
│   ├── views/               # 页面组件
│   │   ├── Analysis.vue     # 数据分析
│   │   ├── Auth.vue         # 登录/注册
│   │   ├── Dashboard.vue    # 数据监控
│   │   ├── DietData.vue     # 饮食记录管理
│   │   ├── ExerciseData.vue # 运动数据管理
│   │   ├── HealthData.vue   # 健康数据管理
│   │   ├── Layout.vue       # 主布局
│   │   ├── Logs.vue         # 日志审计
│   │   ├── Reports.vue      # 报告管理
│   │   ├── Settings.vue     # 系统设置
│   │   ├── SleepData.vue    # 睡眠数据管理
│   │   ├── UserDetail.vue   # 用户详情
│   │   └── Users.vue        # 用户管理
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── .env                     # 环境变量
├── .env.example             # 环境变量示例
├── index.html               # HTML 模板
├── package.json             # 依赖配置
├── tsconfig.json            # TS 配置
└── vite.config.ts           # Vite 配置
```

## 功能模块

### 1. 认证模块 (Auth.vue)
- 邮箱登录
- 邮箱验证码注册
- 演示模式（超级管理员登录）

### 2. 数据监控 (Dashboard.vue)
- 统计卡片展示
- 用户活跃度趋势图
- 数据采集量趋势图
- 快捷操作入口

### 3. 用户管理 (Users.vue)
- 用户列表展示
- 用户搜索和筛选
- 用户状态管理（启用/禁用）
- 用户删除

### 4. 用户详情 (UserDetail.vue)
- 基本信息展示
- 健康数据统计
- BMI 自动计算

### 5. 健康数据管理 (HealthData.vue)
- 血压、血糖、心率等数据管理
- 数据类型筛选
- 日期范围查询
- 数据详情查看

### 6. 运动数据管理 (ExerciseData.vue)
- 步数、距离、热量等数据
- 运动记录统计
- 数据导出功能

### 7. 睡眠数据管理 (SleepData.vue)
- 睡眠时长和质量分析
- 深睡/浅睡/REM 数据展示
- 可视化睡眠结构

### 8. 饮食记录管理 (DietData.vue)
- 餐次记录管理
- 营养成分分析
- 热量、蛋白质、脂肪等数据

### 9. 数据分析 (Analysis.vue)
- 多维度数据分析
- 趋势图表展示
- 数据分布饼图
- 健康指标排行
- 数据质量分析

### 10. 报告管理 (Reports.vue)
- 报告列表管理
- 报告类型筛选
- 报告生成功能
- 报告预览和下载

### 11. 日志审计 (Logs.vue)
- 操作日志记录
- 日志筛选查询
- 用户行为追踪

### 12. 系统设置 (Settings.vue)
- 系统基本信息配置
- 预警阈值设置
- 角色权限管理

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 环境配置

复制 `.env.example` 为 `.env` 并配置以下变量：

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key

# 短信服务配置（可选）
VITE_SMS_PROVIDER=aliyun
VITE_SMS_ACCESS_KEY_ID=your-aliyun-access-key-id
VITE_SMS_ACCESS_KEY_SECRET=your-aliyun-access-key-secret
VITE_SMS_SIGN_NAME=your-sign-name
VITE_SMS_TEMPLATE_CODE=your-template-code
```

## 演示模式

在未配置 Supabase 时，系统会自动进入演示模式，使用模拟数据进行展示。

**超级管理员账号**:
- 邮箱: `admin@health.com`
- 密码: `Admin@123`

## 代码规范

- 使用 Composition API 和 `<script setup>` 语法
- 使用 TypeScript 进行类型定义
- 遵循 Vue 3 最佳实践
- 组件化开发
- 良好的代码组织和注释

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发团队

- 前端开发: 管理后台开发团队
