<template>
  <div class="layout-container">
    <el-container class="layout-wrapper">
      <!-- 侧边栏 -->
      <el-aside :width="collapsed ? '64px' : '240px'" class="layout-aside">
        <!-- Logo -->
        <div class="aside-header">
          <transition name="logo-fade">
            <div v-show="!collapsed" class="logo-content">
              <div class="logo-icon">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" stroke="url(#paint0_linear)" stroke-width="2"/>
                  <path d="M16 8C12.7 8 10 10.7 10 14V16H9V24H13V16H12V14C12 11.8 13.8 10 16 10C18.2 10 20 11.8 20 14V16H19V24H23V16H22V14C22 10.7 19.3 8 16 8Z" fill="url(#paint1_linear)"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#00b4d8"/>
                      <stop offset="1" stop-color="#0077b6"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="9" y1="8" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#00b4d8"/>
                      <stop offset="1" stop-color="#0077b6"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span class="logo-text">健康管理系统</span>
            </div>
          </transition>
          <div v-show="collapsed" class="logo-collapsed">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-icon-small">
              <circle cx="16" cy="16" r="12" stroke="url(#paint0_linear_c)" stroke-width="2"/>
              <path d="M16 8C12.7 8 10 10.7 10 14V16H9V24H13V16H12V14C12 11.8 13.8 10 16 10C18.2 10 20 11.8 20 14V16H19V24H23V16H22V14C22 10.7 19.3 8 16 8Z" fill="url(#paint1_linear_c)"/>
              <defs>
                <linearGradient id="paint0_linear_c" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#00b4d8"/>
                  <stop offset="1" stop-color="#0077b6"/>
                </linearGradient>
                <linearGradient id="paint1_linear_c" x1="9" y1="8" x2="23" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#00b4d8"/>
                  <stop offset="1" stop-color="#0077b6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <!-- 导航菜单 -->
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          class="aside-menu"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>数据监控</template>
          </el-menu-item>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/health-data">
            <el-icon><Document /></el-icon>
            <template #title>健康数据</template>
          </el-menu-item>
          <el-menu-item index="/analysis">
            <el-icon><TrendCharts /></el-icon>
            <template #title>数据分析</template>
          </el-menu-item>
          <el-menu-item index="/reports">
            <el-icon><Files /></el-icon>
            <template #title>报告管理</template>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
          <el-menu-item index="/logs">
            <el-icon><DocumentCopy /></el-icon>
            <template #title>日志审计</template>
          </el-menu-item>
        </el-menu>

        <!-- 折叠按钮 -->
        <div class="aside-footer" @click="collapsed = !collapsed">
          <el-icon :size="18">
            <component :is="collapsed ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
      </el-aside>

      <!-- 主内容区 -->
      <el-container class="layout-main">
        <!-- 顶部栏 -->
        <el-header class="layout-header">
          <!-- 面包屑 -->
          <el-breadcrumb separator="/" class="header-breadcrumb">
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>

          <!-- 右侧操作 -->
          <div class="header-actions">
            <!-- 通知 -->
            <el-badge :value="3" :max="99" class="header-badge">
              <el-button :icon="Bell" circle size="small" class="header-icon-btn" />
            </el-badge>

            <!-- 用户下拉 -->
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-dropdown">
                <el-avatar :size="36" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.nickname?.[0] || 'A' }}
                </el-avatar>
                <span class="user-name" v-show="!isMobile">
                  {{ userStore.userInfo?.nickname || '管理员' }}
                </span>
                <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    <span>个人信息</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    <span>系统设置</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 页面内容 -->
        <el-main class="layout-content">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  DataAnalysis,
  User,
  Document,
  TrendCharts,
  Files,
  Setting,
  DocumentCopy,
  Expand,
  Fold,
  Bell,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const collapsed = ref(false)
const isMobile = ref(false)

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta.title as string || '数据监控')

// 响应式检测
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    collapsed.value = true
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const handleCommand = async (command: string) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'settings') {
    router.push('/settings')
  } else if (command === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    userStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}

.layout-wrapper {
  height: 100%;
}

/* 侧边栏 */
.layout-aside {
  background: var(--bg-card);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  box-shadow: var(--shadow-sm);
  z-index: 100;
}

/* Logo 区域 */
.aside-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-light);
  padding: 0 16px;
  position: relative;
}

.logo-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 4px rgba(0, 123, 182, 0.2));
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.logo-collapsed {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-icon-small {
  width: 28px;
  height: 28px;
}

.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: all var(--transition-base);
}

.logo-fade-enter-from,
.logo-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 菜单 */
.aside-menu {
  flex: 1;
  border-right: none;
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}

:deep(.el-menu) {
  background: transparent;
}

:deep(.el-menu-item) {
  margin-bottom: 4px;
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

:deep(.el-menu-item:hover) {
  background: var(--bg-secondary);
  color: var(--primary);
}

:deep(.el-menu-item.is-active) {
  background: var(--primary-gradient);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 123, 182, 0.3);
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

/* 底部折叠按钮 */
.aside-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-light);
  cursor: pointer;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.aside-footer:hover {
  color: var(--primary);
  background: var(--bg-secondary);
}

/* 主内容区 */
.layout-main {
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.layout-header {
  height: 64px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: var(--shadow-sm);
}

.header-breadcrumb {
  font-size: 14px;
}

:deep(.el-breadcrumb__inner) {
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-badge {
  display: flex;
  align-items: center;
}

.header-icon-btn {
  background: var(--bg-secondary);
  border: none;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.header-icon-btn:hover {
  background: var(--border-light);
  color: var(--primary);
}

/* 用户下拉 */
.user-dropdown {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 24px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.user-dropdown:hover {
  background: var(--bg-secondary);
}

.user-dropdown .el-avatar {
  background: var(--primary-gradient);
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

/* 下拉菜单 */
:deep(.el-dropdown-menu) {
  padding: 8px;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 4px;
  color: var(--text-secondary);
  font-size: 14px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: var(--bg-secondary);
  color: var(--primary);
}

:deep(.el-dropdown-menu__item.is-divided) {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
}

/* 页面内容 */
.layout-content {
  background: var(--bg-primary);
  padding: 24px;
  overflow-y: auto;
}

/* 页面过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: all var(--transition-base);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式 */
@media (max-width: 768px) {
  .layout-aside {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
  }

  .layout-aside:not(.is-collapsed) {
    box-shadow: var(--shadow-xl);
  }

  .layout-header {
    padding: 0 16px;
  }

  .layout-content {
    padding: 16px;
  }

  .user-name {
    display: none;
  }
}

/* 折叠状态时的样式调整 */
.layout-aside:has(.el-menu--collapse) {
  width: 64px !important;
}

:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-menu--collapse .el-menu-item) {
  padding: 0 20px;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin-right: 0;
}
</style>
