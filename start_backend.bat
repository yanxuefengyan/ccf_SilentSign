@echo off
echo 正在启动SilentSign后端服务...
echo.

:: 切换到后端目录
cd backend

:: 启动Flask应用
python app.py

:: 等待用户按任意键退出
echo.
echo 按任意键退出...
pause >nul