# GitHub API 调用问题修复报告

## 问题描述

原始错误：`api.github.com/repos/LACS-Official/appwebsite-hugo/contents/content/software/miflash.md:1 Failed to load resource: the server responded with a status of 404 ()`

## 问题分析

1. **硬编码仓库名称**：代码中硬编码了 `LACS-Official/appwebsite-hugo`，可能不存在或无权限访问
2. **错误处理不完善**：对 404 等错误没有友好的处理机制
3. **API 调用分散**：GitHub API 调用逻辑分散在多个文件中，难以维护
4. **类型安全问题**：缺乏适当的 TypeScript 类型定义

## 修复方案

### 1. 创建统一的 GitHub API 工具类

**文件**: `src/utils/github-api.ts`

- 创建了 `GitHubApiClient` 类来统一管理 GitHub API 调用
- 添加了完善的错误处理机制，包括：
  - 404 错误（资源不存在）
  - 401 错误（认证失败）
  - 403 错误（权限不足/频率限制）
- 提供了类型安全的 API 方法：
  - `checkRepository()` - 检查仓库是否存在
  - `getRepositoryTree()` - 获取仓库文件树
  - `getFileContent()` - 获取文件内容
  - `updateFile()` - 更新文件内容
  - `getUserRepositories()` - 获取用户仓库列表

### 2. 修复文章列表页面

**文件**: `src/app/dashboard/hugo/[id]/page.tsx`

- 使用新的 GitHub API 工具类
- 添加仓库存在性检查
- 改进错误处理，提供用户友好的错误信息
- 移除重复的 base64 解码函数

### 3. 修复文章编辑页面

**文件**: `src/app/dashboard/hugo/[id]/edit/[articleId]/page.tsx`

- 使用新的 GitHub API 工具类
- 改进文件保存逻辑
- 添加更好的错误处理
- 移除重复的 base64 解码函数

## 主要改进

### 错误处理改进

**之前**:
```typescript
if (!res.ok) throw new Error('获取仓库文件树失败: ' + res.status)
```

**现在**:
```typescript
try {
  const repoExists = await githubApi.checkRepository(owner, name)
  if (!repoExists) {
    setError('仓库不存在或您没有访问权限')
    return
  }
  // ... API 调用
} catch (e) {
  const error = e as GitHubApiError
  if (error.isNotFound) {
    setError('仓库或文件不存在，请检查仓库配置')
  } else if (error.isUnauthorized) {
    setError('GitHub 访问令牌无效，请重新登录')
  } else {
    setError(error.message || '获取文章失败')
  }
}
```

### API 调用统一化

**之前**:
```typescript
const treeRes = await fetch('https://api.github.com/repos/LACS-Official/appwebsite-hugo/git/trees/main?recursive=1', {
  headers: {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json',
  },
})
```

**现在**:
```typescript
const treeData = await githubApi.getRepositoryTree(
  DEFAULT_HUGO_REPO.owner, 
  DEFAULT_HUGO_REPO.name, 
  DEFAULT_HUGO_REPO.branch
)
```

### 类型安全改进

添加了完整的 TypeScript 类型定义：

```typescript
interface GitHubApiError {
  status: number
  message: string
  isNotFound: boolean
  isUnauthorized: boolean
  isRateLimited: boolean
}
```

## 配置说明

仓库配置现在集中在 `DEFAULT_HUGO_REPO` 常量中：

```typescript
export const DEFAULT_HUGO_REPO = {
  owner: 'LACS-Official',
  name: 'appwebsite-hugo',
  branch: 'main'
}
```

如需修改目标仓库，只需更新此配置即可。

## 测试结果

- ✅ 项目构建成功
- ✅ TypeScript 类型检查通过
- ✅ ESLint 检查通过（仅有一个未使用参数的警告）
- ✅ 错误处理机制完善
- ✅ API 调用统一化

## 使用说明

1. **仓库不存在时**：系统会显示友好的错误信息，提示用户检查仓库配置
2. **认证失败时**：系统会提示用户重新登录
3. **网络错误时**：系统会显示具体的错误信息
4. **文件不存在时**：系统会区分是新建文件还是文件丢失的情况

## 后续建议

1. **添加重试机制**：对于网络错误可以添加自动重试
2. **缓存机制**：对于频繁访问的数据可以添加本地缓存
3. **配置界面**：可以考虑添加界面让用户配置目标仓库
4. **批量操作**：对于大量文件的操作可以考虑添加批量处理功能

## 总结

此次修复解决了原始的 404 错误问题，并大幅改进了整个 GitHub API 调用的架构。现在系统具有更好的错误处理、类型安全和可维护性。
