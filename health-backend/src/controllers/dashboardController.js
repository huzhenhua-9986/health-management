// 仪表盘控制器
import { User } from '../models/User.js'
import { HealthData } from '../models/HealthData.js'
import { ExerciseData } from '../models/ExerciseData.js'
import { SleepData } from '../models/SleepData.js'
import { DietData } from '../models/DietData.js'
import { SystemLog } from '../models/SystemLog.js'
import { query } from '../config/database.js'
import { success, error } from '../utils/response.js'
import { getDateDaysAgo } from '../utils/helpers.js'

/**
 * 获取增强的仪表盘统计数据
 * GET /api/dashboard/stats
 */
export async function getStats(req, res) {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // 并行查询所有统计数据
    const [
      totalUsersResult,
      activeUsersResult,
      todayUsersResult,
      totalHealthResult,
      totalExerciseResult,
      totalSleepResult,
      totalDietResult
    ] = await Promise.all([
      // 总用户数
      query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']),
      // 活跃用户数(7天内有登录)
      query(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM system_logs
        WHERE action = 'login'
        AND status = 'success'
        AND created_at >= $1
      `, [sevenDaysAgo]),
      // 今日新增用户
      query('SELECT COUNT(*) FROM users WHERE created_at >= $1 AND role = $2', [todayStart, 'user']),
      // 健康数据总数
      query('SELECT COUNT(*) FROM health_data'),
      // 运动数据总数
      query('SELECT COUNT(*) FROM exercise_data'),
      // 睡眠数据总数
      query('SELECT COUNT(*) FROM sleep_data'),
      // 饮食记录总数
      query('SELECT COUNT(*) FROM diet_data')
    ])

    return success(res, {
      totalUsers: parseInt(totalUsersResult.rows[0].count),
      activeUsers: parseInt(activeUsersResult.rows[0].count),
      todayUsers: parseInt(todayUsersResult.rows[0].count),
      totalHealth: parseInt(totalHealthResult.rows[0].count),
      totalExercise: parseInt(totalExerciseResult.rows[0].count),
      totalSleep: parseInt(totalSleepResult.rows[0].count),
      totalDiet: parseInt(totalDietResult.rows[0].count)
    })
  } catch (err) {
    console.error('获取统计数据失败:', err)
    return error(res, 500, '获取统计数据失败')
  }
}

/**
 * 获取概览数据
 */
export async function getOverview(req, res) {
  try {
    // 获取用户统计
    const userStats = await User.getStatistics()

    // 获取最近7天的数据统计
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [healthCount, exerciseCount, sleepCount, dietCount] = await Promise.all([
      query('SELECT COUNT(*) FROM health_data WHERE created_at >= $1', [weekAgo]),
      query('SELECT COUNT(*) FROM exercise_data WHERE created_at >= $1', [weekAgo]),
      query('SELECT COUNT(*) FROM sleep_data WHERE created_at >= $1', [weekAgo]),
      query('SELECT COUNT(*) FROM diet_data WHERE created_at >= $1', [weekAgo])
    ])

    return success(res, {
      users: userStats,
      data_this_week: {
        health_records: parseInt(healthCount.rows[0].count),
        exercise_days: parseInt(exerciseCount.rows[0].count),
        sleep_records: parseInt(sleepCount.rows[0].count),
        diet_records: parseInt(dietCount.rows[0].count)
      }
    })
  } catch (err) {
    return error(res, 500, '获取概览数据失败')
  }
}

/**
 * 获取用户活跃度趋势
 * GET /api/dashboard/user-trend?days=7
 */
export async function getUserActivityTrend(req, res) {
  try {
    const { days = 7 } = req.query
    const daysNum = Math.min(Math.max(parseInt(days) || 7, 1), 90) // 限制1-90天

    const result = await query(`
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as count
      FROM system_logs
      WHERE action = 'login'
      AND status = 'success'
      AND created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [daysNum])

    return success(res, result.rows)
  } catch (err) {
    console.error('获取用户活跃度趋势失败:', err)
    return error(res, 500, '获取用户活跃度趋势失败')
  }
}

/**
 * 获取数据采集量趋势
 * GET /api/dashboard/data-trend?days=7&dataType=all
 */
export async function getDataCollectionTrend(req, res) {
  try {
    const { days = 7, dataType = 'all' } = req.query
    const daysNum = Math.min(Math.max(parseInt(days) || 7, 1), 90) // 限制1-90天

    const validDataTypes = ['all', 'health', 'exercise', 'sleep', 'diet']
    const requestedType = validDataTypes.includes(dataType) ? dataType : 'all'

    // 根据dataType参数决定查询哪些数据
    const queries = []

    if (requestedType === 'all' || requestedType === 'health') {
      queries.push(
        query(`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM health_data
          WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
          GROUP BY DATE(created_at)
          ORDER BY date
        `, [daysNum]).then(r => ({ type: 'health_data', data: r.rows }))
      )
    }

    if (requestedType === 'all' || requestedType === 'exercise') {
      queries.push(
        query(`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM exercise_data
          WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
          GROUP BY DATE(created_at)
          ORDER BY date
        `, [daysNum]).then(r => ({ type: 'exercise_data', data: r.rows }))
      )
    }

    if (requestedType === 'all' || requestedType === 'sleep') {
      queries.push(
        query(`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM sleep_data
          WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
          GROUP BY DATE(created_at)
          ORDER BY date
        `, [daysNum]).then(r => ({ type: 'sleep_data', data: r.rows }))
      )
    }

    if (requestedType === 'all' || requestedType === 'diet') {
      queries.push(
        query(`
          SELECT DATE(created_at) as date, COUNT(*) as count
          FROM diet_data
          WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
          GROUP BY DATE(created_at)
          ORDER BY date
        `, [daysNum]).then(r => ({ type: 'diet_data', data: r.rows }))
      )
    }

    const results = await Promise.all(queries)

    // 组装返回数据
    const responseData = {}
    results.forEach(item => {
      responseData[item.type] = item.data
    })

    return success(res, responseData)
  } catch (err) {
    console.error('获取数据趋势失败:', err)
    return error(res, 500, '获取数据趋势失败')
  }
}
