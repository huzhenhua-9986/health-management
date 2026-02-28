// 健康数据控制器
import { HealthData } from '../models/HealthData.js'
import { SystemLog } from '../models/SystemLog.js'
import { success, error, paginated } from '../utils/response.js'

/**
 * 获取健康数据列表
 */
export async function getList(req, res) {
  try {
    const { data_type, start_date, end_date, page, page_size } = req.query

    // 非管理员只能查看自己的数据
    const user_id = req.user.role === 'admin' && req.query.user_id ? req.query.user_id : req.user.id

    const result = await HealthData.getList({
      user_id,
      data_type,
      start_date,
      end_date,
      page: parseInt(page) || 1,
      pageSize: parseInt(page_size) || 20
    })

    return paginated(res, result.data, result.total, result.page, result.pageSize)
  } catch (err) {
    return error(res, 500, '获取数据失败')
  }
}

/**
 * 创建健康数据
 */
export async function create(req, res) {
  try {
    const data = {
      ...req.body,
      user_id: req.user.id
    }

    const record = await HealthData.create(data)

    // 记录日志
    await SystemLog.create({
      user_id: req.user.id,
      action: 'create',
      resource_type: 'health_data',
      resource_id: record.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, record, '创建成功', 201)
  } catch (err) {
    return error(res, 500, '创建失败')
  }
}

/**
 * 获取单条健康数据
 */
export async function getOne(req, res) {
  try {
    const { id } = req.params
    const record = await HealthData.findById(id)

    if (!record) {
      return error(res, 404, '数据不存在')
    }

    // 权限检查
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
      return error(res, 403, '无权访问')
    }

    return success(res, record)
  } catch (err) {
    return error(res, 500, '获取失败')
  }
}

/**
 * 更新健康数据
 */
export async function update(req, res) {
  try {
    const { id } = req.params
    const record = await HealthData.findById(id)

    if (!record) {
      return error(res, 404, '数据不存在')
    }

    // 权限检查
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
      return error(res, 403, '无权修改')
    }

    const updated = await HealthData.update(id, req.body)

    // 记录日志
    await SystemLog.create({
      user_id: req.user.id,
      action: 'update',
      resource_type: 'health_data',
      resource_id: id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, updated, '更新成功')
  } catch (err) {
    return error(res, 500, '更新失败')
  }
}

/**
 * 删除健康数据
 */
export async function remove(req, res) {
  try {
    const { id } = req.params
    const record = await HealthData.findById(id)

    if (!record) {
      return error(res, 404, '数据不存在')
    }

    // 权限检查
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) {
      return error(res, 403, '无权删除')
    }

    await HealthData.delete(id)

    // 记录日志
    await SystemLog.create({
      user_id: req.user.id,
      action: 'delete',
      resource_type: 'health_data',
      resource_id: id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, null, '删除成功')
  } catch (err) {
    return error(res, 500, '删除失败')
  }
}

/**
 * 获取统计数据
 */
export async function getStatistics(req, res) {
  try {
    const { data_type, start_date, end_date } = req.query
    const user_id = req.user.id

    const stats = await HealthData.getStatistics({
      user_id,
      data_type,
      start_date,
      end_date
    })

    return success(res, stats)
  } catch (err) {
    return error(res, 500, '获取统计数据失败')
  }
}

/**
 * 获取趋势数据
 */
export async function getTrends(req, res) {
  try {
    const { data_type, days = 7 } = req.query
    const user_id = req.user.id

    const trends = await HealthData.getTrends({
      user_id,
      data_type,
      days: parseInt(days)
    })

    return success(res, trends)
  } catch (err) {
    return error(res, 500, '获取趋势数据失败')
  }
}
