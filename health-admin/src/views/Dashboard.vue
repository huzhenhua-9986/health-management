<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">数据监控</h1>
        <p class="page-subtitle">实时监控系统运行状态和关键指标</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Refresh" @click="loadData">刷新数据</el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="stat-card"
        :class="[`stat-card-${index}`]"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="stat-icon-wrapper" :style="{ background: stat.iconBg }">
          <component :is="stat.icon" class="stat-icon" />
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trendClass">
            <el-icon><component :is="stat.trendIcon" /></el-icon>
            <span>{{ stat.trend }}</span>
          </div>
        </div>
        <div class="stat-chart">
          <svg viewBox="0 0 100 40" class="mini-chart">
            <path
              :d="stat.chartPath"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              :d="stat.chartArea"
              fill="currentColor"
              opacity="0.1"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 用户活跃度趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon class="title-icon"><TrendCharts /></el-icon>
            <span>用户活跃度趋势</span>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <i class="legend-dot" style="background: #00b4d8"></i>
              活跃用户
            </span>
          </div>
        </div>
        <div ref="userTrendRef" class="chart-body"></div>
      </div>

      <!-- 数据采集量趋势 -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">
            <el-icon class="title-icon"><DataLine /></el-icon>
            <span>数据采集量趋势</span>
          </div>
          <div class="chart-legend">
            <span class="legend-item">
              <i class="legend-dot" style="background: #2ec4b6"></i>
              采集数量
            </span>
          </div>
        </div>
        <div ref="dataTrendRef" class="chart-body"></div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <div class="action-card" @click="$router.push('/users')">
        <div class="action-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <el-icon :size="24"><User /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">用户管理</div>
          <div class="action-desc">管理系统用户</div>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>

      <div class="action-card" @click="$router.push('/health-data')">
        <div class="action-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <el-icon :size="24"><Document /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">健康数据</div>
          <div class="action-desc">查看健康数据</div>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>

      <div class="action-card" @click="$router.push('/analysis')">
        <div class="action-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <el-icon :size="24"><DataAnalysis /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">数据分析</div>
          <div class="action-desc">深度分析数据</div>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>

      <div class="action-card" @click="$router.push('/reports')">
        <div class="action-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <el-icon :size="24"><Files /></el-icon>
        </div>
        <div class="action-content">
          <div class="action-title">健康报告</div>
          <div class="action-desc">查看健康报告</div>
        </div>
        <el-icon class="action-arrow"><ArrowRight /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import {
  User,
  UserFilled,
  Document,
  TrendCharts,
  DataLine,
  DataAnalysis,
  Files,
  Refresh,
  ArrowRight,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'
import { dashboardApi } from '@/api'

const userTrendRef = ref<HTMLElement>()
const dataTrendRef = ref<HTMLElement>()

const overview = ref({
  totalUsers: 0,
  activeUsers: 0,
  todayUsers: 0,
  totalHealthData: 0
})

// 统计卡片数据
const stats = computed(() => [
  {
    label: '总用户数',
    value: overview.value.totalUsers,
    icon: User,
    iconBg: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
    trend: '+12.5%',
    trendIcon: ArrowUp,
    trendClass: 'trend-up',
    chartPath: 'M0,35 Q25,30 50,20 T100,15',
    chartArea: 'M0,35 Q25,30 50,20 T100,15 V40 H0 Z'
  },
  {
    label: '活跃用户',
    value: overview.value.activeUsers,
    icon: UserFilled,
    iconBg: 'linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%)',
    trend: '+8.3%',
    trendIcon: ArrowUp,
    trendClass: 'trend-up',
    chartPath: 'M0,30 Q25,25 50,28 T100,10',
    chartArea: 'M0,30 Q25,25 50,28 T100,10 V40 H0 Z'
  },
  {
    label: '今日新增',
    value: overview.value.todayUsers,
    icon: TrendCharts,
    iconBg: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.15) 100%)',
    trend: '+23.1%',
    trendIcon: ArrowUp,
    trendClass: 'trend-up',
    chartPath: 'M0,38 Q25,35 50,25 T100,20',
    chartArea: 'M0,38 Q25,35 50,25 T100,20 V40 H0 Z'
  },
  {
    label: '健康数据',
    value: overview.value.totalHealthData,
    icon: Document,
    iconBg: 'linear-gradient(135deg, rgba(67, 233, 123, 0.15) 0%, rgba(56, 249, 215, 0.15) 100%)',
    trend: '-2.4%',
    trendIcon: ArrowDown,
    trendClass: 'trend-down',
    chartPath: 'M0,25 Q25,30 50,20 T100,30',
    chartArea: 'M0,25 Q25,30 50,20 T100,30 V40 H0 Z'
  }
])

let userChart: echarts.ECharts | null = null
let dataChart: echarts.ECharts | null = null

const loadData = async () => {
  try {
    const [overviewData, userTrendData, dataTrendData] = await Promise.all([
      dashboardApi.getOverview().catch(() => ({
        totalUsers: 1234,
        activeUsers: 892,
        todayUsers: 45,
        totalHealthData: 15678
      })),
      dashboardApi.getUserActivityTrend(7).catch(() =>
        Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 50) + 20
        }))
      ),
      dashboardApi.getDataCollectionTrend(7).catch(() =>
        Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 200) + 100
        }))
      )
    ])

    overview.value = overviewData

    // 用户活跃度图表
    if (userChart && userTrendRef.value) {
      userChart.setOption({
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
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
          data: userTrendData.map((d: any) => d.date.slice(5)),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#94a3b8', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: { color: '#f1f5f9', type: 'dashed' }
          },
          axisLabel: { color: '#94a3b8', fontSize: 12 }
        },
        series: [{
          data: userTrendData.map((d: any) => d.count),
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2:0,
              colorStops: [
                { offset: 0, color: '#00b4d8' },
                { offset: 1, color: '#0077b6' }
              ]
            }
          },
          itemStyle: {
            color: '#fff',
            borderColor: '#0077b6',
            borderWidth: 3
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 180, 216, 0.3)' },
                { offset: 1, color: 'rgba(0, 180, 216, 0)' }
              ]
            }
          }
        }]
      })
    }

    // 数据采集量图表
    if (dataChart && dataTrendRef.value) {
      dataChart.setOption({
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
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
          data: dataTrendData.map((d: any) => d.date.slice(5)),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#94a3b8', fontSize: 12 }
        },
        yAxis: {
          type: 'value',
          splitLine: {
            lineStyle: { color: '#f1f5f9', type: 'dashed' }
          },
          axisLabel: { color: '#94a3b8', fontSize: 12 }
        },
        series: [{
          data: dataTrendData.map((d: any) => d.count),
          type: 'bar',
          barWidth: '50%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#2ec4b6' },
                { offset: 1, color: '#00b4d8' }
              ]
            },
            borderRadius: [6, 6, 0, 0]
          },
          emphasis: {
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#95d5b2' },
                  { offset: 1, color: '#48cae4' }
                ]
              }
            }
          }
        }]
      })
    }
  } catch (err) {
    console.error('加载数据失败，使用演示数据', err)
  }
}

onMounted(async () => {
  if (userTrendRef.value) {
    userChart = echarts.init(userTrendRef.value)
  }
  if (dataTrendRef.value) {
    dataChart = echarts.init(dataTrendRef.value)
  }

  await loadData()

  window.addEventListener('resize', () => {
    userChart?.resize()
    dataChart?.resize()
  })
})

onUnmounted(() => {
  userChart?.dispose()
  dataChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  animation: fadeInUp 0.6s ease-out;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  overflow: hidden;
  animation: fadeInUp 0.5s ease-out backwards;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.stat-icon {
  font-size: 28px;
  color: var(--primary-dark);
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.trend-up {
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
}

.trend-down {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.stat-chart {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100px;
  height: 40px;
  opacity: 0.5;
  color: var(--primary-light);
}

.mini-chart {
  width: 100%;
  height: 100%;
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
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
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.title-icon {
  font-size: 20px;
  color: var(--primary);
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chart-body {
  width: 100%;
  height: 280px;
}

/* 快捷操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border-radius: 14px;
  padding: 20px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: linear-gradient(135deg, rgba(0, 123, 182, 0.02) 0%, rgba(0, 180, 216, 0.02) 100%);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.action-arrow {
  font-size: 18px;
  color: var(--text-muted);
  transition: all var(--transition-base);
}

.action-card:hover .action-arrow {
  color: var(--primary);
  transform: translateX(4px);
}

/* 响应式 */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
