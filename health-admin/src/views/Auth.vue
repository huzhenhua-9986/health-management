<template>
  <div class="auth-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- 认证卡片 -->
    <div class="auth-card animate-fade-in-scale">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" stroke="url(#paint0_linear)" stroke-width="4"/>
            <path d="M32 16C25.4 16 20 21.4 20 28V32H18V48H28V32H24V28C24 23.6 27.6 20 32 20C36.4 20 40 23.6 40 28V32H36V48H46V32H44V28C44 21.4 38.6 16 32 16Z" fill="url(#paint1_linear)"/>
            <defs>
              <linearGradient id="paint0_linear" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00b4d8"/>
                <stop offset="1" stop-color="#0077b6"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="18" y1="16" x2="46" y2="48" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00b4d8"/>
                <stop offset="1" stop-color="#0077b6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="logo-title">健康管理系统</h1>
        <p class="logo-subtitle">Health Management System</p>
      </div>

      <!-- 标签页 -->
      <el-tabs v-model="activeTab" class="auth-tabs">
        <!-- 登录 -->
        <el-tab-pane label="登录" name="login">
          <el-form
            :model="loginForm"
            :rules="loginRules"
            ref="loginFormRef"
            class="auth-form"
          >
            <el-form-item prop="email">
              <label class="form-label">
                <el-icon><Message /></el-icon>
                <span>邮箱地址</span>
              </label>
              <el-input
                v-model="loginForm.email"
                placeholder="请输入邮箱地址"
                size="large"
                clearable
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon color="#94a3b8"><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <label class="form-label">
                <el-icon><Lock /></el-icon>
                <span>密码</span>
              </label>
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                show-password
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon color="#94a3b8"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-button
              type="primary"
              size="large"
              :loading="loginLoading"
              class="submit-button"
              @click="handleLogin"
            >
              <span v-if="!loginLoading">登 录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form>
        </el-tab-pane>

        <!-- 注册 -->
        <el-tab-pane label="注册" name="register">
          <el-form
            :model="registerForm"
            :rules="registerRules"
            ref="registerFormRef"
            class="auth-form"
          >
            <el-form-item prop="email">
              <label class="form-label">
                <el-icon><Message /></el-icon>
                <span>邮箱地址</span>
              </label>
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱地址"
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon color="#94a3b8"><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="code">
              <label class="form-label">
                <el-icon><Message /></el-icon>
                <span>验证码</span>
              </label>
              <div class="code-input-group">
                <el-input
                  v-model="registerForm.code"
                  placeholder="请输入验证码"
                  size="large"
                  maxlength="6"
                >
                  <template #prefix>
                    <el-icon color="#94a3b8"><Message /></el-icon>
                  </template>
                </el-input>
                <el-button
                  :disabled="codeCountdown > 0"
                  :loading="codeSending"
                  @click="sendCode"
                  class="code-button"
                >
                  {{ codeButtonText }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <label class="form-label">
                <el-icon><Lock /></el-icon>
                <span>设置密码</span>
              </label>
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请设置密码（6-20位）"
                size="large"
                show-password
              >
                <template #prefix>
                  <el-icon color="#94a3b8"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <label class="form-label">
                <el-icon><Lock /></el-icon>
                <span>确认密码</span>
              </label>
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                show-password
              >
                <template #prefix>
                  <el-icon color="#94a3b8"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="nickname">
              <label class="form-label">
                <el-icon><User /></el-icon>
                <span>昵称（可选）</span>
              </label>
              <el-input
                v-model="registerForm.nickname"
                placeholder="请输入昵称"
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon color="#94a3b8"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-button
              type="primary"
              size="large"
              :loading="registerLoading"
              class="submit-button"
              @click="handleRegister"
            >
              <span v-if="!registerLoading">注 册</span>
              <span v-else>注册中...</span>
            </el-button>

            <div class="form-footer">
              <span class="agreement-text">
                注册即表示同意
                <a href="javascript:">《用户协议》</a>
                和
                <a href="javascript:">《隐私政策》</a>
              </span>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <!-- 底部提示 -->
      <div class="auth-footer">
        <p class="hint-text">
          <el-icon><InfoFilled /></el-icon>
          <span>超级管理员：admin@health.com / Admin@123</span>
        </p>
      </div>
    </div>

    <!-- 版权信息 -->
    <div class="copyright">
      <p>&copy; 2024 健康管理系统. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Message,
  InfoFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { validateEmail } from '@/utils/email'
import { sendVerificationEmail, generateVerifyCode } from '@/utils/email'
import { authApi } from '@/api/backend'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')

// 登录表单
const loginFormRef = ref()
const loginLoading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: (_rule: any, value: string, callback: any) => {
      if (!value || !validateEmail(value)) {
        callback(new Error('邮箱格式不正确'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 注册表单
const registerFormRef = ref()
const registerLoading = ref(false)
const codeSending = ref(false)
const codeCountdown = ref(0)

const registerForm = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: (_rule: any, value: string, callback: any) => {
      if (!value || !validateEmail(value)) {
        callback(new Error('邮箱格式不正确'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请设置密码', trigger: 'blur' },
    { validator: (_rule: any, value: string, callback: any) => {
      if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
      } else if (value.length > 20) {
        callback(new Error('密码长度不能超过20位'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 计算属性
const codeButtonText = computed(() => {
  return codeCountdown.value > 0 ? `${codeCountdown.value}s 后重发` : '获取验证码'
})

// 方法
const startCountdown = () => {
  codeCountdown.value = 60
  const timer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 发送验证码
const sendCode = async () => {
  if (!registerForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }

  if (!validateEmail(registerForm.email)) {
    ElMessage.error('邮箱格式不正确')
    return
  }

  codeSending.value = true
  try {
    const code = generateVerifyCode()
    const result = await sendVerificationEmail(registerForm.email, code)

    if (result.success) {
      // 存储验证码到本地
      localStorage.setItem(`verify_code_${registerForm.email}`, code)
      localStorage.setItem(`verify_code_time_${registerForm.email}`, Date.now().toString())

      ElMessage.success('验证码已发送到您的邮箱')
      startCountdown()
    } else {
      ElMessage.error(result.message || '发送失败')
    }
  } finally {
    codeSending.value = false
  }
}

// 登录处理
const handleLogin = async () => {
  await loginFormRef.value?.validate()
  loginLoading.value = true

  try {
    // 检查超级管理员账号（演示模式）
    if (loginForm.email === 'admin@health.com' && loginForm.password === 'Admin@123') {
      const superAdmin = {
        id: 'super-admin-001',
        email: 'admin@health.com',
        nickname: '超级管理员',
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString()
      }

      const token = `super_admin_token_${Date.now()}`

      userStore.setToken(token)
      userStore.setUserInfo(superAdmin)

      ElMessage.success('登录成功')
      router.push('/')
      return
    }

    // 调用后端API登录
    const result = await authApi.login({
      email: loginForm.email,
      password: loginForm.password
    })

    // 保存token和用户信息
    userStore.setToken(result.token)
    userStore.setUserInfo(result.user)

    ElMessage.success('登录成功')
    router.push('/')
  } catch (error: any) {
    // 如果后端调用失败，回退到本地演示模式
    console.log('后端API调用失败，使用本地演示模式', error)

    // 从 localStorage 获取注册用户
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]')
    const user = users.find((u: any) => u.email === loginForm.email)

    if (!user) {
      ElMessage.error('用户不存在，请先注册')
      return
    }

    if (user.password !== loginForm.password) {
      ElMessage.error('密码错误')
      return
    }

    if (user.status === 'inactive') {
      ElMessage.error('账号已被禁用，请联系管理员')
      return
    }

    const token = `user_token_${user.id}_${Date.now()}`

    userStore.setToken(token)
    userStore.setUserInfo(user)

    ElMessage.success('登录成功（演示模式）')
    router.push('/')
  } finally {
    loginLoading.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  await registerFormRef.value?.validate()

  registerLoading.value = true

  try {
    // 调用后端API注册
    const result = await authApi.register({
      email: registerForm.email,
      password: registerForm.password,
      nickname: registerForm.nickname
    })

    // 保存token和用户信息
    userStore.setToken(result.token)
    userStore.setUserInfo(result.user)

    ElMessage.success('注册成功')
    router.push('/')
  } catch (error: any) {
    // 如果后端调用失败，回退到本地演示模式
    console.log('后端API调用失败，使用本地演示模式', error)

    // 验证验证码
    const storedCode = localStorage.getItem(`verify_code_${registerForm.email}`)
    const storedTime = parseInt(localStorage.getItem(`verify_code_time_${registerForm.email}`) || '0')
    const now = Date.now()

    if (!storedCode || now - storedTime > 5 * 60 * 1000) {
      ElMessage.error('验证码无效或已过期，请重新获取')
      return
    }

    if (registerForm.code !== storedCode) {
      ElMessage.error('验证码错误')
      return
    }

    // 检查邮箱是否已注册
    const users = JSON.parse(localStorage.getItem('registered_users') || '[]')
    const existingUser = users.find((u: any) => u.email === registerForm.email)

    if (existingUser) {
      ElMessage.error('该邮箱已注册')
      return
    }

    // 创建新用户
    const newUser = {
      id: `user_${Date.now()}`,
      email: registerForm.email,
      password: registerForm.password,
      nickname: registerForm.nickname || registerForm.email.split('@')[0],
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString()
    }

    // 保存到 localStorage
    users.push(newUser)
    localStorage.setItem('registered_users', JSON.stringify(users))

    // 清除验证码
    localStorage.removeItem(`verify_code_${registerForm.email}`)
    localStorage.removeItem(`verify_code_time_${registerForm.email}`)

    const token = `user_token_${newUser.id}_${Date.now()}`

    userStore.setToken(token)
    userStore.setUserInfo(newUser)

    ElMessage.success('注册成功（演示模式）')
    router.push('/')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  padding: 20px;
  box-sizing: border-box;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 180, 216, 0.1), rgba(0, 119, 182, 0.05));
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  animation-delay: 5s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

.grid-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 119, 182, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 119, 182, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* 认证卡片 */
.auth-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 119, 182, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 20px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
}

.logo-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.logo-subtitle {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* 标签页 */
.auth-tabs {
  margin-top: 16px;
}

.auth-tabs :deep(.el-tabs__header) {
  margin: 0 0 16px 0;
}

.auth-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.auth-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  padding: 0 16px;
}

.auth-tabs :deep(.el-tabs__item.is-active) {
  color: #0077b6;
  font-weight: 600;
}

.auth-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #00b4d8, #0077b6);
  height: 3px;
  border-radius: 3px;
}

/* 表单 */
.auth-form {
  margin-top: 16px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.auth-form :deep(.el-form-item__content) {
  flex-direction: column;
  align-items: flex-start;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 8px;
  width: 100%;
}

.form-label .el-icon {
  font-size: 14px;
  color: #0077b6;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #e2e8f0;
  background: #fff;
  padding: 5px 11px;
  transition: all 0.3s ease;
  width: 100%;
}

.auth-form :deep(.el-input__wrapper:hover) {
  border-color: #00b4d8;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(0, 123, 182, 0.1);
}

.auth-form :deep(.el-input__inner) {
  height: 34px;
  line-height: 34px;
}

/* 验证码输入 */
.code-input-group {
  display: flex;
  gap: 8px;
  width: 100%;
  align-items: center;
}

.code-input-group :deep(.el-input) {
  flex: 1;
}

.code-button {
  flex-shrink: 0;
  width: 110px;
  height: 34px;
  line-height: 34px;
  padding: 0 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #48cae4 0%, #00b4d8 100%);
  border: 1px solid #00b4d8;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 180, 216, 0.25);
  position: relative;
  overflow: hidden;
}

.code-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.code-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 180, 216, 0.4);
}

.code-button:hover:not(:disabled)::before {
  opacity: 1;
}

.code-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 180, 216, 0.3);
}

.code-button:disabled {
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  border-color: #94a3b8;
  color: #fff;
  cursor: not-allowed;
  box-shadow: none;
  opacity: 0.7;
}

.code-button:disabled::before {
  display: none;
}

/* 提交按钮 */
.submit-button {
  width: 100%;
  height: 42px;
  margin-top: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #00b4d8, #0077b6);
  border: none;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 119, 182, 0.3);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 119, 182, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

/* 表单底部 */
.form-footer {
  margin-top: 16px;
  text-align: center;
}

.agreement-text {
  font-size: 11px;
  color: #94a3b8;
}

.agreement-text a {
  color: #0077b6;
  text-decoration: none;
  margin: 0 2px;
}

.agreement-text a:hover {
  text-decoration: underline;
}

/* 底部提示 */
.auth-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.hint-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
  margin: 0;
}

.hint-text .el-icon {
  font-size: 14px;
  color: #00b4d8;
}

/* 版权信息 */
.copyright {
  position: absolute;
  bottom: 20px;
  text-align: center;
  z-index: 1;
}

.copyright p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

/* 动画 */
.animate-fade-in-scale {
  animation: fadeInScale 0.5s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 版权信息 */
.copyright {
  position: absolute;
  bottom: 15px;
  text-align: center;
  z-index: 1;
}

.copyright p {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}

/* 动画 */
.animate-fade-in-scale {
  animation: fadeInScale 0.5s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 响应式 */
@media (max-width: 480px) {
  .auth-container {
    padding: 10px;
  }

  .auth-card {
    max-width: 100%;
    padding: 20px 18px;
  }

  .logo-section {
    margin-bottom: 16px;
  }

  .logo-title {
    font-size: 18px;
  }

  .logo-subtitle {
    font-size: 11px;
  }

  .auth-tabs {
    margin-top: 12px;
  }

  .auth-tabs :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 12px;
  }

  .submit-button {
    height: 40px;
    font-size: 14px;
  }

  .hint-text {
    font-size: 10px;
  }

  .agreement-text {
    font-size: 10px;
  }
}

/* 小屏幕高度优化 */
@media (max-height: 700px) {
  .auth-container {
    padding: 10px;
  }

  .auth-card {
    padding: 18px;
  }

  .logo-section {
    margin-bottom: 14px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto 8px;
  }

  .logo-title {
    font-size: 18px;
  }

  .logo-subtitle {
    font-size: 11px;
  }

  .auth-tabs {
    margin-top: 12px;
  }

  .auth-tabs :deep(.el-tabs__header) {
    margin-bottom: 12px;
  }

  .auth-form {
    margin-top: 12px;
  }

  .form-label {
    margin-bottom: 5px;
    font-size: 12px;
  }

  .submit-button {
    height: 38px;
    margin-top: 12px;
  }

  .auth-footer {
    margin-top: 12px;
    padding-top: 12px;
  }
}
</style>
