@echo off
echo 正在启动SilentSign本地服务器...
echo.

:: 切换到前端目录
cd frontend\web

:: 启动Python服务器
python start_server.py

:: 等待用户按任意键退出
echo.
echo 按任意键退出...
pause >nul