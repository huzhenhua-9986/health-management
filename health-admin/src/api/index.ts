import request from '@/utils/request'

// 认证API
export const authApi = {
  // 登录
  login: async (phone: string, password: string) => {
    return request.post('/auth/login', { phone, password })
  },

  // 注册
  register: async (phone: string, password: string, nickname?: string) => {
    return request.post('/auth/register', { phone, password, nickname })
  },

  // 微信登录
  wxLogin: async (code: string) => {
    return request.post('/auth/wx-login', { code })
  },

  // 获取当前用户信息
  me: async () => {
    return request.get('/auth/me')
  }
}

// 用户管理API
export const userApi = {
  // 获取用户列表
  getList: async (params: {
    page?: number
    page_size?: number
    keyword?: string
    status?: string
  }) => {
    return request.get('/users', { params })
  },

  // 获取用户详情
  getDetail: async (id: string) => {
    return request.get(`/users/${id}`)
  },

  // 更新用户
  update: async (id: string, data: any) => {
    return request.put(`/users/${id}`, data)
  },

  // 批量更新用户状态
  batchUpdateStatus: async (ids: string[], status: string) => {
    return request.put('/users/batch', { ids, status })
  },

  // 删除用户
  delete: async (id: string) => {
    return request.delete(`/users/${id}`)
  },

  // 获取用户统计
  getStatistics: async () => {
    return request.get('/dashboard/stats')
  }
}

// 健康数据API
export const healthDataApi = {
  // 获取健康数据列表
  getList: async (params: {
    user_id?: string
    data_type?: string
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  }) => {
    return request.get('/health-data', { params })
  },

  // 添加健康数据
  create: async (data: any) => {
    return request.post('/health-data', data)
  },

  // 更新健康数据
  update: async (id: string, data: any) => {
    return request.put(`health-data/${id}`, data)
  },

  // 删除健康数据
  delete: async (id: string) => {
    return request.delete(`health-data/${id}`)
  },

  // 获取健康数据统计
  getStatistics: async (params: {
    data_type?: string
    period?: string
    start_date?: string
    end_date?: string
  }) => {
    return request.get('/health-data/statistics', { params })
  },

  // 获取趋势数据
  getTrends: async (params: {
    user_id?: string
    data_type: string
    period: string
  }) => {
    return request.get('/health-data/trends', { params })
  }
}

// 运动数据API
export const exerciseApi = {
  // 获取运动数据列表
  getList: async (params: {
    user_id?: string
    start_date?: string
    end_date?: string
  }) => {
    return request.get('/exercise', { params })
  },

  // 添加运动数据
  create: async (data: any) => {
    return request.post('/exercise', data)
  },

  // 更新运动数据
  update: async (id: string, data: any) => {
    return request.put(`exercise/${id}`, data)
  },

  // 删除运动数据
  delete: async (id: string) => {
    return request.delete(`exercise/${id}`)
  }
}

// 睡眠数据API
export const sleepApi = {
  // 获取睡眠数据列表
  getList: async (params: {
    user_id?: string
    start_date?: string
    end_date?: string
  }) => {
    return request.get('/sleep', { params })
  },

  // 添加睡眠数据
  create: async (data: any) => {
    return request.post('/sleep', data)
  },

  // 更新睡眠数据
  update: async (id: string, data: any) => {
    return request.put(`sleep/${id}`, data)
  },

  // 删除睡眠数据
  delete: async (id: string) => {
    return request.delete(`sleep/${id}`)
  }
}

// 饮食数据API
export const dietApi = {
  // 获取饮食数据列表
  getList: async (params: {
    user_id?: string
    start_date?: string
    end_date?: string
  }) => {
    return request.get('/diet', { params })
  },

  // 添加饮食数据
  create: async (data: any) => {
    return request.post('/diet', data)
  },

  // 更新饮食数据
  update: async (id: string, data: any) => {
    return request.put(`diet/${id}`, data)
  },

  // 删除饮食数据
  delete: async (id: string) => {
    return request.delete(`diet/${id}`)
  }
}

// 数据分析API
export const analysisApi = {
  // 数据验证
  validate: (data: { data_type: string; data_value: any; user_id: string }) =>
    request.post('/analysis/validate', data),

  // 健康评估
  assess: (data: { user_id: string; period: string; start_date: string; end_date: string }) =>
    request.post('/analysis/assess', data),

  // 趋势预测
  predict: (data: { user_id: string; data_type: string; prediction_days: number }) =>
    request.post('/analysis/predict', data),

  // 获取风险预警
  getRisks: (params: { user_id?: string }) =>
    request.get('/analysis/risks', { params }),

  // 获取健康建议
  getRecommendations: (params: { user_id: string }) =>
    request.get('/analysis/recommendations', { params })
}

// 报告API
export const reportApi = {
  // 获取报告列表
  getList: async (params: {
    user_id?: string
    report_type?: string
    page?: number
    page_size?: number
  }) => {
    return request.get('/reports', { params })
  },

  // 生成报告
  generate: (data: {
    user_id: string
    report_type: string
    start_date: string
    end_date: string
    include_sections?: string[]
  }) => request.post('/reports/generate', data),

  // 删除报告
  delete: async (id: string) => {
    return request.delete(`/api/reports/${id}`)
  }
}

// 日志API
export const logApi = {
  // 获取日志列表
  getList: async (params: {
    user_id?: string
    action?: string
    status?: string
    start_date?: string
    end_date?: string
    page?: number
    page_size?: number
  }) => {
    return request.get('/logs', { params })
  }
}

// 仪表盘API
export const dashboardApi = {
  // 获取概览数据
  getOverview: async () => {
    return request.get('/dashboard/stats')
  },

  // 获取用户活跃度趋势
  getUserActivityTrend: async (days: number = 7) => {
    return request.get('/dashboard/trends', { params: { days, type: 'activity' } })
  },

  // 获取数据采集量趋势
  getDataCollectionTrend: async (days: number = 7) => {
    return request.get('/dashboard/trends', { params: { days, type: 'collection' } })
  }
}
