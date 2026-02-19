// pages/index/index.js
const request = require('../../utils/request')
const util = require('../../utils/util')

Page({
  data: {
    userInfo: null,
    todaySteps: 0,
    todaySleep: 0,
    todayCalories: 0,
    healthScore: 85,
    recentData: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadTodayData()
  },

  onShow() {
    this.loadTodayData()
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 加载今日数据
  async loadTodayData() {
    try {
      const app = getApp()
      if (!app.globalData.userInfo) return

      const today = util.formatDate(new Date())

      // 获取今日运动数据
      const exerciseData = await request.get('exercise_data', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        exercise_date: `eq.${today}`,
        select: '*'
      })

      // 获取今日睡眠数据
      const sleepData = await request.get('sleep_data', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        sleep_date: `eq.${today}`,
        select: '*'
      })

      // 获取今日饮食数据
      const dietData = await request.get('diet_data', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        meal_time: `gte.${today}T00:00:00`,
        select: '*'
      })

      this.setData({
        todaySteps: exerciseData[0]?.steps || 0,
        todaySleep: sleepData[0] ? (sleepData[0].sleep_duration / 60).toFixed(1) : 0,
        todayCalories: dietData.reduce((sum, item) => sum + (item.calories || 0), 0)
      })
    } catch (err) {
      console.error('加载今日数据失败', err)
    }
  },

  // 跳转到数据录入
  goToInput() {
    wx.navigateTo({
      url: '/pages/input/input'
    })
  },

  // 跳转到数据查看
  goToData() {
    wx.switchTab({
      url: '/pages/data/data'
    })
  },

  // 跳转到报告
  goToReport() {
    wx.switchTab({
      url: '/pages/report/report'
    })
  }
})
