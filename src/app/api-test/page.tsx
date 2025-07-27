'use client'

import { useState } from 'react'
import { Button, Card, Typography, Space, Alert } from 'antd'
import { activationCodeApi } from '@/utils/activation-codes-api'

const { Title, Text, Paragraph } = Typography

export default function ApiTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testApiConfig = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('开始测试API配置...')
      
      // 测试统计API
      const stats = await activationCodeApi.getActivationCodeStats()
      setResult(`API配置正确！统计数据: ${JSON.stringify(stats, null, 2)}`)
    } catch (error) {
      console.error('API测试失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setResult(`API测试失败: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>API配置测试</Title>
        <Paragraph>
          测试激活码API配置。前端请求 <Text code>/api/activation-codes</Text>，
          通过Next.js重写规则转发到 <Text code>https://api-g.lacs.cc/api/activation-codes</Text>
        </Paragraph>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            onClick={testApiConfig}
            loading={loading}
          >
            测试API配置
          </Button>
          
          {result && (
            <Alert
              message="测试结果"
              description={<pre style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>}
              type={result.includes('失败') ? 'error' : 'success'}
              showIcon
            />
          )}
        </Space>
      </Card>
    </div>
  )
}
