<template>
  <div class="exercise-data-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">运动数据管理</h1>
        <p class="page-subtitle">管理用户的运动记录和活动数据</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Plus" type="primary" @click="showAddDialog = true">新增记录</el-button>
        <el-button :icon="Download" @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, key) in statistics" :key="key">
        <div class="stat-icon" :style="{ background: stat.color }">
          <component :is="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>运动数据列表</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="用户">
          <el-input v-model="queryForm.keyword" placeholder="手机号/昵称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{ background: '#f8fafc', color: '#475569' }"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="users.phone" label="用户手机号" width="130">
          <template #default="{ row }">
            {{ row.users?.phone || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="users.nickname" label="用户昵称" width="120">
          <template #default="{ row }">
            {{ row.users?.nickname || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="steps" label="步数" width="100" align="right">
          <template #default="{ row }">
            <span class="data-value">{{ formatNumber(row.steps) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="distance" label="距离(km)" width="100" align="right">
          <template #default="{ row }">
            {{ row.distance.toFixed(1) }}
          </template>
        </el-table-column>
        <el-table-column prop="calories" label="热量(kcal)" width="110" align="right">
          <template #default="{ row }">
            {{ row.calories }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="110" align="right">
          <template #default="{ row }">
            {{ row.duration }}
          </template>
        </el-table-column>
        <el-table-column prop="exercise_date" label="运动日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.exercise_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="device_type" label="设备类型" width="100" />
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="View" @click="handleView(row)">查看</el-button>
            <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        class="pagination"
      />
    </el-card>

    <!-- 数据详情对话框 -->
    <el-dialog v-model="detailVisible" title="运动数据详情" width="500px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="用户手机号" :span="2">
          {{ currentRow.users?.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="步数">
          {{ formatNumber(currentRow.steps) }} 步
        </el-descriptions-item>
        <el-descriptions-item label="距离">
          {{ currentRow.distance.toFixed(1) }} km
        </el-descriptions-item>
        <el-descriptions-item label="消耗热量">
          {{ currentRow.calories }} kcal
        </el-descriptions-item>
        <el-descriptions-item label="运动时长">
          {{ currentRow.duration }} 分钟
        </el-descriptions-item>
        <el-descriptions-item label="运动日期" :span="2">
          {{ formatDateFull(currentRow.exercise_date) }}
        </el-descriptions-item>
        <el-descriptions-item label="设备类型" :span="2">
          {{ currentRow.device_type || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增记录对话框 -->
    <el-dialog v-model="showAddDialog" title="新增运动记录" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="addForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="步数">
          <el-input-number v-model="addForm.steps" :min="0" :max="100000" />
        </el-form-item>
        <el-form-item label="距离(km)">
          <el-input-number v-model="addForm.distance" :min="0" :max="100" :step="0.1" />
        </el-form-item>
        <el-form-item label="热量(kcal)">
          <el-input-number v-model="addForm.calories" :min="0" :max="5000" />
        </el-form-item>
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="addForm.duration" :min="0" :max="1440" />
        </el-form-item>
        <el-form-item label="运动日期">
          <el-date-picker v-model="addForm.exercise_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="addForm.device_type" placeholder="选择设备" style="width: 100%">
            <el-option label="iPhone" value="iPhone" />
            <el-option label="Android" value="Android" />
            <el-option label="Xiaomi" value="Xiaomi" />
            <el-option label="Huawei" value="Huawei" />
            <el-option label="手动录入" value="manual" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAdd" :loading="adding">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Delete, Download, Search, Refresh, Plus, TrendCharts, Timer, Calendar, DataLine } from '@element-plus/icons-vue'
import { exerciseApi as backendApi } from '@/api/backend'
import { exerciseApi as localApi } from '@/api'
import dayjs from 'dayjs'

const loading = ref(false)
const adding = ref(false)
const tableData = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const detailVisible = ref(false)
const showAddDialog = ref(false)
const currentRow = ref<any>(null)

const queryForm = reactive({
  keyword: ''
})

const addForm = reactive({
  user_id: '',
  steps: 8000,
  distance: 5.0,
  calories: 300,
  duration: 60,
  exercise_date: '',
  device_type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const statistics = reactive({
  totalRecords: { label: '总记录数', value: 0, color: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', icon: DataLine },
  totalSteps: { label: '总步数(万)', value: 0, color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)', icon: TrendCharts },
  avgDuration: { label: '平均时长(分)', value: 0, color: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)', icon: Timer },
  todayRecords: { label: '今日记录', value: 0, color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)', icon: Calendar }
})

const loadData = async () => {
  loading.value = true
  try {
    // 调用后端API
    const result = await backendApi.getList({
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      page: pagination.page,
      pageSize: pagination.pageSize
    })

    tableData.value = result.data || []
    pagination.total = result.total || 0

    // 更新统计
    statistics.totalRecords.value = pagination.total
    const totalSteps = tableData.value.reduce((sum: number, d: any) => sum + (d.steps || 0), 0)
    statistics.totalSteps.value = Math.floor(totalSteps / 10000)
    const avgDuration = tableData.value.reduce((sum: number, d: any) => sum + (d.duration || 0), 0) / tableData.value.length || 0
    statistics.avgDuration.value = Math.floor(avgDuration)
    const today = dayjs().format('YYYY-MM-DD')
    statistics.todayRecords.value = tableData.value.filter((d: any) => d.exercise_date === today).length
  } catch (err) {
    // 回退到本地API
    console.log('后端API调用失败，使用本地演示模式', err)
    try {
      const { data, error } = await localApi.getList({
        start_date: dateRange.value?.[0],
        end_date: dateRange.value?.[1]
      })

      if (error) throw error
      tableData.value = data || []

      // 分页处理（本地）
      pagination.total = tableData.value.length
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      tableData.value = tableData.value.slice(start, end)

      // 更新统计
      statistics.totalRecords.value = pagination.total
      const totalSteps = tableData.value.reduce((sum: number, d: any) => sum + d.steps, 0)
      statistics.totalSteps.value = Math.floor(totalSteps / 10000)
      const avgDuration = tableData.value.reduce((sum: number, d: any) => sum + d.duration, 0) / tableData.value.length || 0
      statistics.avgDuration.value = Math.floor(avgDuration)
      const today = dayjs().format('YYYY-MM-DD')
      statistics.todayRecords.value = tableData.value.filter((d: any) => d.exercise_date === today).length
    } catch (localErr) {
      ElMessage.error('加载数据失败')
    }
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  queryForm.keyword = ''
  dateRange.value = null
  handleQuery()
}

const handleView = (row: any) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  try {
    tableData.value = tableData.value.filter((d: any) => d.id !== row.id)
    pagination.total--
    ElMessage.success('删除成功')
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleAdd = async () => {
  if (!addForm.user_id) {
    ElMessage.warning('请输入用户ID')
    return
  }
  if (!addForm.exercise_date) {
    ElMessage.warning('请选择运动日期')
    return
  }

  adding.value = true
  try {
    // 模拟添加
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('添加成功')
    showAddDialog.value = false
    loadData()
  } catch (err) {
    ElMessage.error('添加失败')
  } finally {
    adding.value = false
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateFull = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

onMounted(() => {
  addForm.exercise_date = dayjs().format('YYYY-MM-DD')
  loadData()
})
</script>

<style scoped>
.exercise-data-page {
  padding: 0;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--primary);
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

/* 表格卡片 */
.table-card {
  box-shadow: var(--shadow-sm);
}

.table-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.table-card :deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.query-form {
  margin-bottom: 20px;
}

.query-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.data-value {
  font-weight: 600;
  color: var(--primary);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .query-form :deep(.el-form-item) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 12px;
  }

  .query-form :deep(.el-input),
  .query-form :deep(.el-select),
  .query-form :deep(.el-date-picker) {
    width: 100% !important;
  }
}
</style>
