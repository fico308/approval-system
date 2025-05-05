App({
  globalData: {
    userInfo: null,
    baseUrl: 'https://example.com', // 替换为你的API域名
    isAdmin: false
  },
  onLaunch() {
    // 检查登录状态
    wx.checkSession({
      fail: () => {
        // session_key 已经失效，需要重新执行登录流程
        this.login()
      }
    })
  },
  login() {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          wx.request({
            url: `${this.globalData.baseUrl}/api/login`,
            method: 'POST',
            data: {
              code: res.code
            },
            success: (res) => {
              // 保存登录态
              wx.setStorageSync('token', res.data.token)
            }
          })
        }
      }
    })
  }
}) 