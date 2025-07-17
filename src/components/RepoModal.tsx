'use client'

import { useState, useEffect } from 'react'
import styles from './RepoModal.module.css'

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

interface RepoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (repo: Partial<GitHubRepo>) => void
  repo?: GitHubRepo | null
  mode: 'add' | 'edit'
}

export default function RepoModal({ isOpen, onClose, onSave, repo, mode }: RepoModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    language: 'JavaScript',
    isPrivate: false,
    topics: [] as string[]
  })
  const [topicInput, setTopicInput] = useState('')

  useEffect(() => {
    if (repo && mode === 'edit') {
      setFormData({
        name: repo.name,
        description: repo.description,
        url: repo.url,
        language: repo.language,
        isPrivate: repo.isPrivate,
        topics: [...repo.topics]
      })
    } else {
      setFormData({
        name: '',
        description: '',
        url: '',
        language: 'JavaScript',
        isPrivate: false,
        topics: []
      })
    }
  }, [repo, mode, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const repoData: Partial<GitHubRepo> = {
      ...formData,
      id: repo?.id || Date.now().toString(),
      stars: repo?.stars || 0,
      forks: repo?.forks || 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    
    onSave(repoData)
    onClose()
  }

  const handleTopicAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && topicInput.trim()) {
      e.preventDefault()
      if (!formData.topics.includes(topicInput.trim())) {
        setFormData(prev => ({
          ...prev,
          topics: [...prev.topics, topicInput.trim()]
        }))
      }
      setTopicInput('')
    }
  }

  const handleTopicRemove = (topicToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }))
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{mode === 'add' ? '添加新仓库' : '编辑仓库'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">仓库名称 *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="输入仓库名称"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">描述</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入仓库描述"
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="url">仓库URL *</label>
            <input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              required
              placeholder="https://github.com/username/repository"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="language">主要语言</label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Go">Go</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="PHP">PHP</option>
                <option value="Ruby">Ruby</option>
                <option value="Rust">Rust</option>
                <option value="Swift">Swift</option>
                <option value="Kotlin">Kotlin</option>
                <option value="Other">其他</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                />
                <span className={styles.checkboxCustom}></span>
                私有仓库
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="topics">标签</label>
            <input
              id="topics"
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={handleTopicAdd}
              placeholder="输入标签后按回车添加"
            />
            <div className={styles.topics}>
              {formData.topics.map((topic) => (
                <span key={topic} className={styles.topic}>
                  {topic}
                  <button
                    type="button"
                    onClick={() => handleTopicRemove(topic)}
                    className={styles.topicRemove}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              取消
            </button>
            <button type="submit" className={`${styles.saveButton} btn btn-primary`}>
              {mode === 'add' ? '添加仓库' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
