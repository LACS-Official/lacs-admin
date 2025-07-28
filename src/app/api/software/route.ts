import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-connection'
import { software } from '@/lib/db-schema'
import { eq, like, and, desc, asc } from 'drizzle-orm'

// GET /api/software - 获取所有可用软件列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 查询参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const isActive = searchParams.get('active')
    const sortBy = searchParams.get('sortBy') || 'sortOrder'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    
    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        error: '无效的分页参数'
      }, { status: 400 })
    }
    
    // 构建查询条件
    const conditions = []
    
    // 搜索条件（支持中英文名称和描述）
    if (search) {
      conditions.push(
        like(software.name, `%${search}%`)
      )
    }
    
    // 分类筛选
    if (category) {
      conditions.push(eq(software.category, category))
    }
    
    // 状态筛选
    if (isActive !== null && isActive !== undefined) {
      conditions.push(eq(software.isActive, isActive === 'true'))
    }
    
    // 排序设置
    const orderBy = sortOrder === 'desc' 
      ? desc(software[sortBy as keyof typeof software] || software.sortOrder)
      : asc(software[sortBy as keyof typeof software] || software.sortOrder)
    
    // 执行查询
    const offset = (page - 1) * limit
    const softwareList = await db
      .select()
      .from(software)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
    
    // 获取总数
    const totalCount = await db
      .select({ count: software.id })
      .from(software)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
    
    const total = totalCount.length
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      success: true,
      data: {
        software: softwareList,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })
    
  } catch (error) {
    console.error('获取软件列表失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// POST /api/software - 创建新软件（管理员功能）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 基本字段验证
    const {
      name,
      nameEn,
      description,
      descriptionEn,
      currentVersion,
      latestVersion,
      downloadUrl,
      downloadUrlBackup,
      officialWebsite,
      category,
      tags,
      systemRequirements,
      fileSize,
      isActive = true,
      sortOrder = 0,
      metadata = {}
    } = body
    
    // 必填字段验证
    if (!name || !currentVersion || !latestVersion) {
      return NextResponse.json({
        success: false,
        error: '软件名称、当前版本和最新版本为必填字段'
      }, { status: 400 })
    }
    
    // 检查软件名称是否已存在
    const existingSoftware = await db
      .select()
      .from(software)
      .where(eq(software.name, name))
      .limit(1)
    
    if (existingSoftware.length > 0) {
      return NextResponse.json({
        success: false,
        error: '软件名称已存在'
      }, { status: 409 })
    }
    
    // 创建新软件记录
    const [newSoftware] = await db
      .insert(software)
      .values({
        name,
        nameEn,
        description,
        descriptionEn,
        currentVersion,
        latestVersion,
        downloadUrl,
        downloadUrlBackup,
        officialWebsite,
        category,
        tags,
        systemRequirements,
        fileSize,
        isActive,
        sortOrder,
        metadata,
        updatedAt: new Date()
      })
      .returning()
    
    return NextResponse.json({
      success: true,
      data: newSoftware
    }, { status: 201 })
    
  } catch (error) {
    console.error('创建软件失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
