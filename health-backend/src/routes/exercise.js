// 运动数据路由
import express from 'express'
import * as controller from '../controllers/exerciseController.js'
import { auth } from '../middlewares/auth.js'
import { validate, exerciseDataSchema, paginationSchema } from '../middlewares/validator.js'
import { validateQuery } from '../middlewares/validator.js'

const router = express.Router()

router.use(auth)

router.get('/', validateQuery(paginationSchema), controller.getList)
router.post('/', validate(exerciseDataSchema), controller.create)
router.get('/:id', controller.getOne)
router.put('/:id', validate(exerciseDataSchema), controller.update)
router.delete('/:id', controller.remove)

export default router
