// 认证路由
import express from 'express'
import * as authController from '../controllers/authController.js'
import { auth } from '../middlewares/auth.js'
import { validate, registerSchema, loginSchema, wxLoginSchema } from '../middlewares/validator.js'
import { loginLimiter } from '../middlewares/rateLimit.js'

const router = express.Router()

// 注册（需要限流）
router.post('/register', loginLimiter, validate(registerSchema), authController.register)

// 登录（需要限流）
router.post('/login', loginLimiter, validate(loginSchema), authController.login)

// 微信登录
router.post('/wx-login', validate(wxLoginSchema), authController.wxLogin)

// 刷新令牌
router.post('/refresh', authController.refreshToken)

// 获取当前用户信息（需要认证）
router.get('/me', auth, authController.getMe)

// 登出（需要认证）
router.post('/logout', auth, authController.logout)

export default router
