// SleepData 模型
import { query } from '../config/database.js'

export class SleepData {
  static async getList(options = {}) {
    const { user_id, start_date, end_date, page = 1, pageSize = 20 } = options

    const conditions = []
    const values = []
    let paramIndex = 1

    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`)
      values.push(user_id)
      paramIndex++
    }

    if (start_date) {
      conditions.push(`sleep_date >= $${paramIndex}`)
      values.push(start_date)
      paramIndex++
    }

    if (end_date) {
      conditions.push(`sleep_date <= $${paramIndex}`)
      values.push(end_date)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    const countResult = await query(`SELECT COUNT(*) FROM sleep_data ${whereClause}`, values)
    const total = parseInt(countResult.rows[0].count)

    const dataResult = await query(
      `SELECT * FROM sleep_data ${whereClause} ORDER BY sleep_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, pageSize, offset]
    )

    return { data: dataResult.rows, total, page, pageSize }
  }

  static async create(data) {
    const { user_id, sleep_date, sleep_duration, deep_sleep_duration, light_sleep_duration, rem_sleep_duration, sleep_quality, sleep_cycles } = data

    const result = await query(
      `INSERT INTO sleep_data (user_id, sleep_date, sleep_duration, deep_sleep_duration, light_sleep_duration, rem_sleep_duration, sleep_quality, sleep_cycles)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, sleep_date)
       DO UPDATE SET sleep_duration = EXCLUDED.sleep_duration,
                     deep_sleep_duration = EXCLUDED.deep_sleep_duration,
                     light_sleep_duration = EXCLUDED.light_sleep_duration,
                     rem_sleep_duration = EXCLUDED.rem_sleep_duration,
                     sleep_quality = EXCLUDED.sleep_quality,
                     sleep_cycles = EXCLUDED.sleep_cycles
       RETURNING *`,
      [user_id, sleep_date, sleep_duration || 0, deep_sleep_duration || 0, light_sleep_duration || 0, rem_sleep_duration || 0, sleep_quality, sleep_cycles]
    )

    return result.rows[0]
  }

  static async findById(id) {
    const result = await query('SELECT * FROM sleep_data WHERE id = $1', [id])
    return result.rows[0]
  }

  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    for (const field of ['sleep_duration', 'deep_sleep_duration', 'light_sleep_duration', 'rem_sleep_duration', 'sleep_quality', 'sleep_cycles']) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`)
        values.push(data[field])
        paramIndex++
      }
    }

    if (fields.length === 0) return await this.findById(id)

    values.push(id)

    const result = await query(
      `UPDATE sleep_data SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return result.rows[0]
  }

  static async delete(id) {
    const result = await query('DELETE FROM sleep_data WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }
}
