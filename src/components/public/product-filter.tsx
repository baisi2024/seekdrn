'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Tabs, TabsList } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'
import { DynamicIcon } from '@/components/public/dynamic-icon'
import { useAnalytics } from '@/hooks/use-analytics'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'

interface ProductFilterProps {
  categories: Category[]
  tags: ProductTag[]
  activeCategory: string
  activeTags: string[]
  locale: string
}

export function ProductFilter({
  categories,
  tags,
  activeCategory,
  activeTags,
  locale,
}: ProductFilterProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { trackFilter } = useAnalytics(locale)
  const t = useTranslations('products')

  const buildUrl = (cat?: string, tagSlug?: string, removeTag?: boolean) => {
    const params = new URLSearchParams(searchParams.toString())

    if (cat !== undefined) {
      if (cat === 'all') {
        params.delete('cat')
      } else {
        params.set('cat', cat)
      }
    }

    if (tagSlug) {
      const currentTags = params.get('tags')?.split(',').filter(Boolean) || []
      let newTags: string[]

      if (removeTag) {
        newTags = currentTags.filter((t) => t !== tagSlug)
      } else {
        if (!currentTags.includes(tagSlug)) {
          newTags = [...currentTags, tagSlug]
        } else {
          newTags = currentTags
        }
      }

      if (newTags.length === 0) {
        params.delete('tags')
      } else {
        params.set('tags', newTags.join(','))
      }
    }

    const queryString = params.toString()
    return queryString ? `${pathname}?${queryString}` : pathname
  }

  const handleCategoryClick = (categorySlug: string) => {
    trackFilter('category', categorySlug)
  }

  const handleTagClick = (tagSlug: string, isActive: boolean) => {
    trackFilter('tag', tagSlug, { action: isActive ? 'remove' : 'add' })
  }

  const handleClearFilters = () => {
    trackFilter('clear', 'all')
  }

  return (
    <div className="space-y-6 mb-8">
      {/* 分类导航 */}
      <Tabs value={activeCategory}>
        <TabsList className="bg-[#1A1F2E] border border-white/[0.06]">
          <Link
            href={buildUrl('all')}
            replace
            onClick={() => handleCategoryClick('all')}
            className="relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-white/50 transition-all hover:text-white data-[active]:bg-[#0A0E17] data-[active]:text-white"
            data-active={activeCategory === 'all' ? '' : undefined}
          >
            {t('filter.all')}
          </Link>
          {categories.map((category) => {
            const name = getTranslation(category.translations, locale, 'name')
            return (
              <Link
                key={category.id}
                href={buildUrl(category.slug)}
                replace
                onClick={() => handleCategoryClick(category.slug)}
                className="relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-white/50 transition-all hover:text-white data-[active]:bg-[#0A0E17] data-[active]:text-white"
                data-active={activeCategory === category.slug ? '' : undefined}
              >
                {category.icon && <DynamicIcon name={category.icon} className="w-4 h-4" />}
                {name}
              </Link>
            )
          })}
        </TabsList>
      </Tabs>

      {/* 标签筛选 */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-white/50">
            {t('filter.tagLabel')}
          </span>
          {tags.map((tag) => {
            const name = getTranslation(tag.translations, locale, 'name')
            const isActive = activeTags.includes(tag.slug)
            return (
              <Link
                key={tag.id}
                href={buildUrl(undefined, tag.slug, isActive)}
                replace
                onClick={() => handleTagClick(tag.slug, isActive)}
              >
                <Badge
                  variant={isActive ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${isActive ? 'bg-[#0066FF]' : 'border-white/[0.06] text-white/50 hover:text-white hover:border-white/20'}`}
                >
                  {name}
                </Badge>
              </Link>
            )
          })}
          {activeTags.length > 0 && (
            <Link
              href={buildUrl(undefined, undefined, true)}
              replace
              onClick={handleClearFilters}
              className="text-sm text-[#0066FF] hover:text-[#0052CC] transition-colors"
            >
              {t('filter.clear')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
