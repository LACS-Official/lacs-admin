'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styles from './page.module.css'
import Navigation from '@/components/Navigation'
import { githubApi, GitHubApiError, getUserHugoRepo, generateHugoMarkdown, HugoArticleData } from '@/utils/github-api'

interface HugoFrontmatter {
  title: string
  date: string
  draft: boolean
  categories: string[]
  tags: string[]
  version?: string
  size?: string
  downloads?: {
    official?: string
    quark?: string
    netdisk?: string
    baidu?: string
    thunder?: string
  }
  official_website?: string
  platforms?: string[]
  system_requirements?: {
    [key: string]: string[]
  }
  changelog?: string[]
  previous_versions?: Array<{
    version: string
    date: string
    changes: string[]
  }>
  image?: string
}

function isPlainObject(val: unknown): val is object {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export default function NewHugoArticle() {
  const params = useParams()
  const router = useRouter()
  
  const [frontmatter, setFrontmatter] = useState<HugoFrontmatter>({
    title: '',
    date: new Date().toISOString(),
    draft: true,
    categories: [],
    tags: [],
  })
  
  const [content, setContent] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [tagInput, setTagInput] = useState('')
  
  // 处理基础字段更新
  const updateFrontmatter = (field: keyof HugoFrontmatter, value: unknown) => {
    setFrontmatter(prev => ({ ...prev, [field]: value }))
  }
  
  // 处理数组字段添加
  const addToArray = (field: 'categories' | 'tags' | 'platforms' | 'changelog', value: string, inputSetter: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = frontmatter[field] as string[] || []
      if (!currentArray.includes(value.trim())) {
        updateFrontmatter(field, [...currentArray, value.trim()])
      }
      inputSetter('')
    }
  }
  
  // 处理数组字段删除
  const removeFromArray = (field: 'categories' | 'tags' | 'platforms' | 'changelog', value: string) => {
    const currentArray = frontmatter[field] as string[] || []
    updateFrontmatter(field, currentArray.filter(item => item !== value))
  }
  
  // 生成Markdown内容
  const generateMarkdown = () => {
    const frontmatterObj: Record<string, unknown> = { ...frontmatter }
    
    // 清理空值
    Object.keys(frontmatterObj).forEach(key => {
      const value = frontmatterObj[key];
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (isPlainObject(value) && Object.keys(value).length === 0)
      ) {
        delete frontmatterObj[key];
      }
    })
    
    // 清理downloads中的空值
    if (frontmatterObj.downloads && typeof frontmatterObj.downloads === 'object' && frontmatterObj.downloads !== null) {
      const downloadsObj = frontmatterObj.downloads as Record<string, unknown>;
      Object.keys(downloadsObj).forEach(key => {
        if (!downloadsObj[key]) {
          delete downloadsObj[key];
        }
      });
      if (Object.keys(downloadsObj).length === 0) {
        delete frontmatterObj.downloads;
      }
    }
    
    // 清理system_requirements中的空值
    if (frontmatterObj.system_requirements && typeof frontmatterObj.system_requirements === 'object' && frontmatterObj.system_requirements !== null) {
      const sysReqObj = frontmatterObj.system_requirements as Record<string, unknown[]>;
      Object.keys(sysReqObj).forEach(key => {
        if (!sysReqObj[key] || sysReqObj[key].length === 0) {
          delete sysReqObj[key];
        }
      });
      if (Object.keys(sysReqObj).length === 0) {
        delete frontmatterObj.system_requirements;
      }
    }
    
    const yamlContent = Object.entries(frontmatterObj)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.map(v => `"${v}"`).join(', ')}]`
        } else if (typeof value === 'object' && value !== null) {
          const objStr = Object.entries(value)
            .map(([k, v]) => {
              if (Array.isArray(v)) {
                return `  ${k}:\n${(v as string[]).map(item => `    - "${item}"`).join('\n')}`
              }
              return `  ${k}: "${v}"`
            })
            .join('\n')
          return `${key}:\n${objStr}`
        } else if (typeof value === 'boolean') {
          return `${key}: ${value}`
        } else {
          return `${key}: "${value}"`
        }
      })
      .join('\n')
    
    return `---\n${yamlContent}\n---\n\n${content}`
  }
  
  // 生成文件名 slug
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
  }

  // 处理保存
  const handleSave = async () => {
    if (!frontmatter.title.trim()) {
      alert('请输入文章标题')
      return
    }

    if (!content.trim()) {
      alert('请输入文章内容')
      return
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('github_access_token') : null
      if (!token) {
        alert('未检测到GitHub登录令牌，请重新登录')
        return
      }

      // 获取用户仓库配置
      const repoConfig = getUserHugoRepo()

      // 准备文章数据
      const articleData: HugoArticleData = {
        title: frontmatter.title,
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        draft: frontmatter.draft,
        categories: frontmatter.categories,
        tags: frontmatter.tags,
        version: frontmatter.version,
        size: frontmatter.size,
        downloads: frontmatter.downloads,
        official_website: frontmatter.official_website,
        platforms: frontmatter.platforms,
        system_requirements: frontmatter.system_requirements,
        changelog: frontmatter.changelog,
        previous_versions: frontmatter.previous_versions,
        image: frontmatter.image,
        content: content
      }

      // 生成 Markdown 内容
      const markdownContent = generateHugoMarkdown(articleData)

      // 生成文件路径
      const slug = generateSlug(frontmatter.title)
      const filePath = `content/software/${slug}.md`

      // 提交到 GitHub
      await githubApi.updateFile(
        repoConfig.owner,
        repoConfig.name,
        filePath,
        markdownContent,
        `Create new article: ${frontmatter.title}`
      )

      alert('文章发布成功！')
      router.push(`/dashboard/hugo/${params.id}`)
    } catch (error) {
      const apiError = error as GitHubApiError
      if (apiError.isNotFound) {
        alert('仓库不存在或您没有访问权限')
      } else if (apiError.isUnauthorized) {
        alert('GitHub 访问令牌无效，请重新登录')
      } else {
        alert(apiError.message || '发布失败，请重试')
      }
    }
  }
  
  // 处理预览
  const handlePreview = () => {
    const markdown = generateMarkdown()
    const newWindow = window.open('', '_blank')
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>预览 - ${frontmatter.title}</title></head>
          <body>
            <pre style="white-space: pre-wrap; font-family: monospace; padding: 20px;">
              ${markdown}
            </pre>
          </body>
        </html>
      `)
    }
  }

  return (
    <div className={styles.editor}>
      {/* 导航栏 */}
      <Navigation />

      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>新增Hugo文章</h1>
            <p>创建新的Markdown格式文章</p>
          </div>

          <div className={styles.headerActions}>
            <button onClick={handlePreview} className={styles.previewButton}>
              预览
            </button>
            <button onClick={handleSave} className={`btn btn-primary`}>
              保存文章
            </button>
          </div>
        </div>
      </div>

      <div className={styles.editorContent}>
        {/* 左侧：Frontmatter编辑 */}
        <div className={styles.frontmatterPanel}>
          <h3>文章信息</h3>
          
          {/* 基础信息 */}
          <div className={styles.section}>
            <h4>基础信息</h4>
            
            <div className={styles.formGroup}>
              <label>标题 *</label>
              <input
                type="text"
                value={frontmatter.title}
                onChange={(e) => updateFrontmatter('title', e.target.value)}
                placeholder="输入文章标题"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>发布日期</label>
              <input
                type="datetime-local"
                value={frontmatter.date.slice(0, 16)}
                onChange={(e) => updateFrontmatter('date', e.target.value + ':00+08:00')}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={frontmatter.draft}
                  onChange={(e) => updateFrontmatter('draft', e.target.checked)}
                />
                <span className={styles.checkboxCustom}></span>
                保存为草稿
              </label>
            </div>
          </div>

          {/* 分类和标签 */}
          <div className={styles.section}>
            <h4>分类和标签</h4>
            
            <div className={styles.formGroup}>
              <label>分类</label>
              <div className={styles.inputWithAdd}>
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  placeholder="输入分类后按回车添加"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addToArray('categories', categoryInput, setCategoryInput)
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => addToArray('categories', categoryInput, setCategoryInput)}
                >
                  添加
                </button>
              </div>
              <div className={styles.tags}>
                {frontmatter.categories.map((category) => (
                  <span key={category} className={styles.tag}>
                    {category}
                    <button onClick={() => removeFromArray('categories', category)}>×</button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>标签</label>
              <div className={styles.inputWithAdd}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="输入标签后按回车添加"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addToArray('tags', tagInput, setTagInput)
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => addToArray('tags', tagInput, setTagInput)}
                >
                  添加
                </button>
              </div>
              <div className={styles.tags}>
                {frontmatter.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button onClick={() => removeFromArray('tags', tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 软件信息（可选） */}
          <div className={styles.section}>
            <h4>软件信息（可选）</h4>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>版本</label>
                <input
                  type="text"
                  value={frontmatter.version || ''}
                  onChange={(e) => updateFrontmatter('version', e.target.value)}
                  placeholder="如：1.0.0"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>大小</label>
                <input
                  type="text"
                  value={frontmatter.size || ''}
                  onChange={(e) => updateFrontmatter('size', e.target.value)}
                  placeholder="如：85MB"
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>官方网站</label>
              <input
                type="url"
                value={frontmatter.official_website || ''}
                onChange={(e) => updateFrontmatter('official_website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>封面图片</label>
              <input
                type="text"
                value={frontmatter.image || ''}
                onChange={(e) => updateFrontmatter('image', e.target.value)}
                placeholder="/images/example.jpg"
              />
            </div>
          </div>
        </div>

        {/* 右侧：内容编辑 */}
        <div className={styles.contentPanel}>
          <h3>文章内容</h3>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在这里编写文章内容（支持Markdown格式）..."
            className={styles.contentEditor}
          />
        </div>
      </div>
    </div>
  )
}
