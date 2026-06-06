import type { Product } from '@/features/products/types'

interface ProductSchemaProps {
  product: Product
  locale: string
}

export function ProductSchema({ product, locale }: ProductSchemaProps) {
  const translation = product.translations?.[locale] || {}
  const siteName = 'SEEKDRN'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrn.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: translation.name || product.model,
    description: translation.overview || '',
    image: product.images?.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`) || [],
    sku: product.model,
    category: product.category?.translations?.[locale]?.name || undefined,
    manufacturer: {
      '@type': 'Organization',
      name: siteName,
    },
    ...(product.specs_standardized?.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: product.specs_standardized.weight.value,
        unitCode: getUnitCode(product.specs_standardized.weight.unit),
      },
    }),
    additionalProperty: Object.entries(product.specs_standardized || {})
      .filter(([key]) => key !== 'weight')
      .map(([key, spec]) => ({
        '@type': 'PropertyValue',
        name: formatSpecName(key),
        value: `${spec.value} ${spec.unit}`,
      })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function getUnitCode(unit: string): string {
  const unitMap: Record<string, string> = {
    kg: 'KGM', g: 'GRM', lb: 'LBR',
    km: 'KMT', m: 'MTR', cm: 'CMT', mm: 'MMT',
    min: 'MIN', h: 'HUR', s: 'SEC',
    'km/h': 'KMH', 'm/s': 'MTS',
  }
  return unitMap[unit] || unit
}

function formatSpecName(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()
}
