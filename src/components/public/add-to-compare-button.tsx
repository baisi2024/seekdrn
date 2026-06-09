'use client'

import { useTranslations } from 'next-intl'
import { GitCompareArrows } from 'lucide-react'
import { useProductCompare, type CompareProductData } from '@/components/public/product-compare-provider'

interface AddToCompareButtonProps {
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
      label: Record<string, string>
      specs: Array<{ label: Record<string, string> | string; value: Record<string, string> | string; unit?: Record<string, string> | string }>
    }>
  }
}

export function AddToCompareButton({ product }: AddToCompareButtonProps) {
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
      onClick={handleToggle}
      disabled={!checked && maxReached}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
        checked
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : maxReached
            ? 'cursor-not-allowed border border-border text-muted-foreground opacity-50'
            : 'border border-border bg-background text-foreground hover:bg-muted'
      }`}
    >
      <GitCompareArrows className="h-4 w-4" />
      {checked ? t('compare.added_to_compare') : t('compare.add_to_compare')}
    </button>
  )
}
