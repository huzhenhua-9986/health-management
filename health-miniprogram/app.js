// app.js
App({
  globalData: {
    userInfo: null,
    token: null,
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseKey: 'your-supabase-key'
  },

  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
    }
  }
})
