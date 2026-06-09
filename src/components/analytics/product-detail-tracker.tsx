'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'

interface ProductDetailTrackerProps {
  productModel: string
  productName: string
  category?: string | null
  locale: string
}

export function ProductDetailTracker({
  productModel,
  productName,
  category,
  locale,
}: ProductDetailTrackerProps) {
  const { trackPageView } = useAnalytics(locale)

  useEffect(() => {
    trackPageView('product', {
      product_model: productModel,
      product_name: productName,
      category: category || undefined,
    })
  }, [productModel, productName, category, trackPageView])

  return null
}
