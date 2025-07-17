'use client'

import { useState, useEffect } from 'react'
import { Metadata } from 'next'
import styles from './page.module.css'
import RepoModal from '@/components/RepoModal'
import Navigation from '@/components/Navigation'

// 模拟的GitHub仓库数据类型
interface GitHubRepo {
  id: string
  name: string
  description: string
  url: string
  language: string
  stars: number
  forks: number
  lastUpdated: string
  isPrivate: boolean
  topics: string[]
}

// 模拟数据
const mockRepos: GitHubRepo[] = [
  {
    id: '1',
    name: 'appwebsite-hugo',
    description: 'Hugo静态网站生成器项目，用于构建现代化的网站',
    url: 'https://github.com/user/appwebsite-hugo',
    language: 'HTML',
    stars: 45,
    forks: 12,
    lastUpdated: '2024-01-15',
    isPrivate: false,
    topics: ['hugo', 'website', 'static-site']
  },
  {
    id: '2',
    name: 'lacs-admin',
    description: 'LACS管理系统前端项目',
    url: 'https://github.com/user/lacs-admin',
    language: 'TypeScript',
    stars: 23,
    forks: 5,
    lastUpdated: '2024-01-17',
    isPrivate: true,
    topics: ['admin', 'dashboard', 'nextjs']
  },
  {
    id: '3',
    name: 'api-server',
    description: 'RESTful API服务器，提供后端数据接口',
    url: 'https://github.com/user/api-server',
    language: 'Go',
    stars: 67,
    forks: 18,
    lastUpdated: '2024-01-16',
    isPrivate: false,
    topics: ['api', 'golang', 'server']
  }
]

export default function Dashboard() {
  const [repos, setRepos] = useState<GitHubRepo[]>(mockRepos)
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // 过滤仓库
  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 处理仓库选择
  const handleRepoSelect = (repo: GitHubRepo) => {
    setSelectedRepo(repo)
    setShowEditModal(true)
  }

  // 处理添加仓库
  const handleAddRepo = (newRepo: Partial<GitHubRepo>) => {
    const repoToAdd = newRepo as GitHubRepo
    setRepos(prev => [...prev, repoToAdd])
  }

  // 处理编辑仓库
  const handleEditRepo = (updatedRepo: Partial<GitHubRepo>) => {
    if (!selectedRepo) return

    setRepos(prev => prev.map(repo =>
      repo.id === selectedRepo.id ? { ...repo, ...updatedRepo } : repo
    ))
  }

  // 处理删除仓库
  const handleDeleteRepo = () => {
    if (!selectedRepo) return

    setRepos(prev => prev.filter(repo => repo.id !== selectedRepo.id))
    setSelectedRepo(null)
    setShowDeleteConfirm(false)
  }

  // 处理Hugo文章管理（特殊处理appwebsite-hugo仓库）
  const handleHugoManagement = (repo: GitHubRepo) => {
    if (repo.name === 'appwebsite-hugo') {
      // 跳转到Hugo文章管理页面
      window.location.href = `/dashboard/hugo/${repo.id}`
    }
  }

  return (
    <div className={styles.dashboard}>
      {/* 导航栏 */}
      <Navigation />

      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerInfo}>
            <h1>GitHub 仓库管理</h1>
            <p>管理您的GitHub仓库，特别支持Hugo静态网站项目</p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.searchBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="搜索仓库..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className={`${styles.addButton} btn btn-primary`}
              onClick={() => setShowAddModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加仓库
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className={styles.main}>
        {/* 侧边栏 */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            <div className={styles.navSection}>
              <h3>仓库管理</h3>
              <ul>
                <li className={styles.navItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                  <span>概览</span>
                </li>
                <li className={styles.navItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                  </svg>
                  <span>所有仓库</span>
                </li>
                <li className={styles.navItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <span>Hugo文章</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* 内容区域 */}
        <div className={styles.content}>
          {/* 仓库网格 */}
          <div className={styles.repoGrid}>
            {filteredRepos.map((repo, index) => (
              <div
                key={repo.id}
                className={`${styles.repoCard} card fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.repoHeader}>
                  <div className={styles.repoTitle}>
                    <h3>{repo.name}</h3>
                    {repo.isPrivate && (
                      <span className={styles.privateBadge}>私有</span>
                    )}
                  </div>
                  <div className={styles.repoActions}>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleRepoSelect(repo)}
                      title="编辑仓库"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => {
                        setSelectedRepo(repo)
                        setShowDeleteConfirm(true)
                      }}
                      title="删除仓库"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>
                    {repo.name === 'appwebsite-hugo' && (
                      <button
                        className={`${styles.actionButton} ${styles.hugoButton}`}
                        onClick={() => handleHugoManagement(repo)}
                        title="Hugo文章管理"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14,2 14,8 20,8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10,9 9,9 8,9"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                <p className={styles.repoDescription}>{repo.description}</p>
                
                <div className={styles.repoMeta}>
                  <div className={styles.language}>
                    <span className={`${styles.languageDot} ${styles[repo.language.toLowerCase()]}`}></span>
                    {repo.language}
                  </div>
                  <div className={styles.stats}>
                    <span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                      {repo.stars}
                    </span>
                    <span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 6.1H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-10a2 2 0 0 0-2-2z"/>
                        <path d="M7 9.1v6"/>
                        <path d="M11 9.1v6"/>
                      </svg>
                      {repo.forks}
                    </span>
                  </div>
                </div>
                
                <div className={styles.repoTopics}>
                  {repo.topics.map((topic) => (
                    <span key={topic} className={styles.topic}>{topic}</span>
                  ))}
                </div>
                
                <div className={styles.repoFooter}>
                  <span className={styles.lastUpdated}>
                    更新于 {repo.lastUpdated}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 添加仓库模态框 */}
      <RepoModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddRepo}
        mode="add"
      />

      {/* 编辑仓库模态框 */}
      <RepoModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedRepo(null)
        }}
        onSave={handleEditRepo}
        repo={selectedRepo}
        mode="edit"
      />

      {/* 删除确认模态框 */}
      {showDeleteConfirm && selectedRepo && (
        <div className={styles.overlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteHeader}>
              <h3>确认删除</h3>
            </div>
            <div className={styles.deleteContent}>
              <p>您确定要删除仓库 <strong>{selectedRepo.name}</strong> 吗？</p>
              <p className={styles.deleteWarning}>此操作无法撤销。</p>
            </div>
            <div className={styles.deleteActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.cancelButton}
              >
                取消
              </button>
              <button
                onClick={handleDeleteRepo}
                className={styles.deleteConfirmButton}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
