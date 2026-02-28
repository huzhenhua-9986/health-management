// pages/input/input.js
const api = require('../../utils/request')
const util = require('../../utils/util')
const { cache, CacheKeys } = require('../../utils/cache')

Page({
  data: {
    type: 'health',
    typeOptions: [
      { value: 'health', label: '健康数据' },
      { value: 'exercise', label: '运动数据' },
      { value: 'sleep', label: '睡眠数据' },
      { value: 'diet', label: '饮食记录' }
    ],
    healthForm: {
      data_type: 'blood_pressure',
      data_value: '',
      unit: 'mmHg',
      notes: ''
    },
    exerciseForm: {
      steps: '',
      distance: '',
      calories: '',
      duration: ''
    },
    sleepForm: {
      sleep_duration: '',
      deep_sleep_duration: '',
      light_sleep_duration: '',
      sleep_quality: 8
    },
    dietForm: {
      meal_type: 'breakfast',
      food_name: '',
      calories: '',
      protein: '',
      fat: '',
      carbohydrate: ''
    },
    showTypePicker: false
  },

  // 选择数据类型
  onTypeChange() {
    this.setData({
      showTypePicker: true
    })
  },

  onTypeSelect(e) {
    const { value } = e.currentTarget.dataset
    this.setData({
      type: value,
      showTypePicker: false
    })
  },

  // 健康数据表单输入
  onHealthDataTypeChange(e) {
    this.setData({
      'healthForm.data_type': e.detail.value
    })
  },

  onHealthValueInput(e) {
    this.setData({
      'healthForm.data_value': e.detail.value
    })
  },

  onHealthNotesInput(e) {
    this.setData({
      'healthForm.notes': e.detail.value
    })
  },

  // 运动数据表单输入
  onExerciseInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`exerciseForm.${field}`]: e.detail.value
    })
  },

  // 睡眠数据表单输入
  onSleepInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`sleepForm.${field}`]: e.detail.value
    })
  },

  onSleepQualityChange(e) {
    this.setData({
      'sleepForm.sleep_quality': e.detail.value
    })
  },

  // 饮食数据表单输入
  onDietTypeChange(e) {
    this.setData({
      'dietForm.meal_type': e.detail.value
    })
  },

  onDietInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`dietForm.${field}`]: e.detail.value
    })
  },

  // 保存健康数据
  async saveHealthData() {
    const { data_type, data_value, unit, notes } = this.data.healthForm

    if (!data_value) {
      wx.showToast({
        title: '请输入数值',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '保存中...' })

      await api.addHealthData({
        dataType: data_type,
        dataValue: parseFloat(data_value),
        unit,
        notes,
        recordedAt: new Date().toISOString()
      })

      // 清除相关缓存
      cache.remove(CacheKeys.HEALTH_DATA_LIST)
      cache.remove(CacheKeys.TODAY_HEALTH_DATA)

      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        'healthForm.data_value': '',
        'healthForm.notes': ''
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 保存运动数据
  async saveExerciseData() {
    const { steps, distance, calories, duration } = this.data.exerciseForm

    if (!steps) {
      wx.showToast({
        title: '请输入步数',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '保存中...' })

      await api.addExerciseData({
        steps: parseInt(steps) || 0,
        distance: parseFloat(distance) || 0,
        calories: parseInt(calories) || 0,
        duration: parseInt(duration) || 0,
        exerciseDate: util.formatDate(new Date())
      })

      // 清除相关缓存
      cache.remove(CacheKeys.EXERCISE_DATA_LIST)
      cache.remove(CacheKeys.TODAY_EXERCISE_DATA)
      cache.remove(CacheKeys.TODAY_HEALTH_DATA)

      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        exerciseForm: {
          steps: '',
          distance: '',
          calories: '',
          duration: ''
        }
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 保存睡眠数据
  async saveSleepData() {
    const { sleep_duration, deep_sleep_duration, light_sleep_duration, sleep_quality } = this.data.sleepForm

    if (!sleep_duration) {
      wx.showToast({
        title: '请输入睡眠时长',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '保存中...' })

      await api.addSleepData({
        sleepDate: util.formatDate(new Date()),
        sleepDuration: parseInt(sleep_duration) * 60,
        deepSleepDuration: parseInt(deep_sleep_duration) * 60 || 0,
        lightSleepDuration: parseInt(light_sleep_duration) * 60 || 0,
        sleepQuality: parseInt(sleep_quality)
      })

      // 清除相关缓存
      cache.remove(CacheKeys.SLEEP_DATA_LIST)
      cache.remove(CacheKeys.TODAY_SLEEP_DATA)
      cache.remove(CacheKeys.TODAY_HEALTH_DATA)

      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        sleepForm: {
          sleep_duration: '',
          deep_sleep_duration: '',
          light_sleep_duration: '',
          sleep_quality: 8
        }
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  // 保存饮食数据
  async saveDietData() {
    const { meal_type, food_name, calories, protein, fat, carbohydrate } = this.data.dietForm

    if (!food_name) {
      wx.showToast({
        title: '请输入食物名称',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '保存中...' })

      await api.addDietData({
        mealType: meal_type,
        foodName: food_name,
        calories: calories ? parseFloat(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        fat: fat ? parseFloat(fat) : null,
        carbohydrate: carbohydrate ? parseFloat(carbohydrate) : null,
        mealTime: new Date().toISOString()
      })

      // 清除相关缓存
      cache.remove(CacheKeys.DIET_DATA_LIST)
      cache.remove(CacheKeys.TODAY_DIET_DATA)
      cache.remove(CacheKeys.TODAY_HEALTH_DATA)

      wx.hideLoading()
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        dietForm: {
          meal_type: 'breakfast',
          food_name: '',
          calories: '',
          protein: '',
          fat: '',
          carbohydrate: ''
        }
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
})
