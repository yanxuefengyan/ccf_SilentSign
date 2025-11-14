# SilentSign 项目部署说明

## 🎯 项目概述
SilentSign是一个基于AI的手语实时翻译系统，为听障人士提供无障碍沟通解决方案。本部署说明将指导您将项目部署到生产环境。

## 📋 系统要求

### 硬件要求
- CPU: 双核以上处理器
- 内存: 4GB以上
- 存储: 至少10GB可用空间
- 网络: 稳定的互联网连接（用于在线模式）

### 软件要求
- 操作系统: Linux/macOS/Windows
- Python: 3.7+
- Node.js: 14+（如果需要前端构建）
- 浏览器: Chrome/Firefox/Safari最新版本

## 🚀 部署步骤

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/silentsign.git
cd silentsign
```

### 2. 安装依赖
```bash
# 后端依赖
pip install -r requirements.txt

# 前端依赖（如果需要构建）
cd frontend/web
npm install
npm run build
```

### 3. 配置环境变量
创建`.env`文件：
```env
# 服务器配置
FLASK_APP=backend/app.py
FLASK_ENV=production
PORT=5000

# 模型配置
MODEL_PATH=models/wenxin4.5
MODEL_VERSION=4.5

# 数据库配置（如果需要）
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=password
# DB_NAME=silentsign
```

### 4. 启动服务
```bash
# 启动后端服务
python run_server.py

# 或者使用Gunicorn（生产环境推荐）
gunicorn --workers=4 --bind=0.0.0.0:5000 backend.app:app
```

### 5. 访问应用
- 后端API: http://your-server-ip:5000
- Web前端: 打开 `frontend/web/index.html`
- 微信小程序: 导入 `frontend/miniprogram` 目录到微信开发者工具

## 🌐 微信小程序部署

### 1. 小程序配置
- 在微信公众平台注册小程序账号
- 获取AppID
- 在 `frontend/miniprogram/project.config.json` 中配置AppID

### 2. 上传代码
- 使用微信开发者工具打开 `frontend/miniprogram` 目录
- 点击"上传"按钮上传代码
- 在微信公众平台提交审核

### 3. 发布小程序
- 审核通过后，在微信公众平台发布小程序
- 用户可通过微信搜索"SilentSign"使用

## 🧪 测试验证

### 功能测试
```bash
# 测试手语转语音功能
curl -X POST http://localhost:5000/api/sign-to-text \
  -F "video=@test_video.mp4"
  
# 测试语音转手语功能
curl -X POST http://localhost:5000/api/speech-to-text \
  -F "audio=@test_audio.wav"
```

### 性能测试
- 使用JMeter或Locust进行负载测试
- 测试并发连接数和响应时间
- 监控服务器资源使用情况

## ❓ 常见问题解决

### 1. 依赖安装失败
```bash
# 升级pip
pip install --upgrade pip

# 安装特定版本依赖
pip install package==version
```

### 2. 端口被占用
```bash
# 查找占用端口的进程
lsof -i :5000

# 终止进程
kill -9 PID
```

### 3. 微信小程序授权问题
- 确保小程序已获得摄像头和录音权限
- 在微信公众平台配置正确的服务器域名

## 📞 技术支持
如有任何部署问题，请联系技术支持：
- 邮箱: support@silentsign.com
- 电话: 400-123-4567

## 📄 许可协议
本项目基于Apache-2.0开源协议发布。