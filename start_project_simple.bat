@echo off
title SilentSign 项目启动
color 0a

echo 正在启动SilentSign项目...
echo.

:: 启动后端服务
echo 启动后端服务 (端口5000)...
cd backend
start "" "python" "app.py"
cd ..

:: 等待3秒确保后端启动
timeout /t 3 >nul

:: 检查后端是否启动成功
curl -s http://localhost:5000 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 后端服务启动失败，请检查：
    echo 1. 确保Python已安装
    echo 2. 确保在项目根目录下
    echo 3. 检查backend/app.py文件是否存在
    pause
    exit /b 1
)

:: 启动前端服务
echo 启动前端开发服务器 (端口3000)...
cd frontend/web
start "" "python" "-m" "http.server" "3000"
cd ../..

:: 显示访问信息
echo.
echo 项目已成功启动！
echo 后端API: http://localhost:5000
echo Web前端: http://localhost:3000
echo.
echo 如果浏览器没有自动打开，请手动访问上述地址
echo.

:: 保持窗口打开
pause