'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Spin,
  Alert,
  Tooltip,
  Badge,
  Table,
  Select,
  Pagination,
  Statistic,
  message
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  ClearOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import Navigation from '@/components/Navigation'
import { ErrorBoundary, EmptyState, NetworkError } from '@/components/ErrorBoundary'
import { PageLoading, TableLoading, StatisticLoading } from '@/components/LoadingState'
import {
  activationCodeApi,
  type ActivationCode,
  type ActivationCodeStats,
  type ActivationCodeStatus,
  getActivationCodeStatusText,
  getActivationCodeStatusColor,
  formatDate,
  getDaysUntilExpiration,
  type ActivationCodeApiError
} from '@/utils/activation-codes-api'

const { Content, Sider } = Layout
const { Title, Paragraph, Text } = Typography
const { Search } = Input
const { Option } = Select
const { confirm } = Modal

export default function ActivationCodesPage() {
  const router = useRouter()

  // 状态管理
  const [codes, setCodes] = useState<ActivationCode[]>([])
  const [stats, setStats] = useState<ActivationCodeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ActivationCodeStatus>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedCode, setSelectedCode] = useState<ActivationCode | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 加载激活码列表
  const loadActivationCodes = async (page = currentPage, limit = pageSize, status = statusFilter) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await activationCodeApi.getActivationCodes(page, limit, status)
      setCodes(response.codes)
      setTotal(response.pagination.total)
      setCurrentPage(response.pagination.page)
    } catch (error) {
      const apiError = error as ActivationCodeApiError
      setError(apiError.message)
      message.error(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  // 加载统计信息
  const loadStats = async () => {
    setStatsLoading(true)
    
    try {
      const statsData = await activationCodeApi.getActivationCodeStats()
      setStats(statsData)
    } catch (error) {
      const apiError = error as ActivationCodeApiError
      console.error('加载统计信息失败:', apiError.message)
    } finally {
      setStatsLoading(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    loadActivationCodes()
    loadStats()
  }, [])

  // 状态筛选变化
  useEffect(() => {
    setCurrentPage(1)
    loadActivationCodes(1, pageSize, statusFilter)
  }, [statusFilter])

  // 搜索功能
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    // 这里可以实现前端搜索或者调用后端搜索API
    // 目前先实现前端搜索
  }

  // 过滤激活码
  const filteredCodes = codes.filter(code => {
    if (!searchTerm) return true
    return (
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.productInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.metadata?.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // 查看详情
  const handleViewDetail = (code: ActivationCode) => {
    router.push(`/dashboard/activation-codes/${code.id}`)
  }

  // 删除激活码
  const handleDelete = (code: ActivationCode) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>您确定要删除激活码 <Text code>{code.code}</Text> 吗？</p>
          <Alert
            message="此操作无法撤销"
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
          />
        </div>
      ),
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await activationCodeApi.deleteActivationCode(code.id)
          message.success('激活码删除成功')
          loadActivationCodes()
          loadStats()
        } catch (error) {
          const apiError = error as ActivationCodeApiError
          message.error(apiError.message)
        }
      },
    })
  }

  // 清理过期激活码
  const handleCleanupExpired = () => {
    confirm({
      title: '清理过期激活码',
      icon: <ClearOutlined />,
      content: '确定要清理所有过期超过30天的激活码吗？此操作无法撤销。',
      okText: '清理',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await activationCodeApi.cleanupExpiredCodes({ daysOld: 30 })
          message.success(result.message)
          loadActivationCodes()
          loadStats()
        } catch (error) {
          const apiError = error as ActivationCodeApiError
          message.error(apiError.message)
        }
      },
    })
  }

  // 表格列定义
  const columns: ColumnsType<ActivationCode> = [
    {
      title: '激活码',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      render: (code: string) => (
        <Text code copyable style={{ fontSize: '12px' }}>
          {code}
        </Text>
      ),
      responsive: ['md'],
    },
    {
      title: '激活码信息',
      key: 'codeInfo',
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            <Text code copyable style={{ fontSize: '12px' }}>
              {record.code}
            </Text>
          </div>
          <Tag color={getActivationCodeStatusColor(record)} size="small">
            {getActivationCodeStatusText(record)}
          </Tag>
          {record.productInfo && (
            <div style={{ marginTop: '4px' }}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {record.productInfo.name} v{record.productInfo.version}
              </Text>
            </div>
          )}
        </div>
      ),
      responsive: ['xs', 'sm'],
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={getActivationCodeStatusColor(record)}>
          {getActivationCodeStatusText(record)}
        </Tag>
      ),
      responsive: ['md'],
    },
    {
      title: '产品信息',
      key: 'product',
      width: 150,
      render: (_, record) => (
        <div>
          {record.productInfo ? (
            <>
              <div style={{ fontWeight: 500 }}>{record.productInfo.name}</div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                v{record.productInfo.version}
              </Text>
            </>
          ) : (
            <Text type="secondary">未设置</Text>
          )}
        </div>
      ),
      responsive: ['lg'],
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => formatDate(date),
      responsive: ['lg'],
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 150,
      render: (date: string, record) => {
        const days = getDaysUntilExpiration(date)
        return (
          <div>
            <div>{formatDate(date)}</div>
            {!record.isUsed && (
              <Text type={days > 7 ? 'secondary' : 'warning'} style={{ fontSize: '12px' }}>
                {days > 0 ? `${days}天后过期` : '已过期'}
              </Text>
            )}
          </div>
        )
      },
      responsive: ['md'],
    },
    {
      title: '时间信息',
      key: 'timeInfo',
      render: (_, record) => {
        const days = getDaysUntilExpiration(record.expiresAt)
        return (
          <div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              创建: {formatDate(record.createdAt)}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              过期: {formatDate(record.expiresAt)}
            </div>
            {!record.isUsed && (
              <Text type={days > 7 ? 'secondary' : 'warning'} style={{ fontSize: '10px' }}>
                {days > 0 ? `${days}天后过期` : '已过期'}
              </Text>
            )}
          </div>
        )
      },
      responsive: ['xs', 'sm'],
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <ErrorBoundary>
      <Layout style={{ minHeight: '100vh' }}>
        {/* 导航栏 */}
        <Navigation />

        <Layout style={{ marginTop: 64 }}>
          {/* 主内容区域 */}
          <Content style={{ padding: '24px', background: '#f5f5f5' }}>
            {/* 加载状态 */}
            {loading && <PageLoading tip="正在加载激活码数据..." />}

            {/* 错误状态 */}
            {error && !loading && (
              <NetworkError
                message={error}
                onRetry={() => {
                  loadActivationCodes()
                  loadStats()
                }}
              />
            )}

            {/* 主要内容 */}
            {!loading && !error && (
              <>
                {/* 页面头部 */}
                <div style={{ marginBottom: '24px' }}>
                  <Title level={2} style={{ margin: '0 0 8px 0' }}>
                    激活码管理
                  </Title>
                  <Paragraph style={{ color: '#666', margin: 0 }}>
                    管理系统激活码，包括生成、查看、删除和统计功能
                  </Paragraph>
                </div>

                {/* 统计卡片 */}
                {statsLoading ? (
                  <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} md={6}><StatisticLoading /></Col>
                    <Col xs={24} sm={12} md={6}><StatisticLoading /></Col>
                    <Col xs={24} sm={12} md={6}><StatisticLoading /></Col>
                    <Col xs={24} sm={12} md={6}><StatisticLoading /></Col>
                  </Row>
                ) : stats ? (
                  <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="总激活码"
                          value={stats.total}
                          prefix={<KeyOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="已使用"
                          value={stats.used}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="有效激活码"
                          value={stats.active}
                          prefix={<ClockCircleOutlined />}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Card>
                        <Statistic
                          title="使用率"
                          value={stats.usageRate}
                          suffix="%"
                          precision={1}
                          valueStyle={{ color: stats.usageRate > 50 ? '#52c41a' : '#faad14' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                ) : null}

          {/* 操作栏 */}
          <Card style={{ marginBottom: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={14}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Search
                    placeholder="搜索激活码、产品名称或邮箱..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: '100%' }}
                    allowClear
                  />
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%', maxWidth: 200 }}
                    placeholder="选择状态筛选"
                  >
                    <Option value="all">全部状态</Option>
                    <Option value="active">有效</Option>
                    <Option value="used">已使用</Option>
                    <Option value="expired">已过期</Option>
                    <Option value="unused">未使用</Option>
                  </Select>
                </Space>
              </Col>
              <Col xs={24} lg={10}>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: '100%' }}
                >
                  <Row gutter={[8, 8]}>
                    <Col xs={12} sm={6}>
                      <Button
                        block
                        icon={<BarChartOutlined />}
                        onClick={() => router.push('/dashboard/activation-codes/stats')}
                      >
                        统计
                      </Button>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Button
                        block
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          loadActivationCodes()
                          loadStats()
                        }}
                      >
                        刷新
                      </Button>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Button
                        block
                        icon={<ClearOutlined />}
                        onClick={handleCleanupExpired}
                      >
                        清理
                      </Button>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Button
                        block
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => router.push('/dashboard/activation-codes/new')}
                      >
                        新增
                      </Button>
                    </Col>
                  </Row>
                </Space>
              </Col>
            </Row>
          </Card>

                {/* 激活码表格 */}
                <Card>
                  {filteredCodes.length === 0 && !loading ? (
                    <EmptyState
                      title="暂无激活码"
                      description="当前没有符合条件的激活码，您可以创建新的激活码"
                      action={
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => router.push('/dashboard/activation-codes/new')}
                        >
                          创建激活码
                        </Button>
                      }
                    />
                  ) : (
                    <>
                      <Table
                        columns={columns}
                        dataSource={filteredCodes}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        scroll={{ x: 800 }}
                        size="middle"
                      />

                      {/* 分页 */}
                      <div style={{ marginTop: '16px', textAlign: 'right' }}>
                        <Pagination
                          current={currentPage}
                          pageSize={pageSize}
                          total={total}
                          showSizeChanger
                          showQuickJumper
                          showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
                          onChange={(page, size) => {
                            setCurrentPage(page)
                            setPageSize(size || 10)
                            loadActivationCodes(page, size || 10, statusFilter)
                          }}
                          onShowSizeChange={(current, size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                            loadActivationCodes(1, size, statusFilter)
                          }}
                        />
                      </div>
                    </>
                  )}
                </Card>
              </>
            )}
          </Content>
        </Layout>
      </Layout>
    </ErrorBoundary>
  )
}
