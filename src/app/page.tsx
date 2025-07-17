import Head from 'next/head'

export default function Home() {
  // 后端 API 地址（请替换为你的实际后端API地址）
  const API_BASE = 'https://api-g.lacs.cc'

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <Head>
        <title>GitHub OAuth 登录</title>
      </Head>
      <h1>GitHub OAuth 登录演示</h1>
      <a
        href={`${API_BASE}/api/auth/github/login`}
        style={{
          display: 'inline-block',
          marginTop: 40,
          padding: '12px 32px',
          background: '#24292f',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontSize: 18,
        }}
      >
        使用 GitHub 登录
      </a>
    </div>
  )
}
