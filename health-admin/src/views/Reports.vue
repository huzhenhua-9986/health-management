<template>
  <div class="reports-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">健康报告管理</h1>
        <p class="page-subtitle">管理和下载用户健康报告</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="showGenerateDialog = true">生成报告</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, key) in statistics" :key="key">
        <div class="stat-icon" :style="{ background: stat.color }">
          <component :is="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
        </div>
      </div>
    </div>

    <!-- 报告列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>报告列表</span>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户手机号"
            :prefix-icon="Search"
            clearable
            style="width: 220px"
            @input="handleSearch"
          />
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="报告类型">
          <el-select v-model="queryForm.report_type" placeholder="全部" clearable style="width: 140px">
            <el-option label="日报" value="daily" />
            <el-option label="周报" value="weekly" />
            <el-option label="月报" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成时间">
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
        <el-table-column prop="user_id" label="用户ID" width="150" show-overflow-tooltip />
        <el-table-column prop="report_type" label="报告类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getReportTypeTag(row.report_type)" size="small">
              {{ getReportTypeLabel(row.report_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="report_period" label="报告周期" min-width="160" />
        <el-table-column prop="start_date" label="开始日期" width="120" />
        <el-table-column prop="end_date" label="结束日期" width="120" />
        <el-table-column prop="generated_at" label="生成时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.generated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" :icon="View" @click="handleView(row)">查看</el-button>
            <el-button type="success" link size="small" :icon="Download" @click="handleDownload(row)">下载</el-button>
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

    <!-- 生成报告对话框 -->
    <el-dialog v-model="showGenerateDialog" title="生成健康报告" width="500px">
      <el-form :model="generateForm" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="generateForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="报告类型">
          <el-select v-model="generateForm.report_type" placeholder="选择报告类型" style="width: 100%">
            <el-option label="日报" value="daily" />
            <el-option label="周报" value="weekly" />
            <el-option label="月报" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="generateForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="包含内容">
          <el-checkbox-group v-model="generateForm.include_sections">
            <el-checkbox label="overview">概览</el-checkbox>
            <el-checkbox label="exercise">运动</el-checkbox>
            <el-checkbox label="sleep">睡眠</el-checkbox>
            <el-checkbox label="diet">饮食</el-checkbox>
            <el-checkbox label="analysis">分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">生成报告</el-button>
      </template>
    </el-dialog>

    <!-- 报告预览对话框 -->
    <el-dialog v-model="showPreviewDialog" title="报告预览" width="700px">
      <div class="report-preview" v-if="currentReport">
        <div class="preview-header">
          <h2>健康报告 - {{ getReportTypeLabel(currentReport.report_type) }}</h2>
          <p class="preview-period">{{ currentReport.report_period }}</p>
        </div>
        <div class="preview-content">
          <div class="preview-section">
            <h3>报告概览</h3>
            <p>报告包含用户的运动、睡眠、饮食等健康数据分析。</p>
          </div>
          <div class="preview-section">
            <h3>数据统计</h3>
            <ul>
              <li>平均每日步数：8,234 步</li>
              <li>平均睡眠时长：7.2 小时</li>
              <li>平均热量摄入：1,950 kcal</li>
            </ul>
          </div>
          <div class="preview-section">
            <h3>健康建议</h3>
            <p>根据您的健康数据，建议保持规律作息，适量增加运动。</p>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showPreviewDialog = false">关闭</el-button>
        <el-button type="primary" :icon="Download" @click="handleDownload(currentReport)">下载报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Refresh,
  View,
  Download,
  Delete,
  Files,
  Document,
  Calendar,
  Timer
} from '@element-plus/icons-vue'
import { reportApi } from '@/api'
import dayjs from 'dayjs'

const loading = ref(false)
const generating = ref(false)
const tableData = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const searchKeyword = ref('')
const showGenerateDialog = ref(false)
const showPreviewDialog = ref(false)
const currentReport = ref<any>(null)

const queryForm = reactive({
  report_type: ''
})

const generateForm = reactive({
  user_id: '',
  report_type: 'weekly',
  dateRange: null as [string, string] | null,
  include_sections: ['overview', 'exercise', 'sleep', 'diet', 'analysis']
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const statistics = reactive({
  total: { label: '总报告数', value: 0, color: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', icon: Files },
  daily: { label: '日报', value: 0, color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)', icon: Calendar },
  weekly: { label: '周报', value: 0, color: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)', icon: Document },
  monthly: { label: '月报', value: 0, color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)', icon: Timer }
})

const reportTypeMap: Record<string, string> = {
  daily: '日报',
  weekly: '周报',
  monthly: '月报'
}

const reportTypeTagMap: Record<string, string> = {
  daily: 'success',
  weekly: 'primary',
  monthly: 'warning'
}

const getReportTypeLabel = (type: string) => {
  return reportTypeMap[type] || type
}

const getReportTypeTag = (type: string) => {
  return reportTypeTagMap[type] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const { data, count, error } = await reportApi.getList({
      report_type: queryForm.report_type || undefined,
      page: pagination.page,
      page_size: pagination.pageSize
    })

    if (error) throw error
    tableData.value = data || []
    pagination.total = count || 0

    // 更新统计
    statistics.total.value = count || 0
    statistics.daily.value = tableData.value.filter((d: any) => d.report_type === 'daily').length
    statistics.weekly.value = tableData.value.filter((d: any) => d.report_type === 'weekly').length
    statistics.monthly.value = tableData.value.filter((d: any) => d.report_type === 'monthly').length
  } catch (err) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  queryForm.report_type = ''
  dateRange.value = null
  searchKeyword.value = ''
  handleQuery()
}

const handleSearch = () => {
  // 实现搜索功能
  ElMessage.info('搜索功能开发中...')
}

const handleView = (row: any) => {
  currentReport.value = row
  showPreviewDialog.value = true
}

const handleDownload = (row: any) => {
  if (row.file_url) {
    window.open(row.file_url, '_blank')
    ElMessage.success('开始下载报告')
  } else {
    ElMessage.warning('报告文件不存在')
  }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm('确定要删除该报告吗？此操作不可恢复！', '警告', {
    type: 'error',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  try {
    const { error } = await reportApi.delete(row.id)
    if (error) throw error
    ElMessage.success('删除成功')
    loadData()
  } catch (err) {
    ElMessage.error('删除失败')
  }
}

const handleGenerate = async () => {
  if (!generateForm.user_id) {
    ElMessage.warning('请输入用户ID')
    return
  }
  if (!generateForm.dateRange) {
    ElMessage.warning('请选择时间范围')
    return
  }

  generating.value = true
  try {
    await reportApi.generate({
      user_id: generateForm.user_id,
      report_type: generateForm.report_type,
      start_date: generateForm.dateRange[0],
      end_date: generateForm.dateRange[1],
      include_sections: generateForm.include_sections
    })
    ElMessage.success('报告生成任务已创建')
    showGenerateDialog.value = false
    // 重置表单
    generateForm.user_id = ''
    generateForm.report_type = 'weekly'
    generateForm.dateRange = null
    loadData()
  } catch (err) {
    ElMessage.error('生成报告失败')
  } finally {
    generating.value = false
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.reports-page {
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 报告预览 */
.report-preview {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
}

.preview-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.preview-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.preview-period {
  font-size: 14px;
  color: var(--text-muted);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.preview-section p,
.preview-section ul {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.preview-section ul {
  padding-left: 20px;
}

.preview-section li {
  margin-bottom: 8px;
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

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
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
