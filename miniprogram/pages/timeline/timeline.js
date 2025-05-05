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
      
      // 只保留已批准的申请
      const approvedPlans = plans.filter(plan => plan.status === 'approved')
      
      // 按月份分组并格式化日期
      const groupedPlans = this.groupPlansByMonth(approvedPlans)
      
      this.setData({
        plans: groupedPlans,
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

  groupPlansByMonth(plans) {
    const groups = {}
    
    plans.forEach(plan => {
      const date = new Date(plan.planDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          month: monthKey,
          title: `${date.getFullYear()}年${date.getMonth() + 1}月`,
          plans: []
        }
      }
      
      groups[monthKey].plans.push({
        ...plan,
        planDate: this.formatDate(plan.planDate),
        weekday: this.getWeekday(date)
      })
    })
    
    // 转换为数组并排序
    return Object.values(groups)
      .sort((a, b) => b.month.localeCompare(a.month))
      .map(group => ({
        ...group,
        plans: group.plans.sort((a, b) => new Date(b.planDate) - new Date(a.planDate))
      }))
  },

  formatDate(dateStr) {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getWeekday(date) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekdays[date.getDay()]
  },

  getStatusText(status) {
    switch (status) {
      case 'approved':
        return '已通过'
      case 'rejected':
        return '已拒绝'
      default:
        return '审核中'
    }
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
    const { monthIndex, planIndex } = e.currentTarget.dataset
    const plan = this.data.plans[monthIndex].plans[planIndex]
    wx.navigateTo({
      url: `/pages/plan-detail/plan-detail?id=${plan.id}`
    })
  }
}) 