const app = getApp()

const api = {
  // 获取计划列表
  getPlans() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.baseUrl}/api/plans`,
        method: 'GET',
        success: (res) => {
          console.log('getPlans success:', res)
          resolve(res.data)
        },
        fail: (err) => {
          console.error('getPlans fail:', err)
          reject(err)
        }
      })
    })
  },

  // 提交新计划
  submitPlan(data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.baseUrl}/api/plans`,
        method: 'POST',
        data,
        success: (res) => {
          console.log('submitPlan success:', res)
          resolve(res.data)
        },
        fail: (err) => {
          console.error('submitPlan fail:', err)
          reject(err)
        }
      })
    })
  },

  // 更新计划状态
  updatePlanStatus(planId, data) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.baseUrl}/api/plans/${planId}`,
        method: 'PUT',
        data,
        success: (res) => {
          console.log('updatePlanStatus success:', res)
          resolve(res.data)
        },
        fail: (err) => {
          console.error('updatePlanStatus fail:', err)
          reject(err)
        }
      })
    })
  },

  // 验证管理员身份
  verifyAdmin(totpToken) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${app.globalData.baseUrl}/api/admin/verify`,
        method: 'POST',
        data: { totpToken },
        success: (res) => {
          console.log('verifyAdmin success:', res)
          resolve(res.data)
        },
        fail: (err) => {
          console.error('verifyAdmin fail:', err)
          reject(err)
        }
      })
    })
  }
}

module.exports = api 