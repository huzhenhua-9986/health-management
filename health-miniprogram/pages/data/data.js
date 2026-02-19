// pages/data/data.js
const request = require('../../utils/request')

Page({
  data: {
    activeTab: 0,
    tabs: ['健康数据', '运动', '睡眠', '饮食'],
    healthData: [],
    exerciseData: [],
    sleepData: [],
    dietData: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  // 切换标签
  onTabChange(e) {
    this.setData({
      activeTab: e.detail.index
    })
  },

  // 加载数据
  async loadData() {
    const app = getApp()
    if (!app.globalData.userInfo) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }

    try {
      // 加载健康数据
      const healthData = await request.get('health_data', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        order: 'recorded_at.desc',
        limit: 50
      })

      // 加载运动数据
      const exerciseData = await request.get('exercise_data', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        order: 'exercise_date.desc',
        limit: 30
      })

      // 加载睡眠数据
      const sleepData = await request.get('sleep_data', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        order: 'sleep_date.desc',
        limit: 30
      })

      // 加载饮食数据
      const dietData = await request.get('diet_data', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        order: 'meal_time.desc',
        limit: 50
      })

      this.setData({
        healthData,
        exerciseData,
        sleepData,
        dietData
      })
    } catch (err) {
      console.error('加载数据失败', err)
    }
  },

  // 查看详情
  viewDetail(e) {
    const { item } = e.currentTarget.dataset
    wx.showModal({
      title: '数据详情',
      content: JSON.stringify(item, null, 2),
      showCancel: false
    })
  }
})
