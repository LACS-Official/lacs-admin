'use client'

import { useRouter, usePathname } from 'next/navigation'
import styles from './Navigation.module.css'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('github_access_token')
    router.push('/')
  }

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  return (
    <nav className={`${styles.navigation} ${className || ''}`}>
      <div className={styles.navContent}>
        <div className={styles.logo}>
          <button onClick={() => router.push('/dashboard')} className={styles.logoButton}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" fill="currentColor"/>
            </svg>
            <span>LACS Admin</span>
          </button>
        </div>

        <div className={styles.navLinks}>
          <button 
            onClick={() => router.push('/dashboard')}
            className={`${styles.navLink} ${isActive('/dashboard') && !pathname.includes('/hugo') ? styles.active : ''}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span>仓库管理</span>
          </button>

          {pathname.includes('/hugo') && (
            <button 
              onClick={() => {
                const match = pathname.match(/\/dashboard\/hugo\/([^\/]+)/)
                if (match) {
                  router.push(`/dashboard/hugo/${match[1]}`)
                }
              }}
              className={`${styles.navLink} ${pathname.includes('/hugo') && !pathname.includes('/new') && !pathname.includes('/edit') ? styles.active : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span>Hugo文章</span>
            </button>
          )}
        </div>

        <div className={styles.userActions}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className={styles.username}>管理员</span>
          </div>

          <button onClick={handleLogout} className={styles.logoutButton} title="退出登录">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
