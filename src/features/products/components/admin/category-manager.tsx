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
import type { Category, CategoryTree } from '@/features/products/types'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { LOCALES } from '@/lib/constants/locales'

// API functions
async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/admin/categories')
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

async function fetchCategoryTree(): Promise<CategoryTree> {
  const categories = await fetchCategories()

  const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }))
  }

  return {
    nodes: buildTree(categories),
    flatList: categories
  }
}

async function createCategoryAPI(category: Partial<Category>): Promise<Category> {
  const response = await fetch('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  })
  if (!response.ok) throw new Error('Failed to create category')
  return response.json()
}

async function updateCategoryAPI(id: string, category: Partial<Category>): Promise<Category> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category)
  })
  if (!response.ok) throw new Error('Failed to update category')
  return response.json()
}

async function deleteCategoryAPI(id: string): Promise<void> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete category')
}

export function CategoryManager() {
  const t = useAdminTranslations()
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
        fetchCategories(),
        fetchCategoryTree(),
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
        await updateCategoryAPI(editingCategory.id, formData)
      } else {
        await createCategoryAPI(formData)
      }
      await loadCategories()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to save category:', error)
      alert(t('category_manager.save_failed'))
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm(t('category_manager.delete_confirm'))) return

    try {
      await deleteCategoryAPI(categoryId)
      await loadCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert(t('category_manager.delete_failed'))
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
              {t('category_manager.add_child')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
              {t('edit')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
              {t('delete')}
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
    return <div>{t('category_manager.loading')}</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('category_manager.title')}</CardTitle>
            <Button onClick={() => openAddDialog()}>{t('category_manager.add_root')}</Button>
          </div>
        </CardHeader>
        <CardContent>
          {categoryTree && categoryTree.nodes.length > 0 ? (
            <div>{categoryTree.nodes.map((node) => renderCategoryNode(node))}</div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('category_manager.empty')}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? t('category_manager.edit_title') : t('category_manager.add_title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('category_manager.slug_label')}</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder={t('category_manager.slug_placeholder')}
                />
              </div>
              <div>
                <Label>{t('category_manager.parent_label')}</Label>
                <Select
                  value={formData.parent_id || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parent_id: value === 'none' ? null : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('category_manager.parent_none')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('category_manager.parent_none')}</SelectItem>
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
                <Label>{t('category_manager.icon_label')}</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder={t('category_manager.icon_placeholder')}
                />
              </div>
              <div>
                <Label>{t('category_manager.sort_label')}</Label>
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
              <Label>{t('category_manager.image_label')}</Label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder={t('category_manager.image_placeholder')}
              />
            </div>

            {LOCALES.map((locale) => (
              <div key={locale.code} className="space-y-2">
                <Label className="font-medium">{t('category_manager.name_label')} ({locale.label})</Label>
                <Input
                  value={formData.translations[locale.code]?.name || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        [locale.code]: {
                          ...formData.translations[locale.code],
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
              {t('cancel')}
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? t('create') : t('create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
