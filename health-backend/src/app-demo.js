// Express 应用入口 - 演示模式（无需数据库）
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3002

// Mock 数据存储
const mockData = {
  users: [
    { id: '1', phone: '13800138000', nickname: '测试用户', avatar_url: '', role: 'user' },
    { id: 'admin', phone: '18888888888', nickname: '管理员', avatar_url: '', role: 'admin' }
  ],
  healthData: [
    { id: '1', user_id: '1', data_type: 'blood_pressure', data_value: 120, unit: 'mmHg', recorded_at: '2026-02-28T00:00:00Z' },
    { id: '2', user_id: '1', data_type: 'heart_rate', data_value: 75, unit: 'bpm', recorded_at: '2026-02-28T01:00:00Z' }
  ],
  exerciseData: [
    { id: '1', user_id: '1', steps: 8000, distance: 5.5, calories: 350, duration: 45, exercise_date: '2026-02-28' }
  ],
  sleepData: [
    { id: '1', user_id: '1', sleep_date: '2026-02-28', sleep_duration: 480, deep_sleep_duration: 90, sleep_quality: 8 }
  ],
  dietData: [
    { id: '1', user_id: '1', meal_type: 'breakfast', food_name: '燕麦粥', calories: 300, protein: 10, meal_time: '2026-02-28T08:00:00Z' }
  ],
  reports: []
}

// 中间件
app.use(cors())
app.use(express.json())

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// ==================== 路由 ====================

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'Health Management API (Demo Mode)',
    version: '1.0.0',
    mode: 'demo',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'demo', database: 'mock' })
})

// ==================== 认证 API ====================

app.post('/api/auth/register', (req, res) => {
  const { phone, password, nickname } = req.body
  res.json({
    success: true,
    message: '演示模式：注册成功（演示）',
    data: {
      user: { id: Date.now().toString(), phone, nickname, role: 'user' },
      token: 'demo-token-' + Date.now()
    }
  })
})

app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body
  const user = mockData.users.find(u => u.phone === phone) || mockData.users[0]
  res.json({
    success: true,
    data: {
      user,
      token: 'demo-token-' + Date.now(),
      refreshToken: 'demo-refresh-' + Date.now()
    }
  })
})

app.post('/api/auth/wx-login', (req, res) => {
  res.json({
    success: true,
    data: {
      user: mockData.users[0],
      token: 'demo-wx-token-' + Date.now()
    }
  })
})

app.get('/api/auth/me', (req, res) => {
  res.json({ success: true, data: mockData.users[0] })
})

// ==================== 健康数据 API ====================

app.get('/api/health-data', (req, res) => {
  res.json({
    success: true,
    data: mockData.healthData,
    total: mockData.healthData.length
  })
})

app.post('/api/health-data', (req, res) => {
  const newItem = { id: Date.now().toString(), user_id: '1', ...req.body }
  mockData.healthData.push(newItem)
  res.json({ success: true, data: newItem })
})

app.put('/api/health-data/:id', (req, res) => {
  res.json({ success: true, message: '演示模式：数据已更新' })
})

app.delete('/api/health-data/:id', (req, res) => {
  res.json({ success: true, message: '演示模式：数据已删除' })
})

// ==================== 运动数据 API ====================

app.get('/api/exercise', (req, res) => {
  res.json({ success: true, data: mockData.exerciseData })
})

app.post('/api/exercise', (req, res) => {
  const newItem = { id: Date.now().toString(), user_id: '1', ...req.body }
  mockData.exerciseData.push(newItem)
  res.json({ success: true, data: newItem })
})

// ==================== 睡眠数据 API ====================

app.get('/api/sleep', (req, res) => {
  res.json({ success: true, data: mockData.sleepData })
})

app.post('/api/sleep', (req, res) => {
  const newItem = { id: Date.now().toString(), user_id: '1', ...req.body }
  mockData.sleepData.push(newItem)
  res.json({ success: true, data: newItem })
})

// ==================== 饮食记录 API ====================

app.get('/api/diet', (req, res) => {
  res.json({ success: true, data: mockData.dietData })
})

app.post('/api/diet', (req, res) => {
  const newItem = { id: Date.now().toString(), user_id: '1', ...req.body }
  mockData.dietData.push(newItem)
  res.json({ success: true, data: newItem })
})

// ==================== 用户管理 API ====================

app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: mockData.users,
    total: mockData.users.length
  })
})

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: mockData.users.length,
      totalHealthData: mockData.healthData.length,
      totalExercise: mockData.exerciseData.length,
      totalSleep: mockData.sleepData.length,
      totalDiet: mockData.dietData.length
    }
  })
})

// ==================== 报告 API ====================

app.get('/api/reports', (req, res) => {
  res.json({ success: true, data: mockData.reports })
})

app.post('/api/reports/generate', (req, res) => {
  const report = {
    id: Date.now().toString(),
    user_id: '1',
    report_type: req.body.type || 'daily',
    content: { summary: '演示健康报告', data: {} },
    generated_at: new Date().toISOString()
  }
  mockData.reports.push(report)
  res.json({ success: true, data: report })
})

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   Health Management API Server (DEMO MODE)            ║
║                                                        ║
║   Mode: DEMO (Mock Data)                              ║
║   Port: ${PORT.toString().padEnd(46)}║
║   Time: ${new Date().toISOString().padEnd(44)}║
║                                                        ║
║   API: http://localhost:${PORT}/api                    ║
║   Health: http://localhost:${PORT}/api/health          ║
║                                                        ║
║   演示模式 - 使用Mock数据，无需数据库                   ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `)
  console.log('\n✅ 后端服务已启动！等待前端对接...\n')
})

export default app
