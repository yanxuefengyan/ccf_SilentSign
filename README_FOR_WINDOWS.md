# SilentSign Windows 部署指南

## 🚀 快速开始

### 1. 安装Python
确保已安装Python 3.7或更高版本
- 下载地址: https://www.python.org/downloads/
- 安装时勾选"Add Python to PATH"

### 2. 安装项目依赖
打开命令提示符(CMD)，执行以下命令：
```cmd
cd C:\你的项目路径\pr01
pip install -r requirements.txt
```

### 3. 启动项目
使用以下分步方法启动项目：

#### 方法一：使用批处理文件
双击运行 `start_project.bat`（需要先创建）

#### 方法二：手动启动
1. 打开第一个命令提示符窗口：
```cmd
cd C:\你的项目路径\pr01\backend
python app.py
```

2. 打开第二个命令提示符窗口：
```cmd
cd C:\你的项目路径\pr01\frontend\web
python -m http.server 3000
```

### 4. 访问应用
- Web前端: http://localhost:3000
- 后端API: http://localhost:5000

## 📦 完整启动脚本

创建 `start_project.bat` 文件，内容如下：
```bat
@echo off
title SilentSign 项目启动
color 0a

echo 正在准备启动 SilentSign 项目...
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 错误：未找到Python，请先安装Python并添加到PATH
    pause
    exit /b
)

:: 安装依赖（如果尚未安装）
if not exist "venv" (
    echo 正在创建虚拟环境并安装依赖...
    python -m venv venv
    venv\Scripts\activate && pip install -r requirements.txt
)

:: 启动后端服务
echo.
echo 启动后端服务 (端口5000)...
start "" "cmd" /k "cd backend && venv\Scripts\activate && python app.py"

:: 等待3秒确保后端启动
timeout /t 3 >nul

:: 启动前端服务
echo.
echo 启动前端开发服务器 (端口3000)...
start "" "cmd" /k "cd frontend\web && python -m http.server 3000"

:: 显示访问信息
echo.
echo ======================================
echo     项目已成功启动！
echo ======================================
echo Web前端: http://localhost:3000
echo 后端API: http://localhost:5000
echo ======================================
echo.

pause
```

## ❓ 常见问题解决

### 1. 命令无法识别
- 确保使用**命令提示符(CMD)**而不是PowerShell
- 右键"以管理员身份运行"CMD

### 2. 端口冲突
- 修改 `backend/app.py` 和 `frontend/web/start_server.py` 中的端口号

### 3. 依赖安装失败
```cmd
# 单独安装有问题的包
pip install 包名 --force-reinstall
```

## 📞 技术支持
如仍有问题，请提供：
1. 完整的错误信息截图
2. 您执行的完整命令
3. 项目目录结构截图