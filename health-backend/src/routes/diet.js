// 饮食记录路由
import express from 'express'
import * as controller from '../controllers/dietController.js'
import { auth } from '../middlewares/auth.js'
import { validate, dietDataSchema, paginationSchema } from '../middlewares/validator.js'
import { validateQuery } from '../middlewares/validator.js'

const router = express.Router()

router.use(auth)

router.get('/', validateQuery(paginationSchema), controller.getList)
router.post('/', validate(dietDataSchema), controller.create)
router.get('/:id', controller.getOne)
router.put('/:id', validate(dietDataSchema), controller.update)
router.delete('/:id', controller.remove)

export default router
