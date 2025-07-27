'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Descriptions,
  Alert,
  Spin,
  message,
  Modal
} from 'antd'
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons'
import Navigation from '@/components/Navigation'
import {
  activationCodeApi,
  type ActivationCode,
  type ActivationCodeApiError,
  getActivationCodeStatusText,
  getActivationCodeStatusColor,
  formatDate,
  getDaysUntilExpiration
} from '@/utils/activation-codes-api'

const { Content } = Layout
const { Title, Text } = Typography
const { confirm } = Modal

export default function ActivationCodeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [code, setCode] = useState<ActivationCode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 加载激活码详情
  const loadActivationCode = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      const codeData = await activationCodeApi.getActivationCodeById(id)
      setCode(codeData)
    } catch (error) {
      const apiError = error as ActivationCodeApiError
      setError(apiError.message)
      message.error(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivationCode()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // 复制激活码
  const handleCopyCode = () => {
    if (!code) return
    
    navigator.clipboard.writeText(code.code).then(() => {
      message.success('激活码已复制到剪贴板')
    }).catch(() => {
      message.error('复制失败')
    })
  }

  // 删除激活码
  const handleDelete = () => {
    if (!code) return

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
          router.push('/dashboard/activation-codes')
        } catch (error) {
          const apiError = error as ActivationCodeApiError
          message.error(apiError.message)
        }
      },
    })
  }

  // 获取状态图标
  const getStatusIcon = (code: ActivationCode) => {
    if (code.isUsed) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    }
    
    const now = new Date()
    const expiresAt = new Date(code.expiresAt)
    
    if (expiresAt < now) {
      return <WarningOutlined style={{ color: '#ff4d4f' }} />
    }
    
    return <ClockCircleOutlined style={{ color: '#1890ff' }} />
  }

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Layout style={{ marginTop: 64 }}>
          <Content style={{ padding: '24px', background: '#f5f5f5' }}>
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px', color: '#666' }}>正在加载激活码详情...</div>
            </div>
          </Content>
        </Layout>
      </Layout>
    )
  }

  if (error || !code) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation />
        <Layout style={{ marginTop: 64 }}>
          <Content style={{ padding: '24px', background: '#f5f5f5' }}>
            <Alert
              message="加载失败"
              description={error || '激活码不存在'}
              type="error"
              showIcon
              action={
                <Space>
                  <Button size="small" onClick={loadActivationCode}>
                    重试
                  </Button>
                  <Button size="small" onClick={() => router.back()}>
                    返回
                  </Button>
                </Space>
              }
            />
          </Content>
        </Layout>
      </Layout>
    )
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 导航栏 */}
      <Navigation />

      <Layout style={{ marginTop: 64 }}>
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          {/* 页面头部 */}
          <div style={{ marginBottom: '24px' }}>
            <Space align="center" style={{ marginBottom: '16px' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => router.back()}
              >
                返回
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                激活码详情
              </Title>
            </Space>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              {/* 基本信息 */}
              <Card 
                title={
                  <Space>
                    {getStatusIcon(code)}
                    基本信息
                  </Space>
                }
                extra={
                  <Space direction="vertical" size="small">
                    <Button
                      icon={<CopyOutlined />}
                      onClick={handleCopyCode}
                      size="small"
                      block
                    >
                      复制激活码
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                      size="small"
                      block
                    >
                      删除
                    </Button>
                  </Space>
                }
                style={{ marginBottom: '24px' }}
              >
                <Descriptions column={1} size="middle">
                  <Descriptions.Item label="激活码">
                    <Text code copyable style={{ fontSize: '16px', fontWeight: 500 }}>
                      {code.code}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Tag color={getActivationCodeStatusColor(code)} icon={getStatusIcon(code)}>
                      {getActivationCodeStatusText(code)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {formatDate(code.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="过期时间">
                    <Space>
                      <span>{formatDate(code.expiresAt)}</span>
                      {!code.isUsed && (
                        <Tag color={getDaysUntilExpiration(code.expiresAt) > 7 ? 'blue' : 'orange'}>
                          {getDaysUntilExpiration(code.expiresAt) > 0 
                            ? `${getDaysUntilExpiration(code.expiresAt)}天后过期`
                            : '已过期'
                          }
                        </Tag>
                      )}
                    </Space>
                  </Descriptions.Item>
                  {code.isUsed && code.usedAt && (
                    <Descriptions.Item label="使用时间">
                      {formatDate(code.usedAt)}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* 产品信息 */}
              {code.productInfo && (
                <Card title="产品信息" style={{ marginBottom: '24px' }}>
                  <Descriptions column={1} size="middle">
                    <Descriptions.Item label="产品名称">
                      {code.productInfo.name || '未设置'}
                    </Descriptions.Item>
                    <Descriptions.Item label="产品版本">
                      {code.productInfo.version || '未设置'}
                    </Descriptions.Item>
                    <Descriptions.Item label="功能特性">
                      {code.productInfo.features && code.productInfo.features.length > 0 ? (
                        <Space wrap>
                          {code.productInfo.features.map((feature, index) => (
                            <Tag key={index} color="blue">
                              {feature}
                            </Tag>
                          ))}
                        </Space>
                      ) : (
                        <Text type="secondary">未设置</Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* 元数据信息 */}
              {code.metadata && Object.keys(code.metadata).length > 0 && (
                <Card title="元数据信息">
                  <Descriptions column={1} size="middle">
                    {code.metadata.customerEmail && (
                      <Descriptions.Item label="客户邮箱">
                        {code.metadata.customerEmail as string}
                      </Descriptions.Item>
                    )}
                    {code.metadata.licenseType && (
                      <Descriptions.Item label="许可证类型">
                        <Tag color="green">{code.metadata.licenseType as string}</Tag>
                      </Descriptions.Item>
                    )}
                    {code.metadata.purchaseId && (
                      <Descriptions.Item label="订单ID">
                        {code.metadata.purchaseId as string}
                      </Descriptions.Item>
                    )}
                    {code.metadata.customerId && (
                      <Descriptions.Item label="客户ID">
                        {code.metadata.customerId as string}
                      </Descriptions.Item>
                    )}
                    
                    {/* 显示其他自定义元数据 */}
                    {Object.entries(code.metadata).map(([key, value]) => {
                      if (['customerEmail', 'licenseType', 'purchaseId', 'customerId'].includes(key)) {
                        return null
                      }
                      return (
                        <Descriptions.Item key={key} label={key}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Descriptions.Item>
                      )
                    })}
                  </Descriptions>
                </Card>
              )}
            </Col>

            <Col xs={24} lg={8}>
              {/* 状态卡片 */}
              <Card style={{ marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {getStatusIcon(code)}
                  </div>
                  <Title level={3} style={{ margin: '0 0 8px 0' }}>
                    {getActivationCodeStatusText(code)}
                  </Title>
                  <Text type="secondary">
                    {code.isUsed 
                      ? '此激活码已被使用'
                      : getDaysUntilExpiration(code.expiresAt) > 0
                        ? `还有 ${getDaysUntilExpiration(code.expiresAt)} 天过期`
                        : '此激活码已过期'
                    }
                  </Text>
                </div>
              </Card>

              {/* 操作提示 */}
              <Card title="操作说明">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    message="激活码使用"
                    description="激活码一旦被验证使用后，将无法再次使用"
                    type="info"
                    showIcon
                  />
                  
                  <Alert
                    message="删除警告"
                    description="删除激活码是不可逆操作，请谨慎操作"
                    type="warning"
                    showIcon
                  />
                  
                  {!code.isUsed && getDaysUntilExpiration(code.expiresAt) <= 7 && getDaysUntilExpiration(code.expiresAt) > 0 && (
                    <Alert
                      message="即将过期"
                      description={`此激活码将在 ${getDaysUntilExpiration(code.expiresAt)} 天后过期`}
                      type="warning"
                      showIcon
                    />
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}
