@echo off
title SilentSign Final Startup
color 0a

echo ===============================================
echo      SilentSign Project - Final Startup
echo ===============================================
echo.

:: 检查Python
echo Checking Python installation...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python not found. Please install Python first.
    pause
    exit /b 1
)

:: 检查必要依赖
echo Checking required dependencies...
python -c "import flask; print('Flask: OK')" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Installing Flask...
    pip install flask flask-cors
)

:: 启动后端
echo.
echo Starting backend service on port 5000...
start "" cmd /k "cd backend && python app.py"

:: 启动前端
echo.
echo Starting frontend server on port 3000...
start "" cmd /k "cd frontend\web && python -m http.server 3000"

:: 显示信息
echo.
echo ===============================================
echo     Startup Complete!
echo ===============================================
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ===============================================
echo Press any key to exit...
pause