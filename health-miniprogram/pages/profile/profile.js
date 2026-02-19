// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: null
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 用户信息
  goToUserInfo() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 我的设备
  goToMyDevice() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 数据统计
  goToDataStats() {
    wx.switchTab({
      url: '/pages/data/data'
    })
  },

  // 设置
  goToSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 关于我们
  goToAbout() {
    wx.showModal({
      title: '关于我们',
      content: '健康管理系统 v1.0.0\n为您的健康保驾护航',
      showCancel: false
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo = null
          app.globalData.token = null
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })

          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/login/login'
            })
          }, 1500)
        }
      }
    })
  }
})
