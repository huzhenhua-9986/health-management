// pages/index/index.js
const api = require('../../utils/request')
const util = require('../../utils/util')
const { cache, CacheKeys } = require('../../utils/cache')

Page({
  data: {
    userInfo: null,
    todaySteps: 0,
    todaySleep: 0,
    todayCalories: 0,
    healthScore: 85,
    recentData: [],
    loading: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
    this.loadTodayData()
  },

  // 检查登录状态
  checkLogin() {
    const app = getApp()
    if (!app.checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    this.setData({
      userInfo: app.globalData.userInfo
    })
  },

  // 加载今日数据（带缓存）
  async loadTodayData() {
    const app = getApp()
    if (!app.globalData.userInfo) return

    try {
      this.setData({ loading: true })
      const today = util.formatDate(new Date())
      const cacheKey = `${CacheKeys.TODAY_HEALTH_DATA}_${today}`

      // 尝试从缓存获取
      const cachedData = cache.get(cacheKey)
      if (cachedData) {
        this.setData({
          todaySteps: cachedData.steps,
          todaySleep: cachedData.sleep,
          todayCalories: cachedData.calories
        })
      }

      // 调用后端API获取今日数据汇总
      const todayData = await api.getTodayData()

      const steps = todayData.exercise?.steps || 0
      const sleep = todayData.sleep ? (todayData.sleep.duration / 60).toFixed(1) : 0
      const calories = todayData.diet?.totalCalories || 0

      this.setData({
        todaySteps: steps,
        todaySleep: sleep,
        todayCalories: calories
      })

      // 缓存数据（5分钟）
      cache.set(cacheKey, { steps, sleep, calories }, app.globalData.config.cacheExpire.short)

      // 计算健康分
      this.calculateHealthScore({ steps, sleep, calories })
    } catch (err) {
      console.error('加载今日数据失败', err)
      // 网络失败时使用缓存数据
      const today = util.formatDate(new Date())
      const cachedData = cache.get(`${CacheKeys.TODAY_HEALTH_DATA}_${today}`)
      if (cachedData) {
        wx.showToast({
          title: '使用缓存数据',
          icon: 'none'
        })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  // 计算健康分
  calculateHealthScore(data) {
    let score = 60 // 基础分

    // 步数评分
    if (data.steps >= 10000) score += 15
    else if (data.steps >= 6000) score += 10
    else if (data.steps >= 3000) score += 5

    // 睡眠评分
    const sleepHours = parseFloat(data.sleep)
    if (sleepHours >= 7 && sleepHours <= 9) score += 15
    else if (sleepHours >= 6) score += 10
    else if (sleepHours >= 5) score += 5

    // 饮食评分（基础热量摄入）
    if (data.calories >= 1500 && data.calories <= 2500) score += 10

    this.setData({
      healthScore: Math.min(100, score)
    })
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
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadTodayData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
