// 后端API接口对接
import request from '@/utils/request'

// ==================== 认证模块 ====================

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  nickname?: string
}

export const authApi = {
  // 登录
  login: (data: LoginParams) => {
    return request.post('/auth/login', data) as Promise<{ user: any; token: string }>
  },

  // 注册
  register: (data: RegisterParams) => {
    return request.post('/auth/register', data) as Promise<{ user: any; token: string }>
  },

  // 微信登录
  wxLogin: (data: { code: string }) => {
    return request.post('/auth/wx-login', data) as Promise<{ user: any; token: string }>
  },

  // 获取当前用户信息
  me: () => {
    return request.get('/auth/me') as Promise<any>
  }
}

// ==================== 仪表盘模块 ====================

export const dashboardApi = {
  // 获取统计数据
  getStats: () => {
    return request.get('/dashboard/stats') as Promise<{
      totalUsers: number
      totalHealthData: number
      totalExercise: number
      totalSleep: number
      totalDiet: number
    }>
  }
}

// ==================== 用户模块 ====================

export const userApi = {
  // 获取用户列表
  getList: (params?: { page?: number; pageSize?: number; keyword?: string }) => {
    return request.get('/users', { params }) as Promise<{
      users: any[]
      total: number
      page: number
      pageSize: number
    }>
  },

  // 获取用户详情
  getDetail: (id: string) => {
    return request.get(`/users/${id}`) as Promise<any>
  },

  // 更新用户
  update: (id: string, data: any) => {
    return request.put(`/users/${id}`, data)
  },

  // 删除用户
  delete: (id: string) => {
    return request.delete(`/users/${id}`)
  }
}

// ==================== 健康数据模块 ====================

export const healthDataApi = {
  // 获取健康数据列表
  getList: (params?: {
    userId?: string
    dataType?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) => {
    return request.get('/health-data', { params }) as Promise<{
      data: any[]
      total: number
    }>
  },

  // 创建健康数据
  create: (data: any) => {
    return request.post('/health-data', data)
  },

  // 更新健康数据
  update: (id: string, data: any) => {
    return request.put(`/health-data/${id}`, data)
  },

  // 删除健康数据
  delete: (id: string) => {
    return request.delete(`/health-data/${id}`)
  }
}

// ==================== 运动数据模块 ====================

export const exerciseApi = {
  // 获取运动数据列表
  getList: (params?: {
    userId?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) => {
    return request.get('/exercise', { params }) as Promise<{
      data: any[]
      total: number
    }>
  },

  // 创建运动数据
  create: (data: any) => {
    return request.post('/exercise', data)
  },

  // 更新运动数据
  update: (id: string, data: any) => {
    return request.put(`/exercise/${id}`, data)
  },

  // 删除运动数据
  delete: (id: string) => {
    return request.delete(`/exercise/${id}`)
  }
}

// ==================== 睡眠数据模块 ====================

export const sleepApi = {
  // 获取睡眠数据列表
  getList: (params?: {
    userId?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) => {
    return request.get('/sleep', { params }) as Promise<{
      data: any[]
      total: number
    }>
  },

  // 创建睡眠数据
  create: (data: any) => {
    return request.post('/sleep', data)
  },

  // 更新睡眠数据
  update: (id: string, data: any) => {
    return request.put(`/sleep/${id}`, data)
  },

  // 删除睡眠数据
  delete: (id: string) => {
    return request.delete(`/sleep/${id}`)
  }
}

// ==================== 饮食数据模块 ====================

export const dietApi = {
  // 获取饮食数据列表
  getList: (params?: {
    userId?: string
    mealType?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) => {
    return request.get('/diet', { params }) as Promise<{
      data: any[]
      total: number
    }>
  },

  // 创建饮食数据
  create: (data: any) => {
    return request.post('/diet', data)
  },

  // 更新饮食数据
  update: (id: string, data: any) => {
    return request.put(`/diet/${id}`, data)
  },

  // 删除饮食数据
  delete: (id: string) => {
    return request.delete(`/diet/${id}`)
  }
}

// ==================== 报告模块 ====================

export const reportApi = {
  // 获取报告列表
  getList: (params?: {
    userId?: string
    reportType?: string
    page?: number
    pageSize?: number
  }) => {
    return request.get('/reports', { params }) as Promise<{
      data: any[]
      total: number
    }>
  },

  // 生成报告
  generate: (data: any) => {
    return request.post('/reports/generate', data)
  },

  // 删除报告
  delete: (id: string) => {
    return request.delete(`/reports/${id}`)
  }
}

// ==================== 日志模块 ====================

export const logApi = {
  // 获取日志列表
  getList: (params?: {
    action?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }) => {
    return request.get('/logs', { params }) as Promise<{
      data: any[]
      total: number
    }>
  }
}
