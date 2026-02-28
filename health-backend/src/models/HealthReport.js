// HealthReport 模型
import { query } from '../config/database.js'

export class HealthReport {
  static async getList(options = {}) {
    const { user_id, report_type, page = 1, pageSize = 20 } = options

    const conditions = []
    const values = []
    let paramIndex = 1

    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`)
      values.push(user_id)
      paramIndex++
    }

    if (report_type) {
      conditions.push(`report_type = $${paramIndex}`)
      values.push(report_type)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    const countResult = await query(`SELECT COUNT(*) FROM health_reports ${whereClause}`, values)
    const total = parseInt(countResult.rows[0].count)

    const dataResult = await query(
      `SELECT * FROM health_reports ${whereClause} ORDER BY generated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, pageSize, offset]
    )

    return { data: dataResult.rows, total, page, pageSize }
  }

  static async findById(id) {
    const result = await query('SELECT * FROM health_reports WHERE id = $1', [id])
    return result.rows[0]
  }

  static async create(data) {
    const { user_id, report_type, report_period, start_date, end_date, content, file_url } = data

    const result = await query(
      `INSERT INTO health_report (user_id, report_type, report_period, start_date, end_date, content, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, report_type, report_period, start_date, end_date, content, file_url]
    )

    return result.rows[0]
  }

  static async delete(id) {
    const result = await query('DELETE FROM health_reports WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }

  /**
   * 生成报告内容
   */
  static async generateContent(userId, reportType, startDate, endDate) {
    // 获取用户信息
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId])
    const user = userResult.rows[0]

    // 获取健康数据
    const healthResult = await query(
      `SELECT * FROM health_data WHERE user_id = $1 AND recorded_at >= $2 AND recorded_at <= $3 ORDER BY recorded_at ASC`,
      [userId, startDate, endDate]
    )

    // 获取运动数据
    const exerciseResult = await query(
      `SELECT * FROM exercise_data WHERE user_id = $1 AND exercise_date >= $2 AND exercise_date <= $3 ORDER BY exercise_date ASC`,
      [userId, startDate, endDate]
    )

    // 获取睡眠数据
    const sleepResult = await query(
      `SELECT * FROM sleep_data WHERE user_id = $1 AND sleep_date >= $2 AND sleep_date <= $3 ORDER BY sleep_date ASC`,
      [userId, startDate, endDate]
    )

    // 获取饮食数据
    const dietResult = await query(
      `SELECT * FROM diet_data WHERE user_id = $1 AND meal_time >= $2 AND meal_time <= $3 ORDER BY meal_time ASC`,
      [userId, startDate, endDate]
    )

    // 生成报告内容
    const content = {
      user: {
        nickname: user.nickname,
        gender: user.gender,
        height: user.height,
        weight: user.weight
      },
      summary: {
        health_records: healthResult.rowCount,
        exercise_days: exerciseResult.rowCount,
        sleep_records: sleepResult.rowCount,
        diet_records: dietResult.rowCount
      },
      health_data: healthResult.rows,
      exercise_data: exerciseResult.rows,
      sleep_data: sleepResult.rows,
      diet_data: dietResult.rows
    }

    return content
  }
}
