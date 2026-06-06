'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getTags, createTag, updateTag, deleteTag } from '@/features/products/api/tags'
import type { ProductTag, TagFormData } from '@/features/products/types'

const LOCALES = ['en', 'zh'] as const
const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#1f2937',
]

export function TagManager() {
  const [tags, setTags] = useState<ProductTag[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<ProductTag | null>(null)
  const [formData, setFormData] = useState<{
    slug: string
    color: string
    translations: Record<string, { name: string }>
  }>({
    slug: '',
    color: PRESET_COLORS[0],
    translations: {
      en: { name: '' },
      zh: { name: '' },
    },
  })

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    try {
      const data = await getTags(true)
      setTags(data)
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddDialog = () => {
    setEditingTag(null)
    setFormData({
      slug: '',
      color: PRESET_COLORS[0],
      translations: {
        en: { name: '' },
        zh: { name: '' },
      },
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (tag: ProductTag) => {
    setEditingTag(tag)
    setFormData({
      slug: tag.slug,
      color: tag.color,
      translations: tag.translations,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      const tagData: TagFormData = {
        slug: formData.slug,
        color: formData.color,
        translations: formData.translations,
      }

      if (editingTag) {
        await updateTag(editingTag.id, tagData)
      } else {
        await createTag(tagData)
      }
      await loadTags()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save tag:', error)
      alert('Failed to save tag')
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This will remove it from all products.')) return

    try {
      await deleteTag(tagId)
      await loadTags()
    } catch (error) {
      console.error('Failed to delete tag:', error)
      alert('Failed to delete tag')
    }
  }

  if (loading) {
    return <div>Loading tags...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tags</CardTitle>
            <Button onClick={openAddDialog}>Add Tag</Button>
          </div>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tags yet. Click &quot;Add Tag&quot; to create one.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {tag.translations.en?.name || tag.slug}
                        </span>
                        {tag.product_count !== undefined && (
                          <Badge variant="secondary">{tag.product_count}</Badge>
                        )}
                      </div>
                      {tag.translations.zh?.name && (
                        <span className="text-sm text-muted-foreground">
                          {tag.translations.zh.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(tag)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tag.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? 'Edit Tag' : 'Add Tag'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-friendly-slug"
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? 'border-foreground scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            {LOCALES.map((locale) => (
              <div key={locale}>
                <Label>Name ({locale.toUpperCase()})</Label>
                <Input
                  value={formData.translations[locale]?.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        [locale]: { name: e.target.value },
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTag ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
