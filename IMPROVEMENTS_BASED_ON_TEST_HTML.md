# 基于 test.html 的改进实现

## 参考的关键特性

从 test.html 中学习并实现了以下关键特性：

### 1. 完整的 Frontmatter 生成

**test.html 的实现**：
```javascript
const markdownContent = `---
title: "${articleData.title}"
date: ${articleData.date}+08:00
draft: ${articleData.draft}
categories:
  - ${articleData.categories.join('\n  - ')}
tags:
  - ${articleData.tags.join('\n  - ')}
rating: ${articleData.rating}
version: "${articleData.version}"
size: "${articleData.size}"
downloadCount: ${articleData.downloadCount}
downloads:
  official: "${articleData.downloads.official}"
platforms: [${articleData.platforms.map(plat => "${plat}").join(', ')}]
system_requirements:
  Windows:
    ${articleData.systemRequirements.Windows?.map(req => `- ${req}`).join('\n    ')}
  macOS:
    ${articleData.systemRequirements.macOS?.map(req => `- ${req}`).join('\n    ')}
  Linux:
    ${articleData.systemRequirements.Linux?.map(req => `- ${req}`).join('\n    ')}
changelog:
  ${articleData.changelog.map(item => `- ${item}`).join('\n  ')}
previous_versions:
  ${articleData.previousVersions.map(version => `- version: "${version.version}"
    date: ${version.date}
    changes:
      ${version.changes.map(change => `- ${change}`).join('\n      ')}`).join('\n  ')}
---

${articleData.content}
`;
```

**我们的改进实现**：
```typescript
// 在 src/utils/github-api.ts 中
export function generateHugoMarkdown(data: HugoArticleData): string {
  const frontmatter: string[] = ['---']
  
  // 基础字段
  frontmatter.push(`title: "${data.title}"`)
  frontmatter.push(`date: ${data.date}${data.date.includes('T') ? '' : 'T00:00:00+08:00'}`)
  frontmatter.push(`draft: ${data.draft}`)
  
  // 分类和标签
  if (data.categories && data.categories.length > 0) {
    frontmatter.push('categories:')
    data.categories.forEach(cat => frontmatter.push(`  - "${cat}"`))
  }
  
  // ... 其他字段的完整处理
  
  return frontmatter.join('\n')
}
```

### 2. 用户仓库支持

**test.html 的实现**：
```javascript
// 获取当前登录用户信息
const currentUser = JSON.parse(localStorage.getItem('github_user'));
// 使用实际用户名构建请求URL
fetch(`https://api.github.com/repos/${currentUser.login}/${githubData.repo}/contents/${githubData.path}`, {
```

**我们的改进实现**：
```typescript
// 获取当前用户的仓库配置
export function getUserHugoRepo(): { owner: string; name: string; branch: string } {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('github_user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        return {
          owner: user.login || DEFAULT_HUGO_REPO.owner,
          name: DEFAULT_HUGO_REPO.name,
          branch: DEFAULT_HUGO_REPO.branch
        }
      } catch (error) {
        console.warn('Failed to parse user info:', error)
      }
    }
  }
  return DEFAULT_HUGO_REPO
}
```

### 3. 直接 GitHub API 调用

**test.html 的实现**：
```javascript
fetch(`https://api.github.com/repos/${currentUser.login}/${githubData.repo}/contents/${githubData.path}`, {
  method: 'PUT',
  headers: {
    'Authorization': `token ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: githubData.message,
    content: githubData.content
  })
})
```

**我们的改进实现**：
```typescript
// 在新建文章页面中
await githubApi.updateFile(
  repoConfig.owner,
  repoConfig.name,
  filePath,
  markdownContent,
  `Create new article: ${frontmatter.title}`
)
```

### 4. 智能文件路径生成

**test.html 的实现**：
```javascript
const githubData = {
  repo: selectedRepo,
  path: `content/${selectedPath}/${articleData.slug}.md`,
  message: `Create new article: ${articleData.title}`,
  content: btoa(unescape(encodeURIComponent(markdownContent))) // Base64 编码
};
```

**我们的改进实现**：
```typescript
// 生成文件名 slug
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

// 生成文件路径
const slug = generateSlug(frontmatter.title)
const filePath = `content/software/${slug}.md`
```

## 主要改进点

### 1. 类型安全
- 添加了完整的 TypeScript 接口定义
- 所有数据结构都有明确的类型约束

### 2. 错误处理
- 统一的错误处理机制
- 用户友好的错误提示
- 区分不同类型的错误（404、401、403等）

### 3. 代码复用
- 统一的 GitHub API 工具类
- 可复用的 Markdown 生成函数
- 集中的配置管理

### 4. 用户体验
- 自动获取用户仓库信息
- 智能的文件名生成
- 完整的 frontmatter 支持

## 使用示例

### 新建文章
```typescript
const articleData: HugoArticleData = {
  title: "Visual Studio Code",
  date: "2024-01-15",
  draft: false,
  categories: ["开发工具"],
  tags: ["编辑器", "微软"],
  version: "1.85.0",
  size: "85MB",
  downloads: {
    official: "https://code.visualstudio.com/download",
    quark: "https://example.com/vscode-quark"
  },
  platforms: ["Windows", "macOS", "Linux"],
  content: "Visual Studio Code 是一个轻量级但功能强大的源代码编辑器..."
}

const markdownContent = generateHugoMarkdown(articleData)
await githubApi.updateFile(owner, repo, path, markdownContent, message)
```

### 生成的 Markdown 示例
```yaml
---
title: "Visual Studio Code"
date: 2024-01-15T00:00:00+08:00
draft: false
categories:
  - "开发工具"
tags:
  - "编辑器"
  - "微软"
version: "1.85.0"
size: "85MB"
downloads:
  official: "https://code.visualstudio.com/download"
  quark: "https://example.com/vscode-quark"
platforms: ["Windows", "macOS", "Linux"]
---

Visual Studio Code 是一个轻量级但功能强大的源代码编辑器...
```

## 总结

通过参考 test.html 的实现，我们成功地：

1. **统一了文章提交方式**：使用标准的 GitHub Contents API
2. **改进了 Frontmatter 生成**：支持所有 Hugo 文章字段
3. **增强了用户体验**：自动获取用户仓库，智能生成文件路径
4. **提高了代码质量**：类型安全、错误处理、代码复用

这些改进使得系统更加健壮、易用和可维护。
