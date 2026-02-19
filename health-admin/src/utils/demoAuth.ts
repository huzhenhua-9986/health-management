// 演示模式认证工具
// 用于在没有配置 Supabase 时提供完整的认证体验

interface DemoUser {
  id: string
  phone: string
  nickname: string
  avatar?: string
  role: string
}

// 模拟用户数据库
const demoUsers: DemoUser[] = [
  {
    id: 'demo-admin-001',
    phone: '13800138000',
    nickname: '系统管理员',
    role: 'admin'
  },
  {
    id: 'demo-admin-002',
    phone: '13900139000',
    nickname: '演示管理员',
    role: 'admin'
  }
]

// 模拟验证码存储
const demoCodes = new Map<string, { code: string; time: number }>()

export function isDemoMode(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
  return supabaseUrl === 'https://your-project.supabase.co'
}

// 演示模式登录
export async function demoLogin(phone: string, password: string): Promise<{ user?: DemoUser; token?: string; error?: string }> {
  // 演示模式：接受任意手机号和密码
  const user: DemoUser = {
    id: `demo-${Date.now()}`,
    phone,
    nickname: '演示管理员',
    role: 'admin' // 演示模式默认是管理员
  }

  const token = `demo_token_${user.id}_${Date.now()}`

  return { user, token }
}

// 演示模式注册
export async function demoRegister(data: { phone: string; password: string; nickname?: string }): Promise<{ user?: DemoUser; token?: string; error?: string }> {
  const user: DemoUser = {
    id: `demo-${Date.now()}`,
    phone: data.phone,
    nickname: data.nickname || '新用户',
    role: 'admin'
  }

  const token = `demo_token_${user.id}_${Date.now()}`

  return { user, token }
}

// 演示模式发送验证码
export async function demoSendCode(phone: string): Promise<{ success: boolean; code?: string; message?: string }> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  demoCodes.set(phone, { code, time: Date.now() })

  return {
    success: true,
    code, // 返回验证码用于演示
    message: '验证码已发送'
  }
}

// 演示模式验证验证码
export function demoVerifyCode(phone: string, code: string): boolean {
  const stored = demoCodes.get(phone)
  if (!stored) return false

  const now = Date.now()
  const isValid = now - stored.time < 5 * 60 * 1000 // 5分钟有效

  return isValid && stored.code === code
}

// 演示模式验证码登录
export async function demoLoginWithCode(phone: string, code: string): Promise<{ user?: DemoUser; token?: string; error?: string }> {
  if (!demoVerifyCode(phone, code)) {
    return { error: '验证码错误或已过期' }
  }

  const user: DemoUser = {
    id: `demo-${Date.now()}`,
    phone,
    nickname: '演示用户',
    role: 'admin'
  }

  const token = `demo_token_${user.id}_${Date.now()}`

  return { user, token }
}

// 获取演示用户列表
export function getDemoUsers(): DemoUser[] {
  return [...demoUsers]
}

// 检查是否是演示管理员手机号
export function isDemoAdminPhone(phone: string): boolean {
  return demoUsers.some(u => u.phone === phone && u.role === 'admin')
}
