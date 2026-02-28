// 路由汇总
import express from 'express'
import authRoutes from './auth.js'
import userRoutes from './users.js'
import healthDataRoutes from './healthData.js'
import exerciseRoutes from './exercise.js'
import sleepRoutes from './sleep.js'
import dietRoutes from './diet.js'
import reportRoutes from './reports.js'
import logRoutes from './logs.js'
import dashboardRoutes from './dashboard.js'

const router = express.Router()

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API 路由
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/health-data', healthDataRoutes)
router.use('/exercise', exerciseRoutes)
router.use('/sleep', sleepRoutes)
router.use('/diet', dietRoutes)
router.use('/reports', reportRoutes)
router.use('/logs', logRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
