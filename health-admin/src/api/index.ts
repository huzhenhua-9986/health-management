import request from '@/utils/request'
import { supabase } from '@/utils/supabase'
import { isSupabaseConfigured } from '@/utils/supabase'

// 用户管理API
export const userApi = {
  // 获取用户列表
  getList: async (params: {
    page?: number
    page_size?: number
    keyword?: string
    status?: string
    sort?: string
    order?: string
  }) => {
    // 演示模式：返回模拟数据
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockUsers = Array.from({ length: params.page_size || 20 }, (_, i) => ({
        id: `demo-user-${(params.page || 1) * 20 + i}`,
        phone: `138${String(i).padStart(8, '0')}`,
        nickname: ['张三', '李四', '王五', '赵六', '钱七'][i % 5] + (i > 4 ? i : ''),
        avatar_url: '',
        gender: i % 3 === 0 ? 'male' : i % 3 === 1 ? 'female' : null,
        height: 165 + (i % 20),
        weight: 55 + (i % 30),
        status: i % 5 === 0 ? 'inactive' : 'active',
        role: i % 10 === 0 ? 'admin' : 'user',
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }))
      return {
        data: mockUsers,
        count: 1234,
        error: null
      }
    }

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })

    if (params.keyword) {
      query = query.or(`phone.ilike.%${params.keyword}%,nickname.ilike.%${params.keyword}%`)
    }
    if (params.status) {
      query = query.eq('status', params.status)
    }

    const from = ((params.page || 1) - 1) * (params.page_size || 20)
    const to = from + (params.page_size || 20) - 1

    return query.range(from, to).order(params.sort || 'created_at', { ascending: params.order === 'asc' })
  },

  // 获取用户详情
  getDetail: async (id: string) => {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        data: {
          id,
          phone: '13800138000',
          nickname: '演示用户',
          avatar_url: '',
          gender: 'male',
          birth_date: '1990-01-01',
          height: 175,
          weight: 70,
          status: 'active',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      }
    }

    return supabase.from('users').select('*').eq('id', id).single()
  },

  // 更新用户
  update: async (id: string, data: any) => {
    if (!isSupabaseConfigured()) {
      return { error: null }
    }
    return supabase.from('users').update(data).eq('id', id)
  },

  // 批量更新用户状态
  batchUpdateStatus: async (ids: string[], status: string) => {
    if (!isSupabaseConfigured()) {
      return { error: null }
    }
    return supabase.from('users').update({ status }).in('id', ids)
  },

  // 删除用户
  delete: async (id: string) => {
    if (!isSupabaseConfigured()) {
      return { error: null }
    }
    return supabase.from('users').delete().eq('id', id)
  },

  // 获取用户统计
  getStatistics: async () => {
    if (!isSupabaseConfigured()) {
      return {
        total: 1234,
        active: 892,
        today: 45
      }
    }

    const [{ count: total }, { count: active }, { count: today }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0])
    ])

    return { total: total || 0, active: active || 0, today: today || 0 }
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
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockData = Array.from({ length: params.page_size || 20 }, (_, i) => ({
        id: `demo-health-${i}`,
        user_id: 'demo-user-001',
        data_type: ['blood_pressure', 'blood_sugar', 'heart_rate', 'temperature', 'weight'][i % 5],
        data_value: Math.floor(Math.random() * 200) / 10,
        unit: ['mmHg', 'mmol/L', 'bpm', '℃', 'kg'][i % 5],
        recorded_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: i % 2 === 0 ? 'manual' : 'device',
        notes: i % 3 === 0 ? '晨起测量' : '',
        created_at: new Date().toISOString(),
        users: { phone: '138****8000', nickname: '演示用户' }
      }))
      return {
        data: mockData,
        count: 5678,
        error: null
      }
    }

    let query = supabase
      .from('health_data')
      .select('*, users(phone, nickname)')

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }
    if (params.data_type) {
      query = query.eq('data_type', params.data_type)
    }
    if (params.start_date) {
      query = query.gte('recorded_at', params.start_date)
    }
    if (params.end_date) {
      query = query.lte('recorded_at', params.end_date)
    }

    const from = ((params.page || 1) - 1) * (params.page_size || 20)
    const to = from + (params.page_size || 20) - 1

    return query.range(from, to).order('recorded_at', { ascending: false })
  },

  // 获取健康数据统计
  getStatistics: async (params: {
    data_type?: string
    period?: string
    start_date?: string
    end_date?: string
  }) => {
    if (!isSupabaseConfigured()) {
      return {
        period: 'week',
        statistics: {
          average: 120,
          max: 140,
          min: 100,
          count: 50,
          trend: 'stable'
        },
        daily_data: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 50) + 100,
          count: Math.floor(Math.random() * 10) + 1
        }))
      }
    }

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
  getList: async (params: { user_id?: string; start_date?: string; end_date?: string }) => {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        id: `demo-exercise-${i}`,
        user_id: 'demo-user-001',
        steps: Math.floor(Math.random() * 15000) + 5000,
        distance: Math.floor(Math.random() * 10) / 10,
        calories: Math.floor(Math.random() * 500) + 200,
        duration: Math.floor(Math.random() * 120) + 30,
        exercise_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        device_type: i % 3 === 0 ? 'iPhone' : i % 3 === 1 ? 'Xiaomi' : 'Huawei',
        created_at: new Date().toISOString()
      }))
      return {
        data: mockData,
        error: null
      }
    }

    let query = supabase.from('exercise_data').select('*')

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }
    if (params.start_date) {
      query = query.gte('exercise_date', params.start_date)
    }
    if (params.end_date) {
      query = query.lte('exercise_date', params.end_date)
    }

    return query.order('exercise_date', { ascending: false })
  }
}

// 睡眠数据API
export const sleepApi = {
  getList: async (params: { user_id?: string; start_date?: string; end_date?: string }) => {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        id: `demo-sleep-${i}`,
        user_id: 'demo-user-001',
        sleep_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sleep_duration: Math.floor(Math.random() * 120 + 360) * 60,
        deep_sleep_duration: Math.floor(Math.random() * 90 + 30) * 60,
        light_sleep_duration: Math.floor(Math.random() * 180 + 120) * 60,
        rem_sleep_duration: Math.floor(Math.random() * 60 + 30) * 60,
        sleep_quality: Math.floor(Math.random() * 5) + 5,
        sleep_cycles: Math.floor(Math.random() * 5) + 3,
        created_at: new Date().toISOString()
      }))
      return {
        data: mockData,
        error: null
      }
    }

    let query = supabase.from('sleep_data').select('*')

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }
    if (params.start_date) {
      query = query.gte('sleep_date', params.start_date)
    }
    if (params.end_date) {
      query = query.lte('sleep_date', params.end_date)
    }

    return query.order('sleep_date', { ascending: false })
  }
}

// 饮食数据API
export const dietApi = {
  getList: async (params: { user_id?: string; start_date?: string; end_date?: string }) => {
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack']
      const foods = ['米饭', '面条', '鸡蛋', '牛奶', '苹果', '鸡肉', '蔬菜', '鱼']
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: `demo-diet-${i}`,
        user_id: 'demo-user-001',
        meal_type: mealTypes[i % 4],
        food_name: foods[i % foods.length] + (i % 3 > 0 ? `${i % 3}` : ''),
        calories: Math.floor(Math.random() * 500) + 200,
        protein: Math.floor(Math.random() * 30),
        fat: Math.floor(Math.random() * 20),
        carbohydrate: Math.floor(Math.random() * 50),
        fiber: Math.floor(Math.random() * 10),
        meal_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      }))
      return {
        data: mockData,
        error: null
      }
    }

    let query = supabase.from('diet_data').select('*')

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }
    if (params.start_date) {
      query = query.gte('meal_time', params.start_date)
    }
    if (params.end_date) {
      query = query.lte('meal_time', params.end_date)
    }

    return query.order('meal_time', { ascending: false })
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
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockData = Array.from({ length: params.page_size || 20 }, (_, i) => ({
        id: `demo-report-${i}`,
        user_id: 'demo-user-001',
        report_type: ['daily', 'weekly', 'monthly'][i % 3],
        report_period: `${i + 1}周报告`,
        start_date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        content: { generated: true },
        file_url: '',
        generated_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }))
      return {
        data: mockData,
        count: 50,
        error: null
      }
    }

    let query = supabase
      .from('health_reports')
      .select('*', { count: 'exact' })

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }
    if (params.report_type) {
      query = query.eq('report_type', params.report_type)
    }

    const from = ((params.page || 1) - 1) * (params.page_size || 20)
    const to = from + (params.page_size || 20) - 1

    return query.range(from, to).order('generated_at', { ascending: false })
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
    if (!isSupabaseConfigured()) {
      return { error: null }
    }
    return supabase.from('health_reports').delete().eq('id', id)
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
    if (!isSupabaseConfigured()) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const actions = ['login', 'logout', 'create', 'update', 'delete']
      const mockData = Array.from({ length: params.page_size || 20 }, (_, i) => ({
        id: `demo-log-${i}`,
        user_id: 'demo-user-001',
        action: actions[i % actions.length],
        resource_type: ['users', 'health_data', 'exercise_data'][i % 3],
        resource_id: `demo-resource-${i}`,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0...',
        status: i % 10 === 0 ? 'failed' : 'success',
        error_message: i % 10 === 0 ? 'Connection timeout' : '',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }))
      return {
        data: mockData,
        count: 234,
        error: null
      }
    }

    let query = supabase
      .from('system_logs')
      .select('*', { count: 'exact' })

    if (params.user_id) {
      query = query.eq('user_id', params.user_id)
    }
    if (params.action) {
      query = query.eq('action', params.action)
    }
    if (params.status) {
      query = query.eq('status', params.status)
    }
    if (params.start_date) {
      query = query.gte('created_at', params.start_date)
    }
    if (params.end_date) {
      query = query.lte('created_at', params.end_date)
    }

    const from = ((params.page || 1) - 1) * (params.page_size || 20)
    const to = from + (params.page_size || 20) - 1

    return query.range(from, to).order('created_at', { ascending: false })
  }
}

// 仪表盘API
export const dashboardApi = {
  // 获取概览数据
  getOverview: async () => {
    // 演示模式已经在页面中处理
    throw new Error('Use demo mode in component')
  },

  // 获取用户活跃度趋势
  getUserActivityTrend: async (days: number = 7) => {
    // 演示模式已经在页面中处理
    throw new Error('Use demo mode in component')
  },

  // 获取数据采集量趋势
  getDataCollectionTrend: async (days: number = 7) => {
    // 演示模式已经在页面中处理
    throw new Error('Use demo mode in component')
  }
}
