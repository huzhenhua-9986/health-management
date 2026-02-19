// 认证相关工具函数
import { supabase, isSupabaseConfigured } from './supabase'
import * as demoAuth from './demoAuth'
import { sendSMS, generateVerifyCode, getSMSStatus } from './sms'

export interface LoginCredentials {
  phone: string
  password: string
}

export interface RegisterData {
  phone: string
  password: string
  nickname?: string
  avatar?: string
}

export interface AuthResponse {
  user: any
  token: string
  error?: string
}

// 手机号验证
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 密码强度验证
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: '密码长度不能少于6位' }
  }
  if (password.length > 20) {
    return { valid: false, message: '密码长度不能超过20位' }
  }
  return { valid: true }
}

// 发送验证码
export async function sendVerificationCode(phone: string): Promise<{ success: boolean; code?: string; message?: string }> {
  if (!validatePhone(phone)) {
    return { success: false, message: '手机号格式不正确' }
  }

  // 演示模式：未配置 Supabase
  if (!isSupabaseConfigured()) {
    return await demoAuth.demoSendCode(phone)
  }

  // 检查短信服务配置状态
  const smsStatus = getSMSStatus()

  // 如果未配置短信服务，使用本地模拟（仅演示用）
  if (!smsStatus.configured) {
    console.warn('短信服务未配置，使用本地模拟验证码')
    const code = generateVerifyCode()
    localStorage.setItem(`verify_code_${phone}`, code)
    localStorage.setItem(`verify_code_time_${phone}`, Date.now().toString())
    return {
      success: true,
      code,
      message: '验证码已生成（本地模拟模式，未配置短信服务）'
    }
  }

  // 生产模式：发送真实短信
  const code = generateVerifyCode()
  const result = await sendSMS(phone, code)

  if (result.success) {
    // 验证码发送成功，存储到本地用于验证
    localStorage.setItem(`verify_code_${phone}`, code)
    localStorage.setItem(`verify_code_time_${phone}`, Date.now().toString())
    return {
      success: true,
      code, // 仅用于演示，生产环境不应返回
      message: '验证码已发送'
    }
  } else {
    // 发送失败
    return {
      success: false,
      message: result.message || '短信发送失败'
    }
  }
}

// 验证验证码
export function verifyCode(phone: string, code: string): boolean {
  const storedCode = localStorage.getItem(`verify_code_${phone}`)
  const storedTime = parseInt(localStorage.getItem(`verify_code_time_${phone}`) || '0')
  const now = Date.now()

  // 验证码 5 分钟内有效
  if (now - storedTime > 5 * 60 * 1000) {
    localStorage.removeItem(`verify_code_${phone}`)
    localStorage.removeItem(`verify_code_time_${phone}`)
    return false
  }

  return storedCode === code
}

// 注册
export async function register(data: RegisterData): Promise<AuthResponse> {
  // 演示模式
  if (!isSupabaseConfigured()) {
    return await demoAuth.demoRegister(data)
  }

  try {
    // 使用 Supabase Auth 注册
    const { data: authData, error } = await supabase.auth.signUp({
      email: `${data.phone}@health.temp`,
      password: data.password,
      options: {
        data: {
          phone: data.phone,
          nickname: data.nickname,
          avatar: data.avatar
        }
      }
    })

    if (error) {
      if (error.message.includes('already registered')) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('phone', data.phone)
          .single()

        if (existingUser) {
          return { user: null, token: '', error: '该手机号已注册' }
        }
      }
      return { user: null, token: '', error: error.message }
    }

    if (authData.user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          phone: data.phone,
          nickname: data.nickname || '用户',
          avatar_url: data.avatar,
          status: 'active',
          role: 'user'
        })
        .select()
        .single()

      const { data: session } = await supabase.auth.getSession()

      return {
        user: newUser || authData.user,
        token: session?.access_token || ''
      }
    }

    return { user: null, token: '', error: '注册失败' }
  } catch (error: any) {
    return { user: null, token: '', error: error.message || '注册失败' }
  }
}

// 登录
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // 演示模式
  if (!isSupabaseConfigured()) {
    return await demoAuth.demoLogin(credentials.phone, credentials.password)
  }

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: `${credentials.phone}@health.temp`,
      password: credentials.password
    })

    if (error) {
      return { user: null, token: '', error: '账号或密码错误' }
    }

    const { data: userInfo } = await supabase
      .from('users')
      .select('*')
      .eq('phone', credentials.phone)
      .single()

    if (userInfo?.role !== 'admin') {
      return { user: null, token: '', error: '无权限访问管理后台' }
    }

    return {
      user: userInfo,
      token: authData.session.access_token
    }
  } catch (error: any) {
    return { user: null, token: '', error: error.message || '登录失败' }
  }
}

// 验证码登录
export async function loginWithCode(phone: string, code: string): Promise<AuthResponse> {
  // 演示模式
  if (!isSupabaseConfigured()) {
    return await demoAuth.demoLoginWithCode(phone, code)
  }

  if (!verifyCode(phone, code)) {
    return { user: null, token: '', error: '验证码错误或已过期' }
  }

  try {
    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          phone,
          nickname: '用户',
          status: 'active',
          role: 'admin'
        })
        .select()
        .single()

      user = newUser
    }

    if (user.role !== 'admin') {
      return { user: null, token: '', error: '无权限访问管理后台' }
    }

    const token = `temp_${user.id}_${Date.now()}`

    return {
      user,
      token
    }
  } catch (error: any) {
    return { user: null, token: '', error: error.message || '登录失败' }
  }
}

// 登出
export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }
}

// 获取当前用户
export async function getCurrentUser() {
  // 演示模式
  if (!isSupabaseConfigured()) {
    const token = localStorage.getItem('token')
    const userInfoStr = localStorage.getItem('userInfo')
    if (token && userInfoStr) {
      return JSON.parse(userInfoStr)
    }
    return null
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: userInfo } = await supabase
        .from('users')
        .select('*')
        .eq('phone', user.user_metadata?.phone || user.email?.split('@')[0])
        .single()

      return userInfo
    }

    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 检查会话是否有效
export async function checkSession(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return !!localStorage.getItem('token')
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    return false
  }
}

// 监听认证状态变化
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  if (isSupabaseConfigured()) {
    return supabase.auth.onAuthStateChange(callback)
  }
  return { data: { subscription: null } }
}

// 获取当前模式
export function getAuthMode(): 'demo' | 'production' {
  return isSupabaseConfigured() ? 'production' : 'demo'
}
