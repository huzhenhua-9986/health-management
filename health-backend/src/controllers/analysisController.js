// 数据分析控制器
import { query } from '../config/database.js'
import { success, error } from '../utils/response.js'

/**
 * 数据类型映射配置
 */
const DATA_TYPE_CONFIG = {
  steps: {
    table: 'exercise_data',
    valueColumn: 'steps',
    dateColumn: 'exercise_date',
    unit: '步',
    name: '步数'
  },
  sleep: {
    table: 'sleep_data',
    valueColumn: 'sleep_duration',
    dateColumn: 'sleep_date',
    unit: '秒',
    name: '睡眠时长',
    displayUnit: '小时',
    convertFn: (v) => (v / 3600).toFixed(1)
  },
  calories: {
    table: 'exercise_data',
    valueColumn: 'calories',
    dateColumn: 'exercise_date',
    unit: '千卡',
    name: '消耗热量'
  },
  distance: {
    table: 'exercise_data',
    valueColumn: 'distance',
    dateColumn: 'exercise_date',
    unit: '公里',
    name: '运动距离'
  },
  weight: {
    table: 'health_data',
    valueColumn: 'data_value',
    dateColumn: 'recorded_at',
    unit: 'kg',
    name: '体重',
    where: "data_type = 'weight'"
  },
  bloodPressure: {
    table: 'health_data',
    valueColumn: 'data_value',
    dateColumn: 'recorded_at',
    unit: 'mmHg',
    name: '血压',
    where: "data_type IN ('blood_pressure_systolic', 'blood_pressure_diastolic')",
    isAggregate: true
  },
  heartRate: {
    table: 'health_data',
    valueColumn: 'data_value',
    dateColumn: 'recorded_at',
    unit: 'bpm',
    name: '心率',
    where: "data_type = 'heart_rate'"
  },
  bloodSugar: {
    table: 'health_data',
    valueColumn: 'data_value',
    dateColumn: 'recorded_at',
    unit: 'mmol/L',
    name: '血糖',
    where: "data_type = 'blood_sugar'"
  }
}

/**
 * 获取趋势数据
 * GET /api/analysis/trend
 */
export async function getTrend(req, res) {
  try {
    const { type = 'steps', days = 7, userId } = req.query
    const daysNum = Math.min(Math.max(parseInt(days) || 7, 1), 365)

    const config = DATA_TYPE_CONFIG[type]
    if (!config) {
      return error(res, 400, `不支持的数据类型: ${type}`)
    }

    let whereClause = `${config.dateColumn} >= CURRENT_DATE - INTERVAL '1 day' * $1`
    const queryParams = [daysNum]
    let paramIndex = 2

    if (userId) {
      whereClause += ` AND user_id = $${paramIndex}`
      queryParams.push(userId)
      paramIndex++
    }

    if (config.where) {
      whereClause += ` AND ${config.where}`
    }

    const sql = `
      SELECT
        DATE(${config.dateColumn}) as date,
        ${config.valueColumn} as value
      FROM ${config.table}
      WHERE ${whereClause}
      ORDER BY date
    `

    const result = await query(sql, queryParams)

    // 处理数据
    const dataMap = new Map()
    result.rows.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0].slice(5) // MM-DD
      if (!dataMap.has(dateStr)) {
        dataMap.set(dateStr, [])
      }
      const val = parseFloat(row.value)
      if (!isNaN(val)) {
        dataMap.get(dateStr).push(val)
      }
    })

    // 生成日期和值数组
    const dates = []
    const values = []

    for (let i = daysNum - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(5, 10) // MM-DD
      dates.push(dateStr)

      if (dataMap.has(dateStr)) {
        const dayValues = dataMap.get(dateStr)
        // 使用平均值
        const avg = dayValues.reduce((a, b) => a + b, 0) / dayValues.length
        values.push(config.convertFn ? parseFloat(config.convertFn(avg)) : Math.round(avg))
      } else {
        values.push(0)
      }
    }

    // 计算统计数据
    const nonZeroValues = values.filter(v => v > 0)
    const avg = nonZeroValues.length > 0
      ? (nonZeroValues.reduce((a, b) => a + b, 0) / nonZeroValues.length).toFixed(1)
      : 0
    const max = nonZeroValues.length > 0 ? Math.max(...nonZeroValues) : 0
    const min = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0

    return success(res, {
      type,
      unit: config.displayUnit || config.unit,
      dates,
      values,
      avg: parseFloat(avg),
      max,
      min
    })
  } catch (err) {
    console.error('获取趋势数据失败:', err)
    return error(res, 500, '获取趋势数据失败')
  }
}

/**
 * 获取对比数据
 * GET /api/analysis/compare
 */
export async function getCompare(req, res) {
  try {
    const { types, days = 7 } = req.query

    if (!types) {
      return error(res, 400, '请指定要对比的数据类型')
    }

    const typesArray = Array.isArray(types) ? types : types.split(',')
    const daysNum = Math.min(Math.max(parseInt(days) || 7, 1), 365)

    // 生成日期标签
    const dates = []
    for (let i = daysNum - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().slice(5, 10)) // MM-DD
    }

    // 获取每种类型的数据
    const series = []
    for (const type of typesArray) {
      const config = DATA_TYPE_CONFIG[type]
      if (!config) continue

      const result = await query(`
        SELECT
          DATE(${config.dateColumn}) as date,
          AVG(${config.valueColumn}) as avg_value
        FROM ${config.table}
        WHERE ${config.dateColumn} >= CURRENT_DATE - INTERVAL '1 day' * $1
        ${config.where ? `AND ${config.where}` : ''}
        GROUP BY DATE(${config.dateColumn})
        ORDER BY date
      `, [daysNum])

      const dataMap = new Map()
      result.rows.forEach(row => {
        const dateStr = row.date.toISOString().slice(5, 10)
        const val = parseFloat(row.avg_value)
        if (!isNaN(val)) {
          let displayVal = val
          if (config.convertFn) {
            displayVal = parseFloat(config.convertFn(val))
          } else if (type === 'steps') {
            displayVal = Math.round(val)
          } else {
            displayVal = parseFloat(val.toFixed(1))
          }
          dataMap.set(dateStr, displayVal)
        }
      })

      const data = dates.map(date => dataMap.get(date) || 0)

      series.push({
        name: config.name,
        data
      })
    }

    return success(res, {
      dates,
      series
    })
  } catch (err) {
    console.error('获取对比数据失败:', err)
    return error(res, 500, '获取对比数据失败')
  }
}

/**
 * 获取分布统计
 * GET /api/analysis/distribution
 */
export async function getDistribution(req, res) {
  try {
    const { type = 'bloodPressure' } = req.query

    let ranges = []
    let labels = []
    let sql = ''

    switch (type) {
      case 'bloodPressure':
        ranges = ['<90', '90-120', '120-140', '>140']
        labels = ['偏低', '正常', '偏高', '高']
        sql = `
          SELECT
            CASE
              WHEN data_value::float < 90 THEN '<90'
              WHEN data_value::float >= 90 AND data_value::float < 120 THEN '90-120'
              WHEN data_value::float >= 120 AND data_value::float < 140 THEN '120-140'
              ELSE '>140'
            END as range,
            COUNT(*) as count
          FROM health_data
          WHERE data_type = 'blood_pressure_systolic'
          GROUP BY range
          ORDER BY range
        `
        break

      case 'heartRate':
        ranges = ['<60', '60-80', '80-100', '>100']
        labels = ['偏低', '正常', '偏高', '过高']
        sql = `
          SELECT
            CASE
              WHEN data_value::float < 60 THEN '<60'
              WHEN data_value::float >= 60 AND data_value::float < 80 THEN '60-80'
              WHEN data_value::float >= 80 AND data_value::float < 100 THEN '80-100'
              ELSE '>100'
            END as range,
            COUNT(*) as count
          FROM health_data
          WHERE data_type = 'heart_rate'
          GROUP BY range
          ORDER BY range
        `
        break

      case 'bloodSugar':
        ranges = ['<3.9', '3.9-6.1', '6.1-7.8', '>7.8']
        labels = ['低血糖', '正常', '偏高', '高血糖']
        sql = `
          SELECT
            CASE
              WHEN data_value::float < 3.9 THEN '<3.9'
              WHEN data_value::float >= 3.9 AND data_value::float < 6.1 THEN '3.9-6.1'
              WHEN data_value::float >= 6.1 AND data_value::float < 7.8 THEN '6.1-7.8'
              ELSE '>7.8'
            END as range,
            COUNT(*) as count
          FROM health_data
          WHERE data_type = 'blood_sugar'
          GROUP BY range
          ORDER BY range
        `
        break

      case 'steps':
        ranges = ['<5000', '5000-8000', '8000-12000', '>12000']
        labels = ['活动不足', '正常', '活跃', '非常活跃']
        sql = `
          SELECT
            CASE
              WHEN steps < 5000 THEN '<5000'
              WHEN steps >= 5000 AND steps < 8000 THEN '5000-8000'
              WHEN steps >= 8000 AND steps < 12000 THEN '8000-12000'
              ELSE '>12000'
            END as range,
            COUNT(*) as count
          FROM exercise_data
          GROUP BY range
          ORDER BY range
        `
        break

      case 'sleep':
        ranges = ['<6', '6-7', '7-8', '>8']
        labels = ['睡眠不足', '正常偏少', '正常', '充足']
        sql = `
          SELECT
            CASE
              WHEN sleep_duration < 21600 THEN '<6'
              WHEN sleep_duration >= 21600 AND sleep_duration < 25200 THEN '6-7'
              WHEN sleep_duration >= 25200 AND sleep_duration < 28800 THEN '7-8'
              ELSE '>8'
            END as range,
            COUNT(*) as count
          FROM sleep_data
          GROUP BY range
          ORDER BY range
        `
        break

      default:
        return error(res, 400, `不支持的分布类型: ${type}`)
    }

    const result = await query(sql)

    // 确保所有范围都有数据（没有数据的设为0）
    const countMap = new Map()
    result.rows.forEach(row => {
      countMap.set(row.range, parseInt(row.count))
    })

    const counts = ranges.map(range => countMap.get(range) || 0)

    return success(res, {
      ranges,
      counts,
      labels
    })
  } catch (err) {
    console.error('获取分布统计失败:', err)
    return error(res, 500, '获取分布统计失败')
  }
}
