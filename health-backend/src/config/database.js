// 数据库连接配置
import pkg from 'pg'
const { Pool } = pkg
import { config } from './index.js'

// 创建 PostgreSQL 连接池
export const pool = new Pool({
  connectionString: config.database.url,
  ssl: config.server.env === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000, // 空闲连接超时
  connectionTimeoutMillis: 2000 // 连接超时
})

// 测试数据库连接
export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log('✅ Database connected successfully:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    throw error
  }
}

// 优雅关闭
export async function closePool() {
  await pool.end()
  console.log('Database pool closed')
}

// 查询辅助函数
export async function query(text, params) {
  const start = Date.now()
  try {
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('Query error', { text, error: error.message })
    throw error
  }
}

// 事务辅助函数
export async function transaction(callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// 处理进程退出
process.on('SIGINT', async () => {
  await closePool()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await closePool()
  process.exit(0)
})
