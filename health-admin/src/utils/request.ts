import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 从环境变量获取API地址，开发环境使用代理
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { success, data, message, error } = response.data

    // 后端API返回格式: { success: true, data: {...} }
    if (success === true) {
      return data
    } else if (success === false) {
      ElMessage.error(message || error || '请求失败')
      return Promise.reject(new Error(message || error))
    }

    // 兼容旧格式
    const { code } = response.data
    if (code === 200 || code === 201) {
      return response.data.data
    } else {
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/login')
    } else {
      ElMessage.error(error.response?.data?.message || error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
