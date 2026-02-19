// 短信服务工具
// 支持阿里云、腾讯云等多种短信服务商

interface SMSConfig {
  provider: 'aliyun' | 'tencent' | 'demo'
  accessKeyId?: string
  accessKeySecret?: string
  signName?: string
  templateCode?: string
  appid?: string // 腾讯云 appid
}

interface SendSMSResult {
  success: boolean
  code?: string
  message?: string
}

// 获取短信服务配置
function getSMSConfig(): SMSConfig {
  const provider = import.meta.env.VITE_SMS_PROVIDER || 'demo'
  return {
    provider: provider as any,
    accessKeyId: import.meta.env.VITE_SMS_ACCESS_KEY_ID,
    accessKeySecret: import.meta.env.VITE_SMS_ACCESS_KEY_SECRET,
    signName: import.meta.env.VITE_SMS_SIGN_NAME,
    templateCode: import.meta.env.VITE_SMS_TEMPLATE_CODE,
    appid: import.meta.env.VITE_SMS_APPID
  }
}

// 阿里云短信发送
async function sendAliyunSMS(phone: string, code: string, config: SMSConfig): Promise<SendSMSResult> {
  try {
    // 阿里云短信 API 需要使用 SDK 或自己实现签名
    // 这里使用 fetch API 调用阿里云 RPC 接口

    const timestamp = new Date().toISOString()
    const signatureNonce = Math.random().toString(36).substring(2)

    // 简化版：实际生产中建议使用 @alicloud/dysmsapi20170525 SDK
    // 这里提供一个前端可调用的示例（需要后端代理更安全）

    const response = await fetch('https://dysmsapi.aliyuncs.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'Action': 'SendSms',
        'Version': '2017-05-25',
        'Format': 'JSON',
        'AccessKeyId': config.accessKeyId || '',
        'SignatureMethod': 'HMAC-SHA1',
        'Timestamp': timestamp,
        'SignatureVersion': '1.0',
        'SignatureNonce': signatureNonce,
        'PhoneNumbers': phone,
        'SignName': config.signName || '',
        'TemplateCode': config.templateCode || '',
        'TemplateParam': JSON.stringify({ code })
      })
    })

    const data = await response.json()

    if (data.Code === 'OK') {
      return { success: true, code, message: '发送成功' }
    } else {
      return { success: false, message: data.Message || '发送失败' }
    }
  } catch (error: any) {
    return { success: false, message: error.message || '发送失败' }
  }
}

// 腾讯云短信发送
async function sendTencentSMS(phone: string, code: string, config: SMSConfig): Promise<SendSMSResult> {
  try {
    // 腾讯云短信 API
    // 实际生产中建议使用腾讯云 SMS SDK

    const response = await fetch(`https://sms.tencentcloudapi.com/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TC-Action': 'SendSms',
        'X-TC-Timestamp': Math.floor(Date.now() / 1000).toString(),
        'X-TC-Version': '2021-01-11'
      },
      body: JSON.stringify({
        PhoneNumberSet: [`+86${phone}`],
        TemplateID: config.templateCode,
        TemplateParamSet: [code]
      })
    })

    const data = await response.json()

    if (data.Response?.Error) {
      return { success: false, message: data.Response.Error.Message }
    }

    return { success: true, code, message: '发送成功' }
  } catch (error: any) {
    return { success: false, message: error.message || '发送失败' }
  }
}

// 统一的短信发送接口
export async function sendSMS(phone: string, code: string): Promise<SendSMSResult> {
  const config = getSMSConfig()

  // 如果没有配置短信服务，返回失败
  if (config.provider === 'demo' || !config.accessKeyId) {
    return {
      success: false,
      message: '未配置短信服务，请在环境变量中设置短信服务参数'
    }
  }

  // 根据配置的服务商发送短信
  switch (config.provider) {
    case 'aliyun':
      return await sendAliyunSMS(phone, code, config)
    case 'tencent':
      return await sendTencentSMS(phone, code, config)
    default:
      return { success: false, message: '不支持的短信服务商' }
  }
}

// 生成随机验证码
export function generateVerifyCode(length: number = 6): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 验证手机号格式
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 获取短信服务配置状态
export function getSMSStatus(): { configured: boolean; provider: string } {
  const config = getSMSConfig()
  return {
    configured: !!(
      config.provider !== 'demo' &&
      config.accessKeyId &&
      config.accessKeySecret &&
      config.signName &&
      config.templateCode
    ),
    provider: config.provider
  }
}
