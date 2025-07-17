'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import styles from './page.module.css'
import Navigation from '@/components/Navigation'

// Hugo文章数据类型
interface HugoArticle {
  id: string
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
  content: string
}

export default function HugoManagement() {
  const params = useParams()
  const router = useRouter()
  const [articles, setArticles] = useState<HugoArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDraft, setFilterDraft] = useState<'all' | 'published' | 'draft'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 获取所有md文件
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('github_access_token') : null
        if (!token) {
          setError('未检测到GitHub登录令牌，请重新登录')
          setLoading(false)
          return
        }
        // 递归获取content目录下所有文件
        const treeRes = await fetch('https://api.github.com/repos/LACS-Official/appwebsite-hugo/git/trees/main?recursive=1', {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json',
          },
        })
        if (!treeRes.ok) throw new Error('获取仓库文件树失败: ' + treeRes.status)
        const treeData = await treeRes.json()
        const mdFiles = (treeData.tree || []).filter((item: { path: string; sha: string; type: string }) =>
          typeof item.path === 'string' && item.path.startsWith('content/') && item.path.endsWith('.md') && item.type === 'blob'
        )
        // 并发获取每个md文件内容
        const articlePromises = mdFiles.map(async (file: { path: string; sha: string; type: string }) => {
          const fileRes = await fetch(`https://api.github.com/repos/LACS-Official/appwebsite-hugo/contents/${file.path}`, {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github+json',
            },
          })
          if (!fileRes.ok) return null
          const fileData = await fileRes.json()
          // 解析base64内容
          const contentRaw = typeof fileData.content === 'string' ? atob(fileData.content.replace(/\n/g, '')) : ''
          // 解析frontmatter
          const match = contentRaw.match(/^---([\s\S]*?)---\s*([\s\S]*)$/)
          const frontmatter: Record<string, unknown> = {}
          let body = contentRaw
          if (match) {
            // 简单YAML解析
            const yaml = match[1]
            body = match[2]
            yaml.split(/\r?\n/).forEach(line => {
              const idx = line.indexOf(':')
              if (idx > -1) {
                const key = line.slice(0, idx).trim()
                const value = line.slice(idx + 1).trim()
                if (value.startsWith('[') && value.endsWith(']')) {
                  // 数组
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
          return {
            id: file.sha,
            title: frontmatter.title || (file.path.split('/').pop()?.replace(/\.md$/, '') ?? ''),
            date: frontmatter.date || '',
            draft: frontmatter.draft ?? false,
            categories: frontmatter.categories || [],
            tags: frontmatter.tags || [],
            version: frontmatter.version,
            size: frontmatter.size,
            downloads: frontmatter.downloads,
            official_website: frontmatter.official_website,
            platforms: frontmatter.platforms,
            system_requirements: frontmatter.system_requirements,
            changelog: frontmatter.changelog,
            previous_versions: frontmatter.previous_versions,
            image: frontmatter.image,
            content: body,
            path: file.path,
            sha: file.sha,
          } as HugoArticle & { path: string; sha: string }
        })
        const articles = (await Promise.all(articlePromises)).filter(Boolean) as (HugoArticle & { path: string; sha: string })[]
        setArticles(articles)
      } catch (e) {
        setError(e instanceof Error ? e.message : '获取文章失败')
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  // 获取所有分类
  const categories = Array.from(new Set(articles.flatMap(article => article.categories)))

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    const title = String(article.title || '')
    const tags = Array.isArray(article.tags) ? article.tags : (article.tags ? [String(article.tags)] : [])
    const categories = Array.isArray(article.categories) ? article.categories : (article.categories ? [String(article.categories)] : [])
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some(tag => String(tag).toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDraft = filterDraft === 'all' ||
      (filterDraft === 'published' && article.draft === false) ||
      (filterDraft === 'draft' && article.draft === true)
    const matchesCategory = selectedCategory === 'all' ||
      categories.map(String).includes(String(selectedCategory))
    return matchesSearch && matchesDraft && matchesCategory
  })

  // 处理新增文章
  const handleNewArticle = () => {
    router.push(`/dashboard/hugo/${params.id}/new`)
  }

  // 处理编辑文章
  const handleEditArticle = (articleId: string) => {
    router.push(`/dashboard/hugo/${params.id}/edit/${articleId}`)
  }

  // 处理删除文章
  const handleDeleteArticle = (articleId: string) => {
    alert('请在后续版本中实现通过GitHub API删除md文件')
  }

  // 处理发布/取消发布
  const handleToggleDraft = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId ? { ...article, draft: !article.draft } : article
    ))
  }

  return (
    <div className={styles.hugoManagement}>
      {loading && <div style={{textAlign:'center',padding:'2rem'}}>正在加载文章...</div>}
      {error && <div style={{color:'red',textAlign:'center',padding:'2rem'}}>{error}</div>}
      {/* 导航栏 */}
      <Navigation />

      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>Hugo文章管理</h1>
            <p>管理appwebsite-hugo仓库的Markdown文章</p>
          </div>

          <button
            className={`${styles.newArticleButton} btn btn-primary`}
            onClick={handleNewArticle}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            新增文章
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className={styles.content}>
        {/* 过滤器 */}
        <div className={styles.filters}>
        <div className={styles.searchBox}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          value={filterDraft} 
          onChange={(e) => setFilterDraft(e.target.value as unknown as 'all' | 'published' | 'draft')}
          className={styles.filterSelect}
        >
          <option value="all">所有文章</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>

        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">所有分类</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* 文章列表 */}
      <div className={styles.articleList}>
        {filteredArticles.map((article, index) => (
          <div
              key={article.id}
              className={`${styles.articleCard} card fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
            <div className={styles.articleHeader}>
              <div className={styles.articleTitle}>
                <h3>{article.title}</h3>
                <div className={styles.articleMeta}>
                  <span className={styles.articleDate}>
                    {new Date(article.date).toLocaleDateString('zh-CN')}
                  </span>
                  {article.draft && (
                    <span className={styles.draftBadge}>草稿</span>
                  )}
                </div>
              </div>
              
              <div className={styles.articleActions}>
                <button 
                  className={styles.actionButton}
                  onClick={() => handleEditArticle(article.id)}
                  title="编辑文章"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                
                <button 
                  className={`${styles.actionButton} ${article.draft ? styles.publishButton : styles.unpublishButton}`}
                  onClick={() => handleToggleDraft(article.id)}
                  title={article.draft ? '发布文章' : '设为草稿'}
                >
                  {article.draft ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  )}
                </button>
                
                <button 
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDeleteArticle(article.id)}
                  title="删除文章"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.articleCategories}>
              {article.categories.map(category => (
                <span key={category} className={styles.category}>{category}</span>
              ))}
            </div>

            <div className={styles.articleTags}>
              {article.tags.map(tag => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>

            {article.version && (
              <div className={styles.articleVersion}>
                版本: {article.version}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <h3>暂无文章</h3>
          <p>开始创建您的第一篇Hugo文章吧</p>
          <button 
            className={`btn btn-primary`}
            onClick={handleNewArticle}
          >
            新增文章
          </button>
        </div>
      )}
      </div>
    </div>
  )
}
