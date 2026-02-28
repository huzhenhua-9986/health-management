// 认证中间件
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { query } from '../config/database.js'

/**
 * 验证 JWT token 中间件
 */
export async function auth(req, res, next) {
  try {
    // 从 header 获取 token
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌'
      })
    }

    const token = authHeader.substring(7)

    // 验证 token
    const decoded = jwt.verify(token, config.jwt.secret)

    // 从数据库获取用户信息
    const result = await query(
      'SELECT id, phone, nickname, role, status FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: '用户不存在'
      })
    }

    const user = result.rows[0]

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: '用户已被禁用'
      })
    }

    // 将用户信息挂载到请求对象
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: '令牌已过期'
      })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: '无效的令牌'
      })
    }
    return res.status(500).json({
      success: false,
      error: '认证失败'
    })
  }
}

/**
 * 可选认证中间件 - 如果提供了 token 则验证，否则继续
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, config.jwt.secret)

    const result = await query(
      'SELECT id, phone, nickname, role, status FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length > 0 && result.rows[0].status === 'active') {
      req.user = result.rows[0]
    }

    next()
  } catch (error) {
    // 忽略错误，继续处理请求
    next()
  }
}

/**
 * 管理员权限验证中间件
 */
export function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: '需要登录'
    })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '需要管理员权限'
    })
  }

  next()
}

/**
 * 生成 JWT token
 */
export function generateToken(user) {
  const payload = {
    userId: user.id,
    phone: user.phone,
    role: user.role
  }

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  )

  return { token, refreshToken }
}
