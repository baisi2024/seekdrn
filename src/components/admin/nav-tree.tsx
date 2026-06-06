'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { NavigationItem } from '@/lib/navigation/types'

interface NavTreeItemProps {
  item: NavigationItem
  onEdit: (item: NavigationItem) => void
  onDelete: (item: NavigationItem) => void
  depth?: number
}

export function NavTreeItem({ item, onEdit, onDelete, depth = 0 }: NavTreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // 获取英文标签（或第一个可用的标签）
  const label = item.translations?.en || Object.values(item.translations || {})[0] || 'Untitled'

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div
        className={`
          flex items-center gap-2 p-3 bg-background border border-border rounded-lg mb-2
          ${isDragging ? 'shadow-lg z-50' : 'hover:bg-muted/50'}
        `}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {/* 拖拽手柄 */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* 展开指示器（如果有子项） */}
        {item.children && item.children.length > 0 ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <div className="w-4" />
        )}

        {/* 导航项信息 */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{label}</div>
          <div className="text-sm text-muted-foreground truncate">{item.url}</div>
        </div>

        {/* 状态标签 */}
        <div
          className={`
            px-2 py-1 rounded text-xs font-medium
            ${item.published ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-muted text-foreground'}
          `}
        >
          {item.published ? 'Published' : 'Draft'}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 递归渲染子菜单 */}
      {item.children && item.children.length > 0 && (
        <div>
          {item.children.map((child) => (
            <NavTreeItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface NavTreeProps {
  items: NavigationItem[]
  onEdit: (item: NavigationItem) => void
  onDelete: (item: NavigationItem) => void
}

export function NavTree({ items, onEdit, onDelete }: NavTreeProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No navigation items yet. Click "Add Item" to create one.
      </div>
    )
  }

  return (
    <div>
      {items.map((item) => (
        <NavTreeItem
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
