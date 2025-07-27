'use client'

import { useState, useEffect } from 'react'
import {
  Layout,
  Card,
  Button,
  Input,
  Tag,
  Space,
  Row,
  Col,
  Typography,
  Modal,
  Menu,
  Avatar,
  Spin,
  Alert,
  Tooltip,
  Badge
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  StarOutlined,
  ForkOutlined,
  LockOutlined,
  UnlockOutlined,
  GithubOutlined,
  HomeOutlined,
  FolderOutlined
} from '@ant-design/icons'
import styles from './page.module.css'
import RepoModal from '@/components/RepoModal'
import Navigation from '@/components/Navigation'

const { Header, Content, Sider } = Layout
const { Title, Paragraph, Text } = Typography
const { Search } = Input

// 语言颜色映射
const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'C++': '#f34b7d',
    'C': '#555555',
    'HTML': '#e34c26',
    'CSS': '#1572B6',
    'Vue': '#4FC08D',
    'React': '#61DAFB',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Dart': '#00B4AB',
    'Shell': '#89e051',
    'Dockerfile': '#384d54',
    'YAML': '#cb171e',
    'JSON': '#292929',
    'Markdown': '#083fa1',
  }
  return colors[language] || '#8cc8ff'
}

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
// const mockRepos: GitHubRepo[] = [
//   {
//     id: '1',
//     name: 'appwebsite-hugo',
//     description: 'Hugo静态网站生成器项目，用于构建现代化的网站',
//     url: 'https://github.com/user/appwebsite-hugo',
//     language: 'HTML',
//     stars: 45,
//     forks: 12,
//     lastUpdated: '2024-01-15',
//     isPrivate: false,
//     topics: ['hugo', 'website', 'static-site']
//   },
//   {
//     id: '2',
//     name: 'lacs-admin',
//     description: 'LACS管理系统前端项目',
//     url: 'https://github.com/user/lacs-admin',
//     language: 'TypeScript',
//     stars: 23,
//     forks: 5,
//     lastUpdated: '2024-01-17',
//     isPrivate: true,
//     topics: ['admin', 'dashboard', 'nextjs']
//   },
//   {
//     id: '3',
//     name: 'api-server',
//     description: 'RESTful API服务器，提供后端数据接口',
//     url: 'https://github.com/user/api-server',
//     language: 'Go',
//     stars: 67,
//     forks: 18,
//     lastUpdated: '2024-01-16',
//     isPrivate: false,
//     topics: ['api', 'golang', 'server']
//   }
// ]

export default function Dashboard() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  // 获取真实GitHub仓库
  useEffect(() => {
    const fetchRepos = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('github_access_token') : null
        if (!token) {
          setError('未检测到GitHub登录令牌，请重新登录')
          setLoading(false)
          return
        }
        const res = await fetch('https://api.github.com/user/repos?per_page=100', {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github+json',
          },
        })
        if (!res.ok) {
          throw new Error('GitHub API请求失败: ' + res.status)
        }
        const data = await res.json()
        // 适配为GitHubRepo类型
        const repoList: GitHubRepo[] = data.map((repo: unknown) => {
          const r = repo as Record<string, unknown>;
          return {
            id: String(r.id),
            name: String(r.name),
            description: typeof r.description === 'string' ? r.description : '',
            url: String(r.html_url),
            language: typeof r.language === 'string' ? r.language : '未知',
            stars: typeof r.stargazers_count === 'number' ? r.stargazers_count : 0,
            forks: typeof r.forks_count === 'number' ? r.forks_count : 0,
            lastUpdated: typeof r.updated_at === 'string' ? r.updated_at.slice(0, 10) : '',
            isPrivate: !!r.private,
            topics: Array.isArray(r.topics) ? r.topics as string[] : [],
          }
        })
        setRepos(repoList)
      } catch (e) {
        setError(e instanceof Error ? e.message : '获取仓库失败')
      } finally {
        setLoading(false)
      }
    }
    fetchRepos()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 导航栏 */}
      <Navigation />

      <Layout>
        {/* 侧边栏 */}
        <Sider
          width={250}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            height: 'calc(100vh - 64px)',
            position: 'fixed',
            left: 0,
            top: 64,
            zIndex: 100
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={['repos']}
            style={{ height: '100%', borderRight: 0, paddingTop: '16px' }}
            items={[
              {
                key: 'overview',
                icon: <HomeOutlined />,
                label: '概览',
              },
              {
                key: 'repos',
                icon: <GithubOutlined />,
                label: '所有仓库',
              },
              {
                key: 'hugo',
                icon: <FileTextOutlined />,
                label: 'Hugo文章',
              },
            ]}
          />
        </Sider>

        {/* 主内容区域 */}
        <Layout style={{ marginLeft: 250 }}>
          <Content style={{ padding: '24px', background: '#f5f5f5' }}>
            {/* 加载和错误状态 */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', color: '#666' }}>正在加载GitHub仓库...</div>
              </div>
            )}

            {error && (
              <Alert
                message="加载失败"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}

            {!loading && !error && (
              <>
                {/* 页面头部 */}
                <div style={{ marginBottom: '24px' }}>
                  <Title level={2} style={{ margin: '0 0 8px 0' }}>
                    GitHub 仓库管理
                  </Title>
                  <Paragraph style={{ color: '#666', margin: 0 }}>
                    管理您的GitHub仓库，特别支持Hugo静态网站项目
                  </Paragraph>
                </div>

                {/* 操作栏 */}
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                  <Col>
                    <Search
                      placeholder="搜索仓库..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ width: 300 }}
                      size="large"
                    />
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="large"
                      onClick={() => setShowAddModal(true)}
                    >
                      添加仓库
                    </Button>
                  </Col>
                </Row>

                {/* 仓库网格 */}
                <Row gutter={[24, 24]}>
                  {filteredRepos.map((repo, index) => (
                    <Col xs={24} sm={12} lg={8} xl={6} key={repo.id}>
                      <Card
                        hoverable
                        style={{
                          height: '100%',
                          borderRadius: '12px',
                          border: '1px solid #f0f0f0',
                          transition: 'all 0.3s ease',
                        }}
                        styles={{ body: { padding: '20px' } }}
                        className="fade-in"
                      >
                        {/* 卡片头部 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <Space align="center" style={{ marginBottom: '4px' }}>
                              <Title level={4} style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                                {repo.name}
                              </Title>
                              {repo.isPrivate ? (
                                <Badge count={<LockOutlined style={{ color: '#f5222d' }} />} />
                              ) : (
                                <Badge count={<UnlockOutlined style={{ color: '#52c41a' }} />} />
                              )}
                            </Space>
                          </div>
                          <Space>
                            <Tooltip title="编辑仓库">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() => handleRepoSelect(repo)}
                              />
                            </Tooltip>
                            <Tooltip title="删除仓库">
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  setSelectedRepo(repo)
                                  setShowDeleteConfirm(true)
                                }}
                              />
                            </Tooltip>
                            {repo.name === 'appwebsite-hugo' && (
                              <Tooltip title="Hugo文章管理">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<FileTextOutlined />}
                                  onClick={() => handleHugoManagement(repo)}
                                />
                              </Tooltip>
                            )}
                          </Space>
                        </div>

                        {/* 描述 */}
                        <Paragraph
                          ellipsis={{ rows: 2, tooltip: repo.description }}
                          style={{ color: '#666', marginBottom: '16px', minHeight: '44px' }}
                        >
                          {repo.description || '暂无描述'}
                        </Paragraph>

                        {/* 语言和统计 */}
                        <div style={{ marginBottom: '16px' }}>
                          <Space size="large">
                            <Space size="small">
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: getLanguageColor(repo.language)
                                }}
                              />
                              <Text style={{ fontSize: '12px', color: '#666' }}>{repo.language}</Text>
                            </Space>
                            <Space size="small">
                              <StarOutlined style={{ fontSize: '12px', color: '#666' }} />
                              <Text style={{ fontSize: '12px', color: '#666' }}>{repo.stars}</Text>
                            </Space>
                            <Space size="small">
                              <ForkOutlined style={{ fontSize: '12px', color: '#666' }} />
                              <Text style={{ fontSize: '12px', color: '#666' }}>{repo.forks}</Text>
                            </Space>
                          </Space>
                        </div>

                        {/* 标签 */}
                        {repo.topics.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <Space size={[4, 4]} wrap>
                              {repo.topics.slice(0, 3).map((topic) => (
                                <Tag key={topic} size="small" color="blue">
                                  {topic}
                                </Tag>
                              ))}
                              {repo.topics.length > 3 && (
                                <Tag size="small">+{repo.topics.length - 3}</Tag>
                              )}
                            </Space>
                          </div>
                        )}

                        {/* 底部信息 */}
                        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
                          <Text style={{ fontSize: '12px', color: '#999' }}>
                            更新于 {repo.lastUpdated}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </Content>
        </Layout>
      </Layout>

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
      <Modal
        title="确认删除"
        open={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onOk={handleDeleteRepo}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Paragraph>
            您确定要删除仓库 <Text strong>{selectedRepo?.name}</Text> 吗？
          </Paragraph>
          <Alert
            message="此操作无法撤销"
            type="warning"
            showIcon
          />
        </Space>
      </Modal>
    </Layout>
  )
}
