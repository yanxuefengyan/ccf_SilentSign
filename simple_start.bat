@echo off
title Simple SilentSign Startup
color 0a

echo ===============================================
echo    Simple SilentSign Startup
echo ===============================================
echo.

:: 安装必要依赖
echo Installing required packages...
pip install flask flask-cors requests

:: 启动后端
echo.
echo Starting backend service...
start cmd /k "cd backend && python app.py"

:: 启动前端
echo Starting frontend server...
start cmd /k "cd frontend\web && python -m http.server 3000"

echo.
echo ===============================================
echo    Services Started Successfully!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ===============================================
echo Press any key to exit...
pause