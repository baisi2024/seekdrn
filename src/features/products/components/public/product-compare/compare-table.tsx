'use client'

import { getTranslation } from '@/lib/utils'
import { X } from 'lucide-react'
import type { Product } from '@/features/products/types'

interface CompareTableProps {
  products: Product[]
  onRemove: (id: string) => void
}

export function CompareTable({ products, onRemove }: CompareTableProps) {
  if (products.length === 0) {
    return <div className="text-center text-gray-500 py-8">No products to compare</div>
  }

  // 收集所有规格名称
  const allSpecs = new Map<string, { label: string; unit?: string }>()
  products.forEach((product) => {
    product.spec_groups?.forEach((group) => {
      group.specs.forEach((spec) => {
        const key = spec.label.en || Object.values(spec.label)[0]
        if (!allSpecs.has(key)) {
          allSpecs.set(key, { label: key, unit: spec.unit })
        }
      })
    })
  })

  // 获取规格值
  const getSpecValue = (product: Product, specLabel: string): string | null => {
    for (const group of product.spec_groups || []) {
      for (const spec of group.specs) {
        const key = spec.label.en || Object.values(spec.label)[0]
        if (key === specLabel) {
          return spec.value
        }
      }
    }
    return null
  }

  // 检查是否有差异
  const hasDifference = (specLabel: string): boolean => {
    const values = products.map((p) => getSpecValue(p, specLabel))
    return new Set(values).size > 1
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 border bg-gray-50 text-left w-40">Specification</th>
            {products.map((product) => (
              <th key={product.id} className="p-4 border bg-gray-50 text-center min-w-[200px]">
                <div className="relative">
                  <button
                    onClick={() => onRemove(product.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="aspect-video rounded overflow-hidden mb-2">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <p className="font-semibold">{getTranslation(product.translations, 'en', 'name')}</p>
                  <p className="text-sm text-gray-500">{product.model}</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(allSpecs.entries()).map(([key, { label, unit }]) => {
            const highlight = hasDifference(key)
            return (
              <tr key={key}>
                <td className={`p-4 border font-medium ${highlight ? 'bg-yellow-50' : ''}`}>
                  {label}
                  {unit && <span className="text-gray-500 ml-1">({unit})</span>}
                </td>
                {products.map((product) => {
                  const value = getSpecValue(product, key)
                  return (
                    <td
                      key={product.id}
                      className={`p-4 border text-center ${highlight ? 'bg-yellow-50' : ''}`}
                    >
                      {value || '-'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
