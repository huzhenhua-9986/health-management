// pages/login/login.js
const app = getApp()
const api = require('../../utils/request')
const { cache, CacheKeys } = require('../../utils/cache')

Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    canGetCode: true,
    loading: false
  },

  onLoad() {
    // 检查是否已登录
    if (app.checkLogin()) {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 验证码输入
  onCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 获取验证码
  async getCode() {
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({
        title: '发送中...'
      })

      // 调用后端API发送验证码
      await api.sendCode(this.data.phone)

      wx.hideLoading()
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      })

      // 开始倒计时
      this.setData({
        countdown: 60,
        canGetCode: false
      })

      const timer = setInterval(() => {
        if (this.data.countdown > 0) {
          this.setData({
            countdown: this.data.countdown - 1
          })
        } else {
          clearInterval(timer)
          this.setData({
            canGetCode: true
          })
        }
      }, 1000)
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '发送失败',
        icon: 'none'
      })
    }
  },

  // 微信一键登录
  async wxLogin(e) {
    // 检查用户是否授权
    if (e.detail.errMsg !== 'getUserProfile:ok' && e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({
        title: '您取消了授权',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      // 1. 获取微信登录code
      const loginRes = await this.wxLoginPromise()

      // 2. 获取用户信息
      let userInfo = {}
      if (e.detail.userInfo) {
        userInfo = {
          nickName: e.detail.userInfo.nickName,
          avatarUrl: e.detail.userInfo.avatarUrl,
          gender: e.detail.userInfo.gender,
          country: e.detail.userInfo.country,
          province: e.detail.userInfo.province,
          city: e.detail.userInfo.city
        }
      }

      // 3. 如果有手机号授权，获取手机号
      if (e.detail.code) {
        userInfo.phoneCode = e.detail.code
      }

      // 4. 调用后端登录接口
      wx.showLoading({
        title: '登录中...'
      })

      const loginResult = await api.wxLogin({
        code: loginRes.code,
        ...userInfo
      })

      wx.hideLoading()

      // 5. 保存登录信息
      app.globalData.token = loginResult.token
      app.globalData.userInfo = loginResult.user || {
        id: loginResult.userId,
        nickName: userInfo.nickName || '用户',
        avatarUrl: userInfo.avatarUrl || ''
      }

      wx.setStorageSync('token', loginResult.token)
      wx.setStorageSync('userInfo', app.globalData.userInfo)

      // 6. 缓存用户信息
      cache.set(CacheKeys.USER_INFO, app.globalData.userInfo, app.globalData.config.cacheExpire.veryLong)

      // 7. 清除相关缓存
      cache.remove(CacheKeys.TODAY_HEALTH_DATA)
      cache.remove(CacheKeys.TODAY_EXERCISE_DATA)
      cache.remove(CacheKeys.TODAY_SLEEP_DATA)
      cache.remove(CacheKeys.TODAY_DIET_DATA)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // Promise化的微信登录
  wxLoginPromise() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      })
    })
  },

  // 获取用户信息
  getUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject
      })
    })
  },

  // 验证码登录
  async codeLogin() {
    if (!this.data.phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none'
      })
      return
    }

    if (!this.data.code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({
        title: '登录中...'
      })

      // 调用后端API验证登录
      const result = await api.login({
        phone: this.data.phone,
        code: this.data.code
      })

      wx.hideLoading()

      // 保存登录信息
      app.globalData.token = result.token
      app.globalData.userInfo = result.user || {
        id: result.userId,
        nickName: result.nickName || '用户',
        phone: this.data.phone
      }

      wx.setStorageSync('token', result.token)
      wx.setStorageSync('userInfo', app.globalData.userInfo)

      // 缓存用户信息
      cache.set(CacheKeys.USER_INFO, app.globalData.userInfo, app.globalData.config.cacheExpire.veryLong)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
    }
  },

  // 快速体验登录（开发测试用）
  quickLogin() {
    const userInfo = {
      id: 'demo-user-' + Date.now(),
      nickName: '测试用户',
      avatarUrl: '/images/default-avatar.png'
    }

    app.globalData.userInfo = userInfo
    app.globalData.token = 'demo-token-' + Date.now()

    wx.setStorageSync('userInfo', userInfo)
    wx.setStorageSync('token', app.globalData.token)

    wx.showToast({
      title: '登录成功',
      icon: 'success'
    })

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }, 1000)
  }
})
