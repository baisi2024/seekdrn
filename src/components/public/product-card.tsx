import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'

interface Product {
  id: string
  slug: string
  category_id: string | null
  category?: Category
  tag_objects?: ProductTag[]
  images?: string[]
  translations?: Record<string, Record<string, string>>
  spec_groups?: Array<{
    id: string
    name: Record<string, string>
    specs: Array<{ label: Record<string, string>; value: string; unit?: string }>
  }>
}

interface ProductCardProps {
  product: Product
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('products')
  const title = getTranslation(product.translations || {}, locale, 'name')
  const description = getTranslation(product.translations || {}, locale, 'description')

  // 获取分类名称
  const categoryLabel = product.category
    ? getTranslation(product.category.translations, locale, 'name')
    : null

  // 获取标签（最多显示3个）
  const tags = product.tag_objects || []
  const displayTags = tags.slice(0, 3)
  const remainingTagsCount = tags.length - 3

  // 获取图片
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null

  // 获取规格（从第一个规格组中取前3个）
  const specs = product.spec_groups && product.spec_groups.length > 0
    ? product.spec_groups[0].specs.slice(0, 3)
    : []

  return (
    <div className="group rounded-xl border border-border bg-background overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image Area */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <svg className="w-16 h-16 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {categoryLabel && (
            <Badge variant="secondary" className="text-xs">{categoryLabel}</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-lg leading-snug">
          {title || t('untitledProduct')}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || t('noDescription')}
        </p>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag) => {
              const tagName = getTranslation(tag.translations, locale, 'name')
              return (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tagName}
                </Badge>
              )
            })}
            {remainingTagsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remainingTagsCount}
              </Badge>
            )}
          </div>
        )}

        {/* Spec Rows */}
        {specs.length > 0 && (
          <div className="space-y-2 pt-1">
            {specs.map((spec) => {
              const label = getTranslation(spec.label, locale, 'label') || Object.values(spec.label)[0]
              return (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono text-foreground">
                    {spec.value}{spec.unit || ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Learn More Link */}
        <div className="pt-2">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t('learnMore')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
