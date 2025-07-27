'use client'

import { useState } from 'react'
import { Button, Card, Typography, Space, Alert, Descriptions } from 'antd'

const { Title, Text, Paragraph } = Typography

export default function CorsTestPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testCors = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('开始测试CORS...')
      
      // 测试简单的GET请求
      const response = await fetch('https://api-g.lacs.cc/api/activation-codes/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
      
      console.log('响应状态:', response.status)
      console.log('响应头:', response.headers)
      
      if (response.ok) {
        const data = await response.json()
        setResult(`CORS测试成功！\n状态码: ${response.status}\n响应数据: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`请求失败\n状态码: ${response.status}\n状态文本: ${response.statusText}`)
      }
    } catch (error) {
      console.error('CORS测试失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setResult(`CORS测试失败: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const testPreflight = async () => {
    setLoading(true)
    setResult('')
    
    try {
      console.log('开始测试预检请求...')
      
      // 测试会触发预检请求的POST请求
      const response = await fetch('https://api-g.lacs.cc/api/activation-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          expirationDays: 30,
          metadata: { test: true }
        }),
      })
      
      console.log('预检响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setResult(`预检测试成功！\n状态码: ${response.status}\n响应数据: ${JSON.stringify(data, null, 2)}`)
      } else {
        const errorText = await response.text()
        setResult(`预检请求失败\n状态码: ${response.status}\n状态文本: ${response.statusText}\n响应内容: ${errorText}`)
      }
    } catch (error) {
      console.error('预检测试失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setResult(`预检测试失败: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2}>CORS跨域测试</Title>
        <Paragraph>
          测试前端是否能够成功访问 <Text code>https://api-g.lacs.cc/api</Text> 的API接口
        </Paragraph>
        
        <Alert
          message="CORS说明"
          description="如果API服务器没有正确配置CORS头，浏览器会阻止跨域请求。这个页面可以帮助诊断CORS配置问题。"
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Descriptions title="测试信息" bordered column={1} style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="前端域名">
            {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}
          </Descriptions.Item>
          <Descriptions.Item label="API服务器">
            https://api-g.lacs.cc/api
          </Descriptions.Item>
          <Descriptions.Item label="测试类型">
            简单请求 (GET) 和预检请求 (POST)
          </Descriptions.Item>
        </Descriptions>
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button 
              type="primary" 
              onClick={testCors}
              loading={loading}
            >
              测试简单请求 (GET)
            </Button>
            <Button 
              onClick={testPreflight}
              loading={loading}
            >
              测试预检请求 (POST)
            </Button>
          </Space>
          
          {result && (
            <Alert
              message="测试结果"
              description={<pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{result}</pre>}
              type={result.includes('成功') ? 'success' : 'error'}
              showIcon
            />
          )}

          <Alert
            message="常见CORS错误解决方案"
            description={
              <div>
                <p><strong>如果遇到CORS错误，需要在API服务器端添加以下响应头：</strong></p>
                <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
{`Access-Control-Allow-Origin: https://admin.lacs.cc
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true`}
                </pre>
              </div>
            }
            type="warning"
            showIcon
          />
        </Space>
      </Card>
    </div>
  )
}
