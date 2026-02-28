// 日志中间件
import { config } from '../config/index.js'

// 简单的日志记录器
class Logger {
  constructor(level = 'info') {
    this.level = level
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 }
  }

  _log(level, message, meta = {}) {
    if (this.levels[level] > this.levels[this.level]) return

    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...meta
    }

    console.log(JSON.stringify(logData))
  }

  error(message, meta) {
    this._log('error', message, meta)
  }

  warn(message, meta) {
    this._log('warn', message, meta)
  }

  info(message, meta) {
    this._log('info', message, meta)
  }

  debug(message, meta) {
    this._log('debug', message, meta)
  }
}

export const logger = new Logger(config.log.level)

/**
 * 请求日志中间件
 */
export function requestLogger(req, res, next) {
  const start = Date.now()

  // 记录请求
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress
  })

  // 记录响应
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    })
  })

  next()
}
