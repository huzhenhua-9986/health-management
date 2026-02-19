# EmailJS 配置指南 - 详细步骤

## 📧 配置流程（5分钟完成）

### 第一步：注册 EmailJS 账号

1. 已为您打开：https://www.emailjs.com/
2. 点击右上角 **"Sign Up Free"** 或 **"Get Started"**
3. 选择注册方式：
   - ✅ **推荐**：使用 Google 账号登录（最快）
   - ✅ 使用 GitHub 账号登录
   - 或使用邮箱注册（需要验证邮箱）

### 第二步：添加邮件服务

1. 登录后，进入控制台（Dashboard）
2. 点击左侧菜单 **"Email Services"**
3. 点击 **"Add New Service"**
4. 选择 **"Gmail"**（推荐，因为每个人都有 Google 账号）
5. 点击 **"Connect Account"** 按钮
6. 允许 EmailJS 访问您的 Gmail
7. 连接成功后，记录 **Service ID**（类似：`service_abc123xyz`）

### 第三步：创建邮件模板

1. 点击左侧菜单 **"Email Templates"**
2. 点击 **"Create New Template"**
3. 填写以下信息：

**模板名称：** `验证码模板`

**邮件主题：**
```
健康管理系统 - 验证码
```

**邮件内容（HTML）：**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background-color: #f5f7fa; 
            margin: 0; 
            padding: 20px;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            padding: 30px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            padding-bottom: 20px; 
            border-bottom: 2px solid #0077b6; 
            margin-bottom: 20px;
        }
        .code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #0077b6; 
            letter-spacing: 5px; 
            text-align: center; 
            background: #f0f9ff; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
        }
        .footer { 
            color: #666; 
            font-size: 12px; 
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>健康管理系统</h2>
        </div>
        <p>您好，</p>
        <p>您正在进行注册操作，验证码如下：</p>
        <div class="code">{{verification_code}}</div>
        <p style="color: #666;">验证码有效期为 <strong>5分钟</strong>，请尽快完成验证。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
        <div class="footer">
            <p>此邮件由 {{app_name}} 自动发送，请勿回复。</p>
            <p>如有疑问，请联系客服。</p>
        </div>
    </div>
</body>
</html>
```

4. 点击 **"Save"** 保存模板
5. 记录 **Template ID**（类似：`template_def456uvw`）

### 第四步：获取 Public Key

1. 点击右上角头像或菜单
2. 进入 **"Account"** → **"General"**
3. 找到 **"Public Key"** 部分
4. 点击复制按钮，复制 Public Key（类似：`abc123XYZdef456UVW`）

### 第五步：配置到项目

将获取的三个值填入 `.env` 文件（我会帮您填入）：

```bash
VITE_EMAILJS_SERVICE_ID=service_abc123xyz
VITE_EMAILJS_TEMPLATE_ID=template_def456uvw
VITE_EMAILJS_PUBLIC_KEY=abc123XYZdef456UVW
```

---

## ✅ 配置完成后

1. 重启开发服务器：
```bash
npm run dev
```

2. 测试发送验证码：
   - 切换到注册页面
   - 输入您的邮箱
   - 点击"获取验证码"
   - 检查邮箱（可能需要等几秒）
   - 输入验证码完成注册

---

## 📝 配置信息检查清单

请准备好以下三个值：

- [ ] Service ID：`service_XXXX`
- [ ] Template ID：`template_XXXX`
- [ ] Public Key：一串字母数字混合字符

获取到这些值后告诉我，我会帮您更新配置！

---

## 💡 常见问题

**Q: 一定要用 Gmail 吗？**
A: 不是，也可以用 Outlook、Yahoo 或自定义 SMTP。但 Gmail 最简单。

**Q: 免费额度够用吗？**
A: EmailJS 免费计划每月 200 封邮件，个人使用完全足够。

**Q: 邮件会被标记为垃圾邮件吗？**
A: 一般不会。第一次发送可能需要标记为"不是垃圾邮件"。

---

现在请按照上述步骤操作，获取三个配置值后告诉我！
