// 健康数据分析 Edge Function
// 提供健康数据分析、趋势预测、风险评估等功能

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

// 数据类型配置
const DATA_TYPES = {
  blood_pressure_systolic: { name: '收缩压', unit: 'mmHg', normalRange: [90, 120] },
  blood_pressure_diastolic: { name: '舒张压', unit: 'mmHg', normalRange: [60, 80] },
  blood_sugar: { name: '血糖', unit: 'mmol/L', normalRange: [3.9, 6.1] },
  heart_rate: { name: '心率', unit: 'bpm', normalRange: [60, 100] },
  temperature: { name: '体温', unit: '℃', normalRange: [36.0, 37.3] },
  weight: { name: '体重', unit: 'kg', normalRange: [50, 80] },
  bmi: { name: 'BMI', unit: '', normalRange: [18.5, 24.9] }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    // 获取认证用户
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authorization')
    }

    // 获取用户数据库记录
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // 路由处理
    if (action === 'trends') {
      return await handleTrends(req, supabase, userData)
    } else if (action === 'statistics') {
      return await handleStatistics(req, supabase, userData)
    } else if (action === 'assess') {
      return await handleAssess(req, supabase, userData)
    } else if (action === 'risks') {
      return await handleRisks(req, supabase, userData)
    } else if (action === 'recommendations') {
      return await handleRecommendations(req, supabase, userData)
    } else {
      throw new Error('Unknown action')
    }

  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// 处理趋势数据
async function handleTrends(req: Request, supabase: any, userData: any) {
  const { user_id, data_type, period = 'week' } = await req.json()

  // 权限检查：用户只能查看自己的数据，管理员可以查看所有数据
  if (userData.role !== 'admin' && user_id !== userData.id) {
    throw new Error('Permission denied')
  }

  const targetUserId = user_id || userData.id
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 90
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('data_type', data_type)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: true })

  if (error) throw error

  // 计算趋势
  const values = data.map(d => Number(d.data_value))
  const trend = calculateTrend(values)

  return new Response(
    JSON.stringify({
      data_type,
      period,
      data: data.map(d => ({
        date: d.recorded_at,
        value: d.data_value,
        unit: d.unit
      })),
      trend,
      statistics: {
        average: values.reduce((a, b) => a + b, 0) / values.length || 0,
        max: Math.max(...values),
        min: Math.min(...values),
        count: values.length
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 处理统计数据
async function handleStatistics(req: Request, supabase: any, userData: any) {
  const { data_type, period = 'week', start_date, end_date } = await req.json()

  // 管理员可以查看所有用户的统计
  let query = supabase
    .from('health_data')
    .select('*')

  if (userData.role !== 'admin') {
    query = query.eq('user_id', userData.id)
  }

  if (data_type) {
    query = query.eq('data_type', data_type)
  }

  if (start_date) {
    query = query.gte('recorded_at', start_date)
  }
  if (end_date) {
    query = query.lte('recorded_at', end_date)
  }

  const { data, error } = await query.order('recorded_at', { ascending: false })
  if (error) throw error

  // 按日期分组统计
  const dailyStats = groupByDate(data)

  // 计算总体统计
  const values = data.map(d => Number(d.data_value))
  const statistics = {
    average: values.reduce((a, b) => a + b, 0) / values.length || 0,
    max: Math.max(...values) || 0,
    min: Math.min(...values) || 0,
    count: values.length,
    trend: calculateTrend(values)
  }

  return new Response(
    JSON.stringify({
      period,
      data_type,
      statistics,
      daily_data: dailyStats
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 处理健康评估
async function handleAssess(req: Request, supabase: any, userData: any) {
  const { user_id, period = 'week', start_date, end_date } = await req.json()

  const targetUserId = userData.role === 'admin' && user_id ? user_id : userData.id
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 90
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // 获取各类型健康数据
  const { data: healthData, error } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', targetUserId)
    .gte('recorded_at', startDate.toISOString())

  if (error) throw error

  // 获取运动数据
  const { data: exerciseData } = await supabase
    .from('exercise_data')
    .select('*')
    .eq('user_id', targetUserId)
    .gte('exercise_date', startDate.toISOString().split('T')[0])

  // 获取睡眠数据
  const { data: sleepData } = await supabase
    .from('sleep_data')
    .select('*')
    .eq('user_id', targetUserId)
    .gte('sleep_date', startDate.toISOString().split('T')[0])

  // 计算健康评分
  const assessment = calculateHealthScore(healthData, exerciseData, sleepData)

  return new Response(
    JSON.stringify(assessment),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 处理风险预警
async function handleRisks(req: Request, supabase: any, userData: any) {
  const { user_id } = await req.json()
  const targetUserId = userData.role === 'admin' && user_id ? user_id : userData.id

  // 获取最近30天的数据
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const { data: healthData, error } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', targetUserId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: false })

  if (error) throw error

  const risks = analyzeRisks(healthData)

  return new Response(
    JSON.stringify({ risks }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 处理健康建议
async function handleRecommendations(req: Request, supabase: any, userData: any) {
  const { user_id } = await req.json()
  const targetUserId = userData.role === 'admin' && user_id ? user_id : userData.id

  // 获取最近数据
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)

  const [healthResult, exerciseResult, sleepResult] = await Promise.all([
    supabase.from('health_data').select('*').eq('user_id', targetUserId).gte('recorded_at', startDate.toISOString()),
    supabase.from('exercise_data').select('*').eq('user_id', targetUserId).gte('exercise_date', startDate.toISOString().split('T')[0]),
    supabase.from('sleep_data').select('*').eq('user_id', targetUserId).gte('sleep_date', startDate.toISOString().split('T')[0])
  ])

  const recommendations = generateRecommendations(
    healthResult.data || [],
    exerciseResult.data || [],
    sleepResult.data || []
  )

  return new Response(
    JSON.stringify({ recommendations }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 辅助函数：计算趋势
function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'stable'

  const recent = values.slice(-Math.min(5, values.length))
  const older = values.slice(0, Math.min(5, values.length))

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length

  const change = ((recentAvg - olderAvg) / olderAvg) * 100

  if (change > 10) return 'increasing'
  if (change < -10) return 'decreasing'
  return 'stable'
}

// 辅助函数：按日期分组
function groupByDate(data: any[]): any[] {
  const grouped = new Map()

  data.forEach(item => {
    const date = item.recorded_at.split('T')[0]
    if (!grouped.has(date)) {
      grouped.set(date, [])
    }
    grouped.get(date).push(item)
  })

  return Array.from(grouped.entries()).map(([date, items]) => ({
    date,
    values: (items as any[]).map(i => Number(i.data_value)),
    count: items.length,
    average: (items as any[]).reduce((a, b) => a + Number(b.data_value), 0) / items.length
  }))
}

// 辅助函数：计算健康评分
function calculateHealthScore(healthData: any[], exerciseData: any[], sleepData: any[]): any {
  let score = 70 // 基础分
  const details = []

  // 健康指标评分
  if (healthData && healthData.length > 0) {
    const latestData = healthData.filter(d => {
      const maxDate = new Date(Math.max(...healthData.map(h => new Date(h.recorded_at).getTime())))
      const itemDate = new Date(d.recorded_at)
      const diffDays = (maxDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 1
    })

    latestData.forEach(data => {
      const config = DATA_TYPES[data.data_type as keyof typeof DATA_TYPES]
      if (config) {
        const value = Number(data.data_value)
        const [min, max] = config.normalRange
        if (value >= min && value <= max) {
          score += 5
        } else if (value < min * 0.8 || value > max * 1.2) {
          score -= 5
          details.push(`${config.name}异常: ${value}${config.unit}`)
        }
      }
    })
  }

  // 运动评分
  if (exerciseData && exerciseData.length > 0) {
    const avgSteps = exerciseData.reduce((a, b) => a + b.steps, 0) / exerciseData.length
    if (avgSteps >= 8000) {
      score += 10
    } else if (avgSteps >= 5000) {
      score += 5
    } else {
      details.push('运动量不足，建议每天至少步行8000步')
    }
  } else {
    details.push('缺少运动数据记录')
  }

  // 睡眠评分
  if (sleepData && sleepData.length > 0) {
    const avgDuration = sleepData.reduce((a, b) => a + b.sleep_duration, 0) / sleepData.length / 3600 // 转换为小时
    if (avgDuration >= 7 && avgDuration <= 9) {
      score += 10
    } else if (avgDuration >= 6) {
      score += 5
    } else {
      details.push('睡眠时间不足，建议保持7-9小时睡眠')
    }
  } else {
    details.push('缺少睡眠数据记录')
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    level: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
    details
  }
}

// 辅助函数：分析风险
function analyzeRisks(healthData: any[]): any[] {
  const risks = []

  // 按数据类型分组
  const grouped = new Map()
  healthData.forEach(item => {
    if (!grouped.has(item.data_type)) {
      grouped.set(item.data_type, [])
    }
    grouped.get(item.data_type).push(item)
  })

  grouped.forEach((items, type) => {
    const config = DATA_TYPES[type as keyof typeof DATA_TYPES]
    if (!config) return

    const values = items.map(i => Number(i.data_value))
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const [min, max] = config.normalRange

    if (avg > max * 1.3 || avg < min * 0.7) {
      risks.push({
        type,
        level: 'high',
        message: `${config.name}平均值(${avg.toFixed(1)})超出正常范围(${min}-${max})`,
        recommendation: `建议及时就医检查${config.name}`
      })
    } else if (avg > max * 1.15 || avg < min * 0.85) {
      risks.push({
        type,
        level: 'medium',
        message: `${config.name}平均值(${avg.toFixed(1)})略高于正常范围`,
        recommendation: `建议注意监测${config.name}，保持健康生活方式`
      })
    }
  })

  return risks
}

// 辅助函数：生成建议
function generateRecommendations(healthData: any[], exerciseData: any[], sleepData: any[]): string[] {
  const recommendations = []

  // 运动建议
  if (exerciseData.length === 0) {
    recommendations.push('开始记录您的运动数据，建议每天至少步行8000步')
  } else {
    const avgSteps = exerciseData.reduce((a, b) => a + b.steps, 0) / exerciseData.length
    if (avgSteps < 5000) {
      recommendations.push('运动量偏低，建议增加日常步行，目标每天8000步')
    }
  }

  // 睡眠建议
  if (sleepData.length === 0) {
    recommendations.push('开始记录您的睡眠数据，保持规律的作息时间')
  } else {
    const avgQuality = sleepData.reduce((a, b) => a + b.sleep_quality, 0) / sleepData.length
    if (avgQuality < 6) {
      recommendations.push('睡眠质量偏低，建议保持规律作息，睡前避免使用电子设备')
    }
  }

  // 饮食建议
  recommendations.push('保持均衡饮食，多吃蔬菜水果，控制油盐摄入')
  recommendations.push('每天保持充足水分摄入，建议1.5-2升')

  return recommendations
}
