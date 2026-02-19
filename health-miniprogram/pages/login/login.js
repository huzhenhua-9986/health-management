// pages/login/login.js
const app = getApp()

Page({
  data: {
    phone: '',
    code: '',
    countdown: 0,
    canGetCode: true
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

    // 模拟发送验证码
    wx.showLoading({
      title: '发送中...'
    })

    setTimeout(() => {
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
    }, 1000)
  },

  // 微信登录
  wxLogin() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        const { userInfo } = res
        app.globalData.userInfo = userInfo
        wx.setStorageSync('userInfo', userInfo)

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      },
      fail: () => {
        wx.showToast({
          title: '登录取消',
          icon: 'none'
        })
      }
    })
  },

  // 验证码登录
  codeLogin() {
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

    // 模拟登录
    wx.showLoading({
      title: '登录中...'
    })

    setTimeout(() => {
      wx.hideLoading()

      const userInfo = {
        id: 'demo-user-id',
        nickName: '测试用户',
        avatarUrl: '',
        phone: this.data.phone
      }

      app.globalData.userInfo = userInfo
      app.globalData.token = 'demo-token'
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('token', 'demo-token')

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    }, 1000)
  }
})
