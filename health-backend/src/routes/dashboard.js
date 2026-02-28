// 仪表盘路由
import express from 'express'
import * as controller from '../controllers/dashboardController.js'
import { auth, adminOnly } from '../middlewares/auth.js'

const router = express.Router()

router.use(auth)

// 获取概览数据
router.get('/overview', adminOnly, controller.getOverview)

// 获取用户活跃度趋势
router.get('/user-activity-trend', adminOnly, controller.getUserActivityTrend)

// 获取数据采集量趋势
router.get('/data-collection-trend', adminOnly, controller.getDataCollectionTrend)

export default router
