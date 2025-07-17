# 登录前端（login-frontend）

这是一个独立的 Next.js 前端项目，用于展示 GitHub OAuth 登录界面，并对接后端 API。

## 🚀 使用方法

### 1. 安装依赖
```bash
npm install
```

### 2. 配置后端 API 地址
- 打开 `src/app/page.tsx`
- 修改 `API_BASE` 为你的后端 API 域名，如：
  ```ts
  const API_BASE = 'https://api.example.com'
  ```

### 3. 配置后端回调重定向
- 后端 `/api/auth/github/callback` 处理完成后，重定向到本前端的 `/oauth-result` 页面：
  ```ts
  const FRONTEND_URL = 'http://localhost:3000/oauth-result' // 或你的线上域名
  // ...
  const successUrl = `${FRONTEND_URL}?success=true&user=...&token=...`
  return NextResponse.redirect(successUrl)
  ```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看登录页。

## 🧩 主要页面
- `/` ：首页，点击按钮跳转到后端 API 登录
- `/oauth-result` ：登录结果页，展示用户信息或错误

## 📝 注意事项
- 本项目只负责前端展示，所有 OAuth 逻辑和安全校验都在后端完成
- 你可以根据需要美化页面或扩展功能

## 📦 部署
- 推荐部署到 Vercel、Netlify 或静态服务器
- 部署后记得同步修改后端回调重定向地址为你的前端域名

---

如需帮助请联系后端开发者或本项目维护者。
