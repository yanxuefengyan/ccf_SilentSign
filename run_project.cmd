@echo off
title SilentSign Project Starter
color 0a

echo ===============================================
echo    SilentSign Project Starter
echo ===============================================
echo.

:: 检查Python
echo Checking Python...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python not found. Please install Python first.
    pause
    exit /b 1
)

:: 安装依赖
echo Installing dependencies...
pip install flask flask-cors requests

:: 启动后端
echo.
echo Starting backend service on port 5000...
start cmd /k "cd backend && python app.py"

:: 启动前端
echo.
echo Starting frontend server on port 3000...
start cmd /k "cd frontend\web && python -m http.server 3000"

echo.
echo ===============================================
echo    Project Started Successfully!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ===============================================
echo Press any key to exit...
pause