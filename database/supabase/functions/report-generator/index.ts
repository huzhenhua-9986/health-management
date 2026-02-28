// 健康报告生成 Edge Function
// 生成日、周、月健康报告

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

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

    // 解析请求参数
    const { user_id, report_type, start_date, end_date, include_sections } = await req.json()

    // 权限检查
    const targetUserId = userData.role === 'admin' && user_id ? user_id : userData.id

    // 计算报告周期
    let reportStart = start_date
    let reportEnd = end_date
    let reportPeriod = ''

    if (!reportStart || !reportEnd) {
      const now = new Date()
      if (report_type === 'daily') {
        reportEnd = now.toISOString().split('T')[0]
        reportStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        reportPeriod = `${reportStart}日报告`
      } else if (report_type === 'weekly') {
        reportEnd = now.toISOString().split('T')[0]
        reportStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        reportPeriod = `${reportStart}至${reportEnd}周报告`
      } else if (report_type === 'monthly') {
        reportEnd = now.toISOString().split('T')[0]
        reportStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        reportPeriod = `${now.getFullYear()}年${now.getMonth() + 1}月报告`
      }
    }

    // 生成报告内容
    const reportContent = await generateReport(
      supabase,
      targetUserId,
      reportStart,
      reportEnd,
      include_sections || ['overview', 'health_data', 'exercise', 'sleep', 'diet', 'recommendations']
    )

    // 保存报告到数据库
    const { data: report, error: reportError } = await supabase
      .from('health_reports')
      .insert({
        user_id: targetUserId,
        report_type,
        report_period: reportPeriod,
        start_date: reportStart,
        end_date: reportEnd,
        content: reportContent
      })
      .select()
      .single()

    if (reportError) throw reportError

    return new Response(
      JSON.stringify({
        success: true,
        report: {
          id: report.id,
          report_type,
          report_period: reportPeriod,
          start_date: reportStart,
          end_date: reportEnd,
          content: reportContent,
          generated_at: report.generated_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Report generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// 生成报告内容
async function generateReport(
  supabase: any,
  userId: string,
  startDate: string,
  endDate: string,
  sections: string[]
): Promise<any> {
  const content: any = {}

  // 获取用户基本信息
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  content.user = {
    nickname: user?.nickname || '用户',
    age: user?.birth_date ? calculateAge(user.birth_date) : null,
    gender: user?.gender,
    height: user?.height,
    weight: user?.weight,
    bmi: user?.height && user?.weight ? calculateBMI(Number(user.height), Number(user.weight)) : null
  }

  // 概览部分
  if (sections.includes('overview')) {
    content.overview = await generateOverview(supabase, userId, startDate, endDate)
  }

  // 健康数据部分
  if (sections.includes('health_data')) {
    content.health_data = await generateHealthDataSection(supabase, userId, startDate, endDate)
  }

  // 运动数据部分
  if (sections.includes('exercise')) {
    content.exercise = await generateExerciseSection(supabase, userId, startDate, endDate)
  }

  // 睡眠数据部分
  if (sections.includes('sleep')) {
    content.sleep = await generateSleepSection(supabase, userId, startDate, endDate)
  }

  // 饮食数据部分
  if (sections.includes('diet')) {
    content.diet = await generateDietSection(supabase, userId, startDate, endDate)
  }

  // 建议部分
  if (sections.includes('recommendations')) {
    content.recommendations = generateRecommendations(content)
  }

  return content
}

// 生成概览
async function generateOverview(supabase: any, userId: string, startDate: string, endDate: string) {
  // 获取各类型数据统计
  const [healthResult, exerciseResult, sleepResult, dietResult] = await Promise.all([
    supabase.from('health_data').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('recorded_at', startDate).lte('recorded_at', endDate),
    supabase.from('exercise_data').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('exercise_date', startDate).lte('exercise_date', endDate),
    supabase.from('sleep_data').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('sleep_date', startDate).lte('sleep_date', endDate),
    supabase.from('diet_data').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('meal_time', startDate).lte('meal_time', endDate)
  ])

  return {
    period: { start: startDate, end: endDate },
    data_counts: {
      health_records: healthResult.count || 0,
      exercise_days: exerciseResult.count || 0,
      sleep_records: sleepResult.count || 0,
      diet_records: dietResult.count || 0
    }
  }
}

// 生成健康数据部分
async function generateHealthDataSection(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data: healthData } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', userId)
    .gte('recorded_at', startDate)
    .lte('recorded_at', endDate)
    .order('recorded_at', { ascending: true })

  if (!healthData || healthData.length === 0) {
    return { message: '暂无健康数据记录' }
  }

  // 按数据类型分组
  const grouped = new Map()
  healthData.forEach(item => {
    if (!grouped.has(item.data_type)) {
      grouped.set(item.data_type, [])
    }
    grouped.get(item.data_type).push(item)
  })

  const typeStats = []
  grouped.forEach((items, type) => {
    const values = items.map(i => Number(i.data_value))
    typeStats.push({
      data_type: type,
      unit: items[0]?.unit || '',
      count: values.length,
      average: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
      max: Math.max(...values),
      min: Math.min(...values),
      latest: items[items.length - 1]?.data_value
    })
  })

  return {
    summary: typeStats,
    records: healthData
  }
}

// 生成运动数据部分
async function generateExerciseSection(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data: exerciseData } = await supabase
    .from('exercise_data')
    .select('*')
    .eq('user_id', userId)
    .gte('exercise_date', startDate)
    .lte('exercise_date', endDate)
    .order('exercise_date', { ascending: true })

  if (!exerciseData || exerciseData.length === 0) {
    return { message: '暂无运动数据记录' }
  }

  const totalSteps = exerciseData.reduce((a, b) => a + b.steps, 0)
  const totalDistance = exerciseData.reduce((a, b) => a + Number(b.distance), 0)
  const totalCalories = exerciseData.reduce((a, b) => a + b.calories, 0)
  const totalDuration = exerciseData.reduce((a, b) => a + b.duration, 0)
  const avgSteps = totalSteps / exerciseData.length

  return {
    summary: {
      total_days: exerciseData.length,
      total_steps: totalSteps,
      total_distance: totalDistance.toFixed(2),
      total_calories,
      total_duration: totalDuration,
      avg_steps: Math.round(avgSteps)
    },
    daily_records: exerciseData,
    achievement: {
      steps_target: avgSteps >= 8000,
      distance_target: totalDistance >= 50,
      calories_target: totalCalories >= 2000
    }
  }
}

// 生成睡眠数据部分
async function generateSleepSection(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data: sleepData } = await supabase
    .from('sleep_data')
    .select('*')
    .eq('user_id', userId)
    .gte('sleep_date', startDate)
    .lte('sleep_date', endDate)
    .order('sleep_date', { ascending: true })

  if (!sleepData || sleepData.length === 0) {
    return { message: '暂无睡眠数据记录' }
  }

  const avgDuration = sleepData.reduce((a, b) => a + b.sleep_duration, 0) / sleepData.length
  const avgDeepSleep = sleepData.reduce((a, b) => a + b.deep_sleep_duration, 0) / sleepData.length
  const avgQuality = sleepData.reduce((a, b) => a + b.sleep_quality, 0) / sleepData.length

  return {
    summary: {
      total_records: sleepData.length,
      avg_duration_hours: (avgDuration / 3600).toFixed(1),
      avg_deep_sleep_hours: (avgDeepSleep / 3600).toFixed(1),
      avg_quality: avgQuality.toFixed(1)
    },
    quality_distribution: {
      excellent: sleepData.filter(d => d.sleep_quality >= 8).length,
      good: sleepData.filter(d => d.sleep_quality >= 6 && d.sleep_quality < 8).length,
      fair: sleepData.filter(d => d.sleep_quality >= 4 && d.sleep_quality < 6).length,
      poor: sleepData.filter(d => d.sleep_quality < 4).length
    },
    daily_records: sleepData
  }
}

// 生成饮食数据部分
async function generateDietSection(supabase: any, userId: string, startDate: string, endDate: string) {
  const { data: dietData } = await supabase
    .from('diet_data')
    .select('*')
    .eq('user_id', userId)
    .gte('meal_time', startDate)
    .lte('meal_time', endDate)
    .order('meal_time', { ascending: true })

  if (!dietData || dietData.length === 0) {
    return { message: '暂无饮食记录' }
  }

  const totalCalories = dietData.reduce((a, b) => a + (b.calories || 0), 0)
  const totalProtein = dietData.reduce((a, b) => a + (b.protein || 0), 0)
  const totalFat = dietData.reduce((a, b) => a + (b.fat || 0), 0)
  const totalCarbs = dietData.reduce((a, b) => a + (b.carbohydrate || 0), 0)

  const mealTypeCount = {
    breakfast: dietData.filter(d => d.meal_type === 'breakfast').length,
    lunch: dietData.filter(d => d.meal_type === 'lunch').length,
    dinner: dietData.filter(d => d.meal_type === 'dinner').length,
    snack: dietData.filter(d => d.meal_type === 'snack').length
  }

  return {
    summary: {
      total_records: dietData.length,
      avg_daily_calories: Math.round(totalCalories / Math.max(1, getDaysDiff(startDate, endDate))),
      total_calories: totalCalories,
      avg_daily_protein: (totalProtein / Math.max(1, getDaysDiff(startDate, endDate))).toFixed(1),
      avg_daily_fat: (totalFat / Math.max(1, getDaysDiff(startDate, endDate))).toFixed(1),
      avg_daily_carbs: (totalCarbs / Math.max(1, getDaysDiff(startDate, endDate))).toFixed(1)
    },
    meal_distribution: mealTypeCount
  }
}

// 生成建议
function generateRecommendations(content: any): string[] {
  const recommendations = []

  // 基于BMI的建议
  if (content.user?.bmi) {
    const bmi = Number(content.user.bmi)
    if (bmi < 18.5) {
      recommendations.push('您的BMI偏低，建议增加营养摄入，适当增重')
    } else if (bmi > 24) {
      recommendations.push('您的BMI偏高，建议控制饮食，增加运动')
    }
  }

  // 基于运动的建议
  if (content.exercise?.summary) {
    const avgSteps = content.exercise.summary.avg_steps
    if (avgSteps < 5000) {
      recommendations.push('运动量不足，建议每天至少步行8000步')
    } else if (avgSteps >= 10000) {
      recommendations.push('运动量达标，请继续保持！')
    }
  }

  // 基于睡眠的建议
  if (content.sleep?.summary) {
    const avgDuration = Number(content.sleep.summary.avg_duration_hours)
    if (avgDuration < 6) {
      recommendations.push('睡眠时间偏少，建议保证7-9小时睡眠')
    } else if (avgDuration > 10) {
      recommendations.push('睡眠时间较长，如有不适建议咨询医生')
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('您的健康数据整体良好，请继续保持健康的生活方式！')
  }

  return recommendations
}

// 辅助函数
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function calculateBMI(height: number, weight: number): number {
  return Number((weight / ((height / 100) ** 2)).toFixed(1))
}

function getDaysDiff(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
}
