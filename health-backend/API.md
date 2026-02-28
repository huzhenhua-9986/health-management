# 健康管理系统 API 完整文档

## 基础信息

- **Base URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **数据格式**: JSON

## 通用响应格式

### 成功
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 失败
```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

---

## 1. 认证模块 `/api/auth`

### 1.1 用户注册
```
POST /api/auth/register
```

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "123456",
  "nickname": "张三",
  "gender": "male",
  "birth_date": "1990-01-01"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "13800138000",
      "nickname": "张三",
      "role": "user"
    },
    "token": "eyJhbGc...",
    "refresh_token": "eyJhbGc..."
  }
}
```

### 1.2 用户登录
```
POST /api/auth/login
```

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

### 1.3 微信登录
```
POST /api/auth/wx-login
```

**请求体**:
```json
{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL"
  }
}
```

### 1.4 刷新令牌
```
POST /api/auth/refresh
```

**请求体**:
```json
{
  "refresh_token": "your-refresh-token"
}
```

### 1.5 获取当前用户
```
GET /api/auth/me
```
**需要认证**

### 1.6 登出
```
POST /api/auth/logout
```
**需要认证**

---

## 2. 健康数据模块 `/api/health-data`

### 2.1 获取列表
```
GET /api/health-data?page=1&page_size=20&data_type=blood_sugar
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| page_size | number | 每页数量 |
| data_type | string | 数据类型 |
| start_date | string | 开始日期 |
| end_date | string | 结束日期 |

**数据类型**:
- `blood_pressure_systolic` - 收缩压
- `blood_pressure_diastolic` - 舒张压
- `blood_sugar` - 血糖
- `heart_rate` - 心率
- `temperature` - 体温
- `weight` - 体重
- `bmi` - BMI

### 2.2 创建记录
```
POST /api/health-data
```

**请求体**:
```json
{
  "data_type": "blood_sugar",
  "data_value": 5.5,
  "unit": "mmol/L",
  "recorded_at": "2024-01-01T08:00:00Z",
  "source": "manual",
  "notes": "空腹血糖"
}
```

### 2.3 更新记录
```
PUT /api/health-data/:id
```

### 2.4 删除记录
```
DELETE /api/health-data/:id
```

### 2.5 获取统计
```
GET /api/health-data/statistics?data_type=blood_sugar
```

### 2.6 获取趋势
```
GET /api/health-data/trends?data_type=blood_sugar&days=7
```

### 2.7 获取健康数据统计 (管理员)
```
GET /api/health-data/stats
```
**需要认证，需要管理员权限**

**响应**:
```json
{
  "success": true,
  "data": {
    "totalCount": 1234,
    "todayCount": 45,
    "byType": {
      "bloodPressure": 234,
      "heartRate": 345,
      "bloodSugar": 267,
      "temperature": 156,
      "weight": 232
    },
    "avgValues": {
      "bloodPressure": "125/82",
      "heartRate": 76,
      "bloodSugar": 5.6
    }
  }
}
```

---

## 3. 运动数据模块 `/api/exercise`

### 3.1 获取列表
```
GET /api/exercise?page=1&page_size=20
```

### 3.2 创建记录
```
POST /api/exercise
```

**请求体**:
```json
{
  "steps": 10000,
  "distance": 5.5,
  "calories": 350,
  "duration": 3600,
  "exercise_date": "2024-01-01",
  "device_type": "iPhone"
}
```

### 3.3 更新记录
```
PUT /api/exercise/:id
```

### 3.4 删除记录
```
DELETE /api/exercise/:id
```

---

## 4. 睡眠数据模块 `/api/sleep`

### 4.1 获取列表
```
GET /api/sleep?page=1&page_size=20
```

### 4.2 创建记录
```
POST /api/sleep
```

**请求体**:
```json
{
  "sleep_date": "2024-01-01",
  "sleep_duration": 28800,
  "deep_sleep_duration": 7200,
  "light_sleep_duration": 14400,
  "rem_sleep_duration": 3600,
  "sleep_quality": 8,
  "sleep_cycles": 5
}
```

### 4.3 更新记录
```
PUT /api/sleep/:id
```

### 4.4 删除记录
```
DELETE /api/sleep/:id
```

---

## 5. 饮食记录模块 `/api/diet`

### 5.1 获取列表
```
GET /api/diet?page=1&page_size=20&meal_type=breakfast
```

**餐次类型**:
- `breakfast` - 早餐
- `lunch` - 午餐
- `dinner` - 晚餐
- `snack` - 零食

### 5.2 创建记录
```
POST /api/diet
```

**请求体**:
```json
{
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

### 5.3 更新记录
```
PUT /api/diet/:id
```

### 5.4 删除记录
```
DELETE /api/diet/:id
```

---

## 6. 报告模块 `/api/reports`

### 6.1 获取列表
```
GET /api/reports?page=1&page_size=20&report_type=weekly
```

**报告类型**:
- `daily` - 日报
- `weekly` - 周报
- `monthly` - 月报

### 6.2 生成报告
```
POST /api/reports/generate
```

**请求体**:
```json
{
  "report_type": "weekly",
  "start_date": "2024-01-01",
  "end_date": "2024-01-07"
}
```

### 6.3 删除报告
```
DELETE /api/reports/:id
```

---

## 7. 用户管理模块 `/api/users` (管理员)

### 7.1 获取用户列表
```
GET /api/users?page=1&page_size=20&keyword=张三&status=active
```

### 7.2 获取用户详情
```
GET /api/users/:id
```

**响应** (增强版):
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "phone": "13800138000",
    "nickname": "张三",
    "avatar_url": "",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "stats": {
      "healthDataCount": 25,
      "exerciseDataCount": 18,
      "sleepDataCount": 30,
      "dietDataCount": 45,
      "reportCount": 5,
      "lastActiveAt": "2024-02-28T10:00:00Z",
      "avgHealthScore": 75,
      "totalExerciseDays": 45
    }
  }
}
```

### 7.3 更新用户
```
PUT /api/users/:id
```

**请求体**:
```json
{
  "nickname": "新昵称",
  "status": "active",
  "role": "admin"
}
```

### 7.4 删除用户
```
DELETE /api/users/:id
```

### 7.5 批量更新状态
```
PATCH /api/users/batch-status
```

**请求体**:
```json
{
  "ids": ["uuid1", "uuid2"],
  "status": "inactive"
}
```

### 7.6 获取统计
```
GET /api/users/statistics
```

**响应**:
```json
{
  "success": true,
  "data": {
    "total": 1234,
    "active": 892,
    "today": 45
  }
}
```

---

## 8. 日志模块 `/api/logs`

### 8.1 获取日志列表
```
GET /api/logs?page=1&page_size=20&action=login&status=success
```

**操作类型**:
- `register` - 注册
- `login` - 登录
- `wx_login` - 微信登录
- `logout` - 登出
- `create` - 创建
- `update` - 更新
- `delete` - 删除
- `generate_report` - 生成报告

---

## 9. 仪表盘模块 `/api/dashboard` (管理员)

### 9.1 获取统计数据 (新增)
```
GET /api/dashboard/stats
```
**需要认证，需要管理员权限**

**响应**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "activeUsers": 567,
    "todayUsers": 12,
    "totalHealth": 4567,
    "totalExercise": 2345,
    "totalSleep": 3456,
    "totalDiet": 5678
  }
}
```

**字段说明**:
| 字段 | 说明 |
|------|------|
| totalUsers | 总用户数 |
| activeUsers | 活跃用户数(7天内有登录) |
| todayUsers | 今日新增用户 |
| totalHealth | 健康数据总数 |
| totalExercise | 运动数据总数 |
| totalSleep | 睡眠数据总数 |
| totalDiet | 饮食记录总数 |

### 9.2 获取概览
```
GET /api/dashboard/overview
```

### 9.3 用户活跃度趋势
```
GET /api/dashboard/user-trend?days=7
```
**需要认证，需要管理员权限**

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| days | number | 7 | 查询天数(1-90) |

**响应**:
```json
{
  "success": true,
  "data": [
    { "date": "2024-01-01", "count": 45 },
    { "date": "2024-01-02", "count": 52 }
  ]
}
```

### 9.4 数据采集趋势
```
GET /api/dashboard/data-trend?days=7&dataType=all
```
**需要认证，需要管理员权限**

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| days | number | 7 | 查询天数(1-90) |
| dataType | string | all | 数据类型: all/health/exercise/sleep/diet |

**响应**:
```json
{
  "success": true,
  "data": {
    "health_data": [
      { "date": "2024-01-01", "count": 120 }
    ],
    "exercise_data": [
      { "date": "2024-01-01", "count": 85 }
    ],
    "sleep_data": [
      { "date": "2024-01-01", "count": 92 }
    ],
    "diet_data": [
      { "date": "2024-01-01", "count": 256 }
    ]
  }
}
```

---

## 10. 数据分析模块 `/api/analysis` (管理员)

### 10.1 获取趋势数据
```
GET /api/analysis/trend?type=steps&days=7
```
**需要认证，需要管理员权限**

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | steps | 数据类型: steps/sleep/calories/distance/weight/bloodPressure/heartRate/bloodSugar |
| days | number | 7 | 查询天数(1-365) |
| userId | string | - | 用户ID（可选） |

**响应**:
```json
{
  "success": true,
  "data": {
    "type": "steps",
    "unit": "步",
    "dates": ["02-21", "02-22", "02-23", "02-24", "02-25", "02-26", "02-27"],
    "values": [5234, 6123, 5890, 7123, 6543, 7234, 6890],
    "avg": 6420,
    "max": 7234,
    "min": 5234
  }
}
```

### 10.2 获取对比数据
```
GET /api/analysis/compare?types=steps,sleep,calories&days=7
```
**需要认证，需要管理员权限**

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| types | string/array | 要对比的数据类型，多个用逗号分隔 |
| days | number | 查询天数 |

**响应**:
```json
{
  "success": true,
  "data": {
    "dates": ["02-21", "02-22", "02-23", "02-24", "02-25", "02-26", "02-27"],
    "series": [
      { "name": "步数", "data": [5234, 6123, 5890, 7123, 6543, 7234, 6890] },
      { "name": "睡眠时长", "data": [7.5, 6.8, 7.2, 8.0, 7.1, 7.8, 7.4] },
      { "name": "消耗热量", "data": [1856, 2034, 1923, 2156, 1987, 2234, 2056] }
    ]
  }
}
```

### 10.3 获取分布统计
```
GET /api/analysis/distribution?type=bloodPressure
```
**需要认证，需要管理员权限**

**查询参数**:
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | bloodPressure | 类型: bloodPressure/heartRate/bloodSugar/steps/sleep |

**响应**:
```json
{
  "success": true,
  "data": {
    "ranges": ["<90", "90-120", "120-140", ">140"],
    "counts": [15, 45, 25, 8],
    "labels": ["偏低", "正常", "偏高", "高"]
  }
}
```

---

## 错误代码

| HTTP 状态 | 错误代码 | 描述 |
|-----------|----------|------|
| 400 | VALIDATION_ERROR | 请求参数验证失败 |
| 401 | UNAUTHORIZED | 未授权，需要登录 |
| 401 | INVALID_TOKEN | 无效的令牌 |
| 401 | TOKEN_EXPIRED | 令牌已过期 |
| 403 | FORBIDDEN | 禁止访问，权限不足 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | DUPLICATE | 数据重复 |
| 429 | RATE_LIMIT_EXCEEDED | 请求频率超限 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

---

## 使用示例

### JavaScript

```javascript
// 登录
const loginRes = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '13800138000', password: '123456' })
})
const { data } = await loginRes.json()
const token = data.token

// 创建健康数据
const createRes = await fetch('http://localhost:3000/api/health-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    data_type: 'blood_sugar',
    data_value: 5.5,
    unit: 'mmol/L'
  })
})
```

### Axios

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// 登录
const { data } = await api.post('/auth/login', {
  phone: '13800138000',
  password: '123456'
})

// 设置 token
api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

// 获取健康数据
const healthData = await api.get('/health-data', {
  params: { page: 1, page_size: 20 }
})
```
