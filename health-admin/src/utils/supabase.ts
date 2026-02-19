// Supabase 配置和初始化
import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'your-supabase-anon-key'

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // 自动刷新 token
    autoRefreshToken: true,
    // 检测会话变化
    detectSessionInUrl: true,
    // 持久化会话
    persistSession: true,
    // 存储键前缀
    storage: window.localStorage,
    // 存储键
    storageKey: 'supabase.auth.token'
  }
})

// 数据库类型定义
export interface User {
  id: string
  phone: string
  openid?: string
  nickname?: string
  avatar_url?: string
  gender?: string
  birth_date?: string
  height?: number
  weight?: number
  status: string
  role: string
  created_at: string
  updated_at: string
}

export interface HealthData {
  id: string
  user_id: string
  data_type: string
  data_value: number
  unit?: string
  recorded_at: string
  source: string
  notes?: string
  created_at: string
}

export interface ExerciseData {
  id: string
  user_id: string
  steps: number
  distance: number
  calories: number
  duration: number
  exercise_date: string
  device_type?: string
  created_at: string
}

export interface SleepData {
  id: string
  user_id: string
  sleep_date: string
  sleep_duration: number
  deep_sleep_duration: number
  light_sleep_duration: number
  rem_sleep_duration: number
  sleep_quality: number
  sleep_cycles?: number
  created_at: string
}

export interface DietData {
  id: string
  user_id: string
  meal_type: string
  food_name: string
  calories?: number
  protein?: number
  fat?: number
  carbohydrate?: number
  fiber?: number
  meal_time: string
  created_at: string
}

export interface HealthReport {
  id: string
  user_id: string
  report_type: string
  report_period: string
  start_date: string
  end_date: string
  content: Record<string, any>
  file_url?: string
  generated_at: string
}

export interface SystemLog {
  id: string
  user_id?: string
  action: string
  resource_type?: string
  resource_id?: string
  ip_address?: string
  user_agent?: string
  status: string
  error_message?: string
  created_at: string
}

// 辅助函数：检查是否已配置 Supabase
export function isSupabaseConfigured(): boolean {
  return supabaseUrl !== 'https://your-project.supabase.co' &&
         supabaseKey !== 'your-supabase-anon-key'
}

// 辅助函数：获取演示模式提示
export function getDemoModeWarning(): string {
  if (!isSupabaseConfigured()) {
    return '当前为演示模式，请配置 Supabase 以启用完整的认证功能'
  }
  return ''
}
