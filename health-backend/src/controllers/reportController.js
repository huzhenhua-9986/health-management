// 报告控制器
import { HealthReport } from '../models/HealthReport.js'
import { HealthData } from '../models/HealthData.js'
import { ExerciseData } from '../models/ExerciseData.js'
import { SleepData } from '../models/SleepData.js'
import { DietData } from '../models/DietData.js'
import { SystemLog } from '../models/SystemLog.js'
import { User } from '../models/User.js'
import { success, error, paginated } from '../utils/response.js'
import { getDateDaysAgo, calculateBMI } from '../utils/helpers.js'

/**
 * 获取报告列表
 */
export async function getList(req, res) {
  try {
    const { report_type, page, page_size } = req.query
    const user_id = req.user.role === 'admin' && req.query.user_id ? req.query.user_id : req.user.id

    const result = await HealthReport.getList({
      user_id,
      report_type,
      page: parseInt(page) || 1,
      pageSize: parseInt(page_size) || 20
    })

    return paginated(res, result.data, result.total, result.page, result.pageSize)
  } catch (err) {
    return error(res, 500, '获取报告列表失败')
  }
}

/**
 * 生成报告
 */
export async function generate(req, res) {
  try {
    const { report_type, start_date, end_date } = req.body
    const user_id = req.user.id

    // 计算日期范围
    let startDate, endDate, reportPeriod

    if (start_date && end_date) {
      startDate = new Date(start_date)
      endDate = new Date(end_date)
      reportPeriod = `${start_date} 至 ${end_date}`
    } else {
      const now = new Date()
      endDate = now

      if (report_type === 'daily') {
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        reportPeriod = `${startDate.toISOString().split('T')[0]} 日报告`
      } else if (report_type === 'weekly') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        reportPeriod = `${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]} 周报告`
      } else if (report_type === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        reportPeriod = `${now.getFullYear()}年${now.getMonth() + 1}月报告`
      }
    }

    // 获取用户信息
    const user = await User.findById(user_id)

    // 获取各类数据
    const [healthData, exerciseData, sleepData, dietData] = await Promise.all([
      HealthData.getList({ user_id, start_date: startDate.toISOString(), end_date: endDate.toISOString(), page: 1, pageSize: 1000 }),
      ExerciseData.getList({ user_id, start_date: startDate.toISOString().split('T')[0], end_date: endDate.toISOString().split('T')[0], page: 1, pageSize: 1000 }),
      SleepData.getList({ user_id, start_date: startDate.toISOString().split('T')[0], end_date: endDate.toISOString().split('T')[0], page: 1, pageSize: 1000 }),
      DietData.getList({ user_id, start_date: startDate.toISOString(), end_date: endDate.toISOString(), page: 1, pageSize: 1000 })
    ])

    // 计算统计
    const exerciseStats = {
      total_days: exerciseData.data.length,
      total_steps: exerciseData.data.reduce((a, b) => a + (b.steps || 0), 0),
      avg_steps: exerciseData.data.length > 0 ? Math.round(exerciseData.data.reduce((a, b) => a + (b.steps || 0), 0) / exerciseData.data.length) : 0
    }

    const sleepStats = sleepData.data.length > 0 ? {
      avg_duration: Math.round(sleepData.data.reduce((a, b) => a + (b.sleep_duration || 0), 0) / sleepData.data.length / 60),
      avg_quality: Math.round(sleepData.data.reduce((a, b) => a + (b.sleep_quality || 0), 0) / sleepData.data.length * 10) / 10
    } : null

    // 生成报告内容
    const content = {
      user: {
        nickname: user.nickname,
        height: user.height,
        weight: user.weight,
        bmi: user.height && user.weight ? calculateBMI(user.height, user.weight) : null
      },
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      summary: {
        health_records: healthData.data.length,
        exercise_days: exerciseData.data.length,
        sleep_records: sleepData.data.length,
        diet_records: dietData.data.length
      },
      health: {
        records: healthData.data,
        count: healthData.data.length
      },
      exercise: exerciseStats,
      sleep: sleepStats
    }

    // 保存报告
    const report = await HealthReport.create({
      user_id,
      report_type,
      report_period: reportPeriod,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      content
    })

    // 记录日志
    await SystemLog.create({
      user_id,
      action: 'generate_report',
      resource_type: 'health_reports',
      resource_id: report.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, report, '报告生成成功')
  } catch (err) {
    console.error('Generate report error:', err)
    return error(res, 500, '生成报告失败')
  }
}

/**
 * 删除报告
 */
export async function remove(req, res) {
  try {
    const report = await HealthReport.findById(req.params.id)
    if (!report) return error(res, 404, '报告不存在')
    if (req.user.role !== 'admin' && report.user_id !== req.user.id) return error(res, 403, '无权删除')

    await HealthReport.delete(req.params.id)

    await SystemLog.create({
      user_id: req.user.id,
      action: 'delete',
      resource_type: 'health_reports',
      resource_id: req.params.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, null, '删除成功')
  } catch (err) {
    return error(res, 500, '删除失败')
  }
}
