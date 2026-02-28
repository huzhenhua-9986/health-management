// utils/request.js
// HTTP请求封装 - 对接后端API

const app = getApp()

// ============ 环境配置 ============
// 部署时请根据实际环境修改以下配置

const ENV_CONFIG = {
  // 开发环境 - 本地开发
  develop: {
    baseURL: 'http://localhost:3002/api',
    name: '开发环境'
  },
  // 体验版 - 测试环境
  trial: {
    baseURL: 'https://test-api.yourdomain.com/api',
    name: '测试环境'
  },
  // 正式版 - 生产环境
  release: {
    baseURL: 'https://api.yourdomain.com/api',
    name: '生产环境'
  }
}

// 获取当前环境和小程序版本
const getEnvConfig = () => {
  // 开发阶段默认使用开发环境
  // 部署时会根据小程序版本自动切换
  const envVersion = 'release' // 部署时修改为正确的版本: 'develop'/'trial'/'release'
  return ENV_CONFIG[envVersion] || ENV_CONFIG.release
}

const config = getEnvConfig()
const baseURL = config.baseURL

console.log(`[API Environment] ${config.name}`, baseURL)

// ============ 通用请求方法 ============
const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      method = 'GET',
      data = {},
      header = {},
      skipAuth = false
    } = options

    // 添加认证头
    if (!skipAuth && app.globalData.token) {
      header['Authorization'] = `Bearer ${app.globalData.token}`
    }

    // 完整URL
    const fullURL = url.startsWith('http') ? url : `${baseURL}/${url.replace(/^\/+/, '')}`

    console.log(`[Request] ${method} ${fullURL}`, data)

    wx.request({
      url: fullURL,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        console.log(`[Response] ${fullURL}`, res.data)

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // 未授权，跳转登录
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(res)
        } else {
          const errorMsg = res.data?.message || res.data?.error || '请求失败'
          wx.showToast({
            title: errorMsg,
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        console.error(`[Request Error] ${fullURL}`, err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 便捷方法
const api = {
  get: (url, data) => request(url, { method: 'GET', data }),
  post: (url, data) => request(url, { method: 'POST', data }),
  put: (url, data) => request(url, { method: 'PUT', data }),
  delete: (url, data) => request(url, { method: 'DELETE', data })
}

// ============ 认证相关接口 ============

// 用户登录（手机号+验证码）
api.login = (data) => request('/auth/login', {
  method: 'POST',
  data,
  skipAuth: true
})

// 微信登录
api.wxLogin = (data) => request('/auth/wx-login', {
  method: 'POST',
  data,
  skipAuth: true
})

// 发送验证码
api.sendCode = (phone) => request('/auth/send-code', {
  method: 'POST',
  { phone },
  skipAuth: true
})

// 获取用户信息
api.getUserInfo = () => request('/auth/me')

// ============ 健康数据接口 ============

// 获取健康数据列表
api.getHealthData = (params) => request('/health-data', { method: 'GET', data: params })

// 添加健康数据
api.addHealthData = (data) => request('/health-data', {
  method: 'POST',
  data
})

// 删除健康数据
api.deleteHealthData = (id) => request(`/health-data/${id}`, { method: 'DELETE' })

// ============ 运动数据接口 ============

// 获取运动数据列表
api.getExerciseData = (params) => request('/exercise', { method: 'GET', data: params })

// 添加运动数据
api.addExerciseData = (data) => request('/exercise', {
  method: 'POST',
  data
})

// 删除运动数据
api.deleteExerciseData = (id) => request(`/exercise/${id}`, { method: 'DELETE' })

// ============ 睡眠数据接口 ============

// 获取睡眠数据列表
api.getSleepData = (params) => request('/sleep', { method: 'GET', data: params })

// 添加睡眠数据
api.addSleepData = (data) => request('/sleep', {
  method: 'POST',
  data
})

// 删除睡眠数据
api.deleteSleepData = (id) => request(`/sleep/${id}`, { method: 'DELETE' })

// ============ 饮食数据接口 ============

// 获取饮食数据列表
api.getDietData = (params) => request('/diet', { method: 'GET', data: params })

// 添加饮食数据
api.addDietData = (data) => request('/diet', {
  method: 'POST',
  data
})

// 删除饮食数据
api.deleteDietData = (id) => request(`/diet/${id}`, { method: 'DELETE' })

// ============ 报告接口 ============

// 获取报告列表
api.getReports = () => request('/reports')

// 生成报告
api.generateReport = (data) => request('/reports/generate', {
  method: 'POST',
  data
})

// 删除报告
api.deleteReport = (id) => request(`/reports/${id}`, { method: 'DELETE' })

// ============ 今日数据汇总 ============

// 获取今日数据汇总
api.getTodayData = () => request('/today-data')

module.exports = api
