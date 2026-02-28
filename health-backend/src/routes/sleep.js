// 睡眠数据路由
import express from 'express'
import * as controller from '../controllers/sleepController.js'
import { auth } from '../middlewares/auth.js'
import { validate, sleepDataSchema, paginationSchema } from '../middlewares/validator.js'
import { validateQuery } from '../middlewares/validator.js'

const router = express.Router()

router.use(auth)

router.get('/', validateQuery(paginationSchema), controller.getList)
router.post('/', validate(sleepDataSchema), controller.create)
router.get('/:id', controller.getOne)
router.put('/:id', validate(sleepDataSchema), controller.update)
router.delete('/:id', controller.remove)

export default router
