// 认证控制器
import { User } from '../models/User.js'
import { generateToken } from '../middlewares/auth.js'
import { SystemLog } from '../models/SystemLog.js'
import { getWechatOpenid } from '../utils/helpers.js'
import { success, error } from '../utils/response.js'

/**
 * 用户注册
 */
export async function register(req, res) {
  try {
    const { phone, password, nickname, gender, birth_date } = req.body

    // 检查手机号是否已注册
    const existingUser = await User.findByPhone(phone)
    if (existingUser) {
      return error(res, 409, '该手机号已注册')
    }

    // 创建用户
    const user = await User.create({
      phone,
      password,
      nickname,
      gender,
      birth_date
    })

    // 生成 token
    const { token, refreshToken } = generateToken(user)

    // 记录日志
    await SystemLog.create({
      user_id: user.id,
      action: 'register',
      resource_type: 'users',
      resource_id: user.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        role: user.role
      },
      token,
      refresh_token: refreshToken
    }, '注册成功')
  } catch (err) {
    return error(res, 500, '注册失败')
  }
}

/**
 * 用户登录
 */
export async function login(req, res) {
  try {
    const { phone, password } = req.body

    // 查找用户
    const user = await User.findByPhone(phone)
    if (!user) {
      await SystemLog.create({
        action: 'login',
        status: 'failed',
        error_message: '用户不存在',
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      })
      return error(res, 401, '手机号或密码错误')
    }

    // 验证密码
    const isValid = await User.verifyPassword(user, password)
    if (!isValid) {
      await SystemLog.create({
        user_id: user.id,
        action: 'login',
        status: 'failed',
        error_message: '密码错误',
        ip_address: req.ip,
        user_agent: req.get('user-agent')
      })
      return error(res, 401, '手机号或密码错误')
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return error(res, 403, '账号已被禁用')
    }

    // 生成 token
    const { token, refreshToken } = generateToken(user)

    // 记录日志
    await SystemLog.create({
      user_id: user.id,
      action: 'login',
      resource_type: 'users',
      resource_id: user.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        gender: user.gender,
        role: user.role
      },
      token,
      refresh_token: refreshToken
    }, '登录成功')
  } catch (err) {
    return error(res, 500, '登录失败')
  }
}

/**
 * 微信小程序登录
 */
export async function wxLogin(req, res) {
  try {
    const { code, userInfo } = req.body

    // 调用微信 API 获取 openid
    const wechatData = await getWechatOpenid(code)

    if (wechatData.errcode) {
      return error(res, 400, '微信登录失败: ' + wechatData.errmsg)
    }

    const { openid, session_key } = wechatData

    // 查找或创建用户
    let user = await User.findByOpenid(openid)
    let isNewUser = false

    if (user) {
      // 更新用户信息
      if (userInfo) {
        user = await User.update(user.id, {
          nickname: userInfo.nickName,
          avatar_url: userInfo.avatarUrl,
          gender: userInfo.gender === 1 ? 'male' : userInfo.gender === 2 ? 'female' : null
        })
      }
    } else {
      // 创建新用户
      user = await User.create({
        openid,
        nickname: userInfo?.nickName,
        avatar_url: userInfo?.avatarUrl,
        gender: userInfo?.gender === 1 ? 'male' : userInfo?.gender === 2 ? 'female' : null
      })
      isNewUser = true
    }

    // 生成 token
    const { token, refreshToken } = generateToken(user)

    // 记录日志
    await SystemLog.create({
      user_id: user.id,
      action: 'wx_login',
      resource_type: 'users',
      resource_id: user.id,
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    })

    return success(res, {
      user: {
        id: user.id,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        role: user.role
      },
      token,
      refresh_token: refreshToken,
      is_new_user: isNewUser
    }, '登录成功')
  } catch (err) {
    console.error('WeChat login error:', err)
    return error(res, 500, '微信登录失败')
  }
}

/**
 * 刷新 token
 */
export async function refreshToken(req, res) {
  try {
    const { refresh_token } = req.body

    if (!refresh_token) {
      return error(res, 400, '缺少刷新令牌')
    }

    // 验证 refresh token
    const jwt = await import('jsonwebtoken')
    const { config } = await import('../config/index.js')

    let decoded
    try {
      decoded = jwt.verify(refresh_token, config.jwt.secret)
    } catch (err) {
      return error(res, 401, '刷新令牌无效或已过期')
    }

    if (decoded.type !== 'refresh') {
      return error(res, 401, '无效的刷新令牌类型')
    }

    // 获取用户信息
    const user = await User.findById(decoded.userId)
    if (!user || user.status !== 'active') {
      return error(res, 401, '用户不存在或已被禁用')
    }

    // 生成新的 token
    const { token, refreshToken: newRefreshToken } = generateToken(user)

    return success(res, {
      token,
      refresh_token: newRefreshToken
    }, '令牌刷新成功')
  } catch (err) {
    return error(res, 500, '刷新令牌失败')
  }
}

/**
 * 获取当前用户信息
 */
export async function getMe(req, res) {
  return success(res, {
    id: req.user.id,
    phone: req.user.phone,
    nickname: req.user.nickname,
    avatar_url: req.user.avatar_url,
    gender: req.user.gender,
    birth_date: req.user.birth_date,
    height: req.user.height,
    weight: req.user.weight,
    role: req.user.role
  })
}

/**
 * 登出
 */
export async function logout(req, res) {
  // 记录日志
  await SystemLog.create({
    user_id: req.user.id,
    action: 'logout',
    resource_type: 'users',
    resource_id: req.user.id,
    ip_address: req.ip,
    user_agent: req.get('user-agent')
  })

  return success(res, null, '登出成功')
}
