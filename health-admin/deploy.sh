#!/bin/bash
# 健康管理系统 - 管理后台部署脚本

set -e

echo "=================================="
echo "健康管理系统 - 管理后台部署"
echo "=================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1: 检查环境
echo -e "\n${YELLOW}步骤 1/6: 检查环境...${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未安装Node.js${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未安装npm${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# 步骤2: 安装依赖
echo -e "\n${YELLOW}步骤 2/6: 安装依赖...${NC}"
npm ci --silent
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 步骤3: 检查环境变量
echo -e "\n${YELLOW}步骤 3/6: 检查环境变量...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}警告: 未找到.env.production文件${NC}"
    echo "请创建.env.production文件并配置以下变量："
    echo "  VITE_API_BASE_URL=https://your-backend-api.com/api"
    echo "  VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "  VITE_SUPABASE_KEY=your-supabase-anon-key"
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ 环境变量文件存在${NC}"
fi

# 步骤4: TypeScript类型检查
echo -e "\n${YELLOW}步骤 4/6: TypeScript类型检查...${NC}"
npm run build:check 2>&1 | grep -E "error TS" && {
    echo -e "${RED}类型检查失败${NC}"
    exit 1
}
echo -e "${GREEN}✓ 类型检查通过${NC}"

# 步骤5: 构建生产版本
echo -e "\n${YELLOW}步骤 5/6: 构建生产版本...${NC}"
npm run build
echo -e "${GREEN}✓ 构建完成${NC}"

# 步骤6: 部署选项
echo -e "\n${YELLOW}步骤 6/6: 选择部署方式...${NC}"
echo "1) 本地预览"
echo "2) Vercel部署"
echo "3) Netlify部署"
echo "4) Docker部署"
echo "5) 仅构建（手动部署）"
read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo -e "\n${GREEN}启动本地预览...${NC}"
        npx serve dist -p 3000
        ;;
    2)
        echo -e "\n${GREEN}部署到Vercel...${NC}"
        npx vercel --prod
        ;;
    3)
        echo -e "\n${GREEN}部署到Netlify...${NC}"
        npx netlify deploy --prod --dir=dist
        ;;
    4)
        echo -e "\n${GREEN}构建Docker镜像...${NC}"
        docker build -t health-admin:latest .
        echo "运行以下命令启动容器："
        echo "docker run -d -p 3000:80 --name health-admin health-admin:latest"
        ;;
    5)
        echo -e "\n${GREEN}构建产物位于 dist/ 目录${NC}"
        echo "请手动上传到服务器或部署平台"
        ;;
    *)
        echo -e "${RED}无效选择${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}==================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}==================================${NC}"
