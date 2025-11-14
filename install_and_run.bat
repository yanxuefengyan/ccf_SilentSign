@echo off
title Install and Run SilentSign
color 0a

echo ===============================================
echo    Installing SilentSign Dependencies
echo ===============================================
echo.

:: 升级pip
echo Upgrading pip...
python -m pip install --upgrade pip

:: 安装必要依赖
echo Installing required packages...
pip install flask flask-cors requests numpy opencv-python

:: 检查安装结果
echo.
echo Checking installations...
python -c "import flask; print('Flask: Installed')" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Flask: OK
) else (
    echo Flask: FAILED
)

python -c "import numpy; print('NumPy: Installed')" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo NumPy: OK
) else (
    echo NumPy: FAILED
)

echo.
echo ===============================================
echo    Starting SilentSign Services
echo ===============================================
echo.

:: 启动后端服务
echo Starting backend...
start "" cmd /k "cd backend && python app.py"

:: 启动前端服务
echo Starting frontend...
start "" cmd /k "cd frontend\web && python -m http.server 3000"

echo.
echo ===============================================
echo    Services Started
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ===============================================
echo Press any key to exit...
pause