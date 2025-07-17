'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styles from '../../new/page.module.css'
import Navigation from '@/components/Navigation'

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

// 模拟获取文章数据
const mockArticleData = {
  id: '1',
  title: 'Visual Studio Code',
  date: '2023-08-15T14:30:00+08:00',
  draft: false,
  categories: ['开发工具'],
  tags: ['编程', '工具', 'IDE'],
  version: '1.80.1',
  size: '85MB',
  downloads: {
    official: 'https://code.visualstudio.com/download',
    quark: 'https://example.com/vscode-quark',
    netdisk: 'http://example.com/vscode-123',
    baidu: 'https://pan.baidu.com/s/1vscode_example',
    thunder: 'thunder://example.com/vscode'
  },
  official_website: 'https://code.visualstudio.com',
  platforms: ['Windows', 'macOS', 'Linux'],
  system_requirements: {
    Windows: [
      'Windows 10 或更高版本（64位）',
      '1.6 GHz以上处理器',
      '1GB RAM',
      '200MB可用硬盘空间'
    ],
    macOS: [
      'macOS 10.15 Catalina或更高版本',
      'Intel或Apple Silicon处理器',
      '1GB RAM',
      '200MB可用硬盘空间'
    ],
    Linux: [
      'Ubuntu 16.04, Debian 9或更高版本',
      '1.6 GHz以上处理器',
      '1GB RAM',
      '200MB可用硬盘空间'
    ]
  },
  changelog: [
    '改进了远程开发体验',
    '增强了AI辅助编码功能',
    '优化了性能和内存使用',
    '修复了多个已知问题'
  ],
  previous_versions: [
    {
      version: '1.79.0',
      date: '2023-07-10',
      changes: [
        '添加了新的主题选项',
        '改进了搜索功能',
        '更新了内置终端'
      ]
    }
  ],
  image: '/images/vscode-banner.jpg',
  content: 'Visual Studio Code 是一个轻量级但功能强大的源代码编辑器，运行在桌面上，可用于 Windows、macOS 和 Linux。它内置了对 JavaScript、TypeScript 和 Node.js 的支持，并为其他语言（如 C++、C#、Java、Python、PHP、Go）和运行时（如 .NET 和 Unity）提供了丰富的扩展生态系统。'
}

function isPlainObject(val: unknown): val is object {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export default function EditHugoArticle() {
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
  const [loading, setLoading] = useState(true)
  
  // 加载文章数据
  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      const article = mockArticleData
      setFrontmatter({
        title: article.title,
        date: article.date,
        draft: article.draft,
        categories: article.categories,
        tags: article.tags,
        version: article.version,
        size: article.size,
        downloads: article.downloads,
        official_website: article.official_website,
        platforms: article.platforms,
        system_requirements: article.system_requirements,
        changelog: article.changelog,
        previous_versions: article.previous_versions,
        image: article.image,
      })
      setContent(article.content)
      setLoading(false)
    }, 500)
  }, [params.articleId])
  
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
        } else if (typeof value === 'object') {
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
  
  // 处理保存
  const handleSave = () => {
    if (!frontmatter.title.trim()) {
      alert('请输入文章标题')
      return
    }
    
    const markdown = generateMarkdown()
    console.log('Generated Markdown:', markdown)
    
    // 这里应该调用API更新文章
    alert('文章更新成功！')
    router.push(`/dashboard/hugo/${params.id}`)
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

  if (loading) {
    return (
      <div className={styles.editor}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div>加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editor}>
      {/* 导航栏 */}
      <Navigation />

      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>编辑Hugo文章</h1>
            <p>编辑现有的Markdown格式文章</p>
          </div>

          <div className={styles.headerActions}>
            <button onClick={handlePreview} className={styles.previewButton}>
              预览
            </button>
            <button onClick={handleSave} className={`btn btn-primary`}>
              保存更改
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
