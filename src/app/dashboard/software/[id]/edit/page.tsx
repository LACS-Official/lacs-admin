'use client'

import React, { useState, useEffect } from 'react'
import { 
  Layout,
  Form, 
  Input, 
  Button, 
  Card, 
  Switch, 
  Select, 
  InputNumber,
  Upload,
  message,
  Typography,
  Space,
  Divider,
  Row,
  Col
} from 'antd'
import { 
  SaveOutlined, 
  ArrowLeftOutlined,
  UploadOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography
const { Content } = Layout

interface SoftwareFormData {
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
  fileSize?: string
  isActive: boolean
  sortOrder: number
}

export default function SoftwareEdit() {
  const router = useRouter()
  const params = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const softwareId = params.id as string
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/app'

  // 获取软件详情
  const fetchSoftware = async () => {
    if (softwareId === 'new') {
      setIsEdit(false)
      return
    }

    setIsEdit(true)
    setLoading(true)
    
    try {
      const response = await fetch(`${API_BASE_URL}/software/${softwareId}`)
      const data = await response.json()

      if (data.success) {
        form.setFieldsValue({
          ...data.data,
          tags: data.data.tags || []
        })
      } else {
        message.error('获取软件信息失败')
        router.push('/dashboard/software')
      }
    } catch (error) {
      console.error('Error fetching software:', error)
      message.error('网络错误，请稍后重试')
      router.push('/dashboard/software')
    } finally {
      setLoading(false)
    }
  }

  // 保存软件
  const handleSave = async (values: SoftwareFormData) => {
    setSaving(true)
    
    try {
      const url = isEdit ? `${API_BASE_URL}/software/${softwareId}` : `${API_BASE_URL}/software`
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
        },
        body: JSON.stringify(values)
      })

      const data = await response.json()

      if (data.success) {
        message.success(isEdit ? '更新成功' : '创建成功')
        router.push('/dashboard/software')
      } else {
        message.error(data.error?.message || '保存失败')
      }
    } catch (error) {
      console.error('Error saving software:', error)
      message.error('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  // 上传图片
  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch(`${API_BASE_URL}/software/${softwareId}/upload-image`, {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
        },
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        message.success('图片上传成功')
        return data.data.imageUrl
      } else {
        message.error(data.error?.message || '图片上传失败')
        return false
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      message.error('图片上传失败')
      return false
    }
  }

  useEffect(() => {
    fetchSoftware()
  }, [softwareId])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation />
      
      <Content style={{ padding: '24px', marginTop: '64px', background: '#f5f5f5' }}>
        {/* 页面标题 */}
        <div style={{ marginBottom: '24px' }}>
          <Space>
            <Link href="/dashboard/software">
              <Button icon={<ArrowLeftOutlined />}>返回</Button>
            </Link>
            <Title level={2} style={{ margin: 0 }}>
              {isEdit ? '编辑软件' : '添加软件'}
            </Title>
          </Space>
        </div>

        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="基本信息" loading={loading}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  isActive: true,
                  sortOrder: 0,
                  tags: []
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="软件名称"
                      name="name"
                      rules={[{ required: true, message: '请输入软件名称' }]}
                    >
                      <Input placeholder="请输入软件名称" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="英文名称"
                      name="nameEn"
                    >
                      <Input placeholder="请输入英文名称（可选）" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="软件描述"
                  name="description"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="请输入软件描述" 
                  />
                </Form.Item>

                <Form.Item
                  label="英文描述"
                  name="descriptionEn"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="请输入英文描述（可选）" 
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="当前版本"
                      name="currentVersion"
                      rules={[{ required: true, message: '请输入当前版本' }]}
                    >
                      <Input placeholder="如：1.0.0" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="最新版本"
                      name="latestVersion"
                      rules={[{ required: true, message: '请输入最新版本' }]}
                    >
                      <Input placeholder="如：1.0.1" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="文件大小"
                      name="fileSize"
                    >
                      <Input placeholder="如：85 MB" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="软件分类"
                      name="category"
                    >
                      <Select placeholder="请选择分类" allowClear>
                        <Option value="开发工具">开发工具</Option>
                        <Option value="浏览器">浏览器</Option>
                        <Option value="图像处理">图像处理</Option>
                        <Option value="社交通讯">社交通讯</Option>
                        <Option value="办公软件">办公软件</Option>
                        <Option value="系统工具">系统工具</Option>
                        <Option value="娱乐软件">娱乐软件</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="排序顺序"
                      name="sortOrder"
                    >
                      <InputNumber 
                        min={0} 
                        style={{ width: '100%' }}
                        placeholder="数字越小排序越靠前"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="标签"
                  name="tags"
                >
                  <Select
                    mode="tags"
                    placeholder="请输入标签，按回车添加"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Divider>下载链接</Divider>

                <Form.Item
                  label="主下载链接"
                  name="downloadUrl"
                >
                  <Input placeholder="请输入主下载链接" />
                </Form.Item>

                <Form.Item
                  label="备用下载链接"
                  name="downloadUrlBackup"
                >
                  <Input placeholder="请输入备用下载链接" />
                </Form.Item>

                <Form.Item
                  label="官方网站"
                  name="officialWebsite"
                >
                  <Input placeholder="请输入官方网站地址" />
                </Form.Item>

                <Divider>状态设置</Divider>

                <Form.Item
                  label="启用状态"
                  name="isActive"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      loading={saving}
                    >
                      {isEdit ? '更新软件' : '创建软件'}
                    </Button>
                    <Link href="/dashboard/software">
                      <Button>取消</Button>
                    </Link>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {isEdit && (
              <Card title="软件图片">
                <Upload
                  name="image"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleImageUpload(file)
                    return false
                  }}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                </Upload>
                <p style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                  支持 JPG、PNG、WebP 格式，文件大小不超过 5MB
                </p>
              </Card>
            )}
          </Col>
        </Row>
      </Content>
    </Layout>
  )
}
