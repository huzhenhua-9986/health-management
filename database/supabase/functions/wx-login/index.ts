// 微信小程序登录 Edge Function
// 处理微信小程序的登录请求

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 微信 API 配置
const WECHAT_API = 'https://api.weixin.qq.com/sns/jscode2session'

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 只接受 POST 请求
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { code, userInfo } = await req.json()

    if (!code) {
      throw new Error('Missing code parameter')
    }

    // 从环境变量获取配置
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const wechatAppId = Deno.env.get('WECHAT_APP_ID')!
    const wechatAppSecret = Deno.env.get('WECHAT_APP_SECRET')!

    // 创建 Supabase 客户端 (使用 service role key)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 步骤 1: 使用 code 换取 session_key 和 openid
    const wechatUrl = `${WECHAT_API}?appid=${wechatAppId}&secret=${wechatAppSecret}&js_code=${code}&grant_type=authorization_code`

    const wechatResponse = await fetch(wechatUrl)
    const wechatData = await wechatResponse.json()

    if (wechatData.errcode) {
      throw new Error(`WeChat API error: ${wechatData.errmsg}`)
    }

    const { openid, session_key } = wechatData

    // 步骤 2: 查找或创建用户
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('openid', openid)
      .single()

    let user
    let isNewUser = false

    if (findError && findError.code !== 'PGRST116') {
      throw findError
    }

    if (existingUser) {
      // 更新用户信息
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (userInfo) {
        if (userInfo.nickName) updateData.nickname = userInfo.nickName
        if (userInfo.avatarUrl) updateData.avatar_url = userInfo.avatarUrl
        if (userInfo.gender) updateData.gender = userInfo.gender === 1 ? 'male' : userInfo.gender === 2 ? 'female' : null
        if (userInfo.country || userInfo.province || userInfo.city) {
          // 可以存储到扩展字段
        }
      }

      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', existingUser.id)
        .select()
        .single()

      if (updateError) throw updateError
      user = updatedUser
    } else {
      // 创建新用户
      const newUser: any = {
        openid,
        status: 'active',
        role: 'user'
      }

      if (userInfo) {
        if (userInfo.nickName) newUser.nickname = userInfo.nickName
        if (userInfo.avatarUrl) newUser.avatar_url = userInfo.avatarUrl
        if (userInfo.gender) newUser.gender = userInfo.gender === 1 ? 'male' : userInfo.gender === 2 ? 'female' : null
      }

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single()

      if (createError) throw createError
      user = createdUser
      isNewUser = true
    }

    // 步骤 3: 创建 Supabase Auth session
    // 由于我们使用自定义的 openid 认证，需要创建一个自定义 token
    // 这里我们使用 Supabase 的 auth.api.signUpWithPassword 或者创建自定义 JWT

    // 简化方案：返回用户信息和用于创建 session 的数据
    // 前端需要使用返回的信息调用 supabase.auth.signIn

    // 记录登录日志
    await supabase.from('system_logs').insert({
      user_id: user.id,
      action: 'wx_login',
      resource_type: 'users',
      resource_id: user.id,
      status: 'success',
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'miniprogram'
    })

    // 步骤 4: 使用 Supabase Auth 创建 session
    // 我们需要创建一个临时的邮箱来使用 Supabase Auth
    const tempEmail = `${user.id}@wx.temp`
    const tempPassword = session_key // 使用 session_key 作为临时密码

    // 尝试登录或注册
    let authSession
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password: tempPassword
    })

    if (signInError || !signInData.session) {
      // 用户不存在，尝试注册
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            user_id: user.id,
            provider: 'wechat'
          }
        }
      })

      if (signUpError) throw signUpError
      authSession = signUpData.session
    } else {
      authSession = signInData.session
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar_url: user.avatar_url,
          gender: user.gender,
          role: user.role
        },
        session: {
          access_token: authSession?.access_token,
          refresh_token: authSession?.refresh_token,
          expires_at: authSession?.expires_at
        },
        is_new_user: isNewUser
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Login error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Login failed'
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
