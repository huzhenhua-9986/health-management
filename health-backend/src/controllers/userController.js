// 用户管理控制器
import { User } from '../models/User.js'
import { SystemLog } from '../models/SystemLog.js'
import { success, error, paginated } from '../utils/response.js'

/**
 * 获取用户列表
 */
export async function getList(req, res) {
  try {
    const { keyword, status, role, page, page_size, sort, order } = req.query

    const result = await User.getList({
      keyword,
      status,
      role,
      page: parseInt(page) || 1,
      pageSize: parseInt(page_size) || 20,
      sortBy: sort || 'created_at',
      sortOrder: order || 'DESC'
    })

    return paginated(res, result.data, result.total, result.page, result.pageSize)
  } catch (err) {
    return error(res, 500, '获取用户列表失败')
  }
}

/**
 * 获取用户详情
 */
export async function getOne(req, res) {
  try {
    const { id } = req.params

    // 权限检查：用户只能查看自己的信息，管理员可以查看所有用户
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return error(res, 403, '无权访问')
    }

    const user = await User.findById(id)
    if (!user) {
      return error(res, 404, '用户不存在')
    }

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user
    return success(res, userWithoutPassword)
  } catch (err) {
    return error(res, 500, '获取用户信息失败')
  }
}

/**
 * 更新用户
 */
export async function update(req, res) {
  try {
    const { id } = req.params

    // 权限检查
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return error(res, 403, '无权修改')
    }

    // 非管理员不能修改 role 和 status
    if (req.user.role !== 'admin') {
      delete req.body.role
      delete req.body.status
    }

    const user = await User.update(id, req.body)

    await SystemLog.create({
      user_id: req.user.id,
      action: 'update',
      resource_type: 'users',
      resource_id: id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    const { password_hash, ...userWithoutPassword } = user
    return success(res, userWithoutPassword, '更新成功')
  } catch (err) {
    return error(res, 500, '更新失败')
  }
}

/**
 * 删除用户
 */
export async function remove(req, res) {
  try {
    const { id } = req.params

    // 只有管理员可以删除用户
    if (req.user.role !== 'admin') {
      return error(res, 403, '需要管理员权限')
    }

    // 不能删除自己
    if (req.user.id === id) {
      return error(res, 400, '不能删除自己的账号')
    }

    const user = await User.delete(id)

    await SystemLog.create({
      user_id: req.user.id,
      action: 'delete',
      resource_type: 'users',
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
 * 批量更新用户状态
 */
export async function batchUpdateStatus(req, res) {
  try {
    const { ids, status } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return error(res, 400, '请选择要更新的用户')
    }

    if (!['active', 'inactive'].includes(status)) {
      return error(res, 400, '无效的状态值')
    }

    // 只有管理员可以批量更新
    if (req.user.role !== 'admin') {
      return error(res, 403, '需要管理员权限')
    }

    // 不能修改自己的状态
    if (ids.includes(req.user.id)) {
      return error(res, 400, '不能修改自己的状态')
    }

    const promises = ids.map(id => User.update(id, { status }))
    await Promise.all(promises)

    await SystemLog.create({
      user_id: req.user.id,
      action: 'batch_update_status',
      resource_type: 'users',
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, { updated: ids.length }, `已更新 ${ids.length} 个用户`)
  } catch (err) {
    return error(res, 500, '批量更新失败')
  }
}

/**
 * 获取用户统计
 */
export async function getStatistics(req, res) {
  try {
    const stats = await User.getStatistics()
    return success(res, stats)
  } catch (err) {
    return error(res, 500, '获取统计数据失败')
  }
}
