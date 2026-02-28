// pages/profile/profile.js
const app = getApp()
const api = require('../../utils/request')
const { cache } = require('../../utils/cache')

Page({
  data: {
    userInfo: null,
    stats: {
      totalHealth: 0,
      totalExercise: 0,
      totalSleep: 0,
      totalDiet: 0
    }
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
    this.loadStats()
  },

  // 加载统计数据
  async loadStats() {
    try {
      // 并行获取各类型数据
      const [healthData, exerciseData, sleepData, dietData] = await Promise.all([
        api.getHealthData().catch(() => []),
        api.getExerciseData().catch(() => []),
        api.getSleepData().catch(() => []),
        api.getDietData().catch(() => [])
      ])

      this.setData({
        stats: {
          totalHealth: Array.isArray(healthData) ? healthData.length : 0,
          totalExercise: Array.isArray(exerciseData) ? exerciseData.length : 0,
          totalSleep: Array.isArray(sleepData) ? sleepData.length : 0,
          totalDiet: Array.isArray(dietData) ? dietData.length : 0
        }
      })
    } catch (err) {
      console.error('加载统计失败', err)
    }
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

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          cache.clear()
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 设置
  goToSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 意见反馈
  goToFeedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题请联系客服\n微信：health_support\n邮箱：support@health.com',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 关于我们
  goToAbout() {
    wx.showModal({
      title: '关于我们',
      content: '健康管理系统 v1.0.0\n\n为您的健康保驾护航\n\n© 2024 Health Management',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除全局数据
          app.globalData.userInfo = null
          app.globalData.token = null

          // 清除本地存储
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')

          // 清除缓存
          cache.clear()

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
