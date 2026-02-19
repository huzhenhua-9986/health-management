<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card animate-fade-in-scale">
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

      <!-- 登录表单 -->
      <el-form :model="loginForm" :rules="rules" ref="formRef" class="login-form">
        <div class="form-group">
          <label class="form-label">
            <el-icon><User /></el-icon>
            <span>手机号</span>
          </label>
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon color="#94a3b8"><Iphone /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="form-group">
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
        </div>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          class="login-button"
          @click="handleLogin"
        >
          <span v-if="!loading">登 录</span>
          <span v-else>登录中...</span>
        </el-button>
      </el-form>

      <!-- 底部提示 -->
      <div class="login-footer">
        <div class="divider">
          <span>演示模式</span>
        </div>
        <p class="hint-text">可使用任意手机号和密码登录体验</p>
      </div>
    </div>

    <!-- 版权信息 -->
    <div class="copyright">
      <p>© 2024 Health Management System. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

const loginForm = reactive({
  phone: '',
  password: ''
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  await formRef.value?.validate()
  loading.value = true

  try {
    // 演示模式：任意手机号和密码都可以登录
    // 实际项目中应该连接 Supabase Auth 或后端验证
    const demoUser = {
      id: 'demo-admin-id',
      phone: loginForm.phone,
      nickname: '演示管理员',
      avatar: '',
      role: 'admin'
    }

    userStore.setToken('demo-token-' + Date.now())
    userStore.setUserInfo(demoUser)

    ElMessage.success('登录成功（演示模式）')
    router.push('/')
  } catch (err) {
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ccfbf1 100%);
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
  opacity: 0.08;
  animation: float 20s ease-in-out infinite;
}

.circle-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #2ec4b6 0%, #00b4d8 100%);
  bottom: -100px;
  left: -100px;
  animation-delay: -5s;
}

.circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #95d5b2 0%, #2ec4b6 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
  }
}

.grid-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 123, 182, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 123, 182, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* 登录卡片 */
.login-card {
  position: relative;
  width: 420px;
  padding: 48px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  z-index: 10;
}

/* Logo 区域 */
.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  animation: pulse-glow 3s ease-in-out infinite;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0, 123, 182, 0.2));
}

.logo-title {
  font-size: 28px;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.logo-subtitle {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* 表单 */
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.form-label .el-icon {
  font-size: 18px;
}

:deep(.el-input) {
  --el-input-border-radius: 12px;
}

:deep(.el-input__wrapper) {
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: var(--shadow-md);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(0, 123, 182, 0.1);
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 52px;
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: var(--primary-gradient);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 123, 182, 0.3);
  transition: all var(--transition-base);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 123, 182, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 底部 */
.login-footer {
  margin-top: 32px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-light);
}

.divider span {
  padding: 0 16px;
  font-size: 13px;
  color: var(--text-muted);
}

.hint-text {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 版权信息 */
.copyright {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 10;
}

.copyright p {
  font-size: 12px;
  color: var(--text-muted);
}

/* 响应式 */
@media (max-width: 480px) {
  .login-card {
    width: calc(100% - 32px);
    padding: 32px 24px;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
  }

  .circle-3 {
    width: 200px;
    height: 200px;
  }
}
</style>
