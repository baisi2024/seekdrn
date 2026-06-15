'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Box } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { CompareCheckbox } from '@/components/public/compare-checkbox'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'

interface CategorySummary {
  translations?: Record<string, Record<string, string>>
}

interface Product {
  id: string
  slug: string
  model?: string
  category_id: string | null
  category?: Category | CategorySummary | null
  tag_objects?: ProductTag[]
  images?: string[]
  translations?: Record<string, Record<string, string>>
  spec_groups?: Array<{
    id: string
    label: Record<string, string>
    specs: Array<{ label: Record<string, string> | string; value: Record<string, string> | string; unit?: Record<string, string> | string }>
  }>
}

interface ProductCardEnhancedProps {
  product: Product
  locale: string
  view?: 'grid' | 'list'
}

export function ProductCardEnhanced({ product, locale, view = 'grid' }: ProductCardEnhancedProps) {
  const t = useTranslations('products')
  const title = getTranslation(product.translations || {}, locale, 'name')
  const description = getTranslation(product.translations || {}, locale, 'overview')
  const categoryLabel = product.category?.translations
    ? getTranslation(product.category.translations, locale, 'name')
    : null
  const tags = product.tag_objects || []
  const displayTags = tags.slice(0, 3)
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null
  const maxSpecs = view === 'list' ? 4 : 3
  const specs = product.spec_groups?.flatMap((group) => group.specs).slice(0, maxSpecs) || []
  const positioning = description || categoryLabel || t('noDescription')

  if (view === 'list') {
    return (
      <article className="group flex flex-row overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1F2E] transition-all duration-300 hover:border-[#0066FF]/40">
        <div className="relative w-72 shrink-0 overflow-hidden bg-[#0A0E17]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title || product.model || t('untitledProduct')}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#0A0E17]">
              <Box className="h-14 w-14 text-white/20" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.model && <Badge className="font-mono text-xs bg-[#0066FF]">{product.model}</Badge>}
            {categoryLabel && <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">{categoryLabel}</Badge>}
          </div>
          <div className="absolute right-3 top-3">
            <CompareCheckbox
              product={{
                id: product.id,
                model: product.model,
                slug: product.slug,
                name: title || product.model || '',
                category: categoryLabel || undefined,
                image: imageUrl || undefined,
                tags: displayTags.map((tag) => getTranslation(tag.translations, locale, 'name')).filter(Boolean),
                spec_groups: product.spec_groups,
              }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div>
            {product.model && <div className="text-xs font-semibold text-white/50">{product.model}</div>}
            <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
              {title || product.model || t('untitledProduct')}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
              {positioning}
            </p>
          </div>

          {specs.length > 0 && (
            <dl className="mt-5 grid grid-cols-4 gap-2">
              {specs.map((spec) => {
                if (!spec?.label) return null
                const label = getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)
                const value = getLocalizedValue(spec.value, locale)
                const unit = getLocalizedValue(spec.unit, locale)
                return (
                  <div key={`${label}-${value}`} className="rounded-xl border border-white/[0.06] bg-[#0A0E17] p-3">
                    <dt className="truncate text-xs text-white/50">{label}</dt>
                    <dd className="mt-1 truncate font-mono text-sm font-semibold text-white">
                      {value}{unit}
                    </dd>
                  </div>
                )
              })}
            </dl>
          )}

          {displayTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {displayTags.map((tag) => {
                const tagName = getTranslation(tag.translations, locale, 'name')
                return tagName ? (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs border-white/[0.06] text-white/50"
                    style={tag.color ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' } : undefined}
                  >
                    {tagName}
                  </Badge>
                ) : null
              })}
            </div>
          )}

          <div className="mt-auto pt-5">
            <Link
              href={`/${locale}/products/${product.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] transition-colors hover:text-[#0052CC]"
            >
              {t('detailsCta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1F2E] transition-all duration-300 hover:-translate-y-1 hover:border-[#0066FF]/40">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0A0E17]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || product.model || t('untitledProduct')}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0A0E17]">
            <Box className="h-14 w-14 text-white/20" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.model && <Badge className="font-mono text-xs bg-[#0066FF]">{product.model}</Badge>}
          {categoryLabel && <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">{categoryLabel}</Badge>}
        </div>
        <div className="absolute right-3 top-3">
          <CompareCheckbox
            product={{
              id: product.id,
              model: product.model,
              slug: product.slug,
              name: title || product.model || '',
              category: categoryLabel || undefined,
              image: imageUrl || undefined,
              tags: displayTags.map((tag) => getTranslation(tag.translations, locale, 'name')).filter(Boolean),
              spec_groups: product.spec_groups,
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div>
          {product.model && <div className="text-xs font-semibold text-white/50">{product.model}</div>}
          <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
            {title || product.model || t('untitledProduct')}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
            {positioning}
          </p>
        </div>

        {specs.length > 0 && (
          <dl className="mt-5 grid grid-cols-3 gap-2">
            {specs.map((spec) => {
              if (!spec?.label) return null
              const label = getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)
              const value = getLocalizedValue(spec.value, locale)
              const unit = getLocalizedValue(spec.unit, locale)
              return (
                <div key={`${label}-${value}`} className="rounded-xl border border-white/[0.06] bg-[#0A0E17] p-3">
                  <dt className="truncate text-xs text-white/50">{label}</dt>
                  <dd className="mt-1 truncate font-mono text-sm font-semibold text-white">
                    {value}{unit}
                  </dd>
                </div>
              )
            })}
          </dl>
        )}

        {displayTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {displayTags.map((tag) => {
              const tagName = getTranslation(tag.translations, locale, 'name')
              return tagName ? (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="text-xs border-white/[0.06] text-white/50"
                  style={tag.color ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' } : undefined}
                >
                  {tagName}
                </Badge>
              ) : null
            })}
          </div>
        )}

        <div className="mt-auto pt-5">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] transition-colors hover:text-[#0052CC]"
          >
            {t('detailsCta')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
