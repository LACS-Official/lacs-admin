import { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'GitHub OAuth 登录 - LACS Admin',
  description: '使用 GitHub 账户安全登录 LACS 管理系统',
}

export default function Home() {
  // 后端 API 地址（请替换为你的实际后端API地址）
  const API_BASE = 'https://api-g.lacs.cc'

  return (
    <div className={styles.container}>
      {/* 主要内容 */}
      <main className={styles.main}>
        <div className={`${styles.loginCard} card fade-in`}>
          {/* Logo 区域 */}
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="currentColor"/>
              </svg>
            </div>
            <h1 className={styles.title}>LACS Admin</h1>
            <p className={styles.subtitle}>安全、快速的管理系统</p>
          </div>

          {/* 登录区域 */}
          <div className={styles.loginSection}>
            <h2 className={styles.loginTitle}>欢迎回来</h2>
            <p className={styles.loginDescription}>
              使用您的 GitHub 账户登录，享受安全便捷的身份验证体验
            </p>

            <a
              href={`${API_BASE}/api/auth/github/login`}
              className={`${styles.githubButton} btn btn-primary slide-up`}
              style={{ animationDelay: '0.2s' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              使用 GitHub 登录
            </a>

            <div className={styles.features}>
              <div className={styles.feature}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M3 12h6m6 0h6"/>
                </svg>
                <span>安全可靠</span>
              </div>
              <div className={styles.feature}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6"/>
                  <path d="m21 12-6-6-6 6-6-6"/>
                </svg>
                <span>快速登录</span>
              </div>
              <div className={styles.feature}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>统一身份</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <footer className={styles.footer}>
          <p>© 2024 LACS Team. 保留所有权利。</p>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink}>隐私政策</a>
            <a href="#" className={styles.footerLink}>服务条款</a>
            <a href="#" className={styles.footerLink}>帮助中心</a>
          </div>
        </footer>
      </main>
    </div>
  )
}
