# SilentSign API 配置指南

## 📋 概述
本文档详细说明如何配置SilentSign项目的API接口，包括文心4.5模型集成、第三方服务配置和自定义API设置。

## 🔑 API 密钥配置

### 1. 文心4.5 API 配置
SilentSign项目使用文心4.5模型提供核心AI功能，需要配置相应的API密钥。

#### 获取API密钥
1. 访问百度智能云平台：https://cloud.baidu.com/
2. 注册并登录账户
3. 创建文心一言应用，获取API Key和Secret Key

#### 配置环境变量
在项目根目录创建 `.env` 文件：

```env
# 文心4.5 API配置
WENXIN_API_KEY=your_api_key_here
WENXIN_SECRET_KEY=your_secret_key_here
WENXIN_BASE_URL=https://aip.baidubce.com

# 服务配置
FLASK_APP=backend/app.py
FLASK_ENV=development
PORT=5000
HOST=0.0.0.0
```

### 2. 更新配置文件
修改 `backend/config.py` 文件，添加API配置：

```python
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Config:
    # 文心API配置
    WENXIN_CONFIG = {
        'api_key': os.getenv('WENXIN_API_KEY'),
        'secret_key': os.getenv('WENXIN_SECRET_KEY'),
        'base_url': os.getenv('WENXIN_BASE_URL', 'https://aip.baidubce.com'),
        'timeout': 30,  # 超时时间(秒)
        'retry_times': 3  # 重试次数
    }
```

## 🔧 API 端点配置

### 核心API端点
SilentSign提供以下主要API端点：

| 端点 | 方法 | 功能 | 请求格式 |
|------|------|------|----------|
| `/api/health` | GET | 健康检查 | 无参数 |
| `/api/sign-to-text` | POST | 手语识别 | multipart/form-data |
| `/api/text-to-speech` | POST | 文本转语音 | application/json |
| `/api/speech-to-text` | POST | 语音转文本 | multipart/form-data |

### API请求示例

#### 1. 手语识别 API
```bash
curl -X POST http://localhost:5000/api/sign-to-text \
  -F "video=@sign_gesture.mp4" \
  -H "Content-Type: multipart/form-data"
```

响应格式：
```json
{
  "sentence": "你好，我需要帮助",
  "confidence": 0.92,
  "words": [
    {"word": "你好", "start": 0.0, "end": 0.8},
    {"word": "我", "start": 0.8, "end": 1.2},
    {"word": "需要", "start": 1.2, "end": 1.8},
    {"word": "帮助", "start": 1.8, "end": 2.5}
  ]
}
```

#### 2. 文本转语音 API
```bash
curl -X POST http://localhost:5000/api/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，欢迎使用SilentSign",
    "voice_type": "youth_female"
  }'
```

响应格式：
```json
{
  "audio": "base64_encoded_audio_data",
  "voice_type": "youth_female"
}
```

#### 3. 语音转文本 API
```bash
curl -X POST http://localhost:5000/api/speech-to-text \
  -F "audio=@speech.wav" \
  -H "Content-Type: multipart/form-data"
```

响应格式：
```json
{
  "text": "识别出的语音内容",
  "confidence": 0.89
}
```

## 🛠️ 自定义API配置

### 1. 添加新的API端点
在 `backend/app.py` 中添加新端点：

```python
@app.route('/api/custom-endpoint', methods=['POST'])
def custom_endpoint():
    """自定义API端点"""
    try:
        data = request.get_json()
        # 处理逻辑
        result = process_custom_request(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```

### 2. 配置CORS
如需跨域访问，更新CORS配置：

```python
from flask_cors import CORS

# 配置CORS
CORS(app, origins=[
    'http://localhost:3000',
    'https://your-frontend-domain.com'
])
```

## 🔐 安全配置

### 1. API密钥安全
- 永远不要在代码中硬编码API密钥
- 使用环境变量或安全的密钥管理服务
- 定期轮换API密钥

### 2. 请求限制
配置请求速率限制：

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

@app.route('/api/sign-to-text', methods=['POST'])
@limiter.limit("10 per minute")
def sign_to_text():
    # API逻辑
    pass
```

### 3. 文件上传安全
配置文件上传限制：

```python
# 配置文件上传
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB
app.config['UPLOAD_EXTENSIONS'] = ['.mp4', '.wav', '.mp3']
```

## 📊 监控和日志

### 1. API访问日志
添加请求日志记录：

```python
import logging
from datetime import datetime

@app.before_request
def log_request_info():
    logger.info('API请求: %s %s - %s', 
                request.method, request.url, 
                datetime.now().isoformat())
```

### 2. 性能监控
配置性能指标收集：

```python
import time

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    duration = time.time() - request.start_time
    logger.info('请求耗时: %.3fs', duration)
    return response
```

## 🚀 部署配置

### 1. 生产环境API配置
```env
# 生产环境配置
FLASK_ENV=production
DEBUG=False
PORT=80
HOST=0.0.0.0

# 数据库配置（如需要）
DATABASE_URL=postgresql://user:pass@localhost/silentsign

# Redis配置（缓存）
REDIS_URL=redis://localhost:6379/0
```

### 2. 使用Gunicorn部署
```bash
# 安装Gunicorn
pip install gunicorn

# 启动服务
gunicorn --workers=4 --bind=0.0.0.0:5000 backend.app:app
```

## 🧪 API测试

### 1. 单元测试
创建API测试文件 `tests/test_api.py`：

```python
import unittest
import json
from backend.app import app

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_check(self):
        response = self.app.get('/api/health')
        self.assertEqual(response.status_code, 200)
```

### 2. 集成测试
使用Postman或其他工具进行API集成测试。

## ❓ 常见问题

### Q1: API密钥配置错误
**问题**: 文心API返回认证失败
**解决**: 检查API_KEY和SECRET_KEY是否正确配置

### Q2: 跨域请求被阻止
**问题**: 前端无法访问后端API
**解决**: 配置正确的CORS设置

### Q3: 文件上传失败
**问题**: 视频/音频文件上传失败
**解决**: 检查文件大小限制和格式支持

## 📞 技术支持
如有API配置问题，请联系：
- 技术支持邮箱: api-support@silentsign.com
- 文档更新: https://docs.silentsign.com/api

---
*最后更新: 2024年11月*