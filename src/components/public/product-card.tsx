import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'

interface Product {
  id: string
  slug: string
  category: string
  image_url?: string
  translations?: Record<string, Record<string, string>>
  specs?: { label: string; value: string }[]
}

interface ProductCardProps {
  product: Product
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const title = getTranslation(product.translations || {}, locale, 'name')
  const description = getTranslation(product.translations || {}, locale, 'description')
  const categoryLabel = getTranslation(product.translations || {}, locale, 'category') || product.category

  const specs = product.specs || []

  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Image Area */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="text-xs">{categoryLabel}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-gray-900 text-lg leading-snug">
          {title || 'Untitled Product'}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description || 'No description available.'}
        </p>

        {/* Spec Rows */}
        {specs.length > 0 && (
          <div className="space-y-2 pt-1">
            {specs.slice(0, 3).map((spec) => (
              <div key={spec.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{spec.label}</span>
                <span className="font-mono text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Learn More Link */}
        <div className="pt-2">
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Learn More
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  )
}
