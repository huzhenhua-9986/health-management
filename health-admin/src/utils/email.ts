// 邮件服务工具
// 使用 EmailJS 发送邮件（免费服务，无需后端）

import emailjs from '@emailjs/browser'

interface EmailConfig {
  SERVICE_ID: string
  TEMPLATE_ID: string
  PUBLIC_KEY: string
}

interface SendEmailResult {
  success: boolean
  code?: string
  message?: string
}

// 获取邮件服务配置
function getEmailConfig(): EmailConfig | null {
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  // 检查是否为空或是占位符
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    return null
  }

  // 检查是否为占位符值
  const placeholderValues = ['your-service-id', 'your-template-id', 'your-public-key']
  if (placeholderValues.includes(SERVICE_ID) ||
      placeholderValues.includes(TEMPLATE_ID) ||
      placeholderValues.includes(PUBLIC_KEY)) {
    return null
  }

  return { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY }
}

// 初始化 EmailJS
function initEmailJS() {
  const config = getEmailConfig()
  if (config) {
    emailjs.init(config.PUBLIC_KEY)
    return true
  }
  return false
}

// 生成随机验证码
export function generateVerifyCode(length: number = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 验证邮箱格式
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 发送验证码邮件
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<SendEmailResult> {
  const config = getEmailConfig()

  // 演示模式：未配置邮件服务
  if (!config) {
    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      code, // 返回验证码用于演示
      message: '验证码已生成（演示模式）'
    }
  }

  // 生产模式：使用 EmailJS 发送邮件
  // 初始化 EmailJS
  if (!initEmailJS()) {
    return {
      success: false,
      message: 'EmailJS 初始化失败'
    }
  }

  try {
    // 发送邮件
    const response = await emailjs.send(
      config.SERVICE_ID,
      config.TEMPLATE_ID,
      {
        to_email: email,
        to_name: email.split('@')[0],
        verification_code: code,
        app_name: '健康管理系统',
        expiry_time: '5分钟'
      }
    )

    if (response.status === 200) {
      return {
        success: true,
        code,
        message: '验证码已发送到您的邮箱'
      }
    } else {
      return {
        success: false,
        message: '邮件发送失败，请稍后重试'
      }
    }
  } catch (error: any) {
    console.error('邮件发送错误:', error)
    return {
      success: false,
      message: error.message || '邮件发送失败'
    }
  }
}

// 获取邮件服务配置状态
export function getEmailStatus(): { configured: boolean } {
  const config = getEmailConfig()
  return {
    configured: !!config
  }
}
