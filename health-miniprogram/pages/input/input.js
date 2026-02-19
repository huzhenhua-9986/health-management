// pages/input/input.js
const request = require('../../utils/request')
const util = require('../../utils/util')

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
      const app = getApp()
      await request.post('health_data', {
        user_id: app.globalData.userInfo.id,
        data_type,
        data_value: parseFloat(data_value),
        unit,
        recorded_at: new Date().toISOString(),
        source: 'manual',
        notes
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })

      this.setData({
        'healthForm.data_value': '',
        'healthForm.notes': ''
      })
    } catch (err) {
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
      const app = getApp()
      await request.post('exercise_data', {
        user_id: app.globalData.userInfo.id,
        steps: parseInt(steps) || 0,
        distance: parseFloat(distance) || 0,
        calories: parseInt(calories) || 0,
        duration: parseInt(duration) || 0,
        exercise_date: util.formatDate(new Date())
      })

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
      const app = getApp()
      await request.post('sleep_data', {
        user_id: app.globalData.userInfo.id,
        sleep_date: util.formatDate(new Date()),
        sleep_duration: parseInt(sleep_duration) * 60,
        deep_sleep_duration: parseInt(deep_sleep_duration) * 60 || 0,
        light_sleep_duration: parseInt(light_sleep_duration) * 60 || 0,
        sleep_quality: parseInt(sleep_quality)
      })

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
      const app = getApp()
      await request.post('diet_data', {
        user_id: app.globalData.userInfo.id,
        meal_type,
        food_name,
        calories: calories ? parseFloat(calories) : null,
        protein: protein ? parseFloat(protein) : null,
        fat: fat ? parseFloat(fat) : null,
        carbohydrate: carbohydrate ? parseFloat(carbohydrate) : null,
        meal_time: new Date().toISOString()
      })

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
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  }
})
