const api = require('../../utils/api')

Page({
  data: {
    plans: [],
    loading: true
  },

  onLoad() {
    this.loadPlans()
  },

  onPullDownRefresh() {
    this.loadPlans().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadPlans() {
    try {
      this.setData({ loading: true })
      const plans = await api.getPlans()
      
      // 添加状态文本和格式化日期
      const plansWithStatus = plans.map(plan => ({
        ...plan,
        statusText: this.getStatusText(plan.status),
        planDate: this.formatDate(plan.planDate),
        submitDate: this.formatDate(plan.submitDate)
      }))
      
      this.setData({
        plans: plansWithStatus,
        loading: false
      })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  getStatusText(status) {
    switch (status) {
      case 'approved':
        return '已批准'
      case 'rejected':
        return '已拒绝'
      default:
        return '待审批'
    }
  },

  formatDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getStatusType(status) {
    switch (status) {
      case 'approved':
        return 'success'
      case 'rejected':
        return 'danger'
      default:
        return 'info'
    }
  },

  viewPlanDetail(e) {
    const plan = this.data.plans[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: `/pages/plan-detail/plan-detail?id=${plan.id}`
    })
  }
}) 