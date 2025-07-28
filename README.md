# LACS Admin API

激活码管理系统的后端API服务，基于 Next.js 14 构建，提供完整的激活码生成、验证和管理功能。

## ✨ 特性

### 🔑 激活码管理
- **激活码生成**：支持批量生成唯一激活码
- **状态管理**：激活码状态跟踪（未使用/已使用/已过期）
- **过期控制**：灵活的过期时间设置和检查
- **批量操作**：支持批量激活码操作

### 🔐 API安全
- **API密钥验证**：基于密钥的身份验证
- **过期时间检查**：API密钥过期状态验证
- **安全CORS配置**：跨域请求安全控制
- **请求限制**：防止API滥用

### 📊 数据管理
- **数据库集成**：使用 Neon PostgreSQL 数据库
- **ORM支持**：Drizzle ORM 提供类型安全的数据操作
- **数据迁移**：自动化数据库迁移管理
- **数据验证**：Zod 模式验证确保数据完整性

### ⚡ 性能优化
- **快速响应**：优化的API响应时间
- **连接池**：数据库连接池管理
- **缓存策略**：智能缓存机制
- **错误处理**：完善的错误处理和日志记录

## 🚀 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun
- PostgreSQL 数据库（推荐使用 Neon）

### 安装依赖
```bash
npm install
```

### 环境配置
创建 `.env.local` 文件并配置以下环境变量：

```env
# 数据库连接
DATABASE_URL="postgresql://username:password@host:port/database"

# API 密钥（用于验证）
API_KEY="your-api-key-here"

# 其他配置
NODE_ENV="development"
```

### 数据库设置
```bash
# 生成数据库迁移
npm run db:generate

# 推送数据库结构
npm run db:push

# 打开数据库管理界面
npm run db:studio
```

### 开发环境
```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 生产构建
```bash
npm run build
npm start
```

## 📁 项目结构

```
├── src/                    # 源代码
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API 路由
│   │   │   ├── activation-codes/  # 激活码管理API
│   │   │   └── health/   # 健康检查API
│   │   ├── dashboard/    # 管理面板
│   │   └── layout.tsx    # 根布局
│   ├── components/        # React 组件
│   └── utils/            # 工具函数
├── docs/                  # 文档
│   ├── api/              # API 文档
│   ├── implementation/   # 实现文档
│   └── deployment/       # 部署文档
├── tests/                 # 测试文件
├── lib/                   # 库文件
│   ├── db-connection.ts  # 数据库连接
│   ├── db-schema.ts      # 数据库模式
│   └── cors.ts           # CORS 配置
├── scripts/              # 脚本文件
├── drizzle/              # 数据库迁移
└── public/               # 静态资源
```

## 🧪 测试

运行测试脚本：

```bash
# 运行基础测试
npm run test

# 运行API过期测试
npm run test:api

# 运行新功能测试
npm run test:features

# 运行生产环境测试
npm run test:production

# 运行性能测试
npm run test:performance

# 运行所有测试
npm run test:all
```

## 📚 API 文档

详细的API文档请查看 `docs/api/` 目录：

- [API 快速参考](docs/api/API_QUICK_REFERENCE.md)
- [API 技术文档](docs/api/API_TECHNICAL_DOCUMENTATION.md)
- [激活码API文档](docs/api/激活码API文档.md)
- [Postman 集合](docs/api/API_POSTMAN_COLLECTION.json)

### 主要API端点

- `GET /api/health` - 健康检查
- `GET /api/activation-codes` - 获取激活码列表
- `POST /api/activation-codes` - 创建新激活码
- `PUT /api/activation-codes/:id` - 更新激活码
- `DELETE /api/activation-codes/:id` - 删除激活码

## 🛠️ 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript
- **数据库**：Neon PostgreSQL
- **ORM**：Drizzle ORM
- **验证**：Zod
- **加密**：crypto-js
- **部署**：Vercel

## 📈 性能指标

- **API响应时间**：< 200ms
- **数据库查询**：< 100ms
- **并发处理**：支持高并发请求
- **错误率**：< 0.1%
- **可用性**：99.9%

## 🔧 开发工具

```bash
# 数据库管理
npm run db:studio

# 部署检查
npm run deploy:check

# 代码检查
npm run lint

# 构建项目
npm run build
```

## 📝 注意事项

- 确保数据库连接字符串正确配置
- API密钥需要妥善保管，不要提交到版本控制
- 生产环境建议使用环境变量管理敏感信息
- 定期备份数据库数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

© 2024 LACS Team. 保留所有权利。

## 📦 部署

项目配置为在 Vercel 上部署。详细部署说明请查看 `docs/deployment/` 目录。

### 环境变量配置

在 Vercel 中配置以下环境变量：
- `DATABASE_URL`
- `API_KEY`
- `NODE_ENV`

---

如需帮助请联系项目维护者。
