import { getRelatedProducts } from '@/features/products/api/products'
import { ProductCard } from '@/components/public/product-card'
import { getTranslations } from 'next-intl/server'

interface RelatedProductsProps {
  productId: string
  locale: string
}

export async function RelatedProducts({ productId, locale }: RelatedProductsProps) {
  const products = await getRelatedProducts(productId, 4)
  const t = await getTranslations('products')

  if (products.length === 0) {
    return null
  }

  return (
    <section className="border-t border-border">
      <div className="container mx-auto px-4 py-10 lg:py-14">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t('relatedProducts')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                slug: product.slug,
                category_id: product.category_id,
                category: product.category,
                images: product.images,
                translations: product.translations,
              }}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
