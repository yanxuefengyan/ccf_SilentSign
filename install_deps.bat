@echo off
title Install Dependencies
color 0a

echo Installing SilentSign dependencies...
echo.

:: 检查pip是否可用
pip --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: pip is not available
    echo Please make sure Python is installed and added to PATH
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: 安装依赖
echo Installing required packages...
pip install -r requirements.txt

:: 检查安装结果
if %ERRORLEVEL% equ 0 (
    echo.
    echo Dependencies installed successfully!
) else (
    echo.
    echo WARNING: Some packages may have failed to install
    echo Please check the error messages above
)

pause