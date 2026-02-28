// pages/data/data.js
const api = require('../../utils/request')
const { cache, CacheKeys } = require('../../utils/cache')

Page({
  data: {
    activeTab: 0,
    tabs: ['健康数据', '运动', '睡眠', '饮食'],
    healthData: [],
    exerciseData: [],
    sleepData: [],
    dietData: [],
    loading: false
  },

  onLoad() {
    this.checkLogin()
  },

  onShow() {
    this.checkLogin()
    this.loadData()
  },

  // 检查登录状态
  checkLogin() {
    const app = getApp()
    if (!app.checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return false
    }
    return true
  },

  // 切换标签
  onTabChange(e) {
    this.setData({
      activeTab: e.detail.index
    })
  },

  // 加载数据（带缓存）
  async loadData() {
    const app = getApp()
    if (!app.globalData.userInfo) return

    try {
      this.setData({ loading: true })

      // 加载健康数据
      await this.loadHealthData()

      // 加载运动数据
      await this.loadExerciseData()

      // 加载睡眠数据
      await this.loadSleepData()

      // 加载饮食数据
      await this.loadDietData()
    } catch (err) {
      console.error('加载数据失败', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载健康数据
  async loadHealthData() {
    try {
      // 尝试从缓存获取
      const cached = cache.get(CacheKeys.HEALTH_DATA_LIST)
      if (cached) {
        this.setData({ healthData: cached })
      }

      const healthData = await api.getHealthData()

      this.setData({ healthData: healthData || [] })
      cache.set(CacheKeys.HEALTH_DATA_LIST, healthData, getApp().globalData.config.cacheExpire.medium)
    } catch (err) {
      console.error('加载健康数据失败', err)
    }
  },

  // 加载运动数据
  async loadExerciseData() {
    try {
      const cached = cache.get(CacheKeys.EXERCISE_DATA_LIST)
      if (cached) {
        this.setData({ exerciseData: cached })
      }

      const exerciseData = await api.getExerciseData()

      this.setData({ exerciseData: exerciseData || [] })
      cache.set(CacheKeys.EXERCISE_DATA_LIST, exerciseData, getApp().globalData.config.cacheExpire.medium)
    } catch (err) {
      console.error('加载运动数据失败', err)
    }
  },

  // 加载睡眠数据
  async loadSleepData() {
    try {
      const cached = cache.get(CacheKeys.SLEEP_DATA_LIST)
      if (cached) {
        this.setData({ sleepData: cached })
      }

      const sleepData = await api.getSleepData()

      this.setData({ sleepData: sleepData || [] })
      cache.set(CacheKeys.SLEEP_DATA_LIST, sleepData, getApp().globalData.config.cacheExpire.medium)
    } catch (err) {
      console.error('加载睡眠数据失败', err)
    }
  },

  // 加载饮食数据
  async loadDietData() {
    try {
      const cached = cache.get(CacheKeys.DIET_DATA_LIST)
      if (cached) {
        this.setData({ dietData: cached })
      }

      const dietData = await api.getDietData()

      this.setData({ dietData: dietData || [] })
      cache.set(CacheKeys.DIET_DATA_LIST, dietData, getApp().globalData.config.cacheExpire.medium)
    } catch (err) {
      console.error('加载饮食数据失败', err)
    }
  },

  // 查看详情
  viewDetail(e) {
    const { item } = e.currentTarget.dataset

    // 格式化数据详情
    let content = ''

    if (item.data_type) {
      // 健康数据
      const typeMap = {
        blood_pressure: '血压',
        blood_sugar: '血糖',
        heart_rate: '心率',
        temperature: '体温',
        weight: '体重'
      }
      content = `类型: ${typeMap[item.data_type] || item.data_type}\n`
      content += `数值: ${item.data_value} ${item.unit || ''}\n`
      if (item.recorded_at) {
        content += `时间: ${item.recorded_at}\n`
      }
      if (item.notes) {
        content += `备注: ${item.notes}`
      }
    } else if (item.steps) {
      // 运动数据
      content = `步数: ${item.steps}\n`
      content += `距离: ${item.distance || 0} km\n`
      content += `热量: ${item.calories || 0} kcal\n`
      content += `时长: ${item.duration || 0} 分钟\n`
      content += `日期: ${item.exercise_date}`
    } else if (item.sleep_duration) {
      // 睡眠数据
      const hours = (item.sleep_duration / 60).toFixed(1)
      const deepHours = (item.deep_sleep_duration / 60).toFixed(1)
      content = `总时长: ${hours} 小时\n`
      content += `深睡: ${deepHours} 小时\n`
      content += `睡眠质量: ${item.sleep_quality || 0} 分\n`
      content += `日期: ${item.sleep_date}`
    } else if (item.food_name) {
      // 饮食数据
      const mealMap = {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐',
        snack: '加餐'
      }
      content = `食物: ${item.food_name}\n`
      content += `餐型: ${mealMap[item.meal_type] || item.meal_type}\n`
      if (item.calories) content += `热量: ${item.calories} kcal\n`
      if (item.protein) content += `蛋白质: ${item.protein} g\n`
      if (item.fat) content += `脂肪: ${item.fat} g\n`
      if (item.carbohydrate) content += `碳水: ${item.carbohydrate} g\n`
      content += `时间: ${item.meal_time}`
    }

    wx.showModal({
      title: '数据详情',
      content: content || '暂无详情',
      showCancel: false
    })
  },

  // 删除数据
  deleteData(e) {
    const { item, index, type } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条数据吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 根据类型调用不同的删除接口
            if (type === 'health') {
              await api.deleteHealthData(item.id)
            } else if (type === 'exercise') {
              await api.deleteExerciseData(item.id)
            } else if (type === 'sleep') {
              await api.deleteSleepData(item.id)
            } else if (type === 'diet') {
              await api.deleteDietData(item.id)
            }

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })

            // 清除缓存并重新加载
            cache.remove(CacheKeys.HEALTH_DATA_LIST)
            cache.remove(CacheKeys.EXERCISE_DATA_LIST)
            cache.remove(CacheKeys.SLEEP_DATA_LIST)
            cache.remove(CacheKeys.DIET_DATA_LIST)
            cache.remove(`${CacheKeys.TODAY_HEALTH_DATA}_${new Date().toISOString().split('T')[0]}`)
            this.loadData()
          } catch (err) {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 清除缓存
    cache.remove(CacheKeys.HEALTH_DATA_LIST)
    cache.remove(CacheKeys.EXERCISE_DATA_LIST)
    cache.remove(CacheKeys.SLEEP_DATA_LIST)
    cache.remove(CacheKeys.DIET_DATA_LIST)

    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
