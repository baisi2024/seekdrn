'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { X, GitCompareArrows, Trash2, Box } from 'lucide-react'
import { useProductCompare } from '@/components/public/product-compare-provider'
import { ProductCompareModal } from '@/components/public/product-compare-modal'

export function ProductCompareBar() {
  const t = useTranslations('products')
  const { products, removeProduct, clearAll } = useProductCompare()
  const [modalOpen, setModalOpen] = useState(false)

  if (products.length === 0) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center gap-4 px-4 py-3">
          {/* Product thumbnails */}
          <div className="flex flex-1 items-center gap-3 overflow-x-auto">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-background">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.model || product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Box className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {product.model || product.name}
                </span>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="ml-1 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - products.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex shrink-0 items-center justify-center rounded-lg border border-dashed border-border px-6 py-2"
              >
                <span className="text-xs text-muted-foreground">+</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t('compare.clear_all')}
            </button>
            <button
              onClick={() => setModalOpen(true)}
              disabled={products.length < 2}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GitCompareArrows className="h-4 w-4" />
              {t('compare.start_compare')}
            </button>
          </div>
        </div>
      </div>

      <ProductCompareModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
