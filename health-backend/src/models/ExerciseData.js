// ExerciseData 模型
import { query } from '../config/database.js'

export class ExerciseData {
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
      conditions.push(`exercise_date >= $${paramIndex}`)
      values.push(start_date)
      paramIndex++
    }

    if (end_date) {
      conditions.push(`exercise_date <= $${paramIndex}`)
      values.push(end_date)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    const countResult = await query(`SELECT COUNT(*) FROM exercise_data ${whereClause}`, values)
    const total = parseInt(countResult.rows[0].count)

    const dataResult = await query(
      `SELECT * FROM exercise_data ${whereClause} ORDER BY exercise_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, pageSize, offset]
    )

    return { data: dataResult.rows, total, page, pageSize }
  }

  static async create(data) {
    const { user_id, steps, distance, calories, duration, exercise_date, device_type } = data

    const result = await query(
      `INSERT INTO exercise_data (user_id, steps, distance, calories, duration, exercise_date, device_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, exercise_date)
       DO UPDATE SET steps = EXCLUDED.steps, distance = EXCLUDED.distance,
                     calories = EXCLUDED.calories, duration = EXCLUDED.duration,
                     device_type = EXCLUDED.device_type
       RETURNING *`,
      [user_id, steps || 0, distance || 0, calories || 0, duration || 0, exercise_date, device_type]
    )

    return result.rows[0]
  }

  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    for (const field of ['steps', 'distance', 'calories', 'duration', 'device_type']) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`)
        values.push(data[field])
        paramIndex++
      }
    }

    if (fields.length === 0) return await this.findById(id)

    values.push(id)

    const result = await query(
      `UPDATE exercise_data SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return result.rows[0]
  }

  static async findById(id) {
    const result = await query('SELECT * FROM exercise_data WHERE id = $1', [id])
    return result.rows[0]
  }

  static async delete(id) {
    const result = await query('DELETE FROM exercise_data WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }
}
