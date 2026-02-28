# 健康管理系统 - 后端接口需求清单

**日期**: 2026-02-28
**状态**: 待开发

---

## 📋 需要新增的接口

### 1. 仪表盘统计接口增强

**当前问题**: 数据不完整，使用模拟数据

**现有接口**: `GET /api/dashboard/stats`

**需要返回的字段**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1234,           // 总用户数
    "activeUsers": 856,           // 活跃用户数（7天内有登录）
    "todayUsers": 45,             // 今日新增用户
    "totalHealthData": 5678,      // 健康数据总数
    "totalExercise": 2345,        // 运动数据总数
    "totalSleep": 1234,           // 睡眠数据总数
    "totalDiet": 3456             // 饮食记录总数
  }
}
```

**优先级**: 🔴 高

---

### 2. 用户活跃度趋势接口

**问题**: 当前使用 `Math.random()` 生成模拟数据

**新接口**: `GET /api/dashboard/user-trend`

**请求参数**:
```json
{
  "days": 7              // 天数，默认7天
}
```

**返回数据**:
```json
{
  "success": true,
  "data": [
    { "date": "2025-02-21", "count": 45 },
    { "date": "2025-02-22", "count": 52 },
    { "date": "2025-02-23", "count": 38 },
    { "date": "2025-02-24", "count": 65 },
    { "date": "2025-02-25", "count": 48 },
    { "date": "2025-02-26", "count": 72 },
    { "date": "2025-02-27", "count": 55 }
  ]
}
```

**SQL示例**:
```sql
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as count
FROM system_logs
WHERE action = 'login'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

**优先级**: 🔴 高

---

### 3. 数据采集量趋势接口

**问题**: 当前使用 `Math.random()` 生成模拟数据

**新接口**: `GET /api/dashboard/data-trend`

**请求参数**:
```json
{
  "days": 7,              // 天数
  "dataType": "all"       // 数据类型: all, health, exercise, sleep, diet
}
```

**返回数据**:
```json
{
  "success": true,
  "data": [
    { "date": "2025-02-21", "count": 120 },
    { "date": "2025-02-22", "count": 145 },
    { "date": "2025-02-23", "count": 132 },
    { "date": "2025-02-24", "count": 168 },
    { "date": "2025-02-25", "count": 155 },
    { "date": "2025-02-26", "count": 189 },
    { "date": "2025-02-27", "count": 210 }
  ]
}
```

**优先级**: 🔴 高

---

### 4. 数据分析 - 趋势数据接口

**问题**: Analysis.vue 页面全部使用 `Math.random()` 生成数据

**新接口**: `GET /api/analysis/trend`

**请求参数**:
```json
{
  "type": "steps",        // 类型: steps, sleep, calories, weight, bloodPressure, heartRate, bloodSugar
  "days": 7,              // 天数
  "userId": "optional"    // 用户ID（管理员查看特定用户）
}
```

**返回数据**:
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

**优先级**: 🔴 高

---

### 5. 数据分析 - 对比数据接口

**问题**: Analysis.vue 对比图表使用模拟数据

**新接口**: `GET /api/analysis/compare`

**请求参数**:
```json
{
  "types": ["steps", "sleep", "calories"],  // 要对比的数据类型
  "days": 7
}
```

**返回数据**:
```json
{
  "success": true,
  "data": {
    "dates": ["02-21", "02-22", "02-23", "02-24", "02-25", "02-26", "02-27"],
    "series": [
      {
        "name": "步数",
        "data": [5234, 6123, 5890, 7123, 6543, 7234, 6890]
      },
      {
        "name": "睡眠时长",
        "data": [7.5, 6.8, 7.2, 8.0, 7.1, 7.8, 7.4]
      },
      {
        "name": "热量摄入",
        "data": [1856, 2034, 1923, 2156, 1987, 2234, 2056]
      }
    ]
  }
}
```

**优先级**: 🟡 中

---

### 6. 数据分析 - 分布统计接口

**问题**: 数据分布分析使用模拟数据

**新接口**: `GET /api/analysis/distribution`

**请求参数**:
```json
{
  "type": "bloodPressure",  // 类型
  "interval": "range"        // 区间方式
}
```

**返回数据**:
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

**优先级**: 🟡 中

---

### 7. 用户详情统计数据接口

**问题**: UserDetail.vue 页面统计数据需要完善

**现有接口**: `GET /api/users/:id`

**需要增强返回字段**:
```json
{
  "success": true,
  "data": {
    "id": "xxx",
    "phone": "13800138000",
    "nickname": "张三",
    "avatar_url": "",
    "status": "active",
    "created_at": "2025-01-01T00:00:00Z",

    // 新增统计数据
    "stats": {
      "healthDataCount": 25,        // 健康数据条数
      "exerciseDataCount": 18,       // 运动数据条数
      "sleepDataCount": 30,          // 睡眠数据条数
      "dietDataCount": 45,           // 饮食记录条数
      "reportCount": 5,              // 报告数量
      "lastActiveAt": "2025-02-28T10:00:00Z",  // 最后活跃时间
      "avgHealthScore": 85,          // 平均健康分数
      "totalExerciseDays": 45        // 运动天数
    }
  }
}
```

**优先级**: 🟡 中

---

### 8. 用户最近活动接口

**问题**: 需要展示用户的最近数据录入记录

**新接口**: `GET /api/users/:id/recent-activity`

**请求参数**:
```json
{
  "limit": 10            // 返回条数
}
```

**返回数据**:
```json
{
  "success": true,
  "data": [
    {
      "type": "health_data",
      "typeName": "健康数据",
      "dataType": "血压",
      "dataValue": "120/80",
      "recordedAt": "2025-02-28T10:30:00Z"
    },
    {
      "type": "exercise",
      "typeName": "运动数据",
      "dataType": "步数",
      "dataValue": "8000步",
      "recordedAt": "2025-02-28T08:00:00Z"
    }
  ]
}
```

**优先级**: 🟢 低

---

### 9. 健康数据统计接口

**问题**: HealthData.vue 需要数据统计信息

**新接口**: `GET /api/health-data/stats`

**返回数据**:
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

**优先级**: 🟡 中

---

### 10. 系统日志统计接口

**问题**: Logs.vue 需要日志统计数据

**现有接口**: `GET /api/logs`

**需要增强 - 新增统计接口**: `GET /api/logs/stats`

**返回数据**:
```json
{
  "success": true,
  "data": {
    "totalCount": 5678,
    "todayCount": 234,
    "byAction": {
      "login": 1234,
      "create": 2345,
      "update": 1567,
      "delete": 532
    },
    "byStatus": {
      "success": 5432,
      "failed": 246
    },
    "recentErrors": [
      {
        "action": "login",
        "errorMessage": "Invalid password",
        "count": 15
      }
    ]
  }
}
```

**优先级**: 🟢 低

---

## 🎯 实现优先级

### P0 - 立即实现（核心功能）
1. ✅ 仪表盘统计接口增强
2. ✅ 用户活跃度趋势接口
3. ✅ 数据采集量趋势接口

### P1 - 本周完成（重要功能）
4. ✅ 数据分析 - 趋势数据接口
5. ✅ 用户详情统计数据接口
6. ✅ 健康数据统计接口

### P2 - 下周完成（增强功能）
7. ✅ 数据分析 - 对比数据接口
8. ✅ 数据分析 - 分布统计接口
9. ✅ 系统日志统计接口

### P3 - 有时间再做（锦上添花）
10. ✅ 用户最近活动接口

---

## 📝 前端代码中的模拟数据位置

### Dashboard.vue
- **第234行**: `todayUsers: Math.floor(Math.random() * 50) + 10`
- **第239-242行**: `userTrendData` - 用户活跃度趋势（随机生成）
- **第244-247行**: `dataTrendData` - 数据采集量趋势（随机生成）

### Analysis.vue
- **第284行**: 步数趋势数据（随机生成）
- **第290行**: 睡眠数据（随机生成）
- **第296行**: 热量摄入数据（随机生成）
- **第470行**: 步数对比数据（随机生成）
- **第487行**: 睡眠对比数据（随机生成）
- **第496行**: 热量对比数据（随机生成）

---

## 🚀 后续开发建议

1. **先实现P0接口** - 让仪表盘显示真实数据
2. **逐步替换模拟数据** - 按优先级逐个实现
3. **添加数据缓存** - 提升接口性能
4. **完善错误处理** - 接口失败时的降级方案

---

**文档生成时间**: 2026-02-28
**前端检查**: 已完成
