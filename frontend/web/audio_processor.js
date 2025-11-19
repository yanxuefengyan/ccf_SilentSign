// audio_processor.js - 音频处理模块
class AudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.sampleRate = 16000; // 文心4.5要求的采样率
        this.channelCount = 1;   // 单声道
        this.initAudioContext();
    }
    
    initAudioContext() {
        try {
            // 初始化Web Audio API
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({
                sampleRate: this.sampleRate,
                channelCount: this.channelCount
            });
            
            console.log('音频上下文初始化成功');
        } catch (error) {
            console.error('音频上下文初始化失败:', error);
        }
    }
    
    async startRecording() {
        try {
            // 请求麦克风权限
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: this.sampleRate,
                    channelCount: this.channelCount,
                    echoCancellation: false,
                    noiseSuppression: false
                }
            });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            // 监听数据可用事件
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            // 监听录制结束事件
            this.mediaRecorder.onstop = () => {
                this.onRecordingStop();
            };
            
            // 开始录制
            this.mediaRecorder.start();
            this.isRecording = true;
            
            console.log('开始录音...');
            return true;
            
        } catch (error) {
            console.error('录音启动失败:', error);
            return false;
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // 停止所有音频轨道
            this.mediaRecorder.stream.getTracks().forEach(track => {
                track.stop();
            });
            
            console.log('录音已停止');
        }
    }
    
    onRecordingStop() {
        // 将音频块合并为Blob
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.processAudioBlob(audioBlob);
    }
    
    async processAudioBlob(audioBlob) {
        try {
            // 如果需要重采样，先进行重采样处理
            const audioBuffer = await this.decodeAudioData(audioBlob);
            
            // 转换为16kHz采样率
            const resampledBuffer = await this.resampleAudio(audioBuffer, this.sampleRate);
            
            // 转换为Base64编码
            const base64Audio = await this.audioBufferToBase64(resampledBuffer);
            
            // 发送到后端API
            await this.sendToBackend(base64Audio);
            
        } catch (error) {
            console.error('音频处理失败:', error);
        }
    }
    
    async decodeAudioData(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                this.audioContext.decodeAudioData(reader.result)
                    .then(resolve)
                    .catch(reject);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }
    
    async resampleAudio(audioBuffer, targetSampleRate) {
        // 实现音频重采样逻辑
        // 这里简化处理，实际应用中需要更复杂的重采样算法
        return audioBuffer;
    }
    
    async audioBufferToBase64(audioBuffer) {
        // 将AudioBuffer转换为Base64编码的WAV文件
        return new Promise((resolve) => {
            // 创建WAV文件头
            const wavBuffer = this.createWavBuffer(audioBuffer);
            const base64 = btoa(String.fromCharCode.apply(null, wavBuffer));
            resolve(base64);
        });
    }
    
    createWavBuffer(audioBuffer) {
        // 创建WAV文件格式的数据
        const bufferLength = audioBuffer.length;
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        
        // WAV文件头大小
        const headerSize = 44;
        const buffer = new ArrayBuffer(headerSize + bufferLength * numberOfChannels * 2);
        const view = new DataView(buffer);
        
        // WAV文件头
        let offset = 0;
        this.writeString(view, offset, 'RIFF'); offset += 4;
        this.setUint32(view, offset, 36 + bufferLength * numberOfChannels * 2, true); offset += 4;
        this.writeString(view, offset, 'WAVE'); offset += 4;
        this.writeString(view, offset, 'fmt '); offset += 4;
        this.setUint32(view, offset, 16, true); offset += 4;
        this.setUint16(view, offset, 1, true); offset += 2;
        this.setUint16(view, offset, numberOfChannels, true); offset += 2;
        this.setUint32(view, offset, sampleRate, true); offset += 4;
        this.setUint32(view, offset, sampleRate * numberOfChannels * 2, true); offset += 4;
        this.setUint16(view, offset, numberOfChannels * 2, true); offset += 2;
        this.setUint16(view, offset, 16, true); offset += 2;
        this.writeString(view, offset, 'data'); offset += 4;
        this.setUint32(view, offset, bufferLength * numberOfChannels * 2, true); offset += 4;
        
        // 填充音频数据
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < bufferLength; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset, int16, true);
            offset += 2;
        }
        
        return new Uint8Array(buffer);
    }
    
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    
    setUint16(view, offset, value, littleEndian) {
        view.setUint16(offset, value, littleEndian);
    }
    
    setUint32(view, offset, value, littleEndian) {
        view.setUint32(offset, value, littleEndian);
    }
    
    async sendToBackend(base64Audio) {
        try {
            // 发送到后端API
            const response = await fetch('http://localhost:5000/api/speech-to-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio: base64Audio
                })
            });
            
            const result = await response.json();
            if (response.ok) {
                this.handleSpeechToTextResult(result.text);
            } else {
                console.error('后端API错误:', result.error);
            }
        } catch (error) {
            console.error('发送音频数据失败:', error);
        }
    }
    
    handleSpeechToTextResult(text) {
        // 处理语音转文字结果
        const speechResultElement = document.getElementById('speechResult');
        if (speechResultElement) {
            speechResultElement.textContent = text;
        }
        
        // 显示字幕
        const subtitleTextElement = document.getElementById('subtitleText');
        if (subtitleTextElement) {
            subtitleTextElement.textContent = text;
        }
        
        // 播放对应的手语动画
        this.playSignAnimation(text);
    }
    
    playSignAnimation(text) {
        // 根据文本内容播放相应手语动画
        const animationType = this.getAnimationForText(text);
        if (window.signRenderer) {
            window.signRenderer.playAnimation(animationType, 'neutral');
        }
    }
    
    getAnimationForText(text) {
        // 根据文本内容选择合适的手语动画
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('你好') || lowerText.includes('hello')) {
            return 'hello';
        } else if (lowerText.includes('谢谢') || lowerText.includes('thank')) {
            return 'thankyou';
        } else if (lowerText.includes('帮助') || lowerText.includes('help')) {
            return 'help';
        } else if (lowerText.includes('我') || lowerText.includes('me')) {
            return 'i';
        } else if (lowerText.includes('你') || lowerText.includes('you')) {
            return 'you';
        } else if (lowerText.includes('是') || lowerText.includes('yes')) {
            return 'yes';
        } else if (lowerText.includes('不') || lowerText.includes('no')) {
            return 'no';
        } else {
            return 'default';
        }
    }
    
    async playAudio(base64Audio) {
        try {
            // 将Base64音频数据转换为Blob
            const binaryString = atob(base64Audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            const audioBlob = new Blob([bytes], { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // 创建音频元素并播放
            const audio = new Audio(audioUrl);
            audio.play();
            
            // 清理URL对象
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };
            
        } catch (error) {
            console.error('播放音频失败:', error);
        }
    }
}

// 全局音频处理器实例
window.audioProcessor = new AudioProcessor();

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('音频处理器已初始化');
});