// 日志路由
import express from 'express'
import * as controller from '../controllers/logController.js'
import { auth, adminOnly } from '../middlewares/auth.js'
import { validateQuery, paginationSchema } from '../middlewares/validator.js'

const router = express.Router()

router.use(auth)

// 管理员可以查看所有日志，普通用户只能查看自己的
router.get('/', validateQuery(paginationSchema), controller.getList)

export default router
