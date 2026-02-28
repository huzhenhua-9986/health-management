// 错误处理中间件
export class ApiError extends Error {
  constructor(statusCode, message, code = null) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'ApiError'
  }
}

/**
 * 全局错误处理中间件
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  // API 错误
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code
    })
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: '无效的令牌',
      code: 'INVALID_TOKEN'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: '令牌已过期',
      code: 'TOKEN_EXPIRED'
    })
  }

  // PostgreSQL 错误
  if (err.code) {
    // 唯一约束违反
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: '数据已存在',
        code: 'DUPLICATE'
      })
    }
    // 外键约束违反
    if (err.code === '23503') {
      return res.status(400).json({
        success: false,
        error: '关联数据不存在',
        code: 'FOREIGN_KEY'
      })
    }
    // 非空约束违反
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        error: '缺少必填字段',
        code: 'MISSING_FIELD'
      })
    }
  }

  // 默认错误
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    code: 'INTERNAL_ERROR'
  })
}

/**
 * 404 处理
 */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    code: 'NOT_FOUND'
  })
}

/**
 * 异步处理包装器
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
