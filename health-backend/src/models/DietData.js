// DietData 模型
import { query } from '../config/database.js'

export class DietData {
  static async getList(options = {}) {
    const { user_id, meal_type, start_date, end_date, page = 1, pageSize = 20 } = options

    const conditions = []
    const values = []
    let paramIndex = 1

    if (user_id) {
      conditions.push(`user_id = $${paramIndex}`)
      values.push(user_id)
      paramIndex++
    }

    if (meal_type) {
      conditions.push(`meal_type = $${paramIndex}`)
      values.push(meal_type)
      paramIndex++
    }

    if (start_date) {
      conditions.push(`meal_time >= $${paramIndex}`)
      values.push(start_date)
      paramIndex++
    }

    if (end_date) {
      conditions.push(`meal_time <= $${paramIndex}`)
      values.push(end_date)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    const countResult = await query(`SELECT COUNT(*) FROM diet_data ${whereClause}`, values)
    const total = parseInt(countResult.rows[0].count)

    const dataResult = await query(
      `SELECT * FROM diet_data ${whereClause} ORDER BY meal_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, pageSize, offset]
    )

    return { data: dataResult.rows, total, page, pageSize }
  }

  static async create(data) {
    const { user_id, meal_type, food_name, calories, protein, fat, carbohydrate, fiber, meal_time } = data

    const result = await query(
      `INSERT INTO diet_data (user_id, meal_type, food_name, calories, protein, fat, carbohydrate, fiber, meal_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user_id, meal_type, food_name, calories, protein, fat, carbohydrate, fiber, meal_time || new Date()]
    )

    return result.rows[0]
  }

  static async findById(id) {
    const result = await query('SELECT * FROM diet_data WHERE id = $1', [id])
    return result.rows[0]
  }

  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    for (const field of ['meal_type', 'food_name', 'calories', 'protein', 'fat', 'carbohydrate', 'fiber', 'meal_time']) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`)
        values.push(data[field])
        paramIndex++
      }
    }

    if (fields.length === 0) return await this.findById(id)

    values.push(id)

    const result = await query(
      `UPDATE diet_data SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return result.rows[0]
  }

  static async delete(id) {
    const result = await query('DELETE FROM diet_data WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }
}
