@echo off
REM 健康管理系统 - Windows 快速启动脚本

setlocal enabledelayedexpansion

echo.
echo ==================================
echo   健康管理系统 - 快速启动
echo ==================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Node.js 未安装！请先安装 Node.js 18 或更高版本
    echo 访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

for /f "tokens=1 delims=v" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=1 delims=." %%a in ("%NODE_VERSION%") do set NODE_MAJOR=%%a
if %NODE_MAJOR% LSS 18 (
    echo [错误] Node.js 版本过低！当前版本：%NODE_VERSION%，需要 18 或更高版本
    pause
    exit /b 1
)

echo [成功] Node.js 版本检查通过: %NODE_VERSION%
echo.

REM 检查环境变量配置
if not exist "health-admin\.env" (
    echo [警告] .env 文件不存在

    if exist "health-admin\.env.example" (
        echo 从 .env.example 创建 .env 文件...
        copy "health-admin\.env.example" "health-admin\.env" >nul
        echo [成功] .env 文件已创建

        echo.
        echo [警告] 请编辑 health-admin\.env 文件，填入你的 Supabase 配置
        echo 获取方式：
        echo   1. 访问 https://supabase.com 创建项目
        echo   2. 在 Settings ^>^> API 中获取 URL 和 anon key
        echo.
        pause
    )
) else (
    REM 检查是否还是默认配置
    findstr /C:"your-project.supabase.co" "health-admin\.env" >nul
    if not %ERRORLEVEL% NEQ 0 (
        echo [警告] 检测到 .env 中仍是示例配置
        echo [信息] 请编辑 health-admin\.env 文件，填入你的实际 Supabase 配置
        echo.
        pause
    ) else (
        echo [成功] 环境变量配置检查通过
    )
)
echo.

REM 安装依赖
echo [信息] 检查并安装依赖...
if not exist "health-admin\node_modules" (
    echo [信息] 安装管理后台依赖...
    cd health-admin
    call npm install
    cd ..
    echo [成功] 依赖安装完成
) else (
    echo [成功] 依赖已存在
)
echo.

REM 启动开发服务器
echo [信息] 启动开发服务器...
cd health-admin
call npm run dev

pause
