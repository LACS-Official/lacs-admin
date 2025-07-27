'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layout,
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Tag,
  Alert,
  message
} from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined
} from '@ant-design/icons'
import Navigation from '@/components/Navigation'
import {
  activationCodeApi,
  type CreateActivationCodeRequest,
  type ActivationCodeApiError
} from '@/utils/activation-codes-api'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

interface ProductFeature {
  id: string
  name: string
}

export default function NewActivationCodePage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [features, setFeatures] = useState<ProductFeature[]>([])
  const [newFeature, setNewFeature] = useState('')

  // 添加功能特性
  const addFeature = () => {
    if (!newFeature.trim()) return
    
    const feature: ProductFeature = {
      id: Date.now().toString(),
      name: newFeature.trim()
    }
    
    setFeatures([...features, feature])
    setNewFeature('')
  }

  // 删除功能特性
  const removeFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id))
  }

  // 提交表单
  const handleSubmit = async (values: unknown) => {
    const formData = values as {
      expirationDays: number
      productName?: string
      productVersion?: string
      customerEmail?: string
      licenseType?: string
      purchaseId?: string
      customerId?: string
      customMetadata?: string
    }

    setLoading(true)

    try {
      // 构建请求数据
      const request: CreateActivationCodeRequest = {
        expirationDays: formData.expirationDays || 365,
      }

      // 添加产品信息
      if (formData.productName || formData.productVersion || features.length > 0) {
        request.productInfo = {
          name: formData.productName || '',
          version: formData.productVersion || '1.0.0',
          features: features.map(f => f.name)
        }
      }

      // 添加元数据
      const metadata: Record<string, unknown> = {}
      if (formData.customerEmail) metadata.customerEmail = formData.customerEmail
      if (formData.licenseType) metadata.licenseType = formData.licenseType
      if (formData.purchaseId) metadata.purchaseId = formData.purchaseId
      if (formData.customerId) metadata.customerId = formData.customerId

      // 解析自定义元数据
      if (formData.customMetadata) {
        try {
          const customData = JSON.parse(formData.customMetadata)
          Object.assign(metadata, customData)
        } catch {
          message.error('自定义元数据格式错误，请使用有效的JSON格式')
          setLoading(false)
          return
        }
      }

      if (Object.keys(metadata).length > 0) {
        request.metadata = metadata
      }

      // 调用API创建激活码
      await activationCodeApi.createActivationCode(request)

      message.success('激活码创建成功！')
      
      // 跳转回列表页面
      router.push('/dashboard/activation-codes')
      
    } catch (error) {
      const apiError = error as ActivationCodeApiError
      message.error(apiError.message)
    } finally {
      setLoading(false)
    }
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
                新增激活码
              </Title>
            </Space>
            <Paragraph style={{ color: '#666', margin: 0 }}>
              创建新的激活码，可以设置过期时间、产品信息和元数据
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} xl={16}>
              <Card title="基本信息">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    expirationDays: 365,
                    productVersion: '1.0.0',
                    licenseType: 'standard'
                  }}
                >
                  {/* 过期设置 */}
                  <Form.Item
                    label="有效期（天）"
                    name="expirationDays"
                    rules={[
                      { required: true, message: '请输入有效期' },
                      { type: 'number', min: 1, max: 3650, message: '有效期必须在1-3650天之间' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="请输入有效期天数"
                      min={1}
                      max={3650}
                    />
                  </Form.Item>

                  <Divider orientation="left">产品信息</Divider>

                  {/* 产品名称 */}
                  <Form.Item
                    label="产品名称"
                    name="productName"
                  >
                    <Input placeholder="请输入产品名称（可选）" />
                  </Form.Item>

                  {/* 产品版本 */}
                  <Form.Item
                    label="产品版本"
                    name="productVersion"
                  >
                    <Input placeholder="请输入产品版本" />
                  </Form.Item>

                  {/* 功能特性 */}
                  <Form.Item label="功能特性">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          placeholder="输入功能特性名称"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onPressEnter={addFeature}
                        />
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={addFeature}
                        >
                          添加
                        </Button>
                      </Space.Compact>
                      
                      {features.length > 0 && (
                        <div>
                          {features.map(feature => (
                            <Tag
                              key={feature.id}
                              closable
                              onClose={() => removeFeature(feature.id)}
                              style={{ marginBottom: '8px' }}
                            >
                              {feature.name}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </Space>
                  </Form.Item>

                  <Divider orientation="left">客户信息</Divider>

                  {/* 客户邮箱 */}
                  <Form.Item
                    label="客户邮箱"
                    name="customerEmail"
                    rules={[
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input placeholder="请输入客户邮箱（可选）" />
                  </Form.Item>

                  {/* 许可证类型 */}
                  <Form.Item
                    label="许可证类型"
                    name="licenseType"
                  >
                    <Input placeholder="例如：standard, premium, enterprise" />
                  </Form.Item>

                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      {/* 订单ID */}
                      <Form.Item
                        label="订单ID"
                        name="purchaseId"
                      >
                        <Input placeholder="请输入订单ID（可选）" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      {/* 客户ID */}
                      <Form.Item
                        label="客户ID"
                        name="customerId"
                      >
                        <Input placeholder="请输入客户ID（可选）" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left">自定义元数据</Divider>

                  {/* 自定义元数据 */}
                  <Form.Item
                    label="自定义元数据"
                    name="customMetadata"
                    help='请输入有效的JSON格式数据，例如：{"key": "value"}'
                  >
                    <TextArea
                      rows={4}
                      placeholder='{"customField": "customValue"}'
                    />
                  </Form.Item>

                  {/* 提交按钮 */}
                  <Form.Item style={{ marginTop: '32px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loading}
                        size="large"
                        block
                      >
                        创建激活码
                      </Button>
                      <Button
                        onClick={() => router.back()}
                        size="large"
                        block
                      >
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            <Col xs={24} xl={8}>
              <Card title="创建说明">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Alert
                    message="激活码格式"
                    description="系统将自动生成格式为 {timestamp}-{random}-{uuid} 的唯一激活码"
                    type="info"
                    showIcon
                  />
                  
                  <Alert
                    message="有效期设置"
                    description="激活码的有效期从创建时间开始计算，过期后将无法使用"
                    type="warning"
                    showIcon
                  />
                  
                  <div>
                    <Text strong>常用有效期：</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Space wrap>
                        <Tag onClick={() => form.setFieldValue('expirationDays', 30)}>30天</Tag>
                        <Tag onClick={() => form.setFieldValue('expirationDays', 90)}>90天</Tag>
                        <Tag onClick={() => form.setFieldValue('expirationDays', 365)}>1年</Tag>
                        <Tag onClick={() => form.setFieldValue('expirationDays', 730)}>2年</Tag>
                      </Space>
                    </div>
                  </div>

                  <div>
                    <Text strong>许可证类型示例：</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Space direction="vertical">
                        <Text type="secondary">• standard - 标准版</Text>
                        <Text type="secondary">• premium - 高级版</Text>
                        <Text type="secondary">• enterprise - 企业版</Text>
                        <Text type="secondary">• trial - 试用版</Text>
                      </Space>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}
