'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  message,
  Input,
  Form
} from 'antd'
import {
  ArrowLeftOutlined,
  ExperimentOutlined,
  CheckOutlined,
  CloseOutlined
} from '@ant-design/icons'
import Navigation from '@/components/Navigation'
import {
  activationCodeApi,
  type ActivationCodeApiError
} from '@/utils/activation-codes-api'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography

export default function ActivationCodeTestPage() {
  const router = useRouter()
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [testCode, setTestCode] = useState('')

  // 测试API连接
  const testApiConnection = async () => {
    setLoading(true)
    try {
      await activationCodeApi.getActivationCodeStats()
      setTestResults(prev => ({ ...prev, apiConnection: true }))
      message.success('API连接测试成功')
    } catch (error) {
      setTestResults(prev => ({ ...prev, apiConnection: false }))
      const apiError = error as ActivationCodeApiError
      message.error(`API连接测试失败: ${apiError.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 测试创建激活码
  const testCreateCode = async () => {
    setLoading(true)
    try {
      const result = await activationCodeApi.createActivationCode({
        expirationDays: 30,
        productInfo: {
          name: '测试产品',
          version: '1.0.0',
          features: ['test']
        },
        metadata: {
          customerEmail: 'test@example.com',
          licenseType: 'test'
        }
      })
      setTestCode(result.code)
      setTestResults(prev => ({ ...prev, createCode: true }))
      message.success('创建激活码测试成功')
    } catch (error) {
      setTestResults(prev => ({ ...prev, createCode: false }))
      const apiError = error as ActivationCodeApiError
      message.error(`创建激活码测试失败: ${apiError.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 测试验证激活码
  const testVerifyCode = async () => {
    if (!testCode) {
      message.warning('请先创建测试激活码')
      return
    }

    setLoading(true)
    try {
      await activationCodeApi.verifyActivationCode({ code: testCode })
      setTestResults(prev => ({ ...prev, verifyCode: true }))
      message.success('验证激活码测试成功')
    } catch (error) {
      setTestResults(prev => ({ ...prev, verifyCode: false }))
      const apiError = error as ActivationCodeApiError
      message.error(`验证激活码测试失败: ${apiError.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 测试获取列表
  const testGetList = async () => {
    setLoading(true)
    try {
      await activationCodeApi.getActivationCodes(1, 10, 'all')
      setTestResults(prev => ({ ...prev, getList: true }))
      message.success('获取列表测试成功')
    } catch (error) {
      setTestResults(prev => ({ ...prev, getList: false }))
      const apiError = error as ActivationCodeApiError
      message.error(`获取列表测试失败: ${apiError.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 运行所有测试
  const runAllTests = async () => {
    await testApiConnection()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testGetList()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await testCreateCode()
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (testCode) {
      await testVerifyCode()
    }
  }

  const getTestIcon = (testName: string) => {
    if (!(testName in testResults)) return null
    return testResults[testName] ? 
      <CheckOutlined style={{ color: '#52c41a' }} /> : 
      <CloseOutlined style={{ color: '#ff4d4f' }} />
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
                激活码功能测试
              </Title>
            </Space>
            <Paragraph style={{ color: '#666', margin: 0 }}>
              测试激活码管理系统的各项功能是否正常工作
            </Paragraph>
          </div>

          <Alert
            message="测试说明"
            description="此页面用于测试激活码管理系统的功能。前端请求 /api/activation-codes，通过Next.js重写规则转发到 https://api-g.lacs.cc/api/activation-codes"
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          <Card title="功能测试" style={{ marginBottom: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 测试按钮 */}
              <Space wrap>
                <Button
                  type="primary"
                  icon={<ExperimentOutlined />}
                  onClick={runAllTests}
                  loading={loading}
                >
                  运行所有测试
                </Button>
                <Button onClick={testApiConnection} loading={loading}>
                  测试API连接
                </Button>
                <Button onClick={testGetList} loading={loading}>
                  测试获取列表
                </Button>
                <Button onClick={testCreateCode} loading={loading}>
                  测试创建激活码
                </Button>
                <Button onClick={testVerifyCode} loading={loading} disabled={!testCode}>
                  测试验证激活码
                </Button>
              </Space>

              <Divider />

              {/* 测试结果 */}
              <div>
                <Title level={4}>测试结果</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>API连接测试</Text>
                    {getTestIcon('apiConnection')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>获取激活码列表</Text>
                    {getTestIcon('getList')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>创建激活码</Text>
                    {getTestIcon('createCode')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text>验证激活码</Text>
                    {getTestIcon('verifyCode')}
                  </div>
                </Space>
              </div>

              {testCode && (
                <>
                  <Divider />
                  <div>
                    <Title level={4}>测试激活码</Title>
                    <Text code copyable>{testCode}</Text>
                  </div>
                </>
              )}
            </Space>
          </Card>

          <Card title="手动测试">
            <Form layout="vertical">
              <Form.Item label="测试激活码验证">
                <Input.Search
                  placeholder="输入激活码进行验证测试"
                  enterButton="验证"
                  onSearch={async (value) => {
                    if (!value.trim()) return
                    try {
                      await activationCodeApi.verifyActivationCode({ code: value.trim() })
                      message.success('激活码验证成功')
                    } catch (error) {
                      const apiError = error as ActivationCodeApiError
                      message.error(`验证失败: ${apiError.message}`)
                    }
                  }}
                />
              </Form.Item>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  )
}
