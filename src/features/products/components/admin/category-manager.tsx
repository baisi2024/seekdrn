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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/features/products/api/categories'
import type { Category, CategoryTree } from '@/features/products/types'

const LOCALES = ['en', 'zh'] as const

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<{
    slug: string
    parent_id: string | null
    icon: string
    image: string
    sort_order: number
    translations: Record<string, { name: string; description?: string }>
  }>({
    slug: '',
    parent_id: null,
    icon: '',
    image: '',
    sort_order: 0,
    translations: {
      en: { name: '', description: '' },
      zh: { name: '', description: '' },
    },
  })

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const [flatList, tree] = await Promise.all([
        getCategories(),
        getCategoryTree(),
      ])
      setCategories(flatList)
      setCategoryTree(tree)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const openAddDialog = (parentId: string | null = null) => {
    setEditingCategory(null)
    setFormData({
      slug: '',
      parent_id: parentId,
      icon: '',
      image: '',
      sort_order: 0,
      translations: {
        en: { name: '', description: '' },
        zh: { name: '', description: '' },
      },
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      slug: category.slug,
      parent_id: category.parent_id,
      icon: category.icon || '',
      image: category.image || '',
      sort_order: category.sort_order,
      translations: category.translations,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await createCategory(formData)
      }
      await loadCategories()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await deleteCategory(categoryId)
      await loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const renderCategoryNode = (category: Category, depth = 0) => {
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id} className="mb-2">
        <div
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-3">
            {hasChildren && <Badge variant="outline">▼</Badge>}
            {!hasChildren && <span className="w-6" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {category.translations.en?.name || category.slug}
                </span>
                <Badge variant="secondary">{category.slug}</Badge>
              </div>
              {category.translations.zh?.name && (
                <span className="text-sm text-muted-foreground">
                  {category.translations.zh.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => openAddDialog(category.id)}>
              Add Child
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
              Delete
            </Button>
          </div>
        </div>
        {hasChildren && (
          <div className="mt-1">
            {category.children!.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return <div>Loading categories...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories</CardTitle>
            <Button onClick={() => openAddDialog()}>Add Root Category</Button>
          </div>
        </CardHeader>
        <CardContent>
          {categoryTree && categoryTree.nodes.length > 0 ? (
            <div>{categoryTree.nodes.map((node) => renderCategoryNode(node))}</div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No categories yet. Click &quot;Add Root Category&quot; to create one.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>
              <div>
                <Label>Parent Category</Label>
                <Select
                  value={formData.parent_id || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_id: value === 'none' ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Root)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.translations.en?.name || cat.slug}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="icon-name"
                />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {LOCALES.map((locale) => (
              <div key={locale} className="space-y-2">
                <Label className="font-medium">Name ({locale.toUpperCase()})</Label>
                <Input
                  value={formData.translations[locale]?.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        [locale]: {
                          ...formData.translations[locale],
                          name: e.target.value,
                        },
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
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
