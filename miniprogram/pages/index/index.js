const api = require('../../utils/api')

Page({
  data: {
    newPlan: {
      planDate: '',
      description: '',
      alternative: '',
      totpToken: ''
    },
    isAfterThursday: false,
    showPreview: false,
    showAlternativePreview: false
  },

  onLoad() {
    this.checkIfAfterThursday()
  },

  checkIfAfterThursday() {
    const today = new Date()
    // 周四是4，周五是5，周六是6，周日是0
    this.setData({
      isAfterThursday: today.getDay() > 4 || today.getDay() === 0
    })
  },

  bindDateChange(e) {
    this.setData({
      'newPlan.planDate': e.detail.value
    })
  },

  bindDescriptionInput(e) {
    this.setData({
      'newPlan.description': e.detail.value
    })
  },

  bindAlternativeInput(e) {
    this.setData({
      'newPlan.alternative': e.detail.value
    })
  },

  bindTotpTokenInput(e) {
    this.setData({
      'newPlan.totpToken': e.detail.value
    })
  },

  togglePreview() {
    this.setData({
      showPreview: !this.data.showPreview
    })
  },

  toggleAlternativePreview() {
    this.setData({
      showAlternativePreview: !this.data.showAlternativePreview
    })
  },

  async submitPlan() {
    if (!this.data.newPlan.planDate) {
      wx.showToast({
        title: '请选择计划日期',
        icon: 'none'
      })
      return
    }

    if (!this.data.newPlan.description) {
      wx.showToast({
        title: '请输入详细描述',
        icon: 'none'
      })
      return
    }

    if (!this.data.newPlan.totpToken) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    })

    try {
      const plan = {
        id: Date.now().toString(),
        submitDate: new Date().toISOString().split('T')[0],
        planDate: this.data.newPlan.planDate,
        description: this.data.newPlan.description,
        alternative: this.data.newPlan.alternative || '',
        status: 'pending',
        feedback: '',
        totpToken: this.data.newPlan.totpToken
      }

      await api.submitPlan({
        plan,
        totpToken: this.data.newPlan.totpToken
      })

      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })

      // 重置表单
      this.setData({
        newPlan: {
          planDate: '',
          description: '',
          alternative: '',
          totpToken: ''
        }
      })

      // 跳转到历史记录页面
      wx.switchTab({
        url: '/pages/history/history'
      })
    } catch (error) {
      console.error('Submit plan error:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '提交失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      // 确保在任何情况下都会隐藏 loading
      wx.hideLoading()
    }
  }
}) 