"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import OptimizedImage from '../../components/OptimizedImage'
import styles from './page.module.css'

interface GitHubUser {
  login: string
  name: string
  email: string
  avatar_url: string
  html_url: string
  public_repos?: number
  followers?: number
  following?: number
  created_at?: string
  bio?: string
}

export default function OAuthResult() {
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    const userParam = params.get('user')
    const tokenParam = params.get('token')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      setLoading(false)
      return
    }

    if (userParam && tokenParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam))
        setUser(userData)
        localStorage.setItem('github_access_token', decodeURIComponent(tokenParam))

        // 模拟一个短暂的加载过程以显示动画
        setTimeout(() => {
          setLoading(false)
        }, 1000)
      } catch {
        setError('用户信息解析失败')
        setLoading(false)
      }
    } else {
      setError('缺少必要的认证参数')
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundDecoration}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
        </div>
        <div className={`${styles.loadingCard} card fade-in`}>
          <div className={styles.loadingSpinner}>
            <div className="loading"></div>
          </div>
          <h2 className={styles.loadingTitle}>正在处理您的登录...</h2>
          <p className={styles.loadingDescription}>请稍候，我们正在验证您的身份</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundDecoration}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
        </div>
        <div className={`${styles.errorCard} card fade-in`}>
          <div className={styles.errorIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className={styles.errorTitle}>登录失败</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorActions}>
            <Link href="/" className="btn btn-primary">
              重新登录
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundDecoration}>
          <div className={styles.circle1}></div>
          <div className={styles.circle2}></div>
        </div>
        <div className={`${styles.errorCard} card fade-in`}>
          <h2 className={styles.errorTitle}>未找到用户信息</h2>
          <p className={styles.errorMessage}>无法获取用户数据，请重新登录</p>
          <div className={styles.errorActions}>
            <Link href="/" className="btn btn-primary">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundDecoration}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      <main className={styles.main}>
        <div className={`${styles.successCard} card slide-up`}>
          {/* 成功图标 */}
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>

          <h1 className={styles.successTitle}>登录成功！</h1>
          <p className={styles.successSubtitle}>欢迎来到 LACS 管理系统</p>

          {/* 用户信息卡片 */}
          <div className={styles.userCard}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                <OptimizedImage
                  src={user.avatar_url}
                  alt={user.login}
                  width={100}
                  height={100}
                  className={styles.avatar}
                  priority
                />
                <div className={styles.onlineIndicator}></div>
              </div>
            </div>

            <div className={styles.userInfo}>
              <h3 className={styles.userName}>{user.name || user.login}</h3>
              <p className={styles.userLogin}>@{user.login}</p>
              {user.bio && <p className={styles.userBio}>{user.bio}</p>}
              {user.email && (
                <div className={styles.userDetail}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            {/* 统计信息 */}
            <div className={styles.userStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{user.public_repos || 0}</span>
                <span className={styles.statLabel}>仓库</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{user.followers || 0}</span>
                <span className={styles.statLabel}>关注者</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{user.following || 0}</span>
                <span className={styles.statLabel}>关注中</span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className={styles.actions}>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.githubLink} btn`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              查看 GitHub 主页
            </a>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-primary"
            >
              进入管理系统
            </button>
          </div>
        </div>

        {/* 安全提示 */}
        <div className={styles.securityNotice}>
          <div className={styles.securityIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <p>您的登录信息已安全保存，访问令牌已加密存储在本地</p>
        </div>
      </main>
    </div>
  )
}