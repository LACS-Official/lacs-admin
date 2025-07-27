'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  Space,
  Button,
  Row,
  Col,
  message
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select

interface GitHubRepo {
  id: string
  name: string
  description: string
  url: string
  language: string
  stars: number
  forks: number
  lastUpdated: string
  isPrivate: boolean
  topics: string[]
}

interface RepoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (repo: Partial<GitHubRepo>) => void
  repo?: GitHubRepo | null
  mode: 'add' | 'edit'
}

export default function RepoModal({ isOpen, onClose, onSave, repo, mode }: RepoModalProps) {
  const [form] = Form.useForm()
  const [topics, setTopics] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')

  useEffect(() => {
    if (repo && mode === 'edit') {
      form.setFieldsValue({
        name: repo.name,
        description: repo.description,
        url: repo.url,
        language: repo.language,
        isPrivate: repo.isPrivate,
      })
      setTopics([...repo.topics])
    } else {
      form.resetFields()
      setTopics([])
    }
  }, [repo, mode, isOpen, form])

  const handleSubmit = async (values: {
    name: string;
    description?: string;
    url: string;
    language: string;
    isPrivate: boolean;
  }) => {
    try {
      const repoData: Partial<GitHubRepo> = {
        ...values,
        topics,
        id: repo?.id || Date.now().toString(),
        stars: repo?.stars || 0,
        forks: repo?.forks || 0,
        lastUpdated: new Date().toISOString().split('T')[0]
      }

      onSave(repoData)
      onClose()
      message.success(mode === 'add' ? '仓库添加成功' : '仓库更新成功')
    } catch {
      message.error('操作失败，请重试')
    }
  }

  const handleTopicAdd = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()])
      setTopicInput('')
    }
  }

  const handleTopicRemove = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  const handleTopicInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTopicAdd()
    }
  }

  return (
    <Modal
      title={mode === 'add' ? '添加新仓库' : '编辑仓库'}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          language: 'JavaScript',
          isPrivate: false,
        }}
      >
        <Form.Item
          label="仓库名称"
          name="name"
          rules={[{ required: true, message: '请输入仓库名称' }]}
        >
          <Input placeholder="输入仓库名称" />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
        >
          <TextArea
            placeholder="输入仓库描述"
            rows={3}
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item
          label="仓库URL"
          name="url"
          rules={[
            { required: true, message: '请输入仓库URL' },
            { type: 'url', message: '请输入有效的URL' }
          ]}
        >
          <Input placeholder="https://github.com/username/repository" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="主要语言"
              name="language"
            >
              <Select placeholder="选择主要语言">
                <Option value="JavaScript">JavaScript</Option>
                <Option value="TypeScript">TypeScript</Option>
                <Option value="Python">Python</Option>
                <Option value="Go">Go</Option>
                <Option value="Java">Java</Option>
                <Option value="C++">C++</Option>
                <Option value="HTML">HTML</Option>
                <Option value="CSS">CSS</Option>
                <Option value="PHP">PHP</Option>
                <Option value="Ruby">Ruby</Option>
                <Option value="Rust">Rust</Option>
                <Option value="Swift">Swift</Option>
                <Option value="Kotlin">Kotlin</Option>
                <Option value="Other">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="仓库类型"
              name="isPrivate"
              valuePropName="checked"
            >
              <Switch
                checkedChildren="私有"
                unCheckedChildren="公开"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="标签">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="输入标签后点击添加"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={handleTopicInputKeyPress}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleTopicAdd}
              >
                添加
              </Button>
            </Space.Compact>

            {topics.length > 0 && (
              <div>
                <Space size={[8, 8]} wrap>
                  {topics.map((topic) => (
                    <Tag
                      key={topic}
                      closable
                      onClose={() => handleTopicRemove(topic)}
                      color="blue"
                    >
                      {topic}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}
          </Space>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {mode === 'add' ? '添加仓库' : '保存更改'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}
