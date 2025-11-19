// SilentSign 微信小程序入口文件
App({
  globalData: {
    userInfo: null,
    isOnline: true, // 是否在线模式
    offlinePhrases: [ // 10条常用离线短语
      '你好', '谢谢', '请问医院在哪里', 
      '我要挂号', '这个多少钱', '紧急求助',
      '我需要帮助', '厕所在哪', '我聋哑人',
      '请写下来'
    ]
  },
  
  onLaunch() {
    // 检查网络状态
    wx.getNetworkType({
      success: res => {
        this.globalData.isOnline = res.networkType !== 'none'
      }
    })
    
    // 加载用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })
  }
})