#!/bin/bash

# 健康管理系统后端一键部署脚本

set -e

echo "================================"
echo "健康管理系统后端部署脚本"
echo "================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js 未安装，正在安装...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

echo -e "${GREEN}Node.js 版本: $(node -v)${NC}"

# 检查 PM2 是否已安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 未安装，正在安装...${NC}"
    npm install -g pm2
fi

# 进入项目目录
PROJECT_DIR="/var/www/health-management/health-backend"
mkdir -p /var/www/health-management

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}项目目录不存在: $PROJECT_DIR${NC}"
    echo "请先将项目代码上传到服务器"
    exit 1
fi

cd "$PROJECT_DIR"

# 检查 .env 文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}.env 文件不存在，正在创建...${NC}"
    cp .env.example .env
    echo -e "${RED}请编辑 .env 文件填入实际配置后再运行部署！${NC}"
    echo "nano $PROJECT_DIR/.env"
    exit 1
fi

# 安装依赖
echo -e "${YELLOW}正在安装依赖...${NC}"
npm install

# 执行数据库迁移
echo -e "${YELLOW}请确保已在 Supabase 中执行数据库迁移脚本${NC}"
echo "迁移脚本路径: $PROJECT_DIR/database/migrations/add_password_hash.sql"
read -p "是否已执行迁移？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "请先执行数据库迁移后再运行部署"
    exit 1
fi

# 停止旧服务
if pm2 list | grep -q "health-api"; then
    echo -e "${YELLOW}正在停止旧服务...${NC}"
    pm2 stop health-api || true
    pm2 delete health-api || true
fi

# 启动服务
echo -e "${YELLOW}正在启动服务...${NC}"
pm2 start src/app.js --name health-api

# 保存 PM2 配置
pm2 save

# 配置 PM2 开机自启
echo -e "${YELLOW}配置开机自启...${NC}"
pm2 startup systemd -u root --hp /root

echo ""
echo -e "${GREEN}================================"
echo "部署完成！"
echo "================================${NC}"
echo ""
echo "服务状态:"
pm2 status health-api
echo ""
echo "查看日志: pm2 logs health-api"
echo "重启服务: pm2 restart health-api"
echo "停止服务: pm2 stop health-api"
echo ""
echo -e "${GREEN}API 地址: http://localhost:3000/api${NC}"
