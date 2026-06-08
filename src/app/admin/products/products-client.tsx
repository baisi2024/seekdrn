'use client'

import { useState, useMemo } from 'react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { AdminPage } from '@/components/admin/core'
import { ProductFilters as ProductFiltersComponent, ProductFilters } from '@/components/admin/product-filters'
import { BatchOperations } from '@/components/admin/batch-operations'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
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

interface Product {
  id: string
  model: string
  category_id: string
  published: boolean
  compliance_flag: string
  featured: boolean
  category?: Category
  tag_objects?: Tag[]
}

interface ProductsClientProps {
  products: Product[]
  categories: Category[]
  tags: Tag[]
}

export function ProductsClient({ products, categories, tags }: ProductsClientProps) {
  const t = useAdminTranslations()
  const supabase = createClient()
  const [filters, setFilters] = useState<ProductFilters>({
    category: '',
    tag: '',
    status: '',
    search: '',
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // 根据筛选条件过滤产品
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 分类筛选
      if (filters.category && product.category_id !== filters.category) {
        return false
      }

      // 标签筛选
      if (filters.tag) {
        const hasTag = product.tag_objects?.some((tag) => tag.id === filters.tag)
        if (!hasTag) return false
      }

      // 状态筛选
      if (filters.status) {
        if (filters.status === 'published' && !product.published) return false
        if (filters.status === 'draft' && product.published) return false
        if (filters.status === 'featured' && !product.featured) return false
      }

      // 关键词搜索
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (!product.model.toLowerCase().includes(searchLower)) {
          return false
        }
      }

      return true
    })
  }, [products, filters])

  // 分页
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const pagedProducts = filteredProducts.slice(page * pageSize, (page + 1) * pageSize)

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.length === pagedProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(pagedProducts.map((p) => p.id))
    }
  }

  // 单个选择
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // 批量发布
  const handleBatchPublish = async (ids: string[], published: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ published })
      .in('id', ids)

    if (error) throw error
    window.location.reload()
  }

  // 批量删除
  const handleBatchDelete = async (ids: string[]) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)

    if (error) throw error
    window.location.reload()
  }

  // 批量设置分类
  const handleBatchSetCategory = async (ids: string[], categoryId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ category_id: categoryId })
      .in('id', ids)

    if (error) throw error
    window.location.reload()
  }

  // 批量设置标签
  const handleBatchSetTags = async (ids: string[], tagIds: string[]) => {
    // 先删除旧的标签关联
    const { error: deleteError } = await supabase
      .from('product_tag_relations')
      .delete()
      .in('product_id', ids)

    if (deleteError) throw deleteError

    // 创建新的标签关联
    const relations = ids.flatMap((productId) =>
      tagIds.map((tagId) => ({
        product_id: productId,
        tag_id: tagId,
      }))
    )

    if (relations.length > 0) {
      const { error: insertError } = await supabase
        .from('product_tag_relations')
        .insert(relations)

      if (insertError) throw insertError
    }

    window.location.reload()
  }

  // 单个删除
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Delete failed')
      }
      toast.success(t('products_page.deleteSuccess'))
      setDeleteConfirmId(null)
      window.location.reload()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(t('products_page.deleteFailed'))
    }
  }

  const columns = [
    { key: 'model', label: t('model') },
    {
      key: 'category',
      label: t('category'),
      render: (item: Product) => {
        const name = item.category?.translations?.zh?.name || item.category?.translations?.en?.name || item.category?.slug || '-'
        return name
      }
    },
    {
      key: 'tags',
      label: t('tags'),
      render: (item: Product) => (
        <div className="flex flex-wrap gap-1">
          {item.tag_objects?.slice(0, 3).map((tag) => {
            const name = tag.translations?.zh?.name || tag.translations?.en?.name || tag.slug
            return (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {name}
              </Badge>
            )
          })}
          {item.tag_objects && item.tag_objects.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{item.tag_objects.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'published',
      label: t('status'),
      render: (item: Product) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? t('published') : t('draft')}
        </Badge>
      )
    },
    {
      key: 'compliance_flag',
      label: t('compliance'),
      render: (item: Product) => item.compliance_flag ? <Badge variant="destructive">{t('complianceRequired')}</Badge> : 'No'
    },
    { key: 'featured', label: t('featured'), render: (item: Product) => item.featured ? '⭐' : '' },
    {
      key: 'actions',
      label: t('actions'),
      render: (item: Product) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setDeleteConfirmId(item.id)
          }}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      )
    },
  ]

  return (
    <AdminPage
      title="products_page.title"
      actions={
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('products_page.add')}
        </Link>
      }
    >
      <div className="space-y-4">
        {/* 筛选器 */}
        <ProductFiltersComponent
          filters={filters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters)
            setPage(0)
          }}
          categories={categories}
          tags={tags}
        />

        {/* 批量操作 */}
        <BatchOperations
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          categories={categories}
          tags={tags}
          onBatchPublish={handleBatchPublish}
          onBatchDelete={handleBatchDelete}
          onBatchSetCategory={handleBatchSetCategory}
          onBatchSetTags={handleBatchSetTags}
        />

        {/* 表格 */}
        <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3.5 text-left w-12">
                  <Checkbox
                    checked={selectedIds.length === pagedProducts.length && pagedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                {columns.map((col) => (
                  <th key={String(col.key)} className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {pagedProducts.map((item, index) => (
                <tr
                  key={item.id}
                  className={`cursor-pointer hover:bg-muted/30 transition-colors duration-150 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                  onClick={() => window.location.href = `/admin/products/${item.id}`}
                >
                  <td className="px-4 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => handleSelect(item.id)}
                    />
                  </td>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm">
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof Product] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* 空状态 */}
          {pagedProducts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm font-medium text-foreground mb-1">{t('noResults')}</p>
              <p className="text-xs text-muted-foreground">{t('tryAdjusting')}</p>
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              {t('showing')} <span className="font-medium text-foreground">{page * pageSize + 1}</span> {t('to')}{' '}
              <span className="font-medium text-foreground">{Math.min((page + 1) * pageSize, filteredProducts.length)}</span> {t('of')}{' '}
              <span className="font-medium text-foreground">{filteredProducts.length}</span> {t('results')}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className="transition-all duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                className="transition-all duration-150"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('products_page.deleteConfirm')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('products_page.deleteConfirmMessage')}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteProduct(deleteConfirmId)}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  )
}
