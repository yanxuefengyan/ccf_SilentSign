// speech-to-sign.js - 语音转手语页面逻辑
Page({
  data: {
    isRecording: false,
    recordingText: '',
    emotion: 'neutral',
    isOnline: true,
    offlinePhrases: [
      // 基础问候
      '你好', '再见', '谢谢', '不客气', '对不起', '没关系',
      '早上好', '下午好', '晚上好', '欢迎', '辛苦了', '祝你好运气',
      
      // 日常交流
      '请问', '请问医院在哪里', '请问洗手间在哪', '请问电梯在哪',
      '我需要帮助', '我迷路了', '我听不见', '我听不清', '我不会说',
      '请再说一遍', '请慢慢说', '请写下来', '请大声点', '请小声点',
      
      // 医疗相关
      '我要看病', '我要挂号', '我要输液', '我要吃药', '我要打针',
      '我头疼', '我肚子疼', '我发烧', '我感冒', '我过敏', '我受伤了',
      '医生', '护士', '药', '针', '病历', '检查报告',
      
      // 购物消费
      '这个多少钱', '太贵了', '便宜一点', '可以打折吗', '我要买',
      '我要退换', '这个好吗', '这个怎么样', '我要退货', '我要退款',
      '收据', '发票', '信用卡', '现金', '支付宝', '微信支付',
      
      // 交通出行
      '我要坐车', '我要坐地铁', '我要坐公交', '我要打车', '我要飞机',
      '我要火车', '我要出租车', '我要网约车', '我要共享单车', '我要地铁',
      '起点', '终点', '上车', '下车', '换乘', '延误', '取消',
      
      // 紧急求助
      '紧急求助', '救命', '危险', '有人吗', '快来人', '救救我',
      '我被困住了', '我受伤了', '我晕倒了', '我饿了', '我渴了',
      '我冷', '我热', '我困', '我累了', '我害怕', '我需要水',
      
      // 餐饮服务
      '我要吃饭', '我要喝水', '我要咖啡', '我要茶', '我要果汁',
      '我要点菜', '我要买单', '我要加菜', '我要退菜', '我要外卖',
      '辣的', '不辣', '少盐', '多糖', '不要葱', '不要蒜',
      
      // 其他生活
      '厕所在哪', '我渴了', '我饿了', '我想睡觉', '我想休息',
      '我累了', '我困了', '我冷', '我热', '我痒', '我痛',
      '我需要毛巾', '我需要纸巾', '我需要水', '我需要药', '我需要医生',
      '我需要帮助', '我需要安静', '我需要安静的环境', '我需要安静的地方'
    ]
  },

  onLoad() {
    // 获取应用实例
    const app = getApp()
    
    // 初始化录音管理器
    this.recorderManager = wx.getRecorderManager()
    this.audioContext = wx.createInnerAudioContext()
    
    // 初始化网络状态
    this.setData({
      isOnline: app.globalData.isOnline
    })
    
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      this.setData({ isOnline: res.isConnected })
      this.showNetworkStatusToast(res.isConnected)
    })
    
    // 录音开始事件
    this.recorderManager.onStart(() => {
      this.setData({ isRecording: true })
      wx.showToast({
        title: '开始录音...',
        icon: 'none'
      })
    })
    
    // 录音结束事件
    this.recorderManager.onStop((res) => {
      this.setData({ isRecording: false })
      this.processAudio(res.tempFilePath)
    })
    
    // 录音错误事件
    this.recorderManager.onError((err) => {
      console.error('录音错误:', err)
      wx.showToast({
        title: '录音失败',
        icon: 'error'
      })
    })
  },
  
  showNetworkStatusToast(isOnline) {
    wx.showToast({
      title: isOnline ? '已切换到在线模式' : '已切换到离线模式',
      icon: 'none',
      duration: 2000
    })
  },
  
  startRecording() {
    // 检查权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => this.doRecording(),
            fail: () => {
              wx.showModal({
                title: '需要录音权限',
                content: '该功能需要录音权限才能使用',
                showCancel: false
              })
            }
          })
        } else {
          this.doRecording()
        }
      }
    })
  },
  
  doRecording() {
    // 配置录音参数
    const options = {
      duration: 10000, // 最长录音时间
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 单声道
      encodeBitRate: 96000, // 比特率
      format: 'mp3', // 音频格式
      frameSize: 50 // 帧大小
    }
    
    // 开始录音
    this.recorderManager.start(options)
  },
  
  stopRecording() {
    if (this.data.isRecording) {
      this.recorderManager.stop()
    }
  },
  
  async processAudio(tempFilePath) {
    try {
      wx.showLoading({
        title: '处理中...',
      })
      
      if (!this.data.isOnline) {
        // 离线模式处理
        const result = this.handleOfflineMode()
        this.setData({ recordingText: result.text })
        this.showSignAnimation(result)
        wx.hideLoading()
        return
      }
      
      // 模拟API调用（实际项目中将发送到后端）
      const result = await this.simulateSpeechToTextAPI(tempFilePath)
      
      // 显示识别结果
      this.setData({ recordingText: result.text })
      
      // 生成并显示手语动画
      this.showSignAnimation(result)
      
      wx.hideLoading()
    } catch (error) {
      console.error('音频处理错误:', error)
      wx.hideLoading()
      
      // 尝试离线模式处理
      const result = this.handleOfflineMode()
      this.setData({ recordingText: result.text })
      this.showSignAnimation(result)
    }
  },
  
  handleOfflineMode() {
    // 离线模式处理
    const randomIndex = Math.floor(Math.random() * this.data.offlinePhrases.length)
    const text = this.data.offlinePhrases[randomIndex]
    
    // 显示离线提示
    wx.showToast({
      title: '当前处于离线模式',
      icon: 'none',
      duration: 2000
    })
    
    return {
      text: text,
      confidence: 0.8 + Math.random() * 0.15
    }
  },
  
  simulateSpeechToTextAPI(tempFilePath) {
    return new Promise((resolve) => {
      // 实际项目中这里应该调用后端API
      // 这里使用模拟响应
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * this.data.phrases.length)
        const randomText = this.data.phrases[randomIndex]
        
        resolve({
          text: randomText,
          confidence: 0.8 + Math.random() * 0.15
        })
      }, 800)
    })
  },
  
  showSignAnimation(result) {
    // 在小程序中模拟手语动画显示
    // 实际项目中可能使用动画组件或Canvas绘制
    
    // 更新情感显示
    const emotions = ['happy', 'sad', 'angry', 'neutral', 'urgent']
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
    
    this.setData({
      emotion: randomEmotion,
      currentSign: this.getSignTypeByText(result.text)
    })
    
    wx.showToast({
      title: `显示手语: ${result.text}`,
      icon: 'none'
    })
  },
  
  getSignTypeByText(text) {
    const lowText = text.toLowerCase()
    if (lowText.includes('你好') || lowText.includes('hi')) return 'greeting'
    if (lowText.includes('谢谢') || lowText.includes('thank')) return 'thank'
    if (lowText.includes('帮助') || lowText.includes('help')) return 'help'
    return 'default'
  },
  
  onUnload() {
    // 清理资源
    if (this.recorderManager) {
      this.recorderManager.stop()
    }
    if (this.audioContext) {
      this.audioContext.destroy()
    }
  }
})
