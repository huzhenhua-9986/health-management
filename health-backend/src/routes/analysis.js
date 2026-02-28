// 数据分析路由
import express from 'express'
import * as controller from '../controllers/analysisController.js'
import { auth, adminOnly } from '../middlewares/auth.js'

const router = express.Router()

router.use(auth)

// 获取趋势数据
router.get('/trend', adminOnly, controller.getTrend)

// 获取对比数据
router.get('/compare', adminOnly, controller.getCompare)

// 获取分布统计
router.get('/distribution', adminOnly, controller.getDistribution)

export default router
