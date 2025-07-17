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

// 兼容utf-8的base64解码
function base64ToUtf8(str: string): string {
  if (typeof window !== 'undefined' && window.atob) {
    const binary = window.atob(str)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    return new TextDecoder('utf-8').decode(bytes)
  } else {
    // Node.js 环境
    return Buffer.from(str, 'base64').toString('utf-8')
  }
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
  
  // 动态加载指定md文件内容
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('github_access_token') : null
        if (!token) {
          alert('未检测到GitHub登录令牌，请重新登录')
          setLoading(false)
          return
        }
        // 约定：articleId为文件sha，path通过query参数或localStorage传递
        let filePath = ''
        if (typeof window !== 'undefined') {
          filePath = window.sessionStorage.getItem('edit_article_path') || ''
        }
        if (!filePath) {
          alert('未找到文章文件路径，无法加载')
          setLoading(false)
          return
        }
        const fileRes = await fetch(`https://api.github.com/repos/LACS-Official/appwebsite-hugo/contents/${filePath}`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json',
          },
        })
        if (!fileRes.ok) throw new Error('获取文章内容失败: ' + fileRes.status)
        const fileData = await fileRes.json()
        const contentRaw = typeof fileData.content === 'string' ? base64ToUtf8(fileData.content.replace(/\n/g, '')) : ''
        // 解析frontmatter
        const match = contentRaw.match(/^---([\s\S]*?)---\s*([\s\S]*)$/)
        const frontmatter: Record<string, unknown> = {}
        let body = contentRaw
        if (match) {
          const yaml = match[1]
          body = match[2]
          yaml.split(/\r?\n/).forEach(line => {
            const idx = line.indexOf(':')
            if (idx > -1) {
              const key = line.slice(0, idx).trim()
              const value = line.slice(idx + 1).trim()
              if (value.startsWith('[') && value.endsWith(']')) {
                frontmatter[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/^\"|\"$/g, ''))
              } else if (value === 'true' || value === 'false') {
                frontmatter[key] = value === 'true'
              } else if (/^\".*\"$/.test(value)) {
                frontmatter[key] = value.slice(1, -1)
              } else {
                frontmatter[key] = value
              }
            }
          })
        }
        setFrontmatter({
          title: frontmatter.title as string || '',
          date: frontmatter.date as string || new Date().toISOString(),
          draft: frontmatter.draft as boolean ?? true,
          categories: (frontmatter.categories as string[]) || [],
          tags: (frontmatter.tags as string[]) || [],
          version: frontmatter.version as string,
          size: frontmatter.size as string,
          downloads: frontmatter.downloads as Record<string, string> | undefined,
          official_website: frontmatter.official_website as string,
          platforms: frontmatter.platforms as string[] | undefined,
          system_requirements: frontmatter.system_requirements as Record<string, string[]> | undefined,
          changelog: frontmatter.changelog as string[] | undefined,
          previous_versions: frontmatter.previous_versions as Array<{version: string; date: string; changes: string[]}> | undefined,
          image: frontmatter.image as string,
        })
        setContent(body)
      } catch (e) {
        alert(e instanceof Error ? e.message : '加载文章失败')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
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
        } else if (typeof value === 'object' && value !== null) {
          const objStr = Object.entries(value as Record<string, unknown>)
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
  const handleSave = async () => {
    if (!frontmatter.title.trim()) {
      alert('请输入文章标题')
      return
    }
    const markdown = generateMarkdown()
    // 获取path
    let filePath = ''
    if (typeof window !== 'undefined') {
      filePath = window.sessionStorage.getItem('edit_article_path') || ''
    }
    if (!filePath) {
      alert('未找到文章文件路径，无法保存')
      return
    }
    // 获取sha
    let sha = ''
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('github_access_token') : null
      if (!token) {
        alert('未检测到GitHub登录令牌，请重新登录')
        return
      }
      const fileRes = await fetch(`https://api.github.com/repos/LACS-Official/appwebsite-hugo/contents/${filePath}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      })
      if (!fileRes.ok) throw new Error('获取文章sha失败: ' + fileRes.status)
      const fileData = await fileRes.json()
      sha = fileData.sha
      // base64编码内容
      let contentBase64 = ''
      if (typeof window !== 'undefined' && window.btoa) {
        contentBase64 = window.btoa(unescape(encodeURIComponent(markdown)))
      } else {
        contentBase64 = Buffer.from(markdown, 'utf-8').toString('base64')
      }
      // 调用GitHub API保存
      const res = await fetch(`https://api.github.com/repos/LACS-Official/appwebsite-hugo/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `更新文章：${frontmatter.title}`,
          content: contentBase64,
          sha,
        })
      })
      if (!res.ok) throw new Error('保存失败: ' + res.status)
      alert('文章更新成功！')
      router.push(`/dashboard/hugo/${params.id}`)
    } catch (e) {
      alert(e instanceof Error ? e.message : '保存失败')
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
