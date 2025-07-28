'use client'

import React, { useState, useEffect } from 'react'
import { 
  Layout, 
  Card, 
  Button, 
  Space, 
  Typography, 
  Descriptions, 
  Tag, 
  Table,
  message,
  Spin,
  Row,
  Col,
  Divider
} from 'antd'
import { 
  ArrowLeftOutlined, 
  EditOutlined,
  NotificationOutlined,
  HistoryOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'

const { Title, Paragraph } = Typography
const { Content } = Layout

interface Software {
  id: string
  name: string
  nameEn?: string
  description?: string
  descriptionEn?: string
  currentVersion: string
  latestVersion: string
  downloadUrl?: string
  downloadUrlBackup?: string
  officialWebsite?: string
  category?: string
  tags?: string[]
  systemRequirements?: Record<string, string[]>
  fileSize?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface Announcement {
  id: string
  title: string
  titleEn?: string
  content: string
  type: string
  priority: string
  version?: string
  isPublished: boolean
  publishedAt: string
  expiresAt?: string
}

interface VersionHistory {
  id: string
  version: string
  releaseDate: string
  releaseNotes?: string
  releaseNotesEn?: string
  downloadUrl?: string
  fileSize?: string
  isStable: boolean
  isBeta: boolean
}

export default function SoftwareDetail() {
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [software, setSoftware] = useState<Software | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [versions, setVersions] = useState<VersionHistory[]>([])
  const [activeTab, setActiveTab] = useState('info')

  const softwareId = params.id as string
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/app'

  // 获取软件详情
  const fetchSoftwareDetail = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/software/${softwareId}`)
      const data = await response.json()

      if (data.success) {
        setSoftware(data.data)
      } else {
        message.error('获取软件详情失败')
      }
    } catch (error) {
      console.error('Error fetching software detail:', error)
      message.error('网络错误，请稍后重试')
    }
  }

  // 获取软件公告
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/software/${softwareId}/announcements`)
      const data = await response.json()

      if (data.success) {
        setAnnouncements(data.data.announcements)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  // 获取版本历史
  const fetchVersionHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/software/${softwareId}/versions`)
      const data = await response.json()

      if (data.success) {
        setVersions(data.data.versions)
      }
    } catch (error) {
      console.error('Error fetching version history:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSoftwareDetail(),
        fetchAnnouncements(),
        fetchVersionHistory()
      ])
      setLoading(false)
    }

    if (softwareId) {
      loadData()
    }
  }, [softwareId])

  // 公告表格列
  const announcementColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          security: 'red',
          update: 'blue',
          maintenance: 'orange',
          general: 'default'
        }
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors = {
          urgent: 'red',
          high: 'orange',
          normal: 'blue',
          low: 'green'
        }
        return <Tag color={colors[priority as keyof typeof colors]}>{priority}</Tag>
      }
    },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      render: (text: string) => new Date(text).toLocaleString()
    }
  ]

  // 版本历史表格列
  const versionColumns = [
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: (text: string, record: VersionHistory) => (
        <Space>
          <span>{text}</span>
          {record.isStable && <Tag color="green">稳定版</Tag>}
          {record.isBeta && <Tag color="orange">测试版</Tag>}
        </Space>
      )
    },
    {
      title: '发布日期',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (text: string) => new Date(text).toLocaleDateString()
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (text: string) => text || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: VersionHistory) => (
        <Space>
          {record.downloadUrl && (
            <Button 
              type="link" 
              icon={<DownloadOutlined />} 
              href={record.downloadUrl}
              target="_blank"
            >
              下载
            </Button>
          )}
        </Space>
      )
    }
  ]

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Content style={{ padding: '24px', marginTop: '64px', background: '#f5f5f5' }}>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>加载中...</div>
          </div>
        </Content>
      </Layout>
    )
  }

  if (!software) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Content style={{ padding: '24px', marginTop: '64px', background: '#f5f5f5' }}>
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Title level={3}>软件不存在</Title>
            <Link href="/dashboard/software">
              <Button type="primary">返回软件列表</Button>
            </Link>
          </div>
        </Content>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation />
      
      <Content style={{ padding: '24px', marginTop: '64px', background: '#f5f5f5' }}>
        {/* 页面头部 */}
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Link href="/dashboard/software">
              <Button icon={<ArrowLeftOutlined />}>返回</Button>
            </Link>
            <Title level={2} style={{ margin: 0 }}>
              {software.name}
            </Title>
            <Tag color={software.isActive ? 'green' : 'red'}>
              {software.isActive ? '启用' : '禁用'}
            </Tag>
          </Space>
          <div style={{ marginTop: '8px' }}>
            <Space>
              <Link href={`/dashboard/software/${software.id}/edit`}>
                <Button type="primary" icon={<EditOutlined />}>
                  编辑软件
                </Button>
              </Link>
              <Link href={`/dashboard/software/${software.id}/announcements`}>
                <Button icon={<NotificationOutlined />}>
                  管理公告
                </Button>
              </Link>
            </Space>
          </div>
        </div>

        <Row gutter={24}>
          {/* 基本信息 */}
          <Col xs={24} lg={16}>
            <Card title="基本信息" style={{ marginBottom: '24px' }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="软件名称">{software.name}</Descriptions.Item>
                <Descriptions.Item label="英文名称">{software.nameEn || '-'}</Descriptions.Item>
                <Descriptions.Item label="当前版本">{software.currentVersion}</Descriptions.Item>
                <Descriptions.Item label="最新版本">{software.latestVersion}</Descriptions.Item>
                <Descriptions.Item label="分类">{software.category || '-'}</Descriptions.Item>
                <Descriptions.Item label="文件大小">{software.fileSize || '-'}</Descriptions.Item>
                <Descriptions.Item label="创建时间" span={2}>
                  {new Date(software.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间" span={2}>
                  {new Date(software.updatedAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {software.description || '-'}
                </Descriptions.Item>
                {software.descriptionEn && (
                  <Descriptions.Item label="英文描述" span={2}>
                    {software.descriptionEn}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* 下载链接 */}
              {(software.downloadUrl || software.downloadUrlBackup || software.officialWebsite) && (
                <>
                  <Divider>下载链接</Divider>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {software.downloadUrl && (
                      <Button type="primary" icon={<DownloadOutlined />} href={software.downloadUrl} target="_blank">
                        主下载链接
                      </Button>
                    )}
                    {software.downloadUrlBackup && (
                      <Button icon={<DownloadOutlined />} href={software.downloadUrlBackup} target="_blank">
                        备用下载链接
                      </Button>
                    )}
                    {software.officialWebsite && (
                      <Button type="link" href={software.officialWebsite} target="_blank">
                        官方网站
                      </Button>
                    )}
                  </Space>
                </>
              )}

              {/* 标签 */}
              {software.tags && software.tags.length > 0 && (
                <>
                  <Divider>标签</Divider>
                  <Space wrap>
                    {software.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </>
              )}
            </Card>

            {/* 最新公告 */}
            <Card title="最新公告" style={{ marginBottom: '24px' }}>
              <Table
                columns={announcementColumns}
                dataSource={announcements.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
              />
              {announcements.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link href={`/dashboard/software/${software.id}/announcements`}>
                    <Button type="link">查看全部公告</Button>
                  </Link>
                </div>
              )}
            </Card>
          </Col>

          {/* 侧边信息 */}
          <Col xs={24} lg={8}>
            {/* 系统要求 */}
            {software.systemRequirements && (
              <Card title="系统要求" style={{ marginBottom: '24px' }}>
                {Object.entries(software.systemRequirements).map(([platform, requirements]) => (
                  <div key={platform} style={{ marginBottom: '16px' }}>
                    <Title level={5}>{platform}</Title>
                    <ul style={{ paddingLeft: '20px' }}>
                      {requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Card>
            )}

            {/* 版本历史 */}
            <Card title="版本历史" extra={
              <Link href={`/dashboard/software/${software.id}/versions`}>
                <Button type="link" icon={<HistoryOutlined />}>
                  查看全部
                </Button>
              </Link>
            }>
              <Table
                columns={versionColumns}
                dataSource={versions.slice(0, 3)}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
