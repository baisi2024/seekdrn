'use client'

import { DragOverlay } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import type { NavigationItem } from '@/lib/navigation/types'

interface NavDragOverlayProps {
  activeItem: NavigationItem | null
}

export function NavDragOverlay({ activeItem }: NavDragOverlayProps) {
  if (!activeItem) return null

  // 获取英文标签（或第一个可用的标签）
  const label = activeItem.translations?.en || Object.values(activeItem.translations || {})[0] || 'Untitled'

  return (
    <DragOverlay>
      <div className="flex items-center gap-2 p-3 bg-white border-2 border-blue-500 rounded-lg shadow-xl">
        {/* 拖拽手柄 */}
        <div className="text-gray-400">
          <GripVertical className="h-5 w-5" />
        </div>

        {/* 导航项信息 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{label}</div>
          <div className="text-sm text-gray-500 truncate">{activeItem.url}</div>
        </div>

        {/* 状态标签 */}
        <div
          className={`
            px-2 py-1 rounded text-xs font-medium
            ${activeItem.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
          `}
        >
          {activeItem.published ? 'Published' : 'Draft'}
        </div>
      </div>
    </DragOverlay>
  )
}
