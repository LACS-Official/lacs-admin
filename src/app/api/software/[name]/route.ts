import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db-connection'
import { software, softwareAnnouncements } from '@/lib/db-schema'
import { eq, and, desc } from 'drizzle-orm'

// GET /api/software/[name] - 根据名称获取特定软件的详细信息
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params
    
    if (!name) {
      return NextResponse.json({
        success: false,
        error: '软件名称参数缺失'
      }, { status: 400 })
    }
    
    // URL 解码软件名称（支持中文和特殊字符）
    const decodedName = decodeURIComponent(name)
    
    // 查询软件信息（支持中英文名称查询）
    const [softwareInfo] = await db
      .select()
      .from(software)
      .where(
        and(
          eq(software.name, decodedName),
          eq(software.isActive, true)
        )
      )
      .limit(1)
    
    // 如果按中文名称没找到，尝试按英文名称查询
    let finalSoftwareInfo = softwareInfo
    if (!finalSoftwareInfo) {
      const [softwareInfoEn] = await db
        .select()
        .from(software)
        .where(
          and(
            eq(software.nameEn, decodedName),
            eq(software.isActive, true)
          )
        )
        .limit(1)
      
      finalSoftwareInfo = softwareInfoEn
    }
    
    if (!finalSoftwareInfo) {
      return NextResponse.json({
        success: false,
        error: '未找到指定的软件'
      }, { status: 404 })
    }
    
    // 获取该软件的最新公告（最多5条）
    const latestAnnouncements = await db
      .select()
      .from(softwareAnnouncements)
      .where(
        and(
          eq(softwareAnnouncements.softwareId, finalSoftwareInfo.id),
          eq(softwareAnnouncements.isPublished, true)
        )
      )
      .orderBy(desc(softwareAnnouncements.publishedAt))
      .limit(5)
    
    // 构建响应数据
    const responseData = {
      ...finalSoftwareInfo,
      latestAnnouncements: latestAnnouncements.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        titleEn: announcement.titleEn,
        content: announcement.content,
        contentEn: announcement.contentEn,
        type: announcement.type,
        priority: announcement.priority,
        version: announcement.version,
        publishedAt: announcement.publishedAt,
        expiresAt: announcement.expiresAt
      }))
    }
    
    return NextResponse.json({
      success: true,
      data: responseData
    })
    
  } catch (error) {
    console.error('获取软件详情失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// PUT /api/software/[name] - 更新软件信息（管理员功能）
export async function PUT(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params
    const body = await request.json()
    
    if (!name) {
      return NextResponse.json({
        success: false,
        error: '软件名称参数缺失'
      }, { status: 400 })
    }
    
    const decodedName = decodeURIComponent(name)
    
    // 查找要更新的软件
    const [existingSoftware] = await db
      .select()
      .from(software)
      .where(eq(software.name, decodedName))
      .limit(1)
    
    if (!existingSoftware) {
      return NextResponse.json({
        success: false,
        error: '未找到指定的软件'
      }, { status: 404 })
    }
    
    // 更新软件信息
    const updateData = {
      ...body,
      updatedAt: new Date()
    }
    
    // 移除不应该被更新的字段
    delete updateData.id
    delete updateData.createdAt
    
    const [updatedSoftware] = await db
      .update(software)
      .set(updateData)
      .where(eq(software.id, existingSoftware.id))
      .returning()
    
    return NextResponse.json({
      success: true,
      data: updatedSoftware
    })
    
  } catch (error) {
    console.error('更新软件信息失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}

// DELETE /api/software/[name] - 删除软件（管理员功能）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params
    
    if (!name) {
      return NextResponse.json({
        success: false,
        error: '软件名称参数缺失'
      }, { status: 400 })
    }
    
    const decodedName = decodeURIComponent(name)
    
    // 查找要删除的软件
    const [existingSoftware] = await db
      .select()
      .from(software)
      .where(eq(software.name, decodedName))
      .limit(1)
    
    if (!existingSoftware) {
      return NextResponse.json({
        success: false,
        error: '未找到指定的软件'
      }, { status: 404 })
    }
    
    // 软删除：设置为不活跃状态
    const [deletedSoftware] = await db
      .update(software)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(software.id, existingSoftware.id))
      .returning()
    
    return NextResponse.json({
      success: true,
      message: '软件已成功删除',
      data: deletedSoftware
    })
    
  } catch (error) {
    console.error('删除软件失败:', error)
    return NextResponse.json({
      success: false,
      error: '服务器内部错误'
    }, { status: 500 })
  }
}
