// 限流中间件
import rateLimit from 'express-rate-limit'
import { config } from '../config/index.js'

/**
 * 通用 API 限流
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: {
    success: false,
    error: '请求过于频繁，请稍后再试',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
})

/**
 * 严格限流 - 用于认证相关接口
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次请求
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: '认证请求过于频繁，请稍后再试',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
})

/**
 * 登录限流
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10,
  message: {
    success: false,
    error: '登录尝试次数过多，请1小时后再试',
    code: 'LOGIN_RATE_LIMIT_EXCEEDED'
  }
})
