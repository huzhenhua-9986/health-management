// pages/report/report.js
const api = require('../../utils/request')
const { cache, CacheKeys } = require('../../utils/cache')

Page({
  data: {
    reports: [],
    reportTypes: ['日报', '周报', '月报']
  },

  onLoad() {
    this.loadReports()
  },

  onShow() {
    this.loadReports()
  },

  // 加载报告列表
  async loadReports() {
    try {
      const app = getApp()
      if (!app.globalData.userInfo) {
        wx.navigateTo({
          url: '/pages/login/login'
        })
        return
      }

      // 尝试从缓存获取
      const cached = cache.get(CacheKeys.REPORT_LIST)
      if (cached) {
        this.setData({ reports: cached })
      }

      const reports = await api.getReports()

      this.setData({
        reports: reports || []
      })

      // 缓存报告列表
      cache.set(CacheKeys.REPORT_LIST, reports, app.globalData.config.cacheExpire.medium)
    } catch (err) {
      console.error('加载报告失败', err)
    }
  },

  // 生成报告
  generateReport(e) {
    const { type } = e.currentTarget.dataset

    wx.showActionSheet({
      itemList: this.data.reportTypes,
      success: (res) => {
        const reportType = ['daily', 'weekly', 'monthly'][res.tapIndex]
        this.doGenerateReport(reportType)
      }
    })
  },

  // 执行生成报告
  async doGenerateReport(reportType) {
    wx.showLoading({
      title: '生成中...'
    })

    try {
      const endDate = new Date()
      const startDate = new Date()

      if (reportType === 'daily') {
        startDate.setDate(startDate.getDate() - 1)
      } else if (reportType === 'weekly') {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setMonth(startDate.getMonth() - 1)
      }

      await api.generateReport({
        reportType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      })

      wx.hideLoading()
      wx.showToast({
        title: '生成成功',
        icon: 'success'
      })

      cache.remove(CacheKeys.REPORT_LIST)
      this.loadReports()
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      })
    }
  },

  // 查看报告
  viewReport(e) {
    const { item } = e.currentTarget.dataset
    wx.showModal({
      title: '报告详情',
      content: `报告类型：${this.getReportTypeLabel(item.report_type)}\n报告周期：${item.report_period}\n生成时间：${item.generated_at}`,
      showCancel: false
    })
  },

  // 删除报告
  deleteReport(e) {
    const { item, index } = e.currentTarget.dataset

    wx.showModal({
      title: '确认删除',
      content: '确定要删除该报告吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteReport(item.id)

            // 清除缓存
            cache.remove(CacheKeys.REPORT_LIST)

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            this.loadReports()
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

  // 获取报告类型标签
  getReportTypeLabel(type) {
    const map = {
      daily: '日报',
      weekly: '周报',
      monthly: '月报'
    }
    return map[type] || type
  },

  // 下拉刷新
  onPullDownRefresh() {
    cache.remove(CacheKeys.REPORT_LIST)
    this.loadReports().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
