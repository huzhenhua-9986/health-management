# 健康管理系统 API 文档

本文档描述了健康管理系统的所有 API 接口。

## 目录

1. [概述](#概述)
2. [认证](#认证)
3. [用户管理 API](#用户管理-api)
4. [健康数据 API](#健康数据-api)
5. [运动数据 API](#运动数据-api)
6. [睡眠数据 API](#睡眠数据-api)
7. [饮食数据 API](#饮食数据-api)
8. [健康报告 API](#健康报告-api)
9. [系统日志 API](#系统日志-api)
10. [数据分析 API](#数据分析-api)
11. [Edge Functions](#edge-functions)

---

## 概述

### 基础 URL

```
https://your-project.supabase.co
```

### 认证方式

所有 API 请求需要在 Header 中携带认证令牌：

```
Authorization: Bearer {access_token}
apikey: {your-anon-key}
Content-Type: application/json
```

### 响应格式

成功响应：
```json
{
  "data": { ... },
  "error": null
}
```

错误响应：
```json
{
  "data": null,
  "error": {
    "message": "错误描述",
    "code": "ERROR_CODE"
  }
}
```

---

## 认证

### 微信小程序登录

通过 Edge Function 实现微信小程序登录。

**端点**: `POST /functions/v1/wx-login`

**请求体**:
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL",
    "gender": 1,
    "country": "国家",
    "province": "省份",
    "city": "城市"
  }
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "手机号",
    "nickname": "昵称",
    "avatar_url": "头像URL",
    "gender": "male",
    "role": "user"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_at": 1234567890
  },
  "is_new_user": false
}
```

### 刷新令牌

使用 Supabase Auth 刷新令牌。

**端点**: `POST /auth/v1/token?grant_type=refresh_token`

**请求体**:
```json
{
  "refresh_token": "your-refresh-token"
}
```

---

## 用户管理 API

### 获取用户列表

**端点**: `GET /rest/v1/users`

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| select | string | 选择字段，默认 `*` |
| order | string | 排序字段，如 `created_at.desc` |
| range | string | 分页，如 `0-19` |
| phone | string | 手机号筛选 |
| status | string | 状态筛选：`active`、`inactive` |

**示例**:
```http
GET /rest/v1/users?select=*&order=created_at.desc&range=0-19&status=active
```

**响应**:
```json
[
  {
    "id": "uuid",
    "phone": "13800138000",
    "nickname": "张三",
    "avatar_url": "https://...",
    "gender": "male",
    "birth_date": "1990-01-01",
    "height": 175.5,
    "weight": 70.0,
    "status": "active",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 获取用户详情

**端点**: `GET /rest/v1/users?id=eq.{id}`

**示例**:
```http
GET /rest/v1/users?id=eq.user-uuid&select=*
```

### 更新用户

**端点**: `PATCH /rest/v1/users?id=eq.{id}`

**请求体**:
```json
{
  "nickname": "新昵称",
  "height": 180,
  "weight": 75
}
```

### 删除用户

**端点**: `DELETE /rest/v1/users?id=eq.{id}`

---

## 健康数据 API

### 数据类型

| 类型 | 说明 | 单位 |
|------|------|------|
| blood_pressure_systolic | 收缩压 | mmHg |
| blood_pressure_diastolic | 舒张压 | mmHg |
| blood_sugar | 血糖 | mmol/L |
| heart_rate | 心率 | bpm |
| temperature | 体温 | ℃ |
| weight | 体重 | kg |

### 获取健康数据

**端点**: `GET /rest/v1/health_data`

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | string | 用户ID |
| data_type | string | 数据类型 |
| recorded_at | string | 记录时间，支持范围查询 |
| order | string | 排序 |

**示例**:
```http
GET /rest/v1/health_data?user_id=eq.uuid&data_type=eq.blood_sugar&order=recorded_at.desc
```

### 创建健康数据

**端点**: `POST /rest/v1/health_data`

**请求体**:
```json
{
  "user_id": "user-uuid",
  "data_type": "blood_sugar",
  "data_value": 5.5,
  "unit": "mmol/L",
  "recorded_at": "2024-01-01T08:00:00Z",
  "source": "manual",
  "notes": "空腹血糖"
}
```

### 更新健康数据

**端点**: `PATCH /rest/v1/health_data?id=eq.{id}`

### 删除健康数据

**端点**: `DELETE /rest/v1/health_data?id=eq.{id}`

---

## 运动数据 API

### 获取运动数据

**端点**: `GET /rest/v1/exercise_data`

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | string | 用户ID |
| exercise_date | string | 运动日期 |
| order | string | 排序 |

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| steps | integer | 步数 |
| distance | decimal | 距离（公里） |
| calories | integer | 消耗卡路里 |
| duration | integer | 运动时长（秒） |
| device_type | string | 设备类型 |

### 创建运动数据

**端点**: `POST /rest/v1/exercise_data`

**请求体**:
```json
{
  "user_id": "user-uuid",
  "steps": 10000,
  "distance": 5.5,
  "calories": 350,
  "duration": 3600,
  "exercise_date": "2024-01-01",
  "device_type": "iPhone"
}
```

---

## 睡眠数据 API

### 获取睡眠数据

**端点**: `GET /rest/v1/sleep_data`

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| sleep_date | date | 睡眠日期 |
| sleep_duration | integer | 总睡眠时长（秒） |
| deep_sleep_duration | integer | 深睡时长（秒） |
| light_sleep_duration | integer | 浅睡时长（秒） |
| rem_sleep_duration | integer | 快速眼动时长（秒） |
| sleep_quality | integer | 睡眠质量（1-10） |
| sleep_cycles | integer | 睡眠周期数 |

### 创建睡眠数据

**端点**: `POST /rest/v1/sleep_data`

**请求体**:
```json
{
  "user_id": "user-uuid",
  "sleep_date": "2024-01-01",
  "sleep_duration": 28800,
  "deep_sleep_duration": 7200,
  "light_sleep_duration": 14400,
  "rem_sleep_duration": 3600,
  "sleep_quality": 8,
  "sleep_cycles": 5
}
```

---

## 饮食数据 API

### 获取饮食记录

**端点**: `GET /rest/v1/diet_data`

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| meal_type | string | 餐次：breakfast、lunch、dinner、snack |
| food_name | string | 食物名称 |
| calories | decimal | 卡路里 |
| protein | decimal | 蛋白质（克） |
| fat | decimal | 脂肪（克） |
| carbohydrate | decimal | 碳水化合物（克） |
| fiber | decimal | 纤维（克） |
| meal_time | timestamp | 用餐时间 |

### 创建饮食记录

**端点**: `POST /rest/v1/diet_data`

**请求体**:
```json
{
  "user_id": "user-uuid",
  "meal_type": "breakfast",
  "food_name": "燕麦牛奶",
  "calories": 350,
  "protein": 12,
  "fat": 8,
  "carbohydrate": 55,
  "fiber": 5,
  "meal_time": "2024-01-01T08:00:00Z"
}
```

---

## 健康报告 API

### 获取报告列表

**端点**: `GET /rest/v1/health_reports`

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | string | 用户ID |
| report_type | string | 报告类型：daily、weekly、monthly |

### 生成报告

**端点**: `POST /functions/v1/report-generator`

**请求体**:
```json
{
  "user_id": "user-uuid",
  "report_type": "weekly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "include_sections": ["overview", "health_data", "exercise", "sleep", "diet", "recommendations"]
}
```

**响应**:
```json
{
  "success": true,
  "report": {
    "id": "report-uuid",
    "report_type": "weekly",
    "report_period": "2024-01-01至2024-01-07周报告",
    "content": {
      "user": { "nickname": "张三", "bmi": 22.5 },
      "overview": { ... },
      "health_data": { ... },
      "exercise": { ... },
      "sleep": { ... },
      "diet": { ... },
      "recommendations": [ ... ]
    },
    "generated_at": "2024-01-08T00:00:00Z"
  }
}
```

### 删除报告

**端点**: `DELETE /rest/v1/health_reports?id=eq.{id}`

---

## 系统日志 API

### 获取日志列表

**端点**: `GET /rest/v1/system_logs`

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| user_id | string | 用户ID |
| action | string | 操作类型 |
| status | string | 状态：success、failed |
| created_at | string | 创建时间 |

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| action | string | 操作类型 |
| resource_type | string | 资源类型 |
| resource_id | string | 资源ID |
| ip_address | string | IP地址 |
| user_agent | string | 用户代理 |
| status | string | 状态 |
| error_message | string | 错误信息 |

### 创建日志

系统自动创建，无需手动调用。

---

## 数据分析 API

### 获取趋势数据

**端点**: `POST /functions/v1/health-analysis/trends`

**请求体**:
```json
{
  "user_id": "user-uuid",
  "data_type": "blood_sugar",
  "period": "week"
}
```

**响应**:
```json
{
  "data_type": "blood_sugar",
  "period": "week",
  "data": [
    { "date": "2024-01-01T08:00:00Z", "value": 5.5, "unit": "mmol/L" }
  ],
  "trend": "stable",
  "statistics": {
    "average": 5.8,
    "max": 6.5,
    "min": 5.2,
    "count": 7
  }
}
```

### 获取统计数据

**端点**: `POST /functions/v1/health-analysis/statistics`

**请求体**:
```json
{
  "data_type": "blood_sugar",
  "period": "week",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07"
}
```

### 获取健康评估

**端点**: `POST /functions/v1/health-analysis/assess`

**请求体**:
```json
{
  "user_id": "user-uuid",
  "period": "week"
}
```

**响应**:
```json
{
  "score": 85,
  "level": "excellent",
  "details": []
}
```

### 获取风险预警

**端点**: `POST /functions/v1/health-analysis/risks`

**请求体**:
```json
{
  "user_id": "user-uuid"
}
```

**响应**:
```json
{
  "risks": [
    {
      "type": "blood_pressure_systolic",
      "level": "medium",
      "message": "收缩压平均值略高于正常范围",
      "recommendation": "建议注意监测血压，保持健康生活方式"
    }
  ]
}
```

### 获取健康建议

**端点**: `POST /functions/v1/health-analysis/recommendations`

**请求体**:
```json
{
  "user_id": "user-uuid"
}
```

**响应**:
```json
{
  "recommendations": [
    "运动量偏低，建议增加日常步行，目标每天8000步",
    "保持均衡饮食，多吃蔬菜水果，控制油盐摄入"
  ]
}
```

---

## Edge Functions

### 可用函数

| 函数名 | 端点 | 功能 |
|--------|------|------|
| wx-login | /functions/v1/wx-login | 微信小程序登录 |
| health-analysis | /functions/v1/health-analysis/* | 健康数据分析 |
| report-generator | /functions/v1/report-generator | 健康报告生成 |

### 调用方式

```javascript
// 使用 fetch 调用
const response = await fetch('https://your-project.supabase.co/functions/v1/wx-login', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    code: 'wx-code',
    userInfo: { ... }
  })
})

// 使用 Supabase 客户端调用
const { data, error } = await supabase.functions.invoke('wx-login', {
  body: { code: 'wx-code', userInfo: { ... } }
})
```

---

## 数据视图

### user_statistics

用户统计视图，汇总用户的数据记录数量。

**端点**: `GET /rest/v1/user_statistics`

**响应字段**:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 用户ID |
| phone | string | 手机号 |
| nickname | string | 昵称 |
| register_date | timestamp | 注册日期 |
| health_data_count | integer | 健康数据记录数 |
| exercise_days | integer | 运动记录天数 |
| sleep_records | integer | 睡眠记录数 |
| diet_records | integer | 饮食记录数 |

---

## 错误代码

| HTTP 状态 | 错误代码 | 说明 |
|-----------|----------|------|
| 400 | INVALID_REQUEST | 请求参数无效 |
| 401 | UNAUTHORIZED | 未授权，需要登录 |
| 403 | FORBIDDEN | 禁止访问，权限不足 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | DUPLICATE | 数据重复 |
| 429 | RATE_LIMIT_EXCEEDED | 请求频率超限 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

---

## 使用示例

### JavaScript/TypeScript

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// 登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 获取健康数据
const { data: healthData } = await supabase
  .from('health_data')
  .select('*')
  .eq('user_id', userId)
  .order('recorded_at', { ascending: false })

// 创建记录
const { data: newRecord } = await supabase
  .from('health_data')
  .insert([{
    user_id: userId,
    data_type: 'blood_sugar',
    data_value: 5.5,
    unit: 'mmol/L',
    recorded_at: new Date().toISOString()
  }])
```

### 微信小程序

```javascript
const app = getApp()

// 获取健康数据
const data = await app.supabase.get('health_data', {
  user_id: `eq.${app.globalData.userInfo.id}`,
  order: 'recorded_at.desc'
})

// 创建记录
const result = await app.supabase.post('health_data', {
  user_id: app.globalData.userInfo.id,
  data_type: 'blood_sugar',
  data_value: 5.5,
  unit: 'mmol/L',
  recorded_at: new Date().toISOString(),
  source: 'manual'
})
```

---

## 附录

### 健康指标参考范围

| 指标 | 正常范围 |
|------|----------|
| 收缩压 | 90-120 mmHg |
| 舒张压 | 60-80 mmHg |
| 空腹血糖 | 3.9-6.1 mmol/L |
| 心率 | 60-100 bpm |
| 体温 | 36.0-37.3 ℃ |
| BMI | 18.5-24.9 |

### 运动建议

| 目标 | 建议值 |
|------|--------|
| 每日步数 | ≥8000 步 |
| 每周运动 | ≥150 分钟 |
| 每日消耗 | ≥300 千卡 |

### 睡眠建议

| 年龄组 | 建议睡眠时长 |
|--------|--------------|
| 成年人 | 7-9 小时 |
| 老年人 | 7-8 小时 |

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-01-01 | 1.0.0 | 初始版本 |
