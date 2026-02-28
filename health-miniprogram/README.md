# 健康管理系统 - 小程序端

微信小程序端，用于用户录入健康数据、查看数据统计和健康报告。

## 技术栈

- **平台**: 微信小程序
- **开发语言**: JavaScript
- **UI框架**: 微信原生组件
- **后端服务**: Supabase
- **数据缓存**: 本地存储 + 内存缓存

## 功能模块

### 用户认证
- 手机号验证码登录
- 微信一键登录
- 快速体验（开发测试用）
- 自动登录状态保持

### 健康数据录入
- **健康指标**: 血压、血糖、心率、体温、体重
- **运动数据**: 步数、距离、热量消耗、运动时长
- **睡眠数据**: 总时长、深睡时长、浅睡时长、睡眠质量
- **饮食记录**: 餐型、食物名称、热量、蛋白质、脂肪、碳水

### 数据查看
- 分类数据展示（健康/运动/睡眠/饮食）
- 数据详情查看
- 数据删除功能
- 下拉刷新

### 健康报告
- 日报/周报/月报生成
- 报告列表查看
- 报告详情展示
- 报告删除

### 个人中心
- 用户信息展示
- 数据统计概览
- 缓存管理
- 退出登录

### 特色功能
- **本地缓存**: 智能缓存数据，提升加载速度
- **健康评分**: 根据今日数据自动计算健康分
- **下拉刷新**: 所有数据页面支持下拉刷新
- **离线友好**: 网络异常时使用缓存数据

## 快速开始

### 1. 克隆项目

```bash
cd health-miniprogram
```

### 2. 配置 Supabase

打开 `app.js`，修改 Supabase 配置：

```javascript
globalData: {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-supabase-anon-key'
}
```

### 3. 配置小程序 AppID

打开 `project.config.json`，修改 `appid` 为你的小程序 AppID：

```json
{
  "appid": "your-appid"
}
```

### 4. 开发调试

1. 打开微信开发者工具
2. 导入项目目录
3. 点击"编译"按钮预览

### 5. 测试登录

- 点击"快速体验"可快速进入小程序
- 配置后端API后可使用完整登录功能

## 项目结构

```
health-miniprogram/
├── pages/              # 页面
│   ├── index/         # 首页 - 健康数据概览
│   ├── data/          # 数据查看 - 历史数据列表
│   ├── input/         # 数据录入 - 各类数据表单
│   ├── report/        # 健康报告 - 报告生成与查看
│   ├── profile/       # 个人中心 - 用户信息与设置
│   └── login/         # 登录 - 微信/手机号登录
├── utils/              # 工具函数
│   ├── request.js     # HTTP请求封装
│   ├── supabase.js    # Supabase SDK封装
│   ├── cache.js       # 本地缓存管理
│   └── util.js        # 通用工具函数
├── images/             # 图片资源
├── docs/               # 文档
├── app.js              # 小程序入口
├── app.json            # 小程序配置
├── app.wxss            # 全局样式
└── project.config.json # 项目配置
```

## 缓存策略

小程序采用多层缓存策略提升性能：

1. **内存缓存**: 最快访问，小程序运行期间有效
2. **本地存储**: 持久化存储，小程序关闭后仍有效
3. **缓存过期**: 支持设置缓存过期时间
4. **自动清理**: 启动时自动清理过期缓存

### 缓存配置

```javascript
config: {
  cacheExpire: {
    short: 300,      // 5分钟 - 实时数据
    medium: 1800,    // 30分钟 - 列表数据
    long: 3600,      // 1小时 - 详情数据
    veryLong: 86400  // 24小时 - 用户信息
  }
}
```

## API对接

小程序通过Supabase REST API与后端通信：

### 请求格式

```javascript
// GET请求
const data = await request.get('table_name', {
  user_id: `eq.${userId}`,
  order: 'created_at.desc'
})

// POST请求
await request.post('table_name', {
  user_id: userId,
  field1: 'value1'
})
```

### 认证方式

```javascript
header: {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 部署发布

### 1. 配置服务器域名

在微信公众平台配置以下域名白名单：

- request合法域名：`https://your-project.supabase.co`
- uploadFile合法域名：`https://your-project.supabase.co`

### 2. 上传代码

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 确认上传

### 3. 提交审核

1. 登录微信公众平台
2. 进入版本管理
3. 将开发版本提交审核
4. 填写审核信息

## 图片资源

小程序所需图片资源请参考：[docs/IMAGES.md](docs/IMAGES.md)

在正式图标准备好之前，小程序使用emoji作为临时图标。

## 注意事项

1. **域名白名单**: 必须在小程序后台配置服务器域名
2. **AppID配置**: 开发和发布时使用正确的AppID
3. **用户隐私**: 遵守微信小程序用户隐私保护规范
4. **数据安全**: 敏感数据应加密传输
5. **错误处理**: 完善的网络异常和错误提示

## 开发建议

1. 使用微信开发者工具的调试功能
2. 注意小程序包大小限制（主包2MB）
3. 合理使用分包加载
4. 优化图片资源大小
5. 使用mock数据进行开发测试

