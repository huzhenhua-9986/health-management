// 仪表盘路由
import express from 'express'
import * as controller from '../controllers/dashboardController.js'
import { auth, adminOnly } from '../middlewares/auth.js'

const router = express.Router()

router.use(auth)

// 获取增强统计数据
router.get('/stats', adminOnly, controller.getStats)

// 获取概览数据
router.get('/overview', adminOnly, controller.getOverview)

// 获取用户活跃度趋势 (按日期统计登录用户数)
router.get('/user-trend', adminOnly, controller.getUserActivityTrend)

// 获取数据采集量趋势 (按日期统计各类型数据)
router.get('/data-trend', adminOnly, controller.getDataCollectionTrend)

// 兼容旧接口
router.get('/user-activity-trend', adminOnly, controller.getUserActivityTrend)
router.get('/data-collection-trend', adminOnly, controller.getDataCollectionTrend)

export default router
