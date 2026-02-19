#!/bin/bash

# 健康管理系统 - 快速启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 检查 Node.js 是否安装
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装！请先安装 Node.js 18 或更高版本"
        print_info "访问 https://nodejs.org/ 下载安装"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js 版本过低！当前版本：$(node -v)，需要 18 或更高版本"
        exit 1
    fi

    print_success "Node.js 版本检查通过: $(node -v)"
}

# 检查环境变量配置
check_env_config() {
    if [ ! -f "health-admin/.env" ]; then
        print_warning ".env 文件不存在"

        if [ -f "health-admin/.env.example" ]; then
            print_info "从 .env.example 创建 .env 文件..."
            cp health-admin/.env.example health-admin/.env
            print_success ".env 文件已创建"

            print_warning "请编辑 health-admin/.env 文件，填入你的 Supabase 配置"
            print_info "获取方式："
            echo "  1. 访问 https://supabase.com 创建项目"
            echo "  2. 在 Settings -> API 中获取 URL 和 anon key"
            echo ""
            read -p "按 Enter 继续..."
        fi
    else
        # 检查是否还是默认配置
        if grep -q "https://your-project.supabase.co" health-admin/.env; then
            print_warning "检测到 .env 中仍是示例配置"
            print_info "请编辑 health-admin/.env 文件，填入你的实际 Supabase 配置"
            echo ""
            read -p "按 Enter 继续..."
        else
            print_success "环境变量配置检查通过"
        fi
    fi
}

# 安装依赖
install_dependencies() {
    print_info "检查并安装依赖..."

    if [ ! -d "health-admin/node_modules" ]; then
        print_info "安装管理后台依赖..."
        cd health-admin
        npm install
        cd ..
        print_success "依赖安装完成"
    else
        print_success "依赖已存在"
    fi
}

# 启动开发服务器
start_dev_server() {
    print_info "启动开发服务器..."
    cd health-admin
    npm run dev
}

# 主函数
main() {
    echo ""
    echo "=================================="
    echo "  健康管理系统 - 快速启动"
    echo "=================================="
    echo ""

    # 检查 Node.js
    check_nodejs
    echo ""

    # 检查环境变量
    check_env_config
    echo ""

    # 安装依赖
    install_dependencies
    echo ""

    # 启动服务器
    start_dev_server
}

# 运行主函数
main
