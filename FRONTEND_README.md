# LACS 管理系统前端

这是一个基于 Next.js 和 Ant Design 构建的软件管理系统前端项目，用于管理软件信息、公告、激活码等功能。

## 功能特性

- 🚀 **软件管理** - 添加、编辑、删除软件信息
- 📢 **公告管理** - 发布和管理软件相关公告
- 🔑 **激活码管理** - 管理软件激活码
- 📊 **数据统计** - 查看各种统计信息
- 🎨 **现代化UI** - 基于 Ant Design 的美观界面
- 📱 **响应式设计** - 支持各种设备尺寸

## 技术栈

- **框架**: Next.js 15.4.1
- **UI库**: Ant Design 5.26.6
- **语言**: TypeScript
- **样式**: CSS Modules + Ant Design
- **状态管理**: React Hooks

## 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 环境配置

复制 `.env.local` 文件并配置相关环境变量：

```bash
# API 配置
NEXT_PUBLIC_API_URL=http://localhost:3000/api/app
NEXT_PUBLIC_API_KEY=your-api-key-here

# 开发环境配置
NODE_ENV=development
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3001](http://localhost:3001) 查看应用。

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 主控制台
│   │   ├── software/      # 软件管理页面
│   │   ├── announcements/ # 公告管理页面
│   │   └── activation-codes/ # 激活码管理页面
│   ├── globals.css        # 全局样式
│   └── layout.tsx         # 根布局
├── components/            # 可复用组件
│   ├── Navigation.tsx     # 导航组件
│   └── ...
└── utils/                 # 工具函数
    └── ...
```

## 主要页面

### 软件管理
- **列表页面**: `/dashboard/software` - 查看所有软件
- **详情页面**: `/dashboard/software/[id]` - 查看软件详情
- **编辑页面**: `/dashboard/software/[id]/edit` - 编辑软件信息
- **新增页面**: `/dashboard/software/new` - 添加新软件

### 公告管理
- **列表页面**: `/dashboard/announcements` - 查看所有公告
- **编辑页面**: `/dashboard/announcements/[softwareId]/[id]` - 编辑公告
- **新增页面**: `/dashboard/announcements/new` - 发布新公告

### 激活码管理
- **列表页面**: `/dashboard/activation-codes` - 查看激活码

## API 集成

前端通过 RESTful API 与后端通信，主要接口包括：

- `GET /api/app/software` - 获取软件列表
- `POST /api/app/software` - 创建软件
- `PUT /api/app/software/:id` - 更新软件
- `DELETE /api/app/software/:id` - 删除软件
- `GET /api/app/software/:id/announcements` - 获取软件公告
- `POST /api/app/software/:id/announcements` - 创建公告

## 开发指南

### 添加新页面

1. 在 `src/app/dashboard/` 下创建新的目录
2. 添加 `page.tsx` 文件
3. 在导航菜单中添加对应的菜单项

### 添加新组件

1. 在 `src/components/` 下创建组件文件
2. 使用 TypeScript 定义组件接口
3. 导出组件供其他页面使用

### 样式规范

- 使用 Ant Design 的组件和主题
- 自定义样式使用 CSS Modules
- 保持响应式设计

## 构建和部署

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
