// src/app/api/admin/navigation/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateNavigationItem, deleteNavigationItem } from '@/lib/navigation/api'
import type { NavigationItemUpdate } from '@/lib/navigation/types'

/**
 * PUT /api/admin/navigation/[id]
 * 更新导航项
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updates: NavigationItemUpdate = body

    const item = await updateNavigationItem(id, updates)

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Error updating navigation item:', error)
    return NextResponse.json({ error: 'Failed to update navigation item' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/navigation/[id]
 * 删除导航项
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await deleteNavigationItem(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting navigation item:', error)
    return NextResponse.json({ error: 'Failed to delete navigation item' }, { status: 500 })
  }
}
