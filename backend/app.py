from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import base64

app = Flask(__name__)
CORS(app)

# 导入新的模型集成模块
from backend.models.wenxin_integration import get_wenxin_integration

# 初始化文心4.5模型集成
wenxin_integration = get_wenxin_integration()

@app.route('/api/sign-to-text', methods=['POST'])
async def sign_to_text():
    """接收手语视频流，返回识别文本"""
    try:
        # 获取上传的视频数据
        if 'video' not in request.files:
            return jsonify({'error': '未找到视频文件'}), 400
            
        video_file = request.files['video']
        video_data = video_file.read()
        
        # 调用文心4.5模型识别手语
        result = await wenxin_integration.recognize_sign(video_data)
        
        if result is None:
            return jsonify({'error': '手语识别失败'}), 500
            
        return jsonify(result)
        
    except Exception as e:
        print(f"手语识别错误: {str(e)}")
        return jsonify({'error': '服务器内部错误'}), 500

@app.route('/api/text-to-speech', methods=['POST'])
async def text_to_speech():
    """接收文本，返回语音数据"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        voice_type = data.get('voice_type', 'youth')
        
        if not text:
            return jsonify({'error': '文本不能为空'}), 400
            
        # 调用文心4.5 TTS生成语音
        audio_data = await wenxin_integration.text_to_speech(text, voice_type)
        
        if audio_data is None:
            return jsonify({'error': '语音合成失败'}), 500
            
        return jsonify({
            'audio': audio_data,
            'voice_type': voice_type
        })
        
    except Exception as e:
        print(f"语音合成错误: {str(e)}")
        return jsonify({'error': '服务器内部错误'}), 500

@app.route('/api/speech-to-text', methods=['POST'])
async def speech_to_text():
    """接收音频数据，返回文字"""
    try:
        # 获取上传的音频数据
        if 'audio' not in request.files:
            return jsonify({'error': '未找到音频文件'}), 400
            
        audio_file = request.files['audio']
        audio_data = audio_file.read()
        
        # 调用文心4.5 ASR识别语音
        text = await wenxin_integration.speech_to_text(audio_data)
        
        if text is None:
            return jsonify({'error': '语音识别失败'}), 500
            
        return jsonify({
            'text': text
        })
        
    except Exception as e:
        print(f"语音识别错误: {str(e)}")
        return jsonify({'error': '服务器内部错误'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)