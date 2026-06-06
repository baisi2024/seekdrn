import { getRelatedProducts } from '@/features/products/api/products'
import { ProductCard } from '@/components/public/product-card'

interface RelatedProductsProps {
  productId: string
  locale: string
}

export async function RelatedProducts({ productId, locale }: RelatedProductsProps) {
  const products = await getRelatedProducts(productId, 4)

  if (products.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              slug: product.slug,
              category: product.category?.slug || '',
              image_url: product.images?.[0],
              translations: product.translations,
            }}
            locale={locale}
          />
        ))}
      </div>
    </section>
  )
}
