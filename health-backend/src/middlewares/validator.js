// 请求验证中间件
import Joi from 'joi'
import { ApiError } from './errorHandler.js'

/**
 * 验证中间件工厂
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))

      throw new ApiError(400, '请求参数验证失败', 'VALIDATION_ERROR')
    }

    // 使用验证后的值替换原始值
    req.body = value
    next()
  }
}

/**
 * 查询参数验证
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      throw new ApiError(400, '查询参数验证失败', 'VALIDATION_ERROR')
    }

    req.query = value
    next()
  }
}

// ==================== 验证 Schema ====================

// 注册验证
export const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
  'string.pattern.base': '手机号格式不正确'
}),
  password: Joi.string().min(6).max(20).required(),
  nickname: Joi.string().max(50).optional(),
  gender: Joi.string().valid('male', 'female', null).optional(),
  birth_date: Joi.date().optional()
})

// 登录验证
export const loginSchema = Joi.object({
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  password: Joi.string().required()
})

// 微信登录验证
export const wxLoginSchema = Joi.object({
  code: Joi.string().required(),
  userInfo: Joi.object({
    nickName: Joi.string().optional(),
    avatarUrl: Joi.string().optional(),
    gender: Joi.number().valid(0, 1, 2).optional(),
    country: Joi.string().optional(),
    province: Joi.string().optional(),
    city: Joi.string().optional()
  }).optional()
})

// 健康数据验证
export const healthDataSchema = Joi.object({
  data_type: Joi.string().valid(
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
    'blood_sugar',
    'heart_rate',
    'temperature',
    'weight',
    'bmi'
  ).required(),
  data_value: Joi.number().positive().required(),
  unit: Joi.string().max(20).optional(),
  recorded_at: Joi.date().optional(),
  source: Joi.string().valid('manual', 'device').optional(),
  notes: Joi.string().max(500).optional()
})

// 运动数据验证
export const exerciseDataSchema = Joi.object({
  steps: Joi.number().integer().min(0).optional(),
  distance: Joi.number().min(0).optional(),
  calories: Joi.number().integer().min(0).optional(),
  duration: Joi.number().integer().min(0).optional(),
  exercise_date: Joi.date().required(),
  device_type: Joi.string().max(50).optional()
})

// 睡眠数据验证
export const sleepDataSchema = Joi.object({
  sleep_date: Joi.date().required(),
  sleep_duration: Joi.number().integer().min(0).optional(),
  deep_sleep_duration: Joi.number().integer().min(0).optional(),
  light_sleep_duration: Joi.number().integer().min(0).optional(),
  rem_sleep_duration: Joi.number().integer().min(0).optional(),
  sleep_quality: Joi.number().integer().min(1).max(10).optional(),
  sleep_cycles: Joi.number().integer().min(0).optional()
})

// 饮食记录验证
export const dietDataSchema = Joi.object({
  meal_type: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
  food_name: Joi.string().max(100).required(),
  calories: Joi.number().min(0).optional(),
  protein: Joi.number().min(0).optional(),
  fat: Joi.number().min(0).optional(),
  carbohydrate: Joi.number().min(0).optional(),
  fiber: Joi.number().min(0).optional(),
  meal_time: Joi.date().optional()
})

// 分页查询验证
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  page_size: Joi.number().integer().min(1).max(100).default(20)
})

// 用户更新验证
export const userUpdateSchema = Joi.object({
  nickname: Joi.string().max(50).optional(),
  avatar_url: Joi.string().uri().optional(),
  gender: Joi.string().valid('male', 'female', null).optional(),
  birth_date: Joi.date().optional(),
  height: Joi.number().positive().optional(),
  weight: Joi.number().positive().optional()
})

// 报告生成验证
export const reportGenerateSchema = Joi.object({
  user_id: Joi.string().uuid().optional(),
  report_type: Joi.string().valid('daily', 'weekly', 'monthly').required(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional()
})
