# 健康管理系统 - 部署检查清单

## 部署前准备

### 代码检查
- [x] 代码构建无错误
- [x] TypeScript类型检查通过
- [x] 所有API已对接
- [x] 环境变量配置文件已创建
- [x] 响应式布局测试通过

### 配置文件
- [x] `.env.production` - 生产环境变量
- [x] `Dockerfile` - Docker镜像构建
- [x] `docker-compose.yml` - 容器编排
- [x] `nginx.conf` - Nginx配置
- [x] `deploy.sh` - 部署脚本

### 文档
- [x] `README_ADMIN.md` - 项目说明
- [x] `DEPLOYMENT.md` - 部署指南

## 部署步骤

### 1. 构建生产版本
```bash
npm run build
```
- [x] 构建成功
- [x] 产物在 `dist/` 目录
- [x] 文件大小合理

### 2. 配置环境变量
在部署平台设置以下环境变量：
- [ ] `VITE_API_BASE_URL` - 后端API地址
- [ ] `VITE_SUPABASE_URL` - Supabase地址（可选）
- [ ] `VITE_SUPABASE_KEY` - Supabase密钥（可选）

### 3. 部署到平台

#### Vercel（推荐）
```bash
npm i -g vercel
vercel login
vercel --prod
```
- [ ] 账号已登录
- [ ] 项目已连接
- [ ] 环境变量已配置
- [ ] 部署成功

#### Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```
- [ ] 账号已登录
- [ ] 环境变量已配置
- [ ] 部署成功

#### Docker
```bash
docker build -t health-admin:latest .
docker run -d -p 3000:80 --name health-admin health-admin:latest
```
- [ ] 镜像构建成功
- [ ] 容器运行正常
- [ ] 端口可访问

#### 云服务器 + Nginx
- [ ] dist目录已上传
- [ ] Nginx已配置
- [ ] SSL证书已安装
- [ ] 域名已解析

## 部署后验证

### 功能测试
- [ ] 页面能正常访问
- [ ] 登录功能正常
- [ ] 用户管理功能正常
- [ ] 健康数据管理正常
- [ ] 运动数据管理正常
- [ ] 睡眠数据管理正常
- [ ] 饮食记录管理正常
- [ ] 数据分析图表正常显示
- [ ] 报告生成功能正常
- [ ] 系统设置功能正常

### 性能检查
- [ ] 页面加载速度 < 3秒
- [ ] 静态资源已缓存
- [ ] Gzip压缩已启用
- [ ] 图片已优化

### 安全检查
- [ ] HTTPS已启用
- [ ] API密钥未泄露
- [ ] XSS防护已启用
- [ ] CSRF防护已启用

## 回滚计划

如果部署出现问题：

1. **Vercel回滚**
   ```bash
   vercel rollback
   ```

2. **Docker回滚**
   ```bash
   docker stop health-admin
   docker rm health-admin
   docker run -d -p 3000:80 --name health-admin health-admin:previous-version
   ```

3. **服务器回滚**
   ```bash
   # 恢复备份
   rm -rf /var/www/health-admin/*
   cp -r /var/www/health-admin.backup/* /var/www/health-admin/
   ```

## 域名配置

| 服务 | 建议域名 |
|------|----------|
| 管理后台 | admin.your-domain.com |
| 后端API | api.your-domain.com |
| 小程序 | 配置为业务域名 |

## 监控配置

建议接入以下监控服务：
- [ ] Sentry - 错误监控
- [ ] Google Analytics - 用户分析
- [ ] LogRocket - 用户行为录制

## 联系信息

- 前端开发: 前端开发(后台)
- 部署日期: 2026-02-28
- 版本: v1.0.0
