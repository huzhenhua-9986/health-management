// 健康数据路由
import express from 'express'
import * as healthDataController from '../controllers/healthDataController.js'
import { auth } from '../middlewares/auth.js'
import { validate, healthDataSchema, paginationSchema } from '../middlewares/validator.js'
import { validateQuery } from '../middlewares/validator.js'

const router = express.Router()

router.use(auth)

// 获取统计数据
router.get('/statistics', healthDataController.getStatistics)

// 获取趋势数据
router.get('/trends', healthDataController.getTrends)

// CRUD 操作
router.get('/', validateQuery(paginationSchema), healthDataController.getList)
router.post('/', validate(healthDataSchema), healthDataController.create)
router.get('/:id', healthDataController.getOne)
router.put('/:id', validate(healthDataSchema), healthDataController.update)
router.delete('/:id', healthDataController.remove)

export default router
