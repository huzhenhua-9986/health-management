<template>
  <div class="user-detail-page" v-loading="loading">
    <el-page-header @back="() => $router.back()" title="返回" content="用户详情" />

    <el-card style="margin-top: 20px" v-if="userInfo">
      <template #header>
        <span>基本信息</span>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="头像">
          <el-avatar :size="80" :src="userInfo.avatar_url">
            {{ userInfo.nickname?.[0] || 'U' }}
          </el-avatar>
        </el-descriptions-item>
        <el-descriptions-item label="昵称">{{ userInfo.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userInfo.phone }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          {{ userInfo.gender === 'male' ? '男' : userInfo.gender === 'female' ? '女' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="身高">{{ userInfo.height || '-' }} cm</el-descriptions-item>
        <el-descriptions-item label="体重">{{ userInfo.weight || '-' }} kg</el-descriptions-item>
        <el-descriptions-item label="BMI">
          {{ userInfo.height && userInfo.weight ? (userInfo.weight / ((userInfo.height / 100) ** 2)).toFixed(1) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="出生日期">{{ userInfo.birth_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="userInfo.status === 'active' ? 'success' : 'danger'">
            {{ userInfo.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="角色">{{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(userInfo.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(userInfo.updated_at) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>健康数据统计</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.healthDataCount }}</div>
            <div class="stat-label">健康数据</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.exerciseDays }}</div>
            <div class="stat-label">运动天数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ avgSleepDuration }}</div>
            <div class="stat-label">平均睡眠(小时)</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ stats.dietRecords }}</div>
            <div class="stat-label">饮食记录</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'
import { supabase } from '@/utils/supabase'
import dayjs from 'dayjs'

const route = useRoute()
const loading = ref(false)
const userInfo = ref<any>(null)
const stats = ref({
  healthDataCount: 0,
  exerciseDays: 0,
  dietRecords: 0
})
const sleepRecords = ref<any[]>([])

const avgSleepDuration = computed(() => {
  if (sleepRecords.value.length === 0) return '-'
  const total = sleepRecords.value.reduce((sum, r) => sum + r.sleep_duration, 0)
  return (total / sleepRecords.value.length / 60).toFixed(1)
})

const loadData = async () => {
  const userId = route.params.id as string
  loading.value = true

  try {
    // 加载用户信息
    const { data: userData, error: userError } = await userApi.getDetail(userId)
    if (userError) throw userError
    userInfo.value = userData

    // 加载统计数据
    const [healthData, exerciseData, sleepData, dietData] = await Promise.all([
      supabase.from('health_data').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('exercise_data').select('exercise_date', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('sleep_data').select('*').eq('user_id', userId).limit(30),
      supabase.from('diet_data').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    stats.value = {
      healthDataCount: healthData.count || 0,
      exerciseDays: exerciseData.count || 0,
      dietRecords: dietData.count || 0
    }
    sleepRecords.value = sleepData.data || []
  } catch (err) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-detail-page {
  height: 100%;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}
</style>
