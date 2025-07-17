"use client"
import { useEffect, useState } from 'react'

export default function OAuthResult() {
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errorParam = params.get('error')
    const userParam = params.get('user')
    const tokenParam = params.get('token')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      return
    }
    if (userParam && tokenParam) {
      try {
        setUser(JSON.parse(decodeURIComponent(userParam)))
        localStorage.setItem('github_access_token', decodeURIComponent(tokenParam))
      } catch {
        setError('用户信息解析失败')
      }
    }
  }, [])

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: 100 }}>{error}</div>
  }
  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: 100 }}>正在处理...</div>
  }
  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h2>登录成功！</h2>
      <img src={user.avatar_url} alt={user.login} width={80} style={{ borderRadius: 40, margin: 20 }} />
      <div>用户名：{user.login}</div>
      <div>昵称：{user.name}</div>
      <div>邮箱：{user.email}</div>
      <div>
        <a href={user.html_url} target='_blank' rel='noopener noreferrer'>
          查看 GitHub 主页
        </a>
      </div>
    </div>
  )
} 