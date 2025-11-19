# config.py - 项目配置文件
import os

class Config:
    # 基础配置
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 模型配置
    MODEL_CONFIG = {
        'wenxin_model_path': os.path.join(BASE_DIR, 'models', 'wenxin4.5', 'sign_language_model'),
        'input_size': (224, 224),
        'supported_gestures': 1500,
        'confidence_threshold': 0.7,
        'max_sequence_length': 50
    }
    
    # 音频配置
    AUDIO_CONFIG = {
        'sample_rate': 16000,
        'channels': 1,
        'chunk_size': 1024,
        'voice_types': ['youth_male', 'youth_female', 'child', 'elder', 'neutral'],
        'default_voice': 'youth_male'
    }
    
    # 动画配置
    ANIMATION_CONFIG = {
        'fps': 30,
        'gltf_model_path': os.path.join(BASE_DIR, 'models', 'blender', 'sign_animation.gltf'),
        'supported_emotions': ['happy', 'sad', 'angry', 'surprised', 'neutral', 'urgent'],
        'default_emotion': 'neutral'
    }
    
    # API配置
    API_CONFIG = {
        'host': '0.0.0.0',
        'port': 5000,
        'debug': True,
        'cors_origins': ['http://localhost:3000', 'https://yourdomain.com']
    }
    
    # 离线配置
    OFFLINE_CONFIG = {
        'enabled': True,
        'phrases': [
            '你好', '谢谢', '请问医院在哪里', '我要挂号',
            '这个多少钱', '紧急求助', '我需要帮助',
            '厕所在哪', '我聋哑人', '请写下来'
        ],
        'cache_size': 10,
        'expire_time': 3600  # 1小时
    }
    
    # 性能配置
    PERFORMANCE_CONFIG = {
        'max_video_duration': 10,  # 秒
        'max_audio_duration': 15,  # 秒
        'batch_size': 1,
        'gpu_acceleration': True,
        'memory_limit_mb': 512
    }
    
    # 安全配置
    SECURITY_CONFIG = {
        'max_file_size': 10 * 1024 * 1024,  # 10MB
        'allowed_video_formats': ['mp4', 'webm', 'mov'],
        'allowed_audio_formats': ['mp3', 'wav', 'ogg'],
        'rate_limit': '100/hour'
    }

# 开发环境配置
class DevelopmentConfig(Config):
    DEBUG = True
    MODEL_CONFIG = {
        **Config.MODEL_CONFIG,
        'wenxin_model_path': os.path.join(Config.BASE_DIR, 'models', 'test_model')
    }

# 生产环境配置
class ProductionConfig(Config):
    DEBUG = False
    API_CONFIG = {
        **Config.API_CONFIG,
        'host': '0.0.0.0',
        'port': 80,
        'debug': False
    }

# 测试环境配置
class TestingConfig(Config):
    TESTING = True
    MODEL_CONFIG = {
        **Config.MODEL_CONFIG,
        'wenxin_model_path': os.path.join(Config.BASE_DIR, 'tests', 'test_models')
    }

# 配置映射
config_dict = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(env='default'):
    return config_dict.get(env, config_dict['default'])