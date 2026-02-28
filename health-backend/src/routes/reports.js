// 报告路由
import express from 'express'
import * as controller from '../controllers/reportController.js'
import { auth } from '../middlewares/auth.js'
import { validate, reportGenerateSchema, paginationSchema } from '../middlewares/validator.js'
import { validateQuery } from '../middlewares/validator.js'

const router = express.Router()

router.use(auth)

router.get('/', validateQuery(paginationSchema), controller.getList)
router.post('/generate', validate(reportGenerateSchema), controller.generate)
router.delete('/:id', controller.remove)

export default router
