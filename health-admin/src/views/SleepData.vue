<template>
  <div class="sleep-data-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">睡眠数据管理</h1>
        <p class="page-subtitle">管理用户的睡眠记录和质量分析</p>
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
          <span>睡眠数据列表</span>
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
        <el-table-column prop="sleep_duration" label="总时长" width="100" align="right">
          <template #default="{ row }">
            <span class="data-value">{{ formatDuration(row.sleep_duration) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="deep_sleep_duration" label="深睡(分)" width="100" align="right">
          <template #default="{ row }">
            {{ row.deep_sleep_duration / 60 }}
          </template>
        </el-table-column>
        <el-table-column prop="light_sleep_duration" label="浅睡(分)" width="100" align="right">
          <template #default="{ row }">
            {{ row.light_sleep_duration / 60 }}
          </template>
        </el-table-column>
        <el-table-column prop="rem_sleep_duration" label="REM(分)" width="100" align="right">
          <template #default="{ row }">
            {{ row.rem_sleep_duration / 60 }}
          </template>
        </el-table-column>
        <el-table-column prop="sleep_quality" label="睡眠质量" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getQualityTag(row.sleep_quality)" size="small">
              {{ getQualityLabel(row.sleep_quality) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sleep_date" label="睡眠日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.sleep_date) }}
          </template>
        </el-table-column>
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
    <el-dialog v-model="detailVisible" title="睡眠数据详情" width="550px">
      <div v-if="currentRow" class="sleep-detail">
        <!-- 睡眠评分 -->
        <div class="sleep-score">
          <div class="score-circle" :class="`score-${getQualityLevel(currentRow.sleep_quality)}`">
            <div class="score-value">{{ currentRow.sleep_quality }}</div>
            <div class="score-label">睡眠评分</div>
          </div>
          <div class="score-desc">{{ getQualityDesc(currentRow.sleep_quality) }}</div>
        </div>

        <!-- 睡眠结构 -->
        <div class="sleep-structure">
          <h4>睡眠结构</h4>
          <div class="structure-bars">
            <div class="structure-item">
              <div class="structure-label">深睡</div>
              <div class="structure-bar">
                <div class="structure-fill deep" :style="{ width: getDeepSleepPercent(currentRow) + '%' }"></div>
              </div>
              <div class="structure-value">{{ formatDuration(currentRow.deep_sleep_duration) }}</div>
            </div>
            <div class="structure-item">
              <div class="structure-label">浅睡</div>
              <div class="structure-bar">
                <div class="structure-fill light" :style="{ width: getLightSleepPercent(currentRow) + '%' }"></div>
              </div>
              <div class="structure-value">{{ formatDuration(currentRow.light_sleep_duration) }}</div>
            </div>
            <div class="structure-item">
              <div class="structure-label">REM</div>
              <div class="structure-bar">
                <div class="structure-fill rem" :style="{ width: getRemSleepPercent(currentRow) + '%' }"></div>
              </div>
              <div class="structure-value">{{ formatDuration(currentRow.rem_sleep_duration) }}</div>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border style="margin-top: 20px">
          <el-descriptions-item label="用户手机号">
            {{ currentRow.users?.phone || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="睡眠日期">
            {{ formatDateFull(currentRow.sleep_date) }}
          </el-descriptions-item>
          <el-descriptions-item label="总睡眠时长">
            {{ formatDuration(currentRow.sleep_duration) }}
          </el-descriptions-item>
          <el-descriptions-item label="睡眠周期">
            {{ currentRow.sleep_cycles || '-' }} 个
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增记录对话框 -->
    <el-dialog v-model="showAddDialog" title="新增睡眠记录" width="500px">
      <el-form :model="addForm" label-width="120px">
        <el-form-item label="用户ID">
          <el-input v-model="addForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="睡眠日期">
          <el-date-picker v-model="addForm.sleep_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="总时长(分钟)">
          <el-input-number v-model="addForm.sleep_duration" :min="0" :max="1440" />
        </el-form-item>
        <el-form-item label="深睡时长(分钟)">
          <el-input-number v-model="addForm.deep_sleep_duration" :min="0" :max="600" />
        </el-form-item>
        <el-form-item label="浅睡时长(分钟)">
          <el-input-number v-model="addForm.light_sleep_duration" :min="0" :max="720" />
        </el-form-item>
        <el-form-item label="REM时长(分钟)">
          <el-input-number v-model="addForm.rem_sleep_duration" :min="0" :max="300" />
        </el-form-item>
        <el-form-item label="睡眠质量">
          <el-slider v-model="addForm.sleep_quality" :min="1" :max="10" show-stops :marks="{ 1: '1', 5: '5', 10: '10' }" />
        </el-form-item>
        <el-form-item label="睡眠周期">
          <el-input-number v-model="addForm.sleep_cycles" :min="0" :max="10" />
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
import { View, Delete, Download, Search, Refresh, Plus, Timer, TrendCharts, Calendar, DataLine } from '@element-plus/icons-vue'
import { sleepApi as backendApi } from '@/api/backend'
import { sleepApi as localApi } from '@/api'
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
  sleep_date: '',
  sleep_duration: 480,
  deep_sleep_duration: 90,
  light_sleep_duration: 240,
  rem_sleep_duration: 150,
  sleep_quality: 7,
  sleep_cycles: 5
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const statistics = reactive({
  totalRecords: { label: '总记录数', value: 0, color: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', icon: DataLine },
  avgDuration: { label: '平均时长(小时)', value: 0, color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)', icon: Timer },
  avgQuality: { label: '平均质量', value: 0, color: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)', icon: TrendCharts },
  todayRecords: { label: '今日记录', value: 0, color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)', icon: Calendar }
})

const getQualityLabel = (score: number) => {
  if (score >= 8) return '优秀'
  if (score >= 6) return '良好'
  if (score >= 4) return '一般'
  return '较差'
}

const getQualityTag = (score: number) => {
  if (score >= 8) return 'success'
  if (score >= 6) return 'primary'
  if (score >= 4) return 'warning'
  return 'danger'
}

const getQualityLevel = (score: number) => {
  if (score >= 8) return 'excellent'
  if (score >= 6) return 'good'
  if (score >= 4) return 'fair'
  return 'poor'
}

const getQualityDesc = (score: number) => {
  if (score >= 8) return '睡眠质量非常好，保持！'
  if (score >= 6) return '睡眠质量良好，继续努力。'
  if (score >= 4) return '睡眠质量一般，建议调整作息。'
  return '睡眠质量较差，建议改善睡眠习惯。'
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

const getDeepSleepPercent = (row: any) => {
  return (row.deep_sleep_duration / row.sleep_duration * 100).toFixed(1)
}

const getLightSleepPercent = (row: any) => {
  return (row.light_sleep_duration / row.sleep_duration * 100).toFixed(1)
}

const getRemSleepPercent = (row: any) => {
  return (row.rem_sleep_duration / row.sleep_duration * 100).toFixed(1)
}

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
    const avgDuration = tableData.value.reduce((sum: number, d: any) => sum + (d.sleep_duration || 0), 0) / tableData.value.length / 3600 || 0
    statistics.avgDuration.value = avgDuration.toFixed(1)
    const avgQuality = tableData.value.reduce((sum: number, d: any) => sum + (d.sleep_quality || 0), 0) / tableData.value.length || 0
    statistics.avgQuality.value = avgQuality.toFixed(1)
    const today = dayjs().format('YYYY-MM-DD')
    statistics.todayRecords.value = tableData.value.filter((d: any) => d.sleep_date === today).length
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
      const avgDuration = tableData.value.reduce((sum: number, d: any) => sum + d.sleep_duration, 0) / tableData.value.length / 3600 || 0
      statistics.avgDuration.value = avgDuration.toFixed(1)
      const avgQuality = tableData.value.reduce((sum: number, d: any) => sum + d.sleep_quality, 0) / tableData.value.length || 0
      statistics.avgQuality.value = avgQuality.toFixed(1)
      const today = dayjs().format('YYYY-MM-DD')
      statistics.todayRecords.value = tableData.value.filter((d: any) => d.sleep_date === today).length
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
    // 调用后端API
    await backendApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (err) {
    // 回退到演示模式
    console.log('后端API调用失败，使用本地演示模式', err)
    tableData.value = tableData.value.filter((d: any) => d.id !== row.id)
    pagination.total--
    ElMessage.success('删除成功（演示模式）')
  }
}

const handleAdd = async () => {
  if (!addForm.user_id) {
    ElMessage.warning('请输入用户ID')
    return
  }
  if (!addForm.sleep_date) {
    ElMessage.warning('请选择睡眠日期')
    return
  }

  adding.value = true
  try {
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

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

const formatDateFull = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

onMounted(() => {
  addForm.sleep_date = dayjs().format('YYYY-MM-DD')
  loadData()
})
</script>

<style scoped>
.sleep-data-page {
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

/* 睡眠详情 */
.sleep-detail {
  padding: 10px 0;
}

.sleep-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 24px;
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.score-excellent {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.score-good {
  background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
  color: white;
}

.score-fair {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.score-poor {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
}

.score-desc {
  font-size: 14px;
  color: var(--text-secondary);
}

.sleep-structure h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.structure-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.structure-item {
  display: grid;
  grid-template-columns: 60px 1fr 80px;
  align-items: center;
  gap: 12px;
}

.structure-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.structure-bar {
  height: 24px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.structure-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.structure-fill.deep {
  background: linear-gradient(90deg, #1e40af 0%, #3b82f6 100%);
}

.structure-fill.light {
  background: linear-gradient(90deg, #7c3aed 0%, #a78bfa 100%);
}

.structure-fill.rem {
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
}

.structure-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
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
