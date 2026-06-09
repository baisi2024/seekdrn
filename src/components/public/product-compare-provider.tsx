'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface CompareProductData {
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

interface ProductCompareContextType {
  products: CompareProductData[]
  addProduct: (productId: string, productData: CompareProductData) => boolean
  removeProduct: (productId: string) => void
  clearAll: () => void
  isInCompare: (productId: string) => boolean
}

const ProductCompareContext = createContext<ProductCompareContextType | null>(null)

const MAX_COMPARE = 3

export function ProductCompareProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CompareProductData[]>([])

  const addProduct = useCallback((productId: string, productData: CompareProductData): boolean => {
    let added = false
    setProducts((prev) => {
      if (prev.some((p) => p.id === productId)) return prev
      if (prev.length >= MAX_COMPARE) return prev
      added = true
      return [...prev, productData]
    })
    return added
  }, [])

  const removeProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }, [])

  const clearAll = useCallback(() => {
    setProducts([])
  }, [])

  const isInCompare = useCallback(
    (productId: string) => products.some((p) => p.id === productId),
    [products]
  )

  return (
    <ProductCompareContext.Provider
      value={{ products, addProduct, removeProduct, clearAll, isInCompare }}
    >
      {children}
    </ProductCompareContext.Provider>
  )
}

export function useProductCompare() {
  const context = useContext(ProductCompareContext)
  if (!context) {
    throw new Error('useProductCompare must be used within a ProductCompareProvider')
  }
  return context
}
