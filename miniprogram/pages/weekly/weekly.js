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
      
      // 获取本周的开始和结束日期
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      
      // 过滤出本周的计划
      const weeklyPlans = approvedPlans.filter(plan => {
        const planDate = new Date(plan.planDate)
        return planDate >= startOfWeek && planDate <= endOfWeek
      })
      
      // 格式化日期并添加周几信息
      const formattedPlans = weeklyPlans.map(plan => {
        const date = new Date(plan.planDate)
        const weekday = this.getWeekday(date)
        return {
          ...plan,
          planDate: this.formatDate(plan.planDate),
          weekday
        }
      })
      
      this.setData({
        plans: formattedPlans,
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

  viewPlanDetail(e) {
    const plan = this.data.plans[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: `/pages/plan-detail/plan-detail?id=${plan.id}`
    })
  }
}) 