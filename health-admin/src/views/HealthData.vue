<template>
  <div class="health-data-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">健康数据管理</h1>
        <p class="page-subtitle">管理所有用户的健康数据记录</p>
      </div>
      <div class="header-actions">
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
          <span>数据列表</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="用户">
          <el-input v-model="queryForm.keyword" placeholder="手机号/昵称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select v-model="queryForm.data_type" placeholder="全部" clearable style="width: 140px">
            <el-option label="血压" value="blood_pressure" />
            <el-option label="血糖" value="blood_sugar" />
            <el-option label="心率" value="heart_rate" />
            <el-option label="体温" value="temperature" />
            <el-option label="体重" value="weight" />
          </el-select>
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
        <el-table-column prop="data_type" label="数据类型" width="110">
          <template #default="{ row }">
            <el-tag :type="getDataTypeTag(row.data_type)" size="small">
              {{ getDataTypeLabel(row.data_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="data_value" label="数值" width="100">
          <template #default="{ row }">
            <span class="data-value">{{ row.data_value }}</span>
            <span class="data-unit">{{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="来源" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.source === 'manual' ? 'info' : 'success'" size="small">
              {{ row.source === 'manual' ? '手动' : '设备' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recorded_at" label="记录时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.recorded_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
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
    <el-dialog v-model="detailVisible" title="数据详情" width="500px">
      <el-descriptions :column="1" border v-if="currentRow">
        <el-descriptions-item label="用户手机号">
          {{ currentRow.users?.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户昵称">
          {{ currentRow.users?.nickname || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="数据类型">
          <el-tag :type="getDataTypeTag(currentRow.data_type)" size="small">
            {{ getDataTypeLabel(currentRow.data_type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="数值">
          {{ currentRow.data_value }} {{ currentRow.unit }}
        </el-descriptions-item>
        <el-descriptions-item label="来源">
          <el-tag :type="currentRow.source === 'manual' ? 'info' : 'success'" size="small">
            {{ currentRow.source === 'manual' ? '手动录入' : '设备同步' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="记录时间">
          {{ formatFullDate(currentRow.recorded_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ currentRow.notes || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Delete, Download, Search, Refresh, TrendCharts, DataLine, Document, Timer } from '@element-plus/icons-vue'
import { healthDataApi as backendApi } from '@/api/backend'
import { healthDataApi as localApi } from '@/api'
import dayjs from 'dayjs'

const loading = ref(false)
const tableData = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const detailVisible = ref(false)
const currentRow = ref<any>(null)

const queryForm = reactive({
  keyword: '',
  data_type: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const statistics = reactive({
  total: { label: '总数据', value: 0, color: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', icon: DataLine },
  bloodPressure: { label: '血压记录', value: 0, color: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)', icon: TrendCharts },
  bloodSugar: { label: '血糖记录', value: 0, color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)', icon: Document },
  today: { label: '今日新增', value: 0, color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)', icon: Timer }
})

const dataTypeMap: Record<string, string> = {
  blood_pressure: '血压',
  blood_sugar: '血糖',
  heart_rate: '心率',
  temperature: '体温',
  weight: '体重'
}

const dataTypeTagMap: Record<string, string> = {
  blood_pressure: 'danger',
  blood_sugar: 'warning',
  heart_rate: 'success',
  temperature: 'info',
  weight: 'primary'
}

const getDataTypeLabel = (type: string) => {
  return dataTypeMap[type] || type
}

const getDataTypeTag = (type: string) => {
  return dataTypeTagMap[type] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    // 调用后端API
    const result = await backendApi.getList({
      dataType: queryForm.data_type || undefined,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      page: pagination.page,
      pageSize: pagination.pageSize
    })

    tableData.value = result.data || []
    pagination.total = result.total || 0

    // 更新统计
    statistics.total.value = pagination.total
    statistics.bloodPressure.value = tableData.value.filter((d: any) => d.data_type === 'blood_pressure').length
    statistics.bloodSugar.value = tableData.value.filter((d: any) => d.data_type === 'blood_sugar').length
    statistics.today.value = tableData.value.filter((d: any) => dayjs(d.recorded_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')).length
  } catch (err) {
    // 回退到本地API
    console.log('后端API调用失败，使用本地演示模式', err)
    try {
      const { data, count, error } = await localApi.getList({
        data_type: queryForm.data_type || undefined,
        start_date: dateRange.value?.[0],
        end_date: dateRange.value?.[1],
        page: pagination.page,
        page_size: pagination.pageSize
      })

      if (error) throw error
      tableData.value = data || []
      pagination.total = count || 0

      // 更新统计
      statistics.total.value = count || 0
      statistics.bloodPressure.value = tableData.value.filter((d: any) => d.data_type === 'blood_pressure').length
      statistics.bloodSugar.value = tableData.value.filter((d: any) => d.data_type === 'blood_sugar').length
      statistics.today.value = tableData.value.filter((d: any) => dayjs(d.recorded_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')).length
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
  queryForm.data_type = ''
  dateRange.value = null
  handleQuery()
}

const handleView = (row: any) => {
  currentRow.value = row
  detailVisible.value = true
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
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

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const formatFullDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.health-data-page {
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

/* 表格样式 */
.data-value {
  font-weight: 600;
  color: var(--primary);
  margin-right: 4px;
}

.data-unit {
  font-size: 12px;
  color: var(--text-muted);
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

  .query-form {
    flex-direction: column;
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
