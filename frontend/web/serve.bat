@echo off
echo Starting SilentSign development server...
echo.
echo Available ports:
echo 1. http://localhost:3000 (default)
echo 2. http://localhost:8080
echo 3. http://localhost:5000
echo.
echo Opening browser...
echo.

REM 尝试启动服务器
node server.js

pause