// app.js
const { initSupabase } = require('./utils/supabase')
const { cache } = require('./utils/cache')

App({
  globalData: {
    userInfo: null,
    token: null,
    supabaseUrl: 'https://your-project.supabase.co',
    supabaseKey: 'your-supabase-key',
    // 配置项
    config: {
      // 缓存过期时间（秒）
      cacheExpire: {
        short: 300,      // 5分钟
        medium: 1800,    // 30分钟
        long: 3600,      // 1小时
        veryLong: 86400  // 24小时
      }
    }
  },

  onLaunch() {
    console.log('小程序启动')

    // 检查登录状态
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && userInfo) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
    }

    // 初始化Supabase
    initSupabase()

    // 清理过期缓存
    cache.cleanExpired()

    // 检查更新
    this.checkUpdate()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  // 检查小程序更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本')
        }
      })

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })

      updateManager.onUpdateFailed(() => {
        console.log('新版本下载失败')
      })
    }
  },

  // 检查登录状态
  checkLogin() {
    if (!this.globalData.token || !this.globalData.userInfo) {
      return false
    }
    return true
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})
