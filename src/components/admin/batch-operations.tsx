'use client'

import { useState } from 'react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, Eye, EyeOff, FolderOpen, Tag, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  slug: string
  translations: Record<string, { name: string }>
}

interface Tag {
  id: string
  slug: string
  translations: Record<string, { name: string }>
}

interface BatchOperationsProps {
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  totalItems: number
  categories: Category[]
  tags: Tag[]
  onBatchPublish: (ids: string[], published: boolean) => Promise<void>
  onBatchDelete: (ids: string[]) => Promise<void>
  onBatchSetCategory: (ids: string[], categoryId: string) => Promise<void>
  onBatchSetTags: (ids: string[], tagIds: string[]) => Promise<void>
}

export function BatchOperations({
  selectedIds,
  onSelectionChange,
  totalItems,
  categories,
  tags,
  onBatchPublish,
  onBatchDelete,
  onBatchSetCategory,
  onBatchSetTags,
}: BatchOperationsProps) {
  const t = useAdminTranslations()
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleBatchPublish = async (published: boolean) => {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await onBatchPublish(selectedIds, published)
      toast.success(published ? '批量发布成功' : '批量取消发布成功')
      onSelectionChange([])
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await onBatchDelete(selectedIds)
      toast.success('批量删除成功')
      onSelectionChange([])
      setShowDeleteDialog(false)
    } catch (error) {
      toast.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSetCategory = async () => {
    if (selectedIds.length === 0 || !selectedCategory) return
    setLoading(true)
    try {
      await onBatchSetCategory(selectedIds, selectedCategory)
      toast.success('批量设置分类成功')
      onSelectionChange([])
      setShowCategoryDialog(false)
      setSelectedCategory('')
    } catch (error) {
      toast.error('设置分类失败')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSetTags = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await onBatchSetTags(selectedIds, selectedTags)
      toast.success('批量设置标签成功')
      onSelectionChange([])
      setShowTagDialog(false)
      setSelectedTags([])
    } catch (error) {
      toast.error('设置标签失败')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  if (selectedIds.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg">
        <Badge variant="secondary" className="px-3 py-1">
          已选择 {selectedIds.length} 项
        </Badge>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchPublish(true)}
            disabled={loading}
          >
            <Eye className="w-4 h-4 mr-1" />
            批量发布
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchPublish(false)}
            disabled={loading}
          >
            <EyeOff className="w-4 h-4 mr-1" />
            取消发布
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryDialog(true)}
            disabled={loading}
          >
            <FolderOpen className="w-4 h-4 mr-1" />
            设置分类
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTagDialog(true)}
            disabled={loading}
          >
            <Tag className="w-4 h-4 mr-1" />
            设置标签
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            批量删除
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
          >
            取消选择
          </Button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              确认删除
            </DialogTitle>
            <DialogDescription>
              您确定要删除选中的 {selectedIds.length} 个产品吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={loading}
            >
              {loading ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置分类对话框 */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量设置分类</DialogTitle>
            <DialogDescription>
              为选中的 {selectedIds.length} 个产品设置分类
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('select_category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const name =
                    category.translations?.zh?.name ||
                    category.translations?.en?.name ||
                    category.slug
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      {name}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              取消
            </Button>
            <Button onClick={handleBatchSetCategory} disabled={loading || !selectedCategory}>
              {loading ? '设置中...' : '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置标签对话框 */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>批量设置标签</DialogTitle>
            <DialogDescription>
              为选中的 {selectedIds.length} 个产品设置标签
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const name =
                  tag.translations?.zh?.name ||
                  tag.translations?.en?.name ||
                  tag.slug
                const isSelected = selectedTags.includes(tag.id)
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {name}
                  </Badge>
                )
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              取消
            </Button>
            <Button onClick={handleBatchSetTags} disabled={loading}>
              {loading ? '设置中...' : '确认'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
