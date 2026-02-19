# 健康管理系统 - 小程序端

微信小程序端，用于用户录入健康数据、查看数据统计和健康报告。

## 技术栈

- **平台**: 微信小程序
- **开发语言**: JavaScript
- **UI框架**: 微信原生组件
- **后端服务**: Supabase

## 功能模块

- 用户注册登录：手机号验证码登录、微信一键登录
- 健康数据录入：手动录入健康数据、运动数据、睡眠数据、饮食记录
- 数据查看：健康数据列表、趋势分析
- 健康报告：报告生成、查看、分享
- 个人中心：个人信息管理、设备管理

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置

1. 打开 `app.js`
2. 修改 Supabase 配置：

```javascript
globalData: {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-supabase-anon-key'
}
```

3. 打开 `project.config.json`
4. 修改 `appid` 为你的小程序 AppID

### 开发

1. 打开微信开发者工具
2. 导入项目目录
3. 点击"编译"按钮预览

### 发布

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 在微信公众平台提交审核

## 项目结构

```
health-miniprogram/
├── pages/              # 页面
│   ├── index/         # 首页
│   ├── data/          # 数据查看
│   ├── input/         # 数据录入
│   ├── report/        # 健康报告
│   ├── profile/       # 个人中心
│   └── login/         # 登录
├── components/         # 组件
├── utils/              # 工具函数
├── images/             # 图片资源
├── app.js
├── app.json
└── project.config.json
```

## 注意事项

1. 小程序需要配置服务器域名白名单
2. 需要在微信公众平台配置 AppID
3. 确保已开启小程序云开发服务（如果使用）
4. 数据录入功能需要用户登录后使用

## 数据权限

- 用户只能查看和录入自己的数据
- 管理员可以查看所有用户数据
