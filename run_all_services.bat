@echo off
echo 正在启动SilentSign所有服务...
echo.

:: 启动后端服务
echo 1. 启动后端服务...
cd backend
start python app.py
cd ..

:: 等待后端启动
timeout /t 3 >nul

:: 启动前端服务
echo 2. 启动前端服务...
cd frontend/web
start python start_server.py
cd ../..

echo.
echo 所有服务已启动完成！
echo.
echo 后端API: http://localhost:5000
echo 前端页面: http://localhost:3000
echo.
echo 按任意键退出...
pause >nul