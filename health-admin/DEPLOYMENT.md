# 健康管理系统 - 管理后台部署指南

## 部署前准备

### 1. 环境变量配置

复制 `.env.production` 并修改以下变量：

```bash
# API地址（修改为实际后端地址）
VITE_API_BASE_URL=https://your-backend-api.com/api

# Supabase配置（如使用Supabase）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key
```

### 2. 构建生产版本

```bash
npm run build
```

构建产物将生成在 `dist/` 目录。

## 部署方式

### 方式一：Vercel部署（推荐）

1. **安装Vercel CLI**
```bash
npm i -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署**
```bash
vercel --prod
```

4. **设置环境变量**
在Vercel控制台设置：
- `VITE_API_BASE_URL`: 你的后端API地址

### 方式二：Netlify部署

1. **安装Netlify CLI**
```bash
npm i -g netlify-cli
```

2. **部署**
```bash
netlify deploy --prod --dir=dist
```

3. **设置环境变量**
在Netlify控制台添加环境变量。

### 方式三：云服务器部署（Nginx）

1. **构建项目**
```bash
npm run build
```

2. **上传到服务器**
```bash
scp -r dist/* user@your-server:/var/www/health-admin/
```

3. **配置Nginx**
```nginx
server {
    listen 80;
    server_name admin.your-domain.com;

    root /var/www/health-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理（可选）
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **配置HTTPS（使用Let's Encrypt）**
```bash
sudo certbot --nginx -d admin.your-domain.com
```

### 方式四：Docker部署

1. **创建Dockerfile**
```dockerfile
# 构建阶段
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **构建镜像**
```bash
docker build -t health-admin:latest .
```

3. **运行容器**
```bash
docker run -d -p 80:80 --name health-admin health-admin:latest
```

## 部署后检查清单

- [ ] 页面能正常访问
- [ ] 登录功能正常
- [ ] 数据列表能正常加载
- [ ] 创建/编辑/删除功能正常
- [ ] 图表正常显示
- [ ] 响应式布局在移动端正常
- [ ] 控制台无错误信息

## 性能优化建议

1. **启用Gzip压缩**（Nginx配置）
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

2. **配置CDN**（静态资源）
- 将 `dist/assets` 目录上传到CDN
- 修改 `vite.config.ts` 的 `base` 配置

3. **启用浏览器缓存**
- 静态资源设置长期缓存
- HTML文件设置短缓存

## 监控与日志

建议接入以下服务：
- 错误监控：Sentry
- 性能监控：Google Analytics
- 日志收集：LogRocket

## 回滚方案

保留最近3个版本的构建产物，出现问题时可快速回滚：

```bash
# 备份当前版本
cp -r dist dist.backup.$(date +%Y%m%d)

# 回滚到指定版本
rm -rf dist
cp -r dist.backup.20240228 dist
```

## 域名配置建议

- 管理后台: `admin.your-domain.com`
- 后端API: `api.your-domain.com`
- 小程序: 配置服务器域名 `admin.your-domain.com` 为业务域名
