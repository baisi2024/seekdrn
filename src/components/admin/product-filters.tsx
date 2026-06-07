'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Search } from 'lucide-react'

export interface ProductFilters {
  category: string
  tag: string
  status: string
  search: string
}

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

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  categories: Category[]
  tags: Tag[]
}

export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
  tags,
}: ProductFiltersProps) {
  const t = useAdminTranslations()

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      tag: '',
      status: '',
      search: '',
    })
  }

  const hasActiveFilters = filters.category || filters.tag || filters.status || filters.search

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 关键词搜索 */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('products_page.searchPlaceholder')}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-9 bg-background border-2 focus:border-primary transition-colors"
        />
      </div>

      {/* 分类筛选 */}
      <Select
        value={filters.category}
        onValueChange={(value) => handleFilterChange('category', value ?? '')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t('select_category')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部分类</SelectItem>
          {categories.map((category) => {
            const name = category.translations?.zh?.name || category.translations?.en?.name || category.slug
            return (
              <SelectItem key={category.id} value={category.id}>
                {name}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* 标签筛选 */}
      <Select
        value={filters.tag}
        onValueChange={(value) => handleFilterChange('tag', value ?? '')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择标签" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部标签</SelectItem>
          {tags.map((tag) => {
            const name = tag.translations?.zh?.name || tag.translations?.en?.name || tag.slug
            return (
              <SelectItem key={tag.id} value={tag.id}>
                {name}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* 状态筛选 */}
      <Select
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value ?? '')}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder={t('status')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">全部状态</SelectItem>
          <SelectItem value="published">{t('published')}</SelectItem>
          <SelectItem value="draft">{t('draft')}</SelectItem>
          <SelectItem value="featured">推荐</SelectItem>
        </SelectContent>
      </Select>

      {/* 清除筛选 */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-3"
        >
          <X className="w-4 h-4 mr-1" />
          清除筛选
        </Button>
      )}
    </div>
  )
}
