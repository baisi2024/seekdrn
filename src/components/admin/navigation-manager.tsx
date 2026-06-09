'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { NavTree } from './nav-tree'
import { NavDragOverlay } from './nav-drag-overlay'
import { NavItemEditor } from './nav-item-editor'
import type { NavigationItem, NavigationItemCreate, NavigationItemUpdate } from '@/lib/navigation/types'
import { toast } from 'sonner'

interface NavigationManagerProps {
  position: 'header' | 'footer'
}

export function NavigationManager({ position }: NavigationManagerProps) {
  // 状态管理
  const [items, setItems] = useState<NavigationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState<NavigationItem | null>(null)

  // 编辑对话框状态
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<NavigationItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // 获取导航数据
  const fetchNavigation = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/navigation?position=${position}`)
      if (!response.ok) {
        throw new Error('Failed to fetch navigation')
      }
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error('Error fetching navigation:', error)
      toast.error('Failed to load navigation items')
    } finally {
      setLoading(false)
    }
  }, [position])

  // 初始化加载
  useEffect(() => {
    // 使用 requestAnimationFrame 避免同步 setState
    requestAnimationFrame(() => {
      fetchNavigation()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = findItemById(items, active.id as string)
    setActiveItem(item)
  }

  // 拖拽结束
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over || active.id === over.id) {
      return
    }

    // 找到旧索引和新索引
    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // 乐观更新：立即更新 UI
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    // 准备排序更新数据
    const updates = newItems.map((item, index) => ({
      id: item.id,
      parent_id: item.parent_id,
      order_index: index,
    }))

    try {
      // 调用 API 更新排序
      const response = await fetch('/api/admin/navigation/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to reorder navigation items')
      }

      toast.success('Navigation order updated')
    } catch (error) {
      console.error('Error reordering navigation:', error)
      // 回滚到之前的状态
      setItems(items)
      toast.error('Failed to update order. Changes reverted.')
    }
  }

  // 添加导航项
  const handleAddItem = () => {
    setEditingItem(null)
    setEditDialogOpen(true)
  }

  // 编辑导航项
  const handleEditItem = (item: NavigationItem) => {
    setEditingItem(item)
    setEditDialogOpen(true)
  }

  // 保存导航项（创建或更新）
  const handleSaveItem = async (data: NavigationItemCreate | NavigationItemUpdate) => {
    try {
      if (editingItem) {
        // 更新现有项
        const response = await fetch(`/api/admin/navigation/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update navigation item')
        }

        toast.success('Navigation item updated')
      } else {
        // 创建新项
        const createData = data as NavigationItemCreate
        // 设置正确的 order_index
        createData.order_index = items.length

        const response = await fetch('/api/admin/navigation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        })

        if (!response.ok) {
          throw new Error('Failed to create navigation item')
        }

        toast.success('Navigation item created')
      }

      // 重新加载数据
      await fetchNavigation()
    } catch (error) {
      console.error('Error saving navigation item:', error)
      throw error
    }
  }

  // 删除导航项
  const handleDeleteItem = (item: NavigationItem) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingItem) return

    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/navigation/${deletingItem.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete navigation item')
      }

      toast.success('Navigation item deleted')
      setDeleteDialogOpen(false)
      setDeletingItem(null)

      // 重新加载数据
      await fetchNavigation()
    } catch (error) {
      console.error('Error deleting navigation item:', error)
      toast.error('Failed to delete navigation item')
    } finally {
      setDeleteLoading(false)
    }
  }

  // 辅助函数：根据 ID 查找导航项
  const findItemById = (items: NavigationItem[], id: string): NavigationItem | null => {
    for (const item of items) {
      if (item.id === id) {
        return item
      }
      if (item.children) {
        const found = findItemById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 获取所有导航项的 ID（用于 SortableContext）
  const getAllItemIds = (items: NavigationItem[]): string[] => {
    return items.map((item) => item.id)
  }

  return (
    <div className="space-y-4">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {position === 'header' ? 'Header' : 'Footer'} Navigation
          </h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop to reorder. Click edit or delete to modify items.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNavigation}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* 拖拽上下文 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={getAllItemIds(items)}
          strategy={verticalListSortingStrategy}
        >
          {/* 导航树 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <NavTree
              items={items}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          )}
        </SortableContext>

        {/* 拖拽覆盖层 */}
        <NavDragOverlay activeItem={activeItem} />
      </DndContext>

      {/* 编辑对话框 */}
      <NavItemEditor
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={editingItem}
        position={position}
        onSave={handleSaveItem}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Navigation Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{' '}
              <strong>
                {deletingItem?.translations?.en ||
                  Object.values(deletingItem?.translations || {})[0] ||
                  'this item'}
              </strong>
              ?
            </p>
            {deletingItem?.children && deletingItem.children.length > 0 && (
              <p className="text-sm text-red-600 mt-2">
                Warning: This item has {deletingItem.children.length} child item(s).
                They will also be deleted.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
