// HealthData 模型
import { query } from '../config/database.js'

export class HealthData {
  /**
   * 获取健康数据列表
   */
  static async getList(options = {}) {
    const {
      user_id,
      data_type,
      start_date,
      end_date,
      page = 1,
      pageSize = 20,
      sortBy = 'recorded_at',
      sortOrder = 'DESC'
    } = options

    const conditions = []
    const values = []
    let paramIndex = 1

    // 权限控制：非管理员只能查看自己的数据
    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`)
      values.push(user_id)
      paramIndex++
    }

    if (data_type) {
      conditions.push(`data_type = $${paramIndex}`)
      values.push(data_type)
      paramIndex++
    }

    if (start_date) {
      conditions.push(`recorded_at >= $${paramIndex}`)
      values.push(start_date)
      paramIndex++
    }

    if (end_date) {
      conditions.push(`recorded_at <= $${paramIndex}`)
      values.push(end_date)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) FROM health_data ${whereClause}`,
      values
    )
    const total = parseInt(countResult.rows[0].count)

    // 获取数据
    const dataResult = await query(
      `SELECT h.*, u.phone, u.nickname
       FROM health_data h
       LEFT JOIN users u ON h.user_id = u.id
       ${whereClause}
       ORDER BY h.${sortBy} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, pageSize, offset]
    )

    return {
      data: dataResult.rows,
      total,
      page,
      pageSize
    }
  }

  /**
   * 通过 ID 获取单条数据
   */
  static async findById(id) {
    const result = await query(
      'SELECT * FROM health_data WHERE id = $1',
      [id]
    )
    return result.rows[0]
  }

  /**
   * 创建健康数据
   */
  static async create(data) {
    const { user_id, data_type, data_value, unit, recorded_at, source, notes } = data

    const result = await query(
      `INSERT INTO health_data (user_id, data_type, data_value, unit, recorded_at, source, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, data_type, data_value, unit, recorded_at || new Date(), source || 'manual', notes]
    )

    return result.rows[0]
  }

  /**
   * 更新健康数据
   */
  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    const allowedFields = ['data_value', 'unit', 'recorded_at', 'source', 'notes']

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`)
        values.push(data[field])
        paramIndex++
      }
    }

    if (fields.length === 0) {
      return await this.findById(id)
    }

    values.push(id)

    const result = await query(
      `UPDATE health_data SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return result.rows[0]
  }

  /**
   * 删除健康数据
   */
  static async delete(id) {
    const result = await query('DELETE FROM health_data WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }

  /**
   * 获取健康数据统计
   */
  static async getStatistics(options = {}) {
    const { user_id, data_type, start_date, end_date } = options

    const conditions = ['user_id = $1']
    const values = [user_id]
    let paramIndex = 2

    if (data_type) {
      conditions.push(`data_type = $${paramIndex}`)
      values.push(data_type)
      paramIndex++
    }

    if (start_date) {
      conditions.push(`recorded_at >= $${paramIndex}`)
      values.push(start_date)
      paramIndex++
    }

    if (end_date) {
      conditions.push(`recorded_at <= $${paramIndex}`)
      values.push(end_date)
      paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    const result = await query(
      `SELECT
        data_type,
        COUNT(*) as count,
        AVG(data_value) as average,
        MAX(data_value) as maximum,
        MIN(data_value) as minimum
       FROM health_data
       WHERE ${whereClause}
       GROUP BY data_type`,
      values
    )

    return result.rows
  }

  /**
   * 获取趋势数据
   */
  static async getTrends(options = {}) {
    const { user_id, data_type, days = 7 } = options

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result = await query(
      `SELECT
        DATE(recorded_at) as date,
        data_type,
        AVG(data_value) as value,
        COUNT(*) as count
       FROM health_data
       WHERE user_id = $1
         AND data_type = $2
         AND recorded_at >= $3
       GROUP BY DATE(recorded_at), data_type
       ORDER BY date ASC`,
      [user_id, data_type, startDate.toISOString()]
    )

    return result.rows
  }
}
