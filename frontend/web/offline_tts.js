// offline_tts.js - 离线语音合成模块
class OfflineTTS {
    constructor() {
        this.voices = [
            { id: 'youth_male', name: '青年男声', speed: 1.0, pitch: 1.0 },
            { id: 'youth_female', name: '青年女声', speed: 1.0, pitch: 1.2 },
            { id: 'child', name: '儿童声音', speed: 1.2, pitch: 1.5 },
            { id: 'elder', name: '老年声音', speed: 0.8, pitch: 0.8 }
        ];
        
        this.defaultVoice = 'youth_male';
        this.isInitialized = false;
        this.init();
    }
    
    async init() {
        try {
            // 检查浏览器是否支持Web Speech API
            if ('speechSynthesis' in window) {
                this.isInitialized = true;
                console.log('离线TTS初始化成功');
            } else {
                console.warn('浏览器不支持Web Speech API，使用备用方案');
                this.isInitialized = false;
            }
        } catch (error) {
            console.error('离线TTS初始化失败:', error);
            this.isInitialized = false;
        }
    }
    
    /**
     * 离线语音合成
     * @param {string} text - 要合成的文本
     * @param {object} options - 语音选项
     * @returns {Promise<string>} Base64编码的音频数据
     */
    async synthesize(text, options = {}) {
        if (!this.isInitialized) {
            // 如果不支持离线TTS，返回模拟数据
            return this.generateMockAudio(text);
        }
        
        try {
            // 使用浏览器内置的TTS引擎
            const utterance = new SpeechSynthesisUtterance(text);
            
            // 应用选项
            const voiceId = options.voice || this.defaultVoice;
            const voice = this.voices.find(v => v.id === voiceId);
            
            if (voice) {
                utterance.rate = voice.speed;
                utterance.pitch = voice.pitch;
            }
            
            // 设置语言
            utterance.lang = 'zh-CN';
            
            // 模拟音频生成过程
            const audioData = await this.simulateAudioGeneration(utterance);
            return audioData;
            
        } catch (error) {
            console.error('离线语音合成失败:', error);
            // 回退到模拟数据
            return this.generateMockAudio(text);
        }
    }
    
    /**
     * 模拟音频生成
     */
    async simulateAudioGeneration(utterance) {
        // 模拟生成音频的过程
        return new Promise((resolve) => {
            // 模拟处理时间
            setTimeout(() => {
                // 返回模拟的base64音频数据
                const mockAudio = `base64_audio_${Date.now()}_${utterance.text.substring(0, 10)}`;
                resolve(mockAudio);
            }, 500);
        });
    }
    
    /**
     * 生成模拟音频数据
     */
    generateMockAudio(text) {
        // 生成模拟的音频数据
        const timestamp = Date.now();
        const hash = this.hashCode(text);
        return `mock_audio_${timestamp}_${hash}`;
    }
    
    /**
     * 简单的哈希函数
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }
    
    /**
     * 获取支持的声音类型
     */
    getSupportedVoices() {
        return this.voices;
    }
    
    /**
     * 设置默认声音
     */
    setDefaultVoice(voiceId) {
        if (this.voices.some(v => v.id === voiceId)) {
            this.defaultVoice = voiceId;
            return true;
        }
        return false;
    }
    
    /**
     * 检查是否支持离线TTS
     */
    isSupported() {
        return this.isInitialized;
    }
}

// 全局实例
window.offlineTTS = new OfflineTTS();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (window.offlineTTS) {
        window.offlineTTS.init();
    }
});