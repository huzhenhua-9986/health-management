// pages/report/report.js
const request = require('../../utils/request')

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

      const reports = await request.get('health_reports', {
        user_id: `eq.${app.globalData.userInfo.id}`,
        order: 'generated_at.desc',
        limit: 50
      })

      this.setData({
        reports
      })
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
      const app = getApp()
      const endDate = new Date()
      const startDate = new Date()

      if (reportType === 'daily') {
        startDate.setDate(startDate.getDate() - 1)
      } else if (reportType === 'weekly') {
        startDate.setDate(startDate.getDate() - 7)
      } else {
        startDate.setMonth(startDate.getMonth() - 1)
      }

      const report = {
        user_id: app.globalData.userInfo.id,
        report_type: reportType,
        report_period: `${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]}`,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        content: {
          generated: true
        },
        generated_at: new Date().toISOString()
      }

      await request.post('health_reports', report)

      wx.hideLoading()
      wx.showToast({
        title: '生成成功',
        icon: 'success'
      })

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
            await request.delete(`health_reports?id=eq.${item.id}`)
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
  }
})
