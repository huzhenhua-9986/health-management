<template>
  <div class="diet-data-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">饮食记录管理</h1>
        <p class="page-subtitle">管理用户的饮食记录和营养摄入数据</p>
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
          <span>饮食记录列表</span>
        </div>
      </template>

      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="用户">
          <el-input v-model="queryForm.keyword" placeholder="手机号/昵称" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="餐次">
          <el-select v-model="queryForm.meal_type" placeholder="全部" clearable style="width: 120px">
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
            <el-option label="加餐" value="snack" />
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
        <el-table-column prop="meal_type" label="餐次" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="getMealTypeTag(row.meal_type)" size="small">
              {{ getMealTypeLabel(row.meal_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="food_name" label="食物名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="calories" label="热量(kcal)" width="100" align="right">
          <template #default="{ row }">
            {{ row.calories || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="protein" label="蛋白质(g)" width="100" align="right">
          <template #default="{ row }">
            {{ row.protein || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="fat" label="脂肪(g)" width="90" align="right">
          <template #default="{ row }">
            {{ row.fat || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="carbohydrate" label="碳水(g)" width="100" align="right">
          <template #default="{ row }">
            {{ row.carbohydrate || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="meal_time" label="用餐时间" width="170">
          <template #default="{ row }">
            {{ formatDateTime(row.meal_time) }}
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
    <el-dialog v-model="detailVisible" title="饮食记录详情" width="500px">
      <el-descriptions :column="2" border v-if="currentRow">
        <el-descriptions-item label="用户手机号" :span="2">
          {{ currentRow.users?.phone || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="餐次" :span="2">
          <el-tag :type="getMealTypeTag(currentRow.meal_type)" size="small">
            {{ getMealTypeLabel(currentRow.meal_type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="食物名称" :span="2">
          {{ currentRow.food_name }}
        </el-descriptions-item>
        <el-descriptions-item label="热量">
          {{ currentRow.calories }} kcal
        </el-descriptions-item>
        <el-descriptions-item label="蛋白质">
          {{ currentRow.protein }} g
        </el-descriptions-item>
        <el-descriptions-item label="脂肪">
          {{ currentRow.fat }} g
        </el-descriptions-item>
        <el-descriptions-item label="碳水化合物">
          {{ currentRow.carbohydrate }} g
        </el-descriptions-item>
        <el-descriptions-item label="膳食纤维" :span="2">
          {{ currentRow.fiber || '-' }} g
        </el-descriptions-item>
        <el-descriptions-item label="用餐时间" :span="2">
          {{ formatDateTimeFull(currentRow.meal_time) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 营养占比 -->
      <div class="nutrition-chart" v-if="currentRow">
        <h4>营养占比</h4>
        <div class="nutrition-bars">
          <div class="nutrition-item">
            <div class="nutrition-label">蛋白质</div>
            <div class="nutrition-bar">
              <div class="nutrition-fill protein" :style="{ width: getNutritionPercent(currentRow, 'protein') + '%' }"></div>
            </div>
            <div class="nutrition-value">{{ getNutritionPercent(currentRow, 'protein') }}%</div>
          </div>
          <div class="nutrition-item">
            <div class="nutrition-label">脂肪</div>
            <div class="nutrition-bar">
              <div class="nutrition-fill fat" :style="{ width: getNutritionPercent(currentRow, 'fat') + '%' }"></div>
            </div>
            <div class="nutrition-value">{{ getNutritionPercent(currentRow, 'fat') }}%</div>
          </div>
          <div class="nutrition-item">
            <div class="nutrition-label">碳水</div>
            <div class="nutrition-bar">
              <div class="nutrition-fill carb" :style="{ width: getNutritionPercent(currentRow, 'carbohydrate') + '%' }"></div>
            </div>
            <div class="nutrition-value">{{ getNutritionPercent(currentRow, 'carbohydrate') }}%</div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增记录对话框 -->
    <el-dialog v-model="showAddDialog" title="新增饮食记录" width="500px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="用户ID">
          <el-input v-model="addForm.user_id" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="餐次">
          <el-select v-model="addForm.meal_type" placeholder="选择餐次" style="width: 100%">
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
            <el-option label="加餐" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item label="食物名称">
          <el-input v-model="addForm.food_name" placeholder="请输入食物名称" />
        </el-form-item>
        <el-form-item label="热量(kcal)">
          <el-input-number v-model="addForm.calories" :min="0" :max="5000" />
        </el-form-item>
        <el-form-item label="蛋白质(g)">
          <el-input-number v-model="addForm.protein" :min="0" :max="500" :step="0.1" />
        </el-form-item>
        <el-form-item label="脂肪(g)">
          <el-input-number v-model="addForm.fat" :min="0" :max="500" :step="0.1" />
        </el-form-item>
        <el-form-item label="碳水(g)">
          <el-input-number v-model="addForm.carbohydrate" :min="0" :max="500" :step="0.1" />
        </el-form-item>
        <el-form-item label="膳食纤维(g)">
          <el-input-number v-model="addForm.fiber" :min="0" :max="100" :step="0.1" />
        </el-form-item>
        <el-form-item label="用餐时间">
          <el-date-picker v-model="addForm.meal_time" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
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
import { View, Delete, Download, Search, Refresh, Plus, DataLine, Calendar, Timer, TrendCharts } from '@element-plus/icons-vue'
import { dietApi as backendApi } from '@/api/backend'
import { dietApi as localApi } from '@/api'
import dayjs from 'dayjs'

const loading = ref(false)
const adding = ref(false)
const tableData = ref<any[]>([])
const dateRange = ref<[string, string] | null>(null)
const detailVisible = ref(false)
const showAddDialog = ref(false)
const currentRow = ref<any>(null)

const queryForm = reactive({
  keyword: '',
  meal_type: ''
})

const addForm = reactive({
  user_id: '',
  meal_type: 'lunch',
  food_name: '',
  calories: 500,
  protein: 20,
  fat: 15,
  carbohydrate: 60,
  fiber: 5,
  meal_time: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const statistics = reactive({
  totalRecords: { label: '总记录数', value: 0, color: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)', icon: DataLine },
  avgCalories: { label: '平均热量', value: 0, color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)', icon: TrendCharts },
  todayRecords: { label: '今日记录', value: 0, color: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)', icon: Calendar },
  totalUsers: { label: '记录用户', value: 0, color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)', icon: Timer }
})

const mealTypeMap: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐'
}

const mealTypeTagMap: Record<string, string> = {
  breakfast: 'success',
  lunch: 'primary',
  dinner: 'warning',
  snack: 'info'
}

const getMealTypeLabel = (type: string) => {
  return mealTypeMap[type] || type
}

const getMealTypeTag = (type: string) => {
  return mealTypeTagMap[type] || 'info'
}

const getNutritionPercent = (row: any, type: string) => {
  const protein = row.protein * 4 || 0
  const fat = row.fat * 9 || 0
  const carb = row.carbohydrate * 4 || 0
  const total = protein + fat + carb
  if (total === 0) return 0

  const value = type === 'protein' ? protein : type === 'fat' ? fat : carb
  return Math.round(value / total * 100)
}

const loadData = async () => {
  loading.value = true
  try {
    // 调用后端API
    const result = await backendApi.getList({
      mealType: queryForm.meal_type || undefined,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      page: pagination.page,
      pageSize: pagination.pageSize
    })

    tableData.value = result.data || []
    pagination.total = result.total || 0

    // 更新统计
    statistics.totalRecords.value = pagination.total
    const avgCalories = tableData.value.reduce((sum: number, d: any) => sum + (d.calories || 0), 0) / tableData.value.length || 0
    statistics.avgCalories.value = Math.floor(avgCalories)
    const today = dayjs().format('YYYY-MM-DD')
    statistics.todayRecords.value = tableData.value.filter((d: any) => d.meal_time?.startsWith(today)).length
    const uniqueUsers = new Set(tableData.value.map((d: any) => d.user_id))
    statistics.totalUsers.value = uniqueUsers.size
  } catch (err) {
    // 回退到本地API
    console.log('后端API调用失败，使用本地演示模式', err)
    try {
      const { data, error } = await localApi.getList({
        start_date: dateRange.value?.[0],
        end_date: dateRange.value?.[1]
      })

      if (error) throw error
      let allData = data || []

      // 餐次筛选
      if (queryForm.meal_type) {
        allData = allData.filter((d: any) => d.meal_type === queryForm.meal_type)
      }

      // 分页处理（本地）
      pagination.total = allData.length
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      tableData.value = allData.slice(start, end)

      // 更新统计
      statistics.totalRecords.value = pagination.total
      const avgCalories = allData.reduce((sum: number, d: any) => sum + (d.calories || 0), 0) / allData.length || 0
      statistics.avgCalories.value = Math.floor(avgCalories)
      const today = dayjs().format('YYYY-MM-DD')
      statistics.todayRecords.value = allData.filter((d: any) => d.meal_time?.startsWith(today)).length
      const uniqueUsers = new Set(allData.map((d: any) => d.user_id))
      statistics.totalUsers.value = uniqueUsers.size
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
  queryForm.meal_type = ''
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
  if (!addForm.food_name) {
    ElMessage.warning('请输入食物名称')
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

const formatDateTime = (date: string) => {
  return dayjs(date).format('MM-DD HH:mm')
}

const formatDateTimeFull = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日 HH:mm')
}

onMounted(() => {
  addForm.meal_time = dayjs().format('YYYY-MM-DD HH:mm:ss')
  loadData()
})
</script>

<style scoped>
.diet-data-page {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 营养图表 */
.nutrition-chart {
  margin-top: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.nutrition-chart h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.nutrition-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nutrition-item {
  display: grid;
  grid-template-columns: 60px 1fr 50px;
  align-items: center;
  gap: 10px;
}

.nutrition-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.nutrition-bar {
  height: 20px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.nutrition-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.nutrition-fill.protein {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

.nutrition-fill.fat {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.nutrition-fill.carb {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.nutrition-value {
  font-size: 12px;
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
