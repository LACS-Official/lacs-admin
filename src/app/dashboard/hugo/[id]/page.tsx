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

// 模拟数据
const mockArticles: HugoArticle[] = [
  {
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
    content: 'Visual Studio Code 是一个轻量级但功能强大的源代码编辑器...'
  },
  {
    id: '2',
    title: 'IntelliJ IDEA',
    date: '2023-08-10T10:00:00+08:00',
    draft: false,
    categories: ['开发工具'],
    tags: ['Java', 'IDE', '开发'],
    version: '2023.2',
    size: '650MB',
    downloads: {
      official: 'https://www.jetbrains.com/idea/download/',
      baidu: 'https://pan.baidu.com/s/1idea_example'
    },
    official_website: 'https://www.jetbrains.com/idea/',
    platforms: ['Windows', 'macOS', 'Linux'],
    content: 'IntelliJ IDEA 是一个功能强大的Java集成开发环境...'
  }
]

export default function HugoManagement() {
  const params = useParams()
  const router = useRouter()
  const [articles, setArticles] = useState<HugoArticle[]>(mockArticles)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDraft, setFilterDraft] = useState<'all' | 'published' | 'draft'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // 获取所有分类
  const categories = Array.from(new Set(articles.flatMap(article => article.categories)))

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDraft = filterDraft === 'all' || 
                        (filterDraft === 'published' && !article.draft) ||
                        (filterDraft === 'draft' && article.draft)
    
    const matchesCategory = selectedCategory === 'all' || 
                           article.categories.includes(selectedCategory)
    
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
    if (confirm('确定要删除这篇文章吗？')) {
      setArticles(prev => prev.filter(article => article.id !== articleId))
    }
  }

  // 处理发布/取消发布
  const handleToggleDraft = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId ? { ...article, draft: !article.draft } : article
    ))
  }

  return (
    <div className={styles.hugoManagement}>
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
          onChange={(e) => setFilterDraft(e.target.value as any)}
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
