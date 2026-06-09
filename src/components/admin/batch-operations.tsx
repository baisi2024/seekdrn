'use client'

import { useState } from 'react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Button } from '@/components/ui/button'
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
      toast.success(published ? t('batch_operations.publish_success') : t('batch_operations.unpublish_success'))
      onSelectionChange([])
    } catch {
      toast.error(t('batch_operations.operation_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await onBatchDelete(selectedIds)
      toast.success(t('batch_operations.batch_delete_success'))
      onSelectionChange([])
      setShowDeleteDialog(false)
    } catch (_error) {
      toast.error(t('batch_operations.delete_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSetCategory = async () => {
    if (selectedIds.length === 0 || !selectedCategory) return
    setLoading(true)
    try {
      await onBatchSetCategory(selectedIds, selectedCategory)
      toast.success(t('batch_operations.batch_set_category_success'))
      onSelectionChange([])
      setShowCategoryDialog(false)
      setSelectedCategory('')
    } catch {
      toast.error(t('batch_operations.set_category_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleBatchSetTags = async () => {
    if (selectedIds.length === 0) return
    setLoading(true)
    try {
      await onBatchSetTags(selectedIds, selectedTags)
      toast.success(t('batch_operations.batch_set_tags_success'))
      onSelectionChange([])
      setShowTagDialog(false)
      setSelectedTags([])
    } catch {
      toast.error(t('batch_operations.set_tags_failed'))
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
          {t('batch_operations.selected_count').replace('{count}', String(selectedIds.length))}
        </Badge>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchPublish(true)}
            disabled={loading}
          >
            <Eye className="w-4 h-4 mr-1" />
            {t('batch_operations.batch_publish')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchPublish(false)}
            disabled={loading}
          >
            <EyeOff className="w-4 h-4 mr-1" />
            {t('batch_operations.batch_unpublish')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryDialog(true)}
            disabled={loading}
          >
            <FolderOpen className="w-4 h-4 mr-1" />
            {t('batch_operations.set_category')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTagDialog(true)}
            disabled={loading}
          >
            <Tag className="w-4 h-4 mr-1" />
            {t('batch_operations.set_tags')}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t('batch_operations.batch_delete')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange([])}
          >
            {t('batch_operations.cancel_selection')}
          </Button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              {t('batch_operations.confirm_delete')}
            </DialogTitle>
            <DialogDescription>
              {t('batch_operations.delete_confirm_message').replace('{count}', String(selectedIds.length))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={loading}
            >
              {loading ? t('batch_operations.deleting') : t('batch_operations.confirm_delete_btn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置分类对话框 */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('batch_operations.batch_set_category')}</DialogTitle>
            <DialogDescription>
              {t('batch_operations.set_category_desc').replace('{count}', String(selectedIds.length))}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedCategory} onValueChange={(value) => value && setSelectedCategory(value)}>
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
              {t('cancel')}
            </Button>
            <Button onClick={handleBatchSetCategory} disabled={loading || !selectedCategory}>
              {loading ? t('batch_operations.setting') : t('batch_operations.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置标签对话框 */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('batch_operations.batch_set_tags')}</DialogTitle>
            <DialogDescription>
              {t('batch_operations.set_tags_desc').replace('{count}', String(selectedIds.length))}
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
              {t('cancel')}
            </Button>
            <Button onClick={handleBatchSetTags} disabled={loading}>
              {loading ? t('batch_operations.setting') : t('batch_operations.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
