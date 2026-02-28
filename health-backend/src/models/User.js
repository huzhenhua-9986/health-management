// User 模型
import { query, transaction } from '../config/database.js'
import bcrypt from 'bcrypt'

export class User {
  /**
   * 通过 ID 查找用户
   */
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0]
  }

  /**
   * 通过手机号查找用户
   */
  static async findByPhone(phone) {
    const result = await query('SELECT * FROM users WHERE phone = $1', [phone])
    return result.rows[0]
  }

  /**
   * 通过 openid 查找用户
   */
  static async findByOpenid(openid) {
    const result = await query('SELECT * FROM users WHERE openid = $1', [openid])
    return result.rows[0]
  }

  /**
   * 创建用户
   */
  static async create(data) {
    const { phone, password, openid, nickname, avatar_url, gender, birth_date, height, weight } = data

    // 哈希密码
    let hashedPassword = null
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    const result = await query(
      `INSERT INTO users (phone, password_hash, openid, nickname, avatar_url, gender, birth_date, height, weight)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [phone, hashedPassword, openid, nickname, avatar_url, gender, birth_date, height, weight]
    )

    return result.rows[0]
  }

  /**
   * 更新用户
   */
  static async update(id, data) {
    const fields = []
    const values = []
    let paramIndex = 1

    const allowedFields = ['nickname', 'avatar_url', 'gender', 'birth_date', 'height', 'weight', 'status', 'role']

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

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    return result.rows[0]
  }

  /**
   * 删除用户
   */
  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id])
    return result.rows[0]
  }

  /**
   * 验证密码
   */
  static async verifyPassword(user, password) {
    if (!user.password_hash) return false
    return await bcrypt.compare(password, user.password_hash)
  }

  /**
   * 获取用户列表
   */
  static async getList(options = {}) {
    const { page = 1, pageSize = 20, keyword, status, role, sortBy = 'created_at', sortOrder = 'DESC' } = options

    const conditions = []
    const values = []
    let paramIndex = 1

    if (keyword) {
      conditions.push(`(phone ILIKE $${paramIndex} OR nickname ILIKE $${paramIndex})`)
      values.push(`%${keyword}%`)
      paramIndex++
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`)
      values.push(status)
      paramIndex++
    }

    if (role) {
      conditions.push(`role = $${paramIndex}`)
      values.push(role)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const offset = (page - 1) * pageSize

    // 获取总数
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    )
    const total = parseInt(countResult.rows[0].count)

    // 获取数据
    const dataResult = await query(
      `SELECT * FROM users ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
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
   * 获取用户统计
   */
  static async getStatistics() {
    const [totalResult, activeResult, todayResult] = await Promise.all([
      query('SELECT COUNT(*) FROM users'),
      query("SELECT COUNT(*) FROM users WHERE status = 'active'"),
      query('SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE')
    ])

    return {
      total: parseInt(totalResult.rows[0].count),
      active: parseInt(activeResult.rows[0].count),
      today: parseInt(todayResult.rows[0].count)
    }
  }
}
