// 配置文件
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../../.env') })

export const config = {
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL
  },

  // Supabase 配置
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // 微信配置
  wechat: {
    appId: process.env.WECHAT_APP_ID,
    appSecret: process.env.WECHAT_APP_SECRET,
    apiUrl: 'https://api.weixin.qq.com/sns/jscode2session'
  },

  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },

  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info'
  }
}

// 验证必需的环境变量
export function validateConfig() {
  const required = ['DATABASE_URL', 'JWT_SECRET']
  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // 生产环境检查
  if (config.server.env === 'production') {
    if (config.jwt.secret === 'your-secret-key') {
      throw new Error('JWT_SECRET must be set in production')
    }
  }
}
