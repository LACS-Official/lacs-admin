'use client'

import { Card, Button, Typography, Space, Row, Col } from 'antd'
import { GithubOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography

export default function Home() {
  // 后端 API 地址（请替换为你的实际后端API地址）
  const API_BASE = 'https://api-g.lacs.cc'

  return (
    <div style={{
      padding: '24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10} xxl={8}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '32px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <GithubOutlined />
                </div>
              </div>

              <Title level={1} style={{
                margin: '0 0 8px 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2.5rem',
                fontWeight: 700,
              }}>
                LACS Admin
              </Title>

              <Paragraph style={{
                color: '#64748b',
                fontSize: '1.1rem',
                margin: '0 0 32px 0'
              }}>
                安全、快速的管理系统
              </Paragraph>

              <Button
                type="primary"
                size="large"
                icon={<GithubOutlined />}
                href={`${API_BASE}/api/auth/github/login`}
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  transition: 'all 0.3s ease',
                }}
              >
                使用 GitHub 登录
              </Button>
            </Space>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '32px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
            <Paragraph style={{ margin: '0 0 16px 0', color: 'rgba(255, 255, 255, 0.8)' }}>
              © 2024 LACS Team. 保留所有权利。
            </Paragraph>
          </div>
        </Col>
      </Row>
    </div>
  )
}
