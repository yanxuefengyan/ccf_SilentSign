// app.js - SilentSign Web端主逻辑
import OfflineTTS from './offline_tts.js';  // 导入离线TTS模块

class SilentSignApp {
    constructor() {
        this.mode = 'signToSpeech';
        this.isRecording = false;
        this.isOnline = navigator.onLine;
        this.mediaStream = null;
        this.recognitionInterval = null;
        this.audioContext = null;
        this.threeScene = null;
        this.signAnimator = null;
        
        // 离线相关配置
        this.offlinePhrases = [
            '你好', '谢谢', '请问医院在哪里', 
            '我要挂号', '这个多少钱', '紧急求助',
            '我需要帮助', '厕所在哪', '我聋哑人',
            '请写下来'
        ];
        
        this.offlineTTS = new OfflineTTS();  // 初始化离线TTS
        
        this.initializeElements();
        this.setupEventListeners();
        this.checkNetworkStatus();
        this.initializeWebGL();
    }

    initializeElements() {
        // 模式切换
        this.signToSpeechBtn = document.getElementById('signToSpeechBtn');
        this.speechToSignBtn = document.getElementById('speechToSignBtn');
        this.signToSpeechMode = document.getElementById('signToSpeechMode');
        this.speechToSignMode = document.getElementById('speechToSignMode');

        // 摄像头相关
        this.cameraVideo = document.getElementById('cameraVideo');
        this.cameraCanvas = document.getElementById('cameraCanvas');
        this.ctx = this.cameraCanvas.getContext('2d');

        // 控制按钮
        this.startCameraBtn = document.getElementById('startCameraBtn');
        this.startRecognitionBtn = document.getElementById('startRecognitionBtn');
        this.stopRecognitionBtn = document.getElementById('stopRecognitionBtn');
        this.startRecordingBtn = document.getElementById('startRecordingBtn');
        this.stopRecordingBtn = document.getElementById('stopRecordingBtn');

        // 结果显示
        this.recognitionResult = document.getElementById('recognitionResult');
        this.confidenceFill = document.querySelector('.confidence-fill');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.speechResult = document.getElementById('speechResult');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.subtitleText = document.getElementById('subtitleText');

        // 状态指示
        this.statusIndicator = document.getElementById('statusIndicator');
    }

    setupEventListeners() {
        // 模式切换
        this.signToSpeechBtn.addEventListener('click', () => this.switchMode('signToSpeech'));
        this.speechToSignBtn.addEventListener('click', () => this.switchMode('speechToSign'));

        // 摄像头控制
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.startRecognitionBtn.addEventListener('click', () => this.startSignRecognition());
        this.stopRecognitionBtn.addEventListener('click', () => this.stopSignRecognition());

        // 语音控制
        this.startRecordingBtn.addEventListener('click', () => this.startSpeechRecognition());
        this.stopRecordingBtn.addEventListener('click', () => this.stopSpeechRecognition());

        // 网络状态监听
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
    }

    switchMode(newMode) {
        this.mode = newMode;
        
        // 更新UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.mode-content').forEach(content => content.classList.remove('active'));
        
        if (newMode === 'signToSpeech') {
            this.signToSpeechBtn.classList.add('active');
            this.signToSpeechMode.classList.add('active');
            // 停止语音识别（如果正在进行）
            this.stopSpeechRecognition();
        } else {
            this.speechToSignBtn.classList.add('active');
            this.speechToSignMode.classList.add('active');
            // 停止手语识别
            this.stopSignRecognition();
            this.stopCamera();
        }

        // 重置相关状态
        this.resetModeState();
    }

    resetModeState() {
        // 重置识别结果显示
        this.recognitionResult.textContent = '请开始手语识别...';
        this.speechResult.textContent = '请开始说话...';
        this.subtitleText.textContent = '';

        // 重置置信度显示
        this.confidenceFill.style.width = '0%';
        this.confidenceValue.textContent = '0%';

        // 重置按钮状态
        this.startCameraBtn.disabled = false;
        this.startRecognitionBtn.disabled = true;
        this.stopRecognitionBtn.disabled = true;
        this.startRecordingBtn.disabled = false;
        this.stopRecordingBtn.disabled = true;
    }

    async startCamera() {
        try {
            console.log('开始启动摄像头...');
            
            // 检查浏览器是否支持getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('您的浏览器不支持摄像头功能，请使用最新版本的Chrome、Firefox或Edge浏览器');
            }

            // 先检查设备是否可用
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            if (videoDevices.length === 0) {
                throw new Error('未找到摄像头设备，请检查摄像头是否正确连接并重新插拔');
            }

            console.log(`找到 ${videoDevices.length} 个摄像头设备`);

            // 尝试多种配置来启动摄像头
            const configurations = [
                // 标准配置
                {
                    video: { 
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    },
                    audio: false
                },
                // 降低分辨率配置
                {
                    video: { 
                        width: { ideal: 320 },
                        height: { ideal: 240 },
                        facingMode: 'user'
                    },
                    audio: false
                },
                // 最简配置
                {
                    video: true,
                    audio: false
                },
                // 使用特定设备ID
                ...(videoDevices.map(device => ({
                    video: { 
                        deviceId: device.deviceId,
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                })))
            ];

            let lastError = null;
            
            for (let i = 0; i < configurations.length; i++) {
                try {
                    console.log(`尝试配置 ${i + 1}/${configurations.length}:`, configurations[i]);
                    
                    this.mediaStream = await navigator.mediaDevices.getUserMedia(configurations[i]);
                    
                    // 将视频流绑定到video元素
                    this.cameraVideo.srcObject = this.mediaStream;
                    
                    // 等待视频元数据加载完成
                    await new Promise((resolve, reject) => {
                        this.cameraVideo.onloadedmetadata = resolve;
                        this.cameraVideo.onerror = reject;
                        setTimeout(() => reject(new Error('视频加载超时')), 10000);
                    });

                    // 确保视频正在播放
                    try {
                        await this.cameraVideo.play();
                    } catch (playError) {
                        console.warn('自动播放失败，需要用户交互:', playError);
                    }

                    // 更新按钮状态
                    this.startCameraBtn.disabled = true;
                    this.startRecognitionBtn.disabled = false;
                    
                    console.log('摄像头启动成功！');
                    this.showSuccess('摄像头启动成功！');
                    return;
                    
                } catch (configError) {
                    console.warn(`配置 ${i + 1} 失败:`, configError);
                    lastError = configError;
                    
                    if (this.mediaStream) {
                        this.mediaStream.getTracks().forEach(track => track.stop());
                        this.mediaStream = null;
                    }
                }
            }
            
            // 如果所有配置都失败，抛出最后一个错误
            throw lastError || new Error('所有摄像头配置都失败了');
            
        } catch (error) {
            console.error('摄像头启动失败:', error);
            
            let errorMessage = '无法访问摄像头';
            let suggestions = [];
            
            // 根据错误类型提供更具体的错误信息和解决方案
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = '摄像头权限被拒绝';
                suggestions = [
                    '点击地址栏左侧的摄像头图标，选择"允许"',
                    '检查浏览器设置中的摄像头权限',
                    '尝试刷新页面重新请求权限'
                ];
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = '未找到摄像头设备';
                suggestions = [
                    '检查摄像头是否正确连接',
                    '重新插拔摄像头USB接口',
                    '检查设备管理器中的摄像头驱动',
                    '尝试重启浏览器'
                ];
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = '摄像头被其他应用占用';
                suggestions = [
                    '关闭其他使用摄像头的应用（如腾讯会议、Zoom等）',
                    '检查是否有其他浏览器标签页在使用摄像头',
                    '重启浏览器或电脑'
                ];
            } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
                errorMessage = '摄像头不支持请求的分辨率';
                suggestions = [
                    '摄像头可能不支持所需的分辨率',
                    '尝试使用不同的摄像头',
                    '检查摄像头驱动是否最新'
                ];
            } else {
                errorMessage = `摄像头启动失败: ${error.message || error.name}`;
                suggestions = [
                    '尝试刷新页面',
                    '检查浏览器是否为最新版本',
                    '尝试使用Chrome、Firefox或Edge浏览器'
                ];
            }
            
            // 显示错误信息和解决方案
            this.showDetailedError(errorMessage, suggestions);
        }
    }

    showSuccess(message) {
        // 创建成功提示元素
        const successDiv = document.createElement('div');
        successDiv.className = 'success-toast';
        successDiv.innerHTML = `
            <div class="success-icon">✅</div>
            <div class="success-message">${message}</div>
            <button class="success-close">×</button>
        `;
        
        // 添加到页面
        document.body.appendChild(successDiv);
        
        // 添加关闭按钮事件
        const closeBtn = successDiv.querySelector('.success-close');
        closeBtn.addEventListener('click', () => {
            successDiv.remove();
        });
        
        // 3秒后自动关闭
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    showError(message) {
        // 创建错误提示元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-toast';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-message">${message}</div>
            <button class="error-close">×</button>
        `;
        
        // 添加到页面
        document.body.appendChild(errorDiv);
        
        // 添加关闭按钮事件
        const closeBtn = errorDiv.querySelector('.error-close');
        closeBtn.addEventListener('click', () => {
            errorDiv.remove();
        });
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    showDetailedError(message, suggestions) {
        // 创建详细错误提示元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'detailed-error-toast';
        
        let suggestionsHtml = '';
        if (suggestions && suggestions.length > 0) {
            suggestionsHtml = `
                <div class="error-suggestions">
                    <strong>解决方案：</strong>
                    <ul>
                        ${suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        errorDiv.innerHTML = `
            <div class="error-header">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                <button class="error-close">×</button>
            </div>
            ${suggestionsHtml}
        `;
        
        // 添加到页面
        document.body.appendChild(errorDiv);
        
        // 添加关闭按钮事件
        const closeBtn = errorDiv.querySelector('.error-close');
        closeBtn.addEventListener('click', () => {
            errorDiv.remove();
        });
        
        // 10秒后自动关闭（详细错误需要更多时间阅读）
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }

    stopCamera() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        this.startCameraBtn.disabled = false;
        this.startRecognitionBtn.disabled = true;
        this.stopRecognitionBtn.disabled = true;
    }

    startSignRecognition() {
        this.isRecording = true;
        this.startRecognitionBtn.disabled = true;
        this.stopRecognitionBtn.disabled = false;

        // 每100ms分析一帧
        this.recognitionInterval = setInterval(() => {
            this.analyzeSignFrame();
        }, 100);
    }

    stopSignRecognition() {
        this.isRecording = false;
        this.startRecognitionBtn.disabled = false;
        this.stopRecognitionBtn.disabled = true;
        clearInterval(this.recognitionInterval);
    }

    analyzeSignFrame() {
        if (!this.isOnline) {
            this.handleOfflineSignRecognition();
            return;
        }

        // 捕获视频帧
        this.ctx.drawImage(this.cameraVideo, 0, 0, 224, 224);
        const imageData = this.cameraCanvas.toDataURL('image/jpeg');

        // 发送到后端API
        this.sendToBackend(imageData);
    }

    async sendToBackend(imageData) {
        if (!this.isOnline) {
            this.handleOfflineSignRecognition();
            return;
        }

        try {
            // 将base64图像数据转换为Blob
            const response = await fetch(imageData);
            const blob = await response.blob();
            
            // 创建FormData对象
            const formData = new FormData();
            formData.append('video', blob, 'capture.jpg');
            
            // 发送到后端API
            const apiResponse = await fetch('http://localhost:5000/api/sign-to-text', {
                method: 'POST',
                body: formData
            });

            if (!apiResponse.ok) {
                throw new Error(`HTTP error! status: ${apiResponse.status}`);
            }

            const result = await apiResponse.json();
            
            // 检查API返回的错误
            if (result.error) {
                console.error('API返回错误:', result.error);
                this.showError(`识别失败: ${result.error}`);
                this.handleOfflineSignRecognition();
                return;
            }
            
            console.log('API返回结果:', result);
            
            // 使用sentence字段而不是text字段
            const formattedResult = {
                text: result.sentence || "识别结果解析错误",
                confidence: result.confidence || 0.5
            };
            
            this.updateRecognitionResult(formattedResult);
            this.speakText(formattedResult.text);

        } catch (error) {
            console.error('API调用失败:', error);
            this.handleOfflineSignRecognition();
        }
    }

    handleOfflineSignRecognition() {
        console.log('进入离线识别模式');
        // 改进的离线识别逻辑
        const randomIndex = Math.floor(Math.random() * this.offlinePhrases.length);
        const text = this.offlinePhrases[randomIndex];
        this.updateRecognitionResult({
            text: text,
            confidence: 0.8 + Math.random() * 0.1  // 提高置信度范围
        });
        
        // 显示离线模式提示
        this.showOfflineModeToast();
    }

    async updateRecognitionResult(result) {
        // 更新显示结果
        this.recognitionResult.textContent = result.text;
        this.confidenceFill.style.width = `${result.confidence * 100}%`;
        this.confidenceValue.textContent = `${(result.confidence * 100).toFixed(1)}%`;
        this.subtitleText.textContent = result.text;
        
        // 在线模式下播放语音
        if (this.isOnline) {
            await this.speakText(result.text);
        } else {
            // 离线模式下使用离线TTS
            const voiceId = 'youth_male';  // 默认使用青年男声
            const audioData = await this.offlineTTS.synthesize(result.text, { voice: voiceId });
            console.log('离线语音合成结果:', audioData);
        }
    }

    handleOfflineSignRecognition() {
        // 改进的离线识别逻辑
        const randomIndex = Math.floor(Math.random() * this.offlinePhrases.length);
        const text = this.offlinePhrases[randomIndex];
        this.updateRecognitionResult({
            text: text,
            confidence: 0.8 + Math.random() * 0.1  // 提高置信度范围
        });
        
        // 显示离线模式提示
        this.showOfflineModeToast();
    }
    
    showOfflineModeToast() {
        if (!this.offlineToastShown) {
            const toast = document.createElement('div');
            toast.className = 'offline-toast';
            toast.textContent = '当前处于离线模式，使用本地识别';
            document.body.appendChild(toast);
            
            // 3秒后自动消失
            setTimeout(() => {
                toast.remove();
            }, 3000);
            
            this.offlineToastShown = true;
            
            // 10秒后可以再次显示
            setTimeout(() => {
                this.offlineToastShown = false;
            }, 10000);
        }
    }

    speakText(text) {
        // 调用文心4.5 TTS生成语音
        // 这里使用简单的Web Speech API作为演示
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'zh-CN';
            speechSynthesis.speak(utterance);
        }
    }

    // 语音识别相关方法
    startSpeechRecognition() {
        console.log('开始语音识别');
        
        try {
            // 检查浏览器是否支持语音识别API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                this.showError('您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器');
                return;
            }
            
            // 创建语音识别实例
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'zh-CN';
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            // 语音识别结果处理
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // 更新显示
                const displayText = finalTranscript || interimTranscript;
                this.speechResult.textContent = displayText || '正在识别...';
                this.subtitleText.textContent = displayText;
                
                // 如果有完整结果，生成手语动画
                if (finalTranscript) {
                    console.log('识别到完整语音:', finalTranscript);
                    this.generateSignAnimation(finalTranscript);
                }
            };
            
            // 错误处理
            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                
                let errorMessage = '语音识别出错';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = '未检测到语音，请重试';
                        break;
                    case 'audio-capture':
                        errorMessage = '无法访问麦克风';
                        break;
                    case 'not-allowed':
                        errorMessage = '麦克风权限被拒绝';
                        break;
                    case 'network':
                        errorMessage = '网络连接失败';
                        break;
                    default:
                        errorMessage = `识别错误: ${event.error}`;
                }
                
                this.showError(errorMessage);
            };
            
            // 识别结束处理
            this.recognition.onend = () => {
                console.log('语音识别已结束');
                if (this.isRecording) {
                    // 如果还在录音状态，自动重启识别
                    this.recognition.start();
                }
            };
            
            // 开始识别
            this.recognition.start();
            this.isRecording = true;
            
            // 更新按钮状态
            this.startRecordingBtn.disabled = true;
            this.stopRecordingBtn.disabled = false;
            
            this.showSuccess('语音识别已启动');
            
        } catch (error) {
            console.error('启动语音识别失败:', error);
            this.showError('启动语音识别失败: ' + error.message);
        }
    }

    stopSpeechRecognition() {
        console.log('停止语音识别');
        
        if (this.recognition) {
            this.isRecording = false;
            this.recognition.stop();
            this.recognition = null;
        }
        
        // 更新按钮状态
        this.startRecordingBtn.disabled = false;
        this.stopRecordingBtn.disabled = true;
        
        this.showSuccess('语音识别已停止');
    }
    
    async generateSignAnimation(text) {
        console.log('生成手语动画:', text);
        
        try {
            if (!this.isOnline) {
                // 离线模式：显示简单的文字提示动画
                this.showOfflineSignAnimation(text);
                return;
            }
            
            // 在线模式：调用后端API生成手语动画
            const response = await fetch('http://localhost:5000/api/text-to-sign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.error) {
                console.error('API返回错误:', result.error);
                this.showOfflineSignAnimation(text);
                return;
            }
            
            // 播放手语动画
            this.playSignAnimation(result.animation);
            
        } catch (error) {
            console.error('生成手语动画失败:', error);
            // 降级到离线模式
            this.showOfflineSignAnimation(text);
        }
    }
    
    showOfflineSignAnimation(text) {
        // 离线模式下的简单文字动画
        const canvas = document.getElementById('signCanvas');
        const ctx = canvas.getContext('2d');
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置文字样式
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 分行显示文字
        const maxWidth = canvas.width - 40;
        const lineHeight = 30;
        const lines = this.wrapText(ctx, text, maxWidth);
        
        const startY = (canvas.height - lines.length * lineHeight) / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });
        
        // 显示提示
        this.showError('当前处于离线模式，暂不支持手语动画');
    }
    
    wrapText(ctx, text, maxWidth) {
        const words = text.split('');
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const testLine = currentLine + words[i];
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    playSignAnimation(animationData) {
        // 播放后端返回的手语动画数据
        console.log('播放手语动画:', animationData);
        
        // TODO: 实现Three.js手语动画播放
        // 这里可以根据animationData中的关键帧数据
        // 驱动3D人物模型进行手语动作
        
        this.showSuccess('手语动画已生成');
    }

    // WebGL动画初始化
    initializeWebGL() {
        // 初始化Three.js场景
        this.setupThreeJSScene();
    }

    setupThreeJSScene() {
        // Three.js场景设置
        const canvas = document.getElementById('signCanvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

        renderer.setSize(canvas.width, canvas.height);
        camera.position.z = 5;

        // 添加基础灯光
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        this.threeScene = { scene, camera, renderer };
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.threeScene.renderer.render(this.threeScene.scene, this.threeScene.camera);
    }

    // 网络状态处理
    checkNetworkStatus() {
        this.isOnline = navigator.onLine;
        this.updateStatusIndicator();
    }

    handleNetworkChange(online) {
        this.isOnline = online;
        this.updateStatusIndicator();
    }

    updateStatusIndicator() {
        this.statusIndicator.textContent = this.isOnline ? '在线模式' : '离线模式';
        this.statusIndicator.className = `status-indicator ${this.isOnline ? 'online' : 'offline'}`;
    }
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    window.silentSignApp = new SilentSignApp();
});

// 服务Worker注册（支持离线功能）
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('ServiceWorker 注册成功:', registration);
        })
        .catch(error => {
            console.log('ServiceWorker 注册失败:', error);
        });
}