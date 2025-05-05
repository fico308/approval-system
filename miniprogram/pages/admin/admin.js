const api = require('../../utils/api')

Page({
  data: {
    isAdmin: false,
    pendingPlans: [],
    reviewedPlans: [],
    loading: false,
    totpToken: '',
    showLoginDialog: false,
    plans: []
  },

  onLoad() {
    this.checkAdminStatus()
    this.loadPlans()
  },

  onPullDownRefresh() {
    this.loadPlans().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async checkAdminStatus() {
    const isAdmin = wx.getStorageSync('isAdmin')
    this.setData({ isAdmin })
    if (isAdmin) {
      this.loadPlans()
    }
  },

  async loadPlans() {
    try {
      this.setData({ loading: true })
      const plans = await api.getPlans()
      console.log('Received plans:', plans) // 添加日志
      
      if (!plans) {
        throw new Error('No plans data received')
      }

      // 添加状态文本和格式化日期
      const plansWithStatus = plans.map(plan => {
        console.log('Processing plan:', plan) // 添加日志
        return {
          ...plan,
          statusText: this.getStatusText(plan.status),
          planDate: this.formatDate(plan.planDate),
          submitDate: this.formatDate(plan.submitDate)
        }
      })
      
      // Filter to show only pending plans
      const pendingPlans = plansWithStatus.filter(plan => plan.status === 'pending')
      
      console.log('Processed plans:', pendingPlans) // 添加日志
      
      this.setData({
        plans: pendingPlans,
        loading: false
      })

      // 停止下拉刷新
      wx.stopPullDownRefresh()
    } catch (error) {
      console.error('Load plans error:', error)
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none',
        duration: 2000
      })
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
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

  showLogin() {
    this.setData({ showLoginDialog: true })
  },

  hideLogin() {
    this.setData({ showLoginDialog: false })
  },

  bindTotpTokenInput(e) {
    const { id } = e.currentTarget.dataset
    
    // 如果是登录验证码输入
    if (!id) {
      this.setData({
        totpToken: e.detail.value
      })
      return
    }
    
    // 如果是计划验证码输入
    const { value } = e.detail
    const plans = this.data.plans.map(plan => {
      if (plan.id === id) {
        return { ...plan, totpToken: value }
      }
      return plan
    })
    
    this.setData({ plans })
  },

  bindFeedbackInput(e) {
    const { id } = e.currentTarget.dataset
    const { value } = e.detail
    
    // 更新对应计划的审批意见
    const plans = this.data.plans.map(plan => {
      if (plan.id === id) {
        return { ...plan, feedback: value }
      }
      return plan
    })
    
    this.setData({ plans })
  },

  async login() {
    if (!this.data.totpToken) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({
        title: '验证中...'
      })

      const res = await api.verifyAdmin(this.data.totpToken)
      
      if (res.valid) {
        wx.setStorageSync('isAdmin', true)
        this.setData({ 
          isAdmin: true,
          showLoginDialog: false
        })
        this.loadPlans()
      } else {
        wx.showToast({
          title: '验证码错误',
          icon: 'none'
        })
      }
    } catch (error) {
      wx.showToast({
        title: '验证失败，请重试',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  async approvePlan(e) {
    const { id } = e.currentTarget.dataset
    const plan = this.data.plans.find(p => p.id === id)
    
    if (!plan.feedback || !plan.totpToken) {
      wx.showToast({
        title: '请填写审批意见和验证码',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '处理中...' })
      
      await api.updatePlanStatus(id, {
        status: 'approved',
        feedback: plan.feedback,
        totpToken: plan.totpToken
      })

      wx.hideLoading()
      wx.showToast({
        title: '已批准',
        icon: 'success'
      })

      // 重新加载计划列表
      this.loadPlans()
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  async rejectPlan(e) {
    const { id } = e.currentTarget.dataset
    const plan = this.data.plans.find(p => p.id === id)
    
    if (!plan.feedback || !plan.totpToken) {
      wx.showToast({
        title: '请填写审批意见和验证码',
        icon: 'none'
      })
      return
    }

    try {
      wx.showLoading({ title: '处理中...' })
      
      await api.updatePlanStatus(id, {
        status: 'rejected',
        feedback: plan.feedback,
        totpToken: plan.totpToken
      })

      wx.hideLoading()
      wx.showToast({
        title: '已拒绝',
        icon: 'success'
      })

      // 重新加载计划列表
      this.loadPlans()
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}) 