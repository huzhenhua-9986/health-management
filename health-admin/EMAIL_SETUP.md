# 邮件验证码服务配置指南

## 📧 概述

健康管理系统已集成 EmailJS 邮件服务，支持通过邮箱发送验证码进行用户注册。EmailJS 是一个免费的邮件服务，无需后端服务器即可在前端发送邮件。

## 🚀 快速配置（仅需 5 分钟）

### 步骤 1：注册 EmailJS 账号

1. 访问 [EmailJS 官网](https://www.emailjs.com/)
2. 点击 **"Sign Up Free"** 或 **"免费注册"**
3. 使用邮箱账号注册（支持 Google、GitHub 账号登录）
4. 注册后登录控制台

### 步骤 2：添加邮件服务

1. 登录 EmailJS 后，进入 **Email Services**
2. 点击 **"Add New Service"**
3. 选择邮件服务商（推荐以下免费选项）：
   - **Gmail**（个人邮箱，推荐）
   - **Outlook**（微软邮箱）
   - **Yahoo Mail**
   - 其他自定义 SMTP 服务

4. 选择 **Gmail** 后，点击 **"Connect Account"**
5. 授权 EmailJS 访问你的 Gmail 账号
6. 服务创建完成后，记录 **Service ID**（如：`service_xxxxxxxxx`）

### 步骤 3：创建邮件模板

1. 进入 **Email Templates**
2. 点击 **"Create New Template"**
3. 填写模板信息：

**模板名称：** 验证码邮件

**邮件主题：**
```
健康管理系统 - 验证码
```

**邮件内容：**
```
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .code { font-size: 32px; font-weight: bold; color: #0077b6; letter-spacing: 5px; }
        .footer { margin-top: 30px; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>健康管理系统</h2>
        <p>您好，</p>
        <p>您正在进行注册操作，验证码如下：</p>
        <p class="code">{{verification_code}}</p>
        <p>验证码有效期为 <strong>5分钟</strong>，请尽快完成验证。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
        <div class="footer">
            <p>此邮件由 {{app_name}} 自动发送，请勿回复。</p>
        </div>
    </div>
</body>
</html>
```

4. 点击 **"Save"** 保存模板
5. 记录 **Template ID**（如：`template_xxxxxxxxx`）

### 步骤 4：获取 Public Key

1. 点击用户头像或菜单
2. 进入 **Account** → **General**
3. 找到 **Public Key** 部分
4. 复制 Public Key（如：`xxxxxxxxxxxxxxxxxxxxxxxxxx`）

### 步骤 5：配置环境变量

编辑 `.env` 文件，添加以下配置：

```bash
# 邮件服务配置（EmailJS - 免费）
VITE_EMAILJS_SERVICE_ID=service_xxxxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**将上面步骤中获取的 ID 和 Key 替换到配置文件中**

### 步骤 6：重启服务

```bash
# 停止当前服务（Ctrl+C）
# 重新启动
npm run dev
```

### 步骤 7：测试邮件发送

1. 访问 http://localhost:3001/auth
2. 切换到"注册"标签
3. 选择"邮箱注册"
4. 输入你的邮箱地址
5. 点击"获取验证码"
6. 检查邮箱是否收到验证码邮件

## 📊 EmailJS 免费额度

EmailJS 免费计划包含：
- ✅ **每月 200 封邮件**
- ✅ **最多 3 个邮件模板**
- ✅ **最多 1 个邮件服务**
- ✅ **无限联系人**

**适合个人项目和小型应用使用**

如果需要更高额度：
- **付费计划**：$15/月，每月 50,000 封邮件
- **或者**：配置自己的 SMTP 服务器

## 🔧 配置示例

### 完整的 .env 文件示例

```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-supabase-anon-key

# 邮件服务配置（EmailJS）
VITE_EMAILJS_SERVICE_ID=service_abc123xyz
VITE_EMAILJS_TEMPLATE_ID=template_def456uvw
VITE_EMAILJS_PUBLIC_KEY=abc123xyzDEF456UVWxyz789
```

### 邮件模板变量说明

邮件模板中可以使用的变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `{{to_email}}` | 收件人邮箱 | user@example.com |
| `{{to_name}}` | 收件人名称 | user |
| `{{verification_code}}` | 验证码 | 123456 |
| `{{app_name}}` | 应用名称 | 健康管理系统 |
| `{{expiry_time}}` | 有效期 | 5分钟 |

## 🛠️ 故障排除

### 问题 1：邮件未收到

**可能原因：**
1. EmailJS 配置未完成
2. 邮件服务未授权
3. 邮件被标记为垃圾邮件

**解决方案：**
1. 检查 `.env` 文件配置是否正确
2. 确认 EmailJS 控制台中服务已连接
3. 检查垃圾邮件文件夹
4. 查看浏览器控制台是否有错误信息

### 问题 2：验证码发送失败

**错误信息：**`邮件服务未配置`

**解决方案：**
1. 确认 `.env` 文件存在
2. 检查三个配置项都已填写
3. 重启开发服务器

### 问题 3：超出邮件额度

**错误信息：**`EmailJS quota exceeded`

**解决方案：**
1. 登录 EmailJS 控制台查看剩余额度
2. 升级到付费计划
3. 或等待下个月额度重置

### 问题 4：Gmail 授权失败

**解决方案：**
1. 确保你的 Gmail 账号已开启"允许不够安全的应用访问"
2. 或使用应用专用密码
3. 推荐使用 Google 账号直接登录 EmailJS

## 🎯 高级配置

### 使用自定义 SMTP 服务器

如果你有自己的 SMTP 服务器（如企业邮箱）：

1. 在 EmailJS 中选择 **"Custom SMTP"**
2. 填写 SMTP 服务器信息：
   - **Host**: smtp.yourdomain.com
   - **Port**: 587
   - **Username**: your-email@yourdomain.com
   - **Password**: your-password

### 多邮件模板配置

可以创建多个邮件模板用于不同场景：
- 注册验证码
- 密码重置
- 通知邮件
- 营销邮件

每个模板都有独立的 Template ID。

## 🔒 安全建议

### 生产环境注意事项

1. **保护密钥**
   - 不要将 `.env` 文件提交到 Git
   - 已添加到 `.gitignore`
   - 生产环境使用环境变量

2. **限制发送频率**
   - 前端添加发送间隔限制（已实现 60 秒）
   - 后端添加 IP 限流
   - 防止恶意调用

3. **验证码有效期**
   - 当前设置为 5 分钟
   - 可根据需求调整

4. **监控发送量**
   - 定期检查 EmailJS 控制台
   - 设置额度告警

## 📚 相关文档

- [EmailJS 官方文档](https://www.emailjs.com/docs/)
- [EmailJS SDK 文档](https://www.emailjs.com/docs/sdk/installation/)
- [Vue 3 + EmailJS 教程](https://www.emailjs.com/docs/tutorials/)

## 💡 常见问题

**Q: EmailJS 真的免费吗？**
A: 是的，每月 200 封邮件完全免费，足够个人和小型项目使用。

**Q: 可以使用自己的邮箱域名吗？**
A: 可以，配置自定义 SMTP 服务器即可。

**Q: 邮件会被标记为垃圾邮件吗？**
A: 使用知名邮件服务商（Gmail、Outlook）一般不会。建议用户添加到白名单。

**Q: 如何更换邮件服务商？**
A: 只需在 EmailJS 控制台添加新服务，更新 `.env` 中的 Service ID 即可。

**Q: 生产环境推荐使用 EmailJS 吗？**
A: 个人项目可以。企业项目建议使用后端邮件服务（如 SendGrid、AWS SES）。

## 🎉 完成

配置完成后，你的健康管理系统就拥有了完整的邮件验证码注册功能！

用户可以通过邮箱注册，系统会自动发送验证码邮件，整个流程安全可靠且完全免费。
