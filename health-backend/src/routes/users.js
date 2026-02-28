// 用户管理路由
import express from 'express'
import * as userController from '../controllers/userController.js'
import { auth, adminOnly } from '../middlewares/auth.js'
import { validate, userUpdateSchema, paginationSchema } from '../middlewares/validator.js'
import { validateQuery } from '../middlewares/validator.js'

const router = express.Router()

// 所有路由需要认证
router.use(auth)

// 获取用户列表
router.get('/', validateQuery(paginationSchema), userController.getList)

// 获取用户统计（管理员）
router.get('/statistics', adminOnly, userController.getStatistics)

// 批量更新用户状态（管理员）
router.patch('/batch-status', adminOnly, userController.batchUpdateStatus)

// 获取用户详情
router.get('/:id', userController.getOne)

// 更新用户
router.put('/:id', validate(userUpdateSchema), userController.update)

// 删除用户（管理员）
router.delete('/:id', adminOnly, userController.remove)

export default router
