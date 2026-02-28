// utils/supabase.js
// Supabase SDK 封装工具类

const app = getApp()

class SupabaseClient {
  constructor() {
    this.url = null
    this.key = null
    this.token = null
  }

  // 初始化配置
  init(config) {
    this.url = config.url || app.globalData.supabaseUrl
    this.key = config.key || app.globalData.supabaseKey
    this.token = config.token || app.globalData.token
  }

  // 通用请求方法
  async request(path, options = {}) {
    const {
      method = 'GET',
      data = null,
      headers = {},
      params = null
    } = options

    // 构建URL
    let url = `${this.url}/rest/v1/${path}`

    // 添加查询参数
    if (params) {
      const queryParams = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      url += `?${queryParams}`
    }

    // 构建请求头
    const requestHeaders = {
      'apikey': this.key,
      'Content-Type': 'application/json',
      ...headers
    }

    // 添加认证令牌
    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url,
        method,
        data,
        header: requestHeaders,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            const error = {
              statusCode: res.statusCode,
              message: res.data?.message || '请求失败',
              details: res.data
            }
            reject(error)
          }
        },
        fail: (err) => {
          reject({
            message: '网络请求失败',
            details: err
          })
        }
      })
    })
  }

  // GET 请求
  async get(table, options = {}) {
    return this.request(table, {
      method: 'GET',
      params: options
    })
  }

  // POST 请求
  async post(table, data) {
    return this.request(table, {
      method: 'POST',
      data
    })
  }

  // PUT 请求
  async put(table, data, options = {}) {
    let url = table
    if (options.filter) {
      url += `?${options.filter}`
    }
    return this.request(url, {
      method: 'PUT',
      data
    })
  }

  // PATCH 请求
  async patch(table, data, options = {}) {
    let url = table
    if (options.filter) {
      url += `?${options.filter}`
    }
    return this.request(url, {
      method: 'PATCH',
      data
    })
  }

  // DELETE 请求
  async delete(table, options = {}) {
    return this.request(table, {
      method: 'DELETE',
      params: options
    })
  }

  // 认证相关 - 微信登录
  async wxLogin(code, userInfo) {
    try {
      // 调用后端API进行微信登录
      // 这里需要后端提供微信登录接口
      const result = await this.request('auth/wx-login', {
        method: 'POST',
        data: {
          code,
          userInfo
        }
      })

      if (result.token) {
        this.token = result.token
        app.globalData.token = result.token
        wx.setStorageSync('token', result.token)
      }

      if (result.user) {
        app.globalData.userInfo = result.user
        wx.setStorageSync('userInfo', result.user)
      }

      return result
    } catch (error) {
      throw error
    }
  }

  // 刷新令牌
  async refreshToken() {
    try {
      const refreshToken = wx.getStorageSync('refreshToken')
      if (!refreshToken) {
        throw new Error('无刷新令牌')
      }

      const result = await this.request('auth/refresh', {
        method: 'POST',
        data: { refreshToken }
      })

      if (result.token) {
        this.token = result.token
        app.globalData.token = result.token
        wx.setStorageSync('token', result.token)
      }

      return result
    } catch (error) {
      throw error
    }
  }

  // 设置认证令牌
  setAuth(token) {
    this.token = token
    app.globalData.token = token
    if (token) {
      wx.setStorageSync('token', token)
    } else {
      wx.removeStorageSync('token')
    }
  }

  // 获取当前用户信息
  getCurrentUser() {
    return app.globalData.userInfo
  }

  // 检查登录状态
  isLoggedIn() {
    return !!app.globalData.token
  }
}

// 创建单例实例
const supabase = new SupabaseClient()

// 初始化
const initSupabase = () => {
  const config = {
    url: app.globalData.supabaseUrl,
    key: app.globalData.supabaseKey,
    token: app.globalData.token
  }
  supabase.init(config)
  return supabase
}

module.exports = {
  supabase,
  initSupabase
}
