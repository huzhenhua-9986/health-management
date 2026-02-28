<template>
  <div class="analysis-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">数据分析</h1>
        <p class="page-subtitle">多维度数据分析与可视化展示</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Download" @click="handleExport">导出报表</el-button>
        <el-button :icon="Refresh" @click="loadData">刷新数据</el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryForm" class="query-form">
        <el-form-item label="分析维度">
          <el-select v-model="queryForm.dimension" placeholder="选择维度" style="width: 160px">
            <el-option label="健康数据" value="health" />
            <el-option label="运动数据" value="exercise" />
            <el-option label="睡眠数据" value="sleep" />
            <el-option label="饮食数据" value="diet" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间周期">
          <el-select v-model="queryForm.period" placeholder="选择周期" style="width: 140px">
            <el-option label="最近7天" value="week" />
            <el-option label="最近30天" value="month" />
            <el-option label="最近90天" value="quarter" />
            <el-option label="最近一年" value="year" />
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
          <el-button type="primary" :icon="Search" @click="handleQuery">分析</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计概览 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, index) in overviewStats" :key="index">
        <div class="stat-icon" :style="{ background: stat.color }">
          <component :is="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trendClass">
            <el-icon><component :is="stat.trendIcon" /></el-icon>
            <span>{{ stat.trend }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 趋势分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon class="title-icon"><TrendCharts /></el-icon>
            <span>数据趋势分析</span>
          </div>
          <el-radio-group v-model="trendDataType" size="small">
            <el-radio-button label="steps">步数</el-radio-button>
            <el-radio-button label="sleep">睡眠</el-radio-button>
            <el-radio-button label="calories">热量</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="trendChartRef" class="chart-body"></div>
      </div>

      <!-- 数据分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon class="title-icon"><PieChart /></el-icon>
            <span>用户数据分布</span>
          </div>
          <el-radio-group v-model="distributionType" size="small">
            <el-radio-button label="age">年龄</el-radio-button>
            <el-radio-button label="gender">性别</el-radio-button>
            <el-radio-button label="activity">活跃度</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="pieChartRef" class="chart-body"></div>
      </div>

      <!-- 对比分析 -->
      <div class="chart-card chart-card-full">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon class="title-icon"><DataLine /></el-icon>
            <span>多指标对比分析</span>
          </div>
        </div>
        <div ref="compareChartRef" class="chart-body"></div>
      </div>

      <!-- 健康指标排行 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon class="title-icon"><Trophy /></el-icon>
            <span>健康指标排行</span>
          </div>
        </div>
        <div class="ranking-list">
          <div class="ranking-item" v-for="(item, index) in rankingData" :key="index">
            <div class="ranking-index" :class="`ranking-${index + 1}`">{{ index + 1 }}</div>
            <div class="ranking-content">
              <div class="ranking-name">{{ item.name }}</div>
              <div class="ranking-bar">
                <div class="ranking-bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
            </div>
            <div class="ranking-value">{{ item.value }}</div>
          </div>
        </div>
      </div>

      <!-- 数据质量分析 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon class="title-icon"><CircleCheck /></el-icon>
            <span>数据质量分析</span>
          </div>
        </div>
        <div class="quality-stats">
          <div class="quality-item">
            <div class="quality-label">
              <span class="quality-dot quality-dot-success"></span>
              正常数据
            </div>
            <div class="quality-value">{{ qualityStats.normal }}</div>
          </div>
          <div class="quality-item">
            <div class="quality-label">
              <span class="quality-dot quality-dot-warning"></span>
              异常数据
            </div>
            <div class="quality-value">{{ qualityStats.abnormal }}</div>
          </div>
          <div class="quality-item">
            <div class="quality-label">
              <span class="quality-dot quality-dot-danger"></span>
              缺失数据
            </div>
            <div class="quality-value">{{ qualityStats.missing }}</div>
          </div>
          <div class="quality-item">
            <div class="quality-label">数据完整率</div>
            <div class="quality-value quality-highlight">{{ qualityStats.completeness }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download,
  Refresh,
  Search,
  TrendCharts,
  PieChart,
  DataLine,
  Trophy,
  CircleCheck,
  ArrowUp,
  ArrowDown,
  User,
  Timer,
  Calendar
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { analysisApi, healthDataStatsApi } from '@/api/backend'

const trendChartRef = ref<HTMLElement>()
const pieChartRef = ref<HTMLElement>()
const compareChartRef = ref<HTMLElement>()

const dateRange = ref<[string, string] | null>(null)
const trendDataType = ref('steps')
const distributionType = ref('age')

const queryForm = reactive({
  dimension: 'health',
  period: 'week'
})

// 概览统计
const overviewStats = ref([
  {
    label: '数据总量',
    value: '12,580',
    icon: DataLine,
    color: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    trend: '+12.5%',
    trendIcon: ArrowUp,
    trendClass: 'trend-up'
  },
  {
    label: '活跃用户',
    value: '892',
    icon: User,
    color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
    trend: '+8.3%',
    trendIcon: ArrowUp,
    trendClass: 'trend-up'
  },
  {
    label: '今日新增',
    value: '156',
    icon: Calendar,
    color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
    trend: '+23.1%',
    trendIcon: ArrowUp,
    trendClass: 'trend-up'
  },
  {
    label: '平均每日',
    value: '458',
    icon: Timer,
    color: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
    trend: '-2.4%',
    trendIcon: ArrowDown,
    trendClass: 'trend-down'
  }
])

// 排行数据
const rankingData = ref([
  { name: '步数达标率', value: '78%', percent: 78 },
  { name: '睡眠充足率', value: '65%', percent: 65 },
  { name: '饮食均衡率', value: '72%', percent: 72 },
  { name: '心率正常率', value: '89%', percent: 89 },
  { name: '体重控制率', value: '56%', percent: 56 }
])

// 数据质量统计
const qualityStats = ref({
  normal: 11850,
  abnormal: 520,
  missing: 210,
  completeness: 98.3
})

let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let compareChart: echarts.ECharts | null = null

// 存储从API获取的真实数据
const trendData = ref<{ dates: string[]; data: number[] } | null>(null)
const compareData = ref<{ dates: string[]; data: any[] } | null>(null)
const distributionDataMap = ref<Record<string, any[]>>({})
const healthStats = ref<any>(null)

// 根据当前类型获取配置
const getTrendConfig = () => {
  switch (trendDataType.value) {
    case 'steps':
      return { name: '步数', unit: '步', color: '#00b4d8' }
    case 'sleep':
      return { name: '睡眠时长', unit: '小时', color: '#7c3aed' }
    case 'calories':
      return { name: '热量摄入', unit: 'kcal', color: '#f59e0b' }
    default:
      return { name: '步数', unit: '步', color: '#00b4d8' }
  }
}

const generateDistributionData = () => {
  switch (distributionType.value) {
    case 'age':
      return [
        { value: 35, name: '18-25岁' },
        { value: 40, name: '26-35岁' },
        { value: 20, name: '36-45岁' },
        { value: 5, name: '46岁以上' }
      ]
    case 'gender':
      return [
        { value: 55, name: '男性' },
        { value: 45, name: '女性' }
      ]
    case 'activity':
      return [
        { value: 30, name: '高活跃' },
        { value: 45, name: '中活跃' },
        { value: 20, name: '低活跃' },
        { value: 5, name: '不活跃' }
      ]
    default:
      return []
  }
}

const updateTrendChart = () => {
  if (!trendChart || !trendChartRef.value) return

  const { name, unit, color } = getTrendConfig()

  // 使用真实API数据或默认空数据
  const dates = trendData.value?.dates || []
  const data = trendData.value?.data || []

  trendChart.setOption({
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#0f172a' },
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;'
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    series: [{
      data,
      type: 'line',
      smooth: true,
      name,
      symbolSize: 8,
      lineStyle: { width: 3, color },
      itemStyle: { color: '#fff', borderColor: color, borderWidth: 3 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: color + '4D' },
            { offset: 1, color: color + '00' }
          ]
        }
      }
    }]
  })
}

const updatePieChart = () => {
  if (!pieChart || !pieChartRef.value) return

  // 使用真实API数据
  const data = distributionDataMap.value[distributionType.value] || generateDistributionData()

  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#0f172a' },
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      textStyle: { color: '#64748b', fontSize: 13 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#0f172a' }
      },
      data,
      color: ['#00b4d8', '#7c3aed', '#f59e0b', '#10b981', '#ef4444']
    }]
  })
}

const updateCompareChart = () => {
  if (!compareChart || !compareChartRef.value) return

  // 使用真实API数据
  const dates = compareData.value?.dates || []
  const data = compareData.value?.data || []

  // 提取各指标数据
  const stepsData = data.map((d: any) => d.steps || 0)
  const sleepData = data.map((d: any) => d.sleep || 0)
  const caloriesData = data.map((d: any) => d.calories || 0)

  compareChart.setOption({
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#0f172a' },
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;'
    },
    legend: {
      data: ['步数', '睡眠', '热量'],
      top: 0,
      textStyle: { color: '#64748b', fontSize: 12 }
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 12 }
    },
    yAxis: [
      {
        type: 'value',
        position: 'left',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 12 }
      },
      {
        type: 'value',
        position: 'right',
        splitLine: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 12 }
      }
    ],
    series: [
      {
        name: '步数',
        type: 'bar',
        data: stepsData,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00b4d8' },
              { offset: 1, color: '#0077b6' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '睡眠',
        type: 'line',
        yAxisIndex: 1,
        data: sleepData,
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2, color: '#7c3aed' },
        itemStyle: { color: '#7c3aed', borderColor: '#fff', borderWidth: 2 }
      },
      {
        name: '热量',
        type: 'line',
        data: caloriesData,
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b', borderColor: '#fff', borderWidth: 2 }
      }
    ]
  })
}

const updateCharts = () => {
  updateTrendChart()
  updatePieChart()
  updateCompareChart()
}

const loadData = async () => {
  try {
    // 并行加载所有数据
    const [trendRes, compareRes, statsRes] = await Promise.allSettled([
      analysisApi.getTrend(trendDataType.value, 7),
      analysisApi.getCompare(['steps', 'sleep', 'calories'], 7),
      healthDataStatsApi.getStats()
    ])

    // 处理趋势数据
    if (trendRes.status === 'fulfilled') {
      trendData.value = trendRes.value
    }

    // 处理对比数据
    if (compareRes.status === 'fulfilled') {
      compareData.value = compareRes.value
    }

    // 处理统计数据
    if (statsRes.status === 'fulfilled') {
      healthStats.value = statsRes.value
      // 更新质量统计
      qualityStats.value = {
        normal: statsRes.value.normal || 0,
        abnormal: statsRes.value.abnormal || 0,
        missing: statsRes.value.missing || 0,
        completeness: statsRes.value.completeness || 0
      }
    }

    // 加载分布数据
    try {
      const distRes = await analysisApi.getDistribution(distributionType.value)
      distributionDataMap.value[distributionType.value] = distRes
    } catch (e) {
      // 分布数据加载失败，使用默认数据
      console.warn('分布数据加载失败，使用默认数据')
    }

    updateCharts()
  } catch (err) {
    console.error('加载数据失败:', err)
    ElMessage.error('加载数据失败')
  }
}

const handleQuery = () => {
  loadData()
}

const handleReset = () => {
  queryForm.dimension = 'health'
  queryForm.period = 'week'
  dateRange.value = null
  loadData()
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 监听趋势数据类型变化，重新加载数据
watch(trendDataType, async () => {
  try {
    const res = await analysisApi.getTrend(trendDataType.value, 7)
    trendData.value = res
    updateTrendChart()
  } catch (err) {
    console.error('加载趋势数据失败:', err)
  }
})

// 监听分布类型变化，重新加载数据
watch(distributionType, async () => {
  try {
    const res = await analysisApi.getDistribution(distributionType.value)
    distributionDataMap.value[distributionType.value] = res
    updatePieChart()
  } catch (err) {
    console.error('加载分布数据失败:', err)
  }
})

onMounted(() => {
  if (trendChartRef.value) trendChart = echarts.init(trendChartRef.value)
  if (pieChartRef.value) pieChart = echarts.init(pieChartRef.value)
  if (compareChartRef.value) compareChart = echarts.init(compareChartRef.value)

  loadData()

  window.addEventListener('resize', () => {
    trendChart?.resize()
    pieChart?.resize()
    compareChart?.resize()
  })
})

onUnmounted(() => {
  trendChart?.dispose()
  pieChart?.dispose()
  compareChart?.dispose()
})
</script>

<style scoped>
.analysis-page {
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

/* 筛选卡片 */
.filter-card {
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
}

.filter-card :deep(.el-card__body) {
  padding: 20px;
}

.query-form :deep(.el-form-item) {
  margin-bottom: 0;
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

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
}

.trend-up {
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
}

.trend-down {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.chart-card {
  background: var(--bg-card);
  border-radius: 14px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.chart-card-full {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  font-size: 18px;
  color: var(--primary);
}

.chart-body {
  width: 100%;
  height: 280px;
}

/* 排行列表 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-index {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.ranking-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
  color: #fff;
}

.ranking-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
  color: #fff;
}

.ranking-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
  color: #fff;
}

.ranking-index:not(.ranking-1):not(.ranking-2):not(.ranking-3) {
  background: #f1f5f9;
  color: #64748b;
}

.ranking-content {
  flex: 1;
}

.ranking-name {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.ranking-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.ranking-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b4d8 0%, #0077b6 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ranking-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  width: 50px;
  text-align: right;
}

/* 数据质量 */
.quality-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.quality-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
}

.quality-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.quality-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.quality-dot-success {
  background: var(--success);
}

.quality-dot-warning {
  background: var(--warning);
}

.quality-dot-danger {
  background: var(--danger);
}

.quality-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.quality-highlight {
  font-size: 26px;
  background: linear-gradient(135deg, #00b4d8 0%, #0077b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 响应式 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
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
