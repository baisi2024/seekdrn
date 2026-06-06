// src/app/api/admin/navigation/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getNavigation, createNavigationItem } from '@/lib/navigation/api'
import type { NavigationItemCreate } from '@/lib/navigation/types'

/**
 * GET /api/admin/navigation
 * 获取导航树
 * Query params: ?position=header|footer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = (searchParams.get('position') as 'header' | 'footer') || 'header'

    const items = await getNavigation(position)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 })
  }
}

/**
 * POST /api/admin/navigation
 * 创建导航项
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item: NavigationItemCreate = body

    const created = await createNavigationItem(item)

    return NextResponse.json({ item: created })
  } catch (error) {
    console.error('Error creating navigation item:', error)
    return NextResponse.json({ error: 'Failed to create navigation item' }, { status: 500 })
  }
}
