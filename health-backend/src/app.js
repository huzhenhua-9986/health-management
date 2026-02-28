// Express 应用入口
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { config, validateConfig } from './config/index.js'
import { testConnection, closePool } from './config/database.js'
import { requestLogger } from './middlewares/logger.js'
import { errorHandler, notFound } from './middlewares/errorHandler.js'
import { apiLimiter } from './middlewares/rateLimit.js'
import routes from './routes/index.js'

const app = express()

// ==================== 配置验证 ====================
try {
  validateConfig()
} catch (error) {
  console.error('Configuration error:', error.message)
  process.exit(1)
}

// ==================== 中间件配置 ====================
// 安全头
app.use(helmet())

// CORS
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true
}))

// 压缩响应
app.use(compression())

// 解析 JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 请求日志
app.use(requestLogger)

// API 限流
app.use('/api', apiLimiter)

// ==================== 路由配置 ====================
// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'Health Management API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// API 路由
app.use('/api', routes)

// ==================== 错误处理 ====================
// 404 处理
app.use(notFound)

// 全局错误处理
app.use(errorHandler)

// ==================== 服务器启动 ====================
const PORT = config.server.port

async function startServer() {
  try {
    // 测试数据库连接
    await testConnection()

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   Health Management API Server                        ║
║                                                        ║
║   Status: running                                     ║
║   Port: ${PORT.toString().padEnd(42)}║
║   Environment: ${config.server.env.padEnd(36)}║
║   Time: ${new Date().toISOString().padEnd(40)}║
║                                                        ║
║   API: http://localhost:${PORT}/api                    ║
║   Health: http://localhost:${PORT}/api/health          ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// 优雅关闭
async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`)
  await closePool()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

// 未捕获的错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  shutdown('uncaughtException')
})

// 启动服务器
startServer()

export default app
