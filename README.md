# LACS Admin - GitHub 仓库管理系统

一个现代化、美观且高性能的 GitHub 仓库管理系统，基于 Next.js 15 构建，特别支持 Hugo 静态网站项目的文章管理。

## ✨ 特性

### 🎨 界面设计
- **现代化设计**：采用渐变背景、玻璃拟态效果和圆角设计
- **响应式布局**：完美适配桌面端、平板和移动设备
- **动画效果**：流畅的CSS动画和过渡效果
- **深色模式支持**：自动适配系统主题偏好
- **专业UI组件**：卡片式布局、优雅的按钮和图标

### 📁 仓库管理
- **仓库列表**：展示所有GitHub仓库，支持搜索和过滤
- **仓库操作**：添加、编辑、删除仓库信息
- **特殊支持**：为appwebsite-hugo仓库提供专门的文章管理功能
- **实时更新**：动态更新仓库信息和状态

### 📝 Hugo文章管理
- **文章列表**：展示所有Hugo文章，支持按状态和分类过滤
- **Markdown编辑器**：支持前置元数据(frontmatter)编辑
- **文章状态**：支持草稿和发布状态切换
- **元数据管理**：完整支持Hugo文章的所有元数据字段
- **预览功能**：实时预览生成的Markdown内容

### ⚡ 性能优化
- **快速加载**：优化的字体加载和图片处理
- **代码分割**：自动代码分割和懒加载
- **图片优化**：WebP/AVIF格式支持，智能缓存
- **CSS优化**：CSS变量系统，减少重复计算
- **构建优化**：SWC编译器，生产环境代码压缩

### 🔒 安全特性
- **安全头部**：X-Frame-Options、CSP等安全配置
- **令牌管理**：安全的本地存储和加密
- **错误处理**：优雅的错误提示和恢复机制

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 配置后端 API 地址
- 打开 `src/app/page.tsx`
- 修改 `API_BASE` 为你的后端 API 域名：
  ```ts
  const API_BASE = 'https://api-g.lacs.cc'
  ```

### 配置后端回调重定向
- 后端 `/api/auth/github/callback` 处理完成后，重定向到本前端的 `/oauth-result` 页面：
  ```ts
  const FRONTEND_URL = 'http://localhost:3000/oauth-result' // 或你的线上域名
  // ...
  const successUrl = `${FRONTEND_URL}?user=...&token=...`
  return NextResponse.redirect(successUrl)
  ```

### 开发环境
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建
```bash
npm run build
npm start
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式和设计系统
│   ├── layout.tsx         # 根布局组件
│   ├── page.tsx           # 登录页面
│   ├── page.module.css    # 登录页面样式
│   └── oauth-result/      # OAuth结果页面
│       ├── page.tsx
│       └── page.module.css
├── components/            # 可复用组件
│   └── OptimizedImage.tsx # 优化的图片组件
└── ...
```

## 🎨 设计系统

### 颜色变量
```css
--primary: #6366f1;        /* 主色调 */
--primary-dark: #4f46e5;   /* 深色主色调 */
--background: #ffffff;      /* 背景色 */
--foreground: #1e293b;     /* 前景色 */
```

### 间距系统
```css
--spacing-xs: 0.5rem;      /* 8px */
--spacing-sm: 0.75rem;     /* 12px */
--spacing: 1rem;           /* 16px */
--spacing-lg: 2rem;        /* 32px */
```

### 圆角系统
```css
--radius-sm: 0.375rem;     /* 6px */
--radius: 0.5rem;          /* 8px */
--radius-lg: 1rem;         /* 16px */
```

## 🧩 主要页面

### 登录页面 (`/`)
- 美观的登录界面
- GitHub OAuth 登录按钮
- 特性展示区域
- 响应式背景动画

### OAuth结果页面 (`/oauth-result`)
- 登录成功展示
- 用户信息卡片
- 统计数据显示
- 操作按钮区域

### 仓库管理页面 (`/dashboard`)
- GitHub仓库列表展示
- 仓库搜索和过滤功能
- 仓库增删改查操作
- Hugo仓库特殊标识和快捷入口

### Hugo文章管理页面 (`/dashboard/hugo/[id]`)
- 文章列表展示和管理
- 文章状态过滤（全部/已发布/草稿）
- 分类过滤和搜索功能
- 文章发布状态切换

### Hugo文章编辑器 (`/dashboard/hugo/[id]/new` 和 `/dashboard/hugo/[id]/edit/[articleId]`)
- 完整的Markdown编辑器
- 前置元数据(frontmatter)可视化编辑
- 支持所有Hugo文章字段
- 实时预览功能
- 智能字段过滤（空值不写入）

## 🛠️ 技术栈

- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript
- **样式**：CSS Modules + CSS变量
- **字体**：Geist Sans & Geist Mono
- **图标**：内联SVG
- **优化**：SWC编译器

## 📈 性能指标

- **首屏加载**：< 2秒
- **交互响应**：< 100ms
- **图片优化**：WebP/AVIF支持
- **代码分割**：自动优化
- **缓存策略**：智能缓存

## 📝 注意事项

- 本项目只负责前端展示，所有 OAuth 逻辑和安全校验都在后端完成
- 界面已针对现代浏览器优化，建议使用最新版本的浏览器
- 所有动画效果都使用CSS实现，确保最佳性能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

© 2024 LACS Team. 保留所有权利。
- 你可以根据需要美化页面或扩展功能

## 📦 部署
- 推荐部署到 Vercel、Netlify 或静态服务器
- 部署后记得同步修改后端回调重定向地址为你的前端域名

---

如需帮助请联系后端开发者或本项目维护者。
