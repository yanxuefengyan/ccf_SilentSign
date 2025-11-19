// index.js
const app = getApp()

Page({
  data: {
    cameraActive: false,
    isRecording: false,
    currentText: '',
    confidence: 0,
    signAnimation: null,
    emotion: 'neutral',
    mode: 'signToSpeech', // signToSpeech 或 speechToSign
    isOnline: true
  },

  onLoad() {
    this.setData({
      isOnline: app.globalData.isOnline
    })
  },

  // 切换模式
  switchMode() {
    const newMode = this.data.mode === 'signToSpeech' ? 'speechToSign' : 'signToSpeech'
    this.setData({ mode: newMode })
    
    if (newMode === 'signToSpeech') {
      this.startCamera()
    } else {
      this.stopCamera()
    }
  },

  // 启动摄像头
  startCamera() {
    this.setData({ cameraActive: true })
  },

  // 停止摄像头
  stopCamera() {
    this.setData({ cameraActive: false })
  },

  // 开始手语识别
  startSignRecognition() {
    this.setData({ isRecording: true })
    // 定时捕获视频帧进行分析
    this.recognitionInterval = setInterval(() => {
      this.analyzeSignFrame()
    }, 100) // 每100ms分析一帧
  },

  // 停止手语识别
  stopSignRecognition() {
    this.setData({ isRecording: false })
    clearInterval(this.recognitionInterval)
  },

  // 分析手语帧
  analyzeSignFrame() {
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'low',
      success: (res) => {
        this.recognizeSign(res.tempImagePath)
      }
    })
  },

  // 识别手语
  recognizeSign(imagePath) {
    if (!this.data.isOnline) {
      // 离线模式处理
      this.handleOfflineMode()
      return
    }

    // 在线模式调用API
    wx.uploadFile({
      url: 'http://localhost:5000/api/sign-to-text',
      filePath: imagePath,
      name: 'video',
      success: (res) => {
        const result = JSON.parse(res.data)
        this.setData({
          currentText: result.text,
          confidence: result.confidence
        })
        this.speakText(result.text)
      }
    })
  },

  // 语音播报
  speakText(text) {
    // 调用微信TTS
    wx.getRecorderManager().start({
      duration: 3000,
      success: () => {
        const innerAudioContext = wx.createInnerAudioContext()
        // 这里实际应该调用文心4.5 TTS生成的音频
        innerAudioContext.src = 'data:audio/mp3;base64,...'
        innerAudioContext.play()
      }
    })
  },

  // 离线模式处理
  handleOfflineMode() {
    // 简单的离线识别逻辑
    const randomIndex = Math.floor(Math.random() * app.globalData.offlinePhrases.length)
    const text = app.globalData.offlinePhrases[randomIndex]
    this.setData({ currentText: text })
  },

  // 开始语音识别
  startSpeechRecognition() {
    const recorderManager = wx.getRecorderManager()
    recorderManager.start({
      duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1
    })
  },

// 停止语音识别
  stopSpeechRecognition() {
    const recorderManager = wx.getRecorderManager()
    recorderManager.stop()
  },
  
  // 导航到语音转手语页面
  navigateToSpeechToSign() {
    wx.navigateTo({
      url: '/pages/speech-to-sign/speech-to-sign'
    })
  }
})