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
 */
export async function getUserActivityTrend(req, res) {
  try {
    const { days = 7 } = req.query

    const result = await query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [days])

    return success(res, result.rows)
  } catch (err) {
    return error(res, 500, '获取活跃度趋势失败')
  }
}

/**
 * 获取数据采集量趋势
 */
export async function getDataCollectionTrend(req, res) {
  try {
    const { days = 7 } = req.query

    const [health, exercise, sleep, diet] = await Promise.all([
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM health_data
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [days]),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM exercise_data
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [days]),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM sleep_data
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [days]),
      query(`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM diet_data
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * $1
        GROUP BY DATE(created_at)
        ORDER BY date
      `, [days])
    ])

    return success(res, {
      health_data: health.rows,
      exercise_data: exercise.rows,
      sleep_data: sleep.rows,
      diet_data: diet.rows
    })
  } catch (err) {
    return error(res, 500, '获取数据趋势失败')
  }
}
