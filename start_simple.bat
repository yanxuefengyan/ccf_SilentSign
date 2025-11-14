@echo off
chcp 65001 >nul
title SilentSign Launcher
color 0a

echo ===============================================
echo           SilentSign Project Launcher
echo ===============================================
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python and add it to your system PATH
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: 检查项目目录结构
if not exist "backend\app.py" (
    echo ERROR: Project structure is incorrect
    echo Please make sure you are in the project root directory
    echo Current directory: %cd%
    pause
    exit /b 1
)

:: 检查前端目录
if not exist "frontend\web\index.html" (
    echo WARNING: Frontend files not found
    echo Continuing with backend only...
    echo.
)

:: 启动后端服务
echo Starting backend service (port 5000)...
cd backend
start "" cmd /k "python app.py"
cd ..

:: 等待3秒确保后端启动
timeout /t 3 >nul

:: 检查后端是否启动成功
curl -s http://localhost:5000 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend service failed to start
    echo Please check:
    echo 1. Python is installed
    echo 2. Requirements are installed (pip install -r requirements.txt)
    echo 3. backend/app.py exists and is correct
    pause
    exit /b 1
)

:: 启动前端服务
echo Starting frontend server (port 3000)...
cd frontend/web
start "" cmd /k "python -m http.server 3000"
cd ../..

:: 显示访问信息
echo.
echo ===============================================
echo           Project Started Successfully!
echo ===============================================
echo Backend API: http://localhost:5000
echo Web Frontend: http://localhost:3000
echo.
echo If browser doesn't open automatically, please visit the URLs above
echo.

:: 保持窗口打开
pause