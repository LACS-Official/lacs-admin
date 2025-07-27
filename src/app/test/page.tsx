'use client'

import { Button, Card, Typography } from 'antd'

const { Title } = Typography

export default function TestPage() {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Ant Design 测试页面</Title>
        <Button type="primary">测试按钮</Button>
      </Card>
    </div>
  )
}
