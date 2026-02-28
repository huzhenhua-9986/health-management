# 小程序部署指南

## 部署前检查清单

### 1. 基础配置

- [ ] 获取微信小程序 AppID
- [ ] 配置服务器域名白名单
- [ ] 准备小程序图标和截图
- [ ] 完善小程序隐私协议

### 2. API配置

修改 `utils/request.js` 中的API地址：

```javascript
// 开发环境
const baseURL = 'http://localhost:3002/api'

// 生产环境 - 需要修改为实际部署地址
const baseURL = 'https://api.yourdomain.com/api'
```

### 3. 小程序信息配置

修改 `project.config.json`：

```json
{
  "appid": "your-real-appid",
  "projectname": "health-miniprogram",
  "description": "健康管理系统小程序"
}
```

## 部署步骤

### 第一步：配置服务器域名

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「开发」→「开发管理」→「开发设置」
3. 配置服务器域名白名单：

```
request合法域名: https://api.yourdomain.com
uploadFile合法域名: https://api.yourdomain.com
downloadFile合法域名: https://api.yourdomain.com
```

### 第二步：上传代码

1. 打开微信开发者工具
2. 点击「上传」按钮
3. 填写版本号：`1.0.0`
4. 填写项目备注：`正式版本发布`

### 第三步：提交审核

1. 登录微信公众平台
2. 进入「版本管理」
3. 将开发版本提交审核
4. 填写审核信息：

| 字段 | 内容 |
|------|------|
| 小程序名称 | 健康管理 |
| 小程序简介 | 个人健康管理工具，记录健康数据、运动、睡眠、饮食 |
| 小程序服务类目 | 医疗→互联网医疗 |
| 服务范围 | 健康管理、数据记录 |

### 第四步：配置隐私设置

1. 进入「设置」→「基本设置」
2. 配置用户隐私保护指引
3. 配置小程序隐私协议

## 小程序截图要求

需要准备以下截图：

| 尺寸 | 用途 | 数量 |
|------|------|------|
| 520x416px | 小程序封面 | 1张 |
| 520x416px | 功能介绍 | 2-4张 |
| 真机截图 | 审核用 | 按要求 |

截图内容建议：
1. 首页 - 健康数据概览
2. 数据录入 - 各类数据表单
3. 数据查看 - 数据列表和趋势
4. 个人中心 - 用户信息

## 常见问题

### 1. 域名必须HTTPS
微信小程序要求所有API请求必须使用HTTPS协议，且SSL证书必须有效。

### 2. 服务器白名单
只有配置在白名单中的域名才能正常请求。

### 3. 用户隐私
小程序必须配置用户隐私保护指引，否则无法通过审核。

### 4. 医疗类目
如果选择医疗类目，可能需要提供相关资质证明。

## 环境配置建议

### 开发环境
```javascript
const baseURL = 'http://localhost:3002/api'
```

### 测试环境
```javascript
const baseURL = 'https://test-api.yourdomain.com/api'
```

### 生产环境
```javascript
const baseURL = 'https://api.yourdomain.com/api'
```

可以通过环境变量控制：

```javascript
// utils/request.js
const envVersion = __wxConfig.envVersion || 'develop'

const baseURLMap = {
  develop: 'http://localhost:3002/api',
  trial: 'https://test-api.yourdomain.com/api',
  release: 'https://api.yourdomain.com/api'
}

const baseURL = baseURLMap[envVersion] || baseURLMap.release
```

## 发布后检查

发布后请检查以下功能：

- [ ] 用户登录功能
- [ ] 数据录入功能
- [ ] 数据查看功能
- [ ] 报告生成功能
- [ ] 下拉刷新功能
- [ ] 缓存功能
- [ ] 错误提示

## 版本更新

后续更新流程：

1. 修改代码
2. 本地测试
3. 上传新版本
4. 提交审核
5. 审核通过后发布

## 联系方式

如有问题，请联系：
- 开发者：前端开发(小程序)
- 技术支持：team-lead
