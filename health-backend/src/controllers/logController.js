// 系统日志控制器
import { SystemLog } from '../models/SystemLog.js'
import { success, error, paginated } from '../utils/response.js'

/**
 * 获取日志列表
 */
export async function getList(req, res) {
  try {
    // 只有管理员可以查看所有日志
    const user_id = req.user.role === 'admin' ? req.query.user_id : req.user.id

    const { action, status, start_date, end_date, page, page_size } = req.query

    const result = await SystemLog.getList({
      user_id,
      action,
      status,
      start_date,
      end_date,
      page: parseInt(page) || 1,
      pageSize: parseInt(page_size) || 20
    })

    return paginated(res, result.data, result.total, result.page, result.pageSize)
  } catch (err) {
    return error(res, 500, '获取日志失败')
  }
}
