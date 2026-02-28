// SystemLog 模型
import { query } from '../config/database.js'

export class SystemLog {
  /**
   * 创建日志
   */
  static async create(data) {
    const { user_id, action, resource_type, resource_id, ip_address, user_agent, status, error_message } = data

    const result = await query(
      `INSERT INTO system_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, status, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, action, resource_type, resource_id, ip_address, user_agent, status || 'success', error_message]
    )

    return result.rows[0]
  }

  /**
   * 获取日志列表
   */
  static async getList(options = {}) {
    const { user_id, action, status, start_date, end_date, page = 1, pageSize = 20 } = options

    const conditions = []
    const values = []
    let paramIndex = 1

    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`)
      values.push(user_id)
      paramIndex++
    }

    if (action) {
      conditions.push(`action = $${paramIndex}`)
      values.push(action)
      paramIndex++
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (start_date) {
      conditions.push(`created_at >= $${paramIndex}`)
      values.push(start_date)
      paramIndex++
    }

    if (end_date) {
      conditions.push(`created_at <= $${paramIndex}`)
      values.push(end_date)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    const countResult = await query(`SELECT COUNT(*) FROM system_logs ${whereClause}`, values)
    const total = parseInt(countResult.rows[0].count)

    const dataResult = await query(
      `SELECT s.*, u.phone, u.nickname
       FROM system_logs s
       LEFT JOIN users u ON s.user_id = u.id
       ${whereClause}
       ORDER BY s.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, pageSize, offset]
    )

    return { data: dataResult.rows, total, page, pageSize }
  }
}
