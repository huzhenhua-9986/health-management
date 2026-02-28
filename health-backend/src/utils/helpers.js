// 工具函数
import axios from 'axios'
import { config } from '../config/index.js'

/**
 * 生成 UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 微信 code 换取 openid
 */
export async function getWechatOpenid(code) {
  const url = `${config.wechat.apiUrl}?appid=${config.wechat.appId}&secret=${config.wechat.appSecret}&js_code=${code}&grant_type=authorization_code`

  const response = await axios.get(url)
  return response.data
}

/**
 * 计算年龄
 */
export function calculateAge(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

/**
 * 计算 BMI
 */
export function calculateBMI(height, weight) {
  if (!height || !weight) return null
  const heightInMeters = height / 100
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

/**
 * 分页计算
 */
export function getPagination(page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize
  const limit = pageSize
  return { offset, limit }
}

/**
 * 日期范围解析
 */
export function parseDateRange(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const end = endDate ? new Date(endDate) : new Date()
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * 格式化日期
 */
export function formatDate(date) {
  return new Date(date).toISOString()
}

/**
 * 获取今日日期字符串
 */
export function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

/**
 * 获取 N 天前的日期
 */
export function getDateDaysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}
