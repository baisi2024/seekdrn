'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { useProductCompare, type CompareProductData } from '@/components/public/product-compare-provider'

interface CompareCheckboxProps {
  product: {
    id: string
    model?: string
    slug: string
    name: string
    category?: string
    image?: string
    tags?: string[]
    spec_groups?: Array<{
      id: string
      name: Record<string, string>
      specs: Array<{ label: Record<string, string>; value: string; unit?: string }>
    }>
  }
}

export function CompareCheckbox({ product }: CompareCheckboxProps) {
  const t = useTranslations('products')
  const { addProduct, removeProduct, isInCompare, products } = useProductCompare()

  const checked = isInCompare(product.id)
  const maxReached = products.length >= 3

  const handleToggle = () => {
    if (checked) {
      removeProduct(product.id)
    } else {
      const compareData: CompareProductData = {
        id: product.id,
        model: product.model,
        slug: product.slug,
        name: product.name,
        category: product.category,
        image: product.image,
        tags: product.tags,
        spec_groups: product.spec_groups,
      }
      addProduct(product.id, compareData)
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleToggle()
      }}
      title={checked ? t('compare.added_to_compare') : maxReached ? t('compare.max_reached') : t('compare.add_to_compare')}
      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        checked
          ? 'bg-primary text-primary-foreground'
          : maxReached
            ? 'cursor-not-allowed text-muted-foreground opacity-50'
            : 'bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground backdrop-blur-sm border border-border'
      }`}
      disabled={!checked && maxReached}
    >
      <Check className={`h-3 w-3 ${checked ? 'opacity-100' : 'opacity-0'}`} />
      {checked ? t('compare.added_to_compare') : t('compare.add_to_compare')}
    </button>
  )
}
