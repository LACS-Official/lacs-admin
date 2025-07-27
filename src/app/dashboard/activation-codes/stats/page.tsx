'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Layout,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Alert
} from 'antd'
import {
  ArrowLeftOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import Navigation from '@/components/Navigation'
import ActivationCodeStats from '@/components/ActivationCodeStats'

const { Content } = Layout
const { Title, Paragraph } = Typography

export default function ActivationCodeStatsPage() {
  const router = useRouter()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
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
                激活码统计分析
              </Title>
            </Space>
            <Paragraph style={{ color: '#666', margin: 0 }}>
              查看激活码的详细统计信息和使用分析
            </Paragraph>
          </div>

          {/* 统计信息提示 */}
          <Alert
            message="统计信息说明"
            description="以下数据实时更新，反映当前激活码的使用情况和分布状态。建议定期查看以优化激活码管理策略。"
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />

          {/* 统计组件 */}
          <ActivationCodeStats 
            onRefresh={handleRefresh}
            refreshTrigger={refreshTrigger}
          />

          {/* 操作建议 */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} md={12}>
              <Card title="管理建议" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <strong>定期清理：</strong>
                    <br />
                    建议每月清理过期超过30天的激活码，保持系统整洁
                  </div>
                  <div>
                    <strong>使用率监控：</strong>
                    <br />
                    关注激活码使用率，如果长期偏低可能需要调整分发策略
                  </div>
                  <div>
                    <strong>过期率控制：</strong>
                    <br />
                    过期率超过20%时建议检查激活码有效期设置是否合理
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="快速操作" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    type="primary" 
                    block
                    onClick={() => router.push('/dashboard/activation-codes/new')}
                  >
                    创建新激活码
                  </Button>
                  <Button 
                    block
                    onClick={() => router.push('/dashboard/activation-codes')}
                  >
                    查看激活码列表
                  </Button>
                  <Button 
                    block
                    onClick={handleRefresh}
                  >
                    刷新统计数据
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  )
}
