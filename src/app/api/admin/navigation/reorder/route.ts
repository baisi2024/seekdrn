// src/app/api/admin/navigation/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { reorderNavigationItems } from '@/lib/navigation/api'
import type { ReorderRequest } from '@/lib/navigation/types'

/**
 * PATCH /api/admin/navigation/reorder
 * 批量更新导航项排序
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const reorderRequest: ReorderRequest = body

    // 验证请求体
    if (!reorderRequest.updates || !Array.isArray(reorderRequest.updates)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { updates: Array }' },
        { status: 400 }
      )
    }

    // 批量更新排序
    await reorderNavigationItems(reorderRequest)

    // 触发 ISR 重新验证
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering navigation items:', error)
    return NextResponse.json(
      { error: 'Failed to reorder navigation items' },
      { status: 500 }
    )
  }
}
