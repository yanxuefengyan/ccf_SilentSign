@echo off
echo 启动SilentSign项目所有服务...
echo.

:: 创建新窗口启动后端服务
echo 1. 启动后端服务 (端口5000)...
start cmd /k "cd backend && python app.py"

:: 等待后端启动
timeout /t 5 >nul

:: 创建新窗口启动前端服务
echo 2. 启动前端开发服务器 (端口3000)...
start cmd /k "cd frontend/web && python -m http.server 3000"

echo.
echo 服务已启动完成！
echo.
echo API服务: http://localhost:5000
echo Web前端: http://localhost:3000
echo.
echo 重要提示:
echo - 如果使用Chrome浏览器，请确保没有其他程序占用端口
echo - 如果遇到端口冲突，请关闭占用端口的程序或等待几秒后重试
echo - 如果防火墙阻止访问，请允许Python访问网络

pause