'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Box, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useProductCompare } from '@/components/public/product-compare-provider'
import { getTranslation } from '@/lib/utils'

interface ProductCompareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductCompareModal({ open, onOpenChange }: ProductCompareModalProps) {
  const t = useTranslations('products')
  const locale = useLocale()
  const { products } = useProductCompare()

  // Collect all unique spec labels across all products
  const allSpecLabels: Array<{ key: string; label: string }> = []
  const specKeySet = new Set<string>()

  for (const product of products) {
    if (!product.spec_groups) continue
    for (const group of product.spec_groups) {
      for (const spec of group.specs) {
        const key = Object.values(spec.label).join('|')
        if (!specKeySet.has(key)) {
          specKeySet.add(key)
          const label = getTranslation(spec.label, locale, 'label') || Object.values(spec.label)[0]
          allSpecLabels.push({ key, label })
        }
      }
    }
  }

  // Build spec value map for each product
  const getSpecValue = (product: typeof products[0], specKey: string): string | null => {
    if (!product.spec_groups) return null
    for (const group of product.spec_groups) {
      for (const spec of group.specs) {
        const key = Object.values(spec.label).join('|')
        if (key === specKey) {
          return `${spec.value}${spec.unit || ''}`
        }
      }
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('compare.title')}</DialogTitle>
          <DialogDescription>{t('compare.specification')}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-popover p-3 text-left text-muted-foreground min-w-[120px]">
                  {/* Row label column */}
                </th>
                {products.map((product) => (
                  <th key={product.id} className="p-3 text-center min-w-[200px]">
                    {/* Product image */}
                    <div className="mx-auto mb-3 relative h-32 w-full overflow-hidden rounded-xl bg-muted">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.model || product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Box className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Model row */}
              <tr className="border-t border-border">
                <td className="sticky left-0 z-10 bg-popover p-3 font-medium text-foreground">
                  {t('compare.specification')}
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <Badge variant="outline" className="font-mono">
                      {product.model || '-'}
                    </Badge>
                  </td>
                ))}
              </tr>

              {/* Name row */}
              <tr className="border-t border-border">
                <td className="sticky left-0 z-10 bg-popover p-3 font-medium text-foreground">
                  Name
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center font-medium text-foreground">
                    {product.name}
                  </td>
                ))}
              </tr>

              {/* Category row */}
              <tr className="border-t border-border">
                <td className="sticky left-0 z-10 bg-popover p-3 font-medium text-foreground">
                  Category
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.category ? (
                      <Badge variant="secondary">{product.category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Tags row */}
              <tr className="border-t border-border">
                <td className="sticky left-0 z-10 bg-popover p-3 font-medium text-foreground">
                  {t('tags')}
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    {product.tags && product.tags.length > 0 ? (
                      <div className="flex flex-wrap justify-center gap-1">
                        {product.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Spec rows */}
              {allSpecLabels.map(({ key, label }) => (
                <tr key={key} className="border-t border-border">
                  <td className="sticky left-0 z-10 bg-popover p-3 font-medium text-foreground">
                    {label}
                  </td>
                  {products.map((product) => {
                    const value = getSpecValue(product, key)
                    return (
                      <td key={product.id} className="p-3 text-center font-mono">
                        {value || <span className="text-muted-foreground">-</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* CTA row */}
              <tr className="border-t border-border">
                <td className="sticky left-0 z-10 bg-popover p-3 font-medium text-foreground">
                  &nbsp;
                </td>
                {products.map((product) => (
                  <td key={product.id} className="p-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Link
                        href={`/${locale}/products/${product.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        {t('compare.view_details')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
