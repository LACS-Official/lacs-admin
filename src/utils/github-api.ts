// GitHub API 工具函数
// 统一处理 GitHub API 调用和错误处理

export interface GitHubApiError {
  status: number
  message: string
  isNotFound: boolean
  isUnauthorized: boolean
  isRateLimited: boolean
}

export class GitHubApiClient {
  private token: string | null = null
  private baseUrl = 'https://api.github.com'

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('github_access_token')
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`
    }
    
    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      return await response.json()
    }

    const error: GitHubApiError = {
      status: response.status,
      message: `GitHub API 请求失败: ${response.status}`,
      isNotFound: response.status === 404,
      isUnauthorized: response.status === 401,
      isRateLimited: response.status === 403,
    }

    // 尝试获取更详细的错误信息
    try {
      const errorData = await response.json()
      if (errorData.message) {
        error.message = errorData.message
      }
    } catch {
      // 忽略解析错误，使用默认消息
    }

    // 根据错误类型提供更友好的消息
    if (error.isNotFound) {
      error.message = '请求的资源不存在，可能是仓库不存在或您没有访问权限'
    } else if (error.isUnauthorized) {
      error.message = 'GitHub 访问令牌无效或已过期，请重新登录'
    } else if (error.isRateLimited) {
      error.message = 'GitHub API 请求频率限制，请稍后再试'
    }

    throw error
  }

  // 检查仓库是否存在
  async checkRepository(owner: string, repo: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: this.getHeaders(),
      })
      return response.ok
    } catch {
      return false
    }
  }

  // 获取仓库文件树
  async getRepositoryTree(owner: string, repo: string, branch = 'main'): Promise<{
    tree: Array<{ path: string; sha: string; type: string }>
  }> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: this.getHeaders(),
      }
    )
    return this.handleResponse(response)
  }

  // 获取文件内容
  async getFileContent(owner: string, repo: string, path: string): Promise<{
    content: string
    sha: string
  }> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: this.getHeaders(),
      }
    )
    return this.handleResponse(response)
  }

  // 更新文件内容
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<{ content: { sha: string } }> {
    const contentBase64 = typeof window !== 'undefined' && window.btoa
      ? window.btoa(unescape(encodeURIComponent(content)))
      : Buffer.from(content, 'utf-8').toString('base64')

    const body: Record<string, unknown> = {
      message,
      content: contentBase64,
    }

    if (sha) {
      body.sha = sha
    }

    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      }
    )
    return this.handleResponse(response)
  }

  // 获取用户仓库列表
  async getUserRepositories(): Promise<Array<{
    id: number
    name: string
    description: string | null
    html_url: string
    language: string | null
    stargazers_count: number
    forks_count: number
    updated_at: string
    private: boolean
    topics: string[]
  }>> {
    const response = await fetch(`${this.baseUrl}/user/repos?per_page=100`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse(response)
  }

  // Base64 解码工具函数
  static base64ToUtf8(base64: string): string {
    try {
      if (typeof window !== 'undefined' && window.atob) {
        const binary = window.atob(base64)
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
        return new TextDecoder('utf-8').decode(bytes)
      } else {
        return Buffer.from(base64, 'base64').toString('utf-8')
      }
    } catch (error) {
      console.error('Base64 解码失败:', error)
      return ''
    }
  }
}

// 默认的仓库配置
export const DEFAULT_HUGO_REPO = {
  owner: 'LACS-Official',
  name: 'appwebsite-hugo',
  branch: 'main'
}

// 创建全局实例
export const githubApi = new GitHubApiClient()
