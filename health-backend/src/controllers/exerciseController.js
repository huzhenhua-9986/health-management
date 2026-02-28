// 运动数据控制器
import { ExerciseData } from '../models/ExerciseData.js'
import { SystemLog } from '../models/SystemLog.js'
import { success, error, paginated } from '../utils/response.js'

export async function getList(req, res) {
  try {
    const { start_date, end_date, page, page_size } = req.query
    const user_id = req.user.role === 'admin' && req.query.user_id ? req.query.user_id : req.user.id

    const result = await ExerciseData.getList({
      user_id,
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

export async function create(req, res) {
  try {
    const data = { ...req.body, user_id: req.user.id }
    const record = await ExerciseData.create(data)

    await SystemLog.create({
      user_id: req.user.id,
      action: 'create',
      resource_type: 'exercise_data',
      resource_id: record.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, record, '创建成功', 201)
  } catch (err) {
    return error(res, 500, '创建失败')
  }
}

export async function getOne(req, res) {
  try {
    const record = await ExerciseData.findById(req.params.id)
    if (!record) return error(res, 404, '数据不存在')
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) return error(res, 403, '无权访问')
    return success(res, record)
  } catch (err) {
    return error(res, 500, '获取失败')
  }
}

export async function update(req, res) {
  try {
    const record = await ExerciseData.findById(req.params.id)
    if (!record) return error(res, 404, '数据不存在')
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) return error(res, 403, '无权修改')

    const updated = await ExerciseData.update(req.params.id, req.body)

    await SystemLog.create({
      user_id: req.user.id,
      action: 'update',
      resource_type: 'exercise_data',
      resource_id: req.params.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, updated, '更新成功')
  } catch (err) {
    return error(res, 500, '更新失败')
  }
}

export async function remove(req, res) {
  try {
    const record = await ExerciseData.findById(req.params.id)
    if (!record) return error(res, 404, '数据不存在')
    if (req.user.role !== 'admin' && record.user_id !== req.user.id) return error(res, 403, '无权删除')

    await ExerciseData.delete(req.params.id)

    await SystemLog.create({
      user_id: req.user.id,
      action: 'delete',
      resource_type: 'exercise_data',
      resource_id: req.params.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, null, '删除成功')
  } catch (err) {
    return error(res, 500, '删除失败')
  }
}
