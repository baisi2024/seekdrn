import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslation } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DatasheetDownloadButton } from '@/components/public/datasheet-download-button'
import { SpecsSection } from '@/components/public/specs-section'
import { DownloadsSection } from '@/components/public/downloads-section'
import { RelatedCasesSection } from '@/components/public/related-cases-section'
import { ProductGallery } from '@/features/products/components/public/product-gallery'
import { RelatedProducts } from '@/features/products/components/public/related-products'
import { ProductSchema } from '@/components/seo/product-schema'
import { generateProductMetadata } from '@/lib/seo/product-metadata'
import { getProductWithEnhancements } from '@/lib/supabase/admin'

export async function generateMetadata({ params }: { params: Promise<{ model: string; locale: string }> }): Promise<Metadata> {
  const { model, locale } = await params
  const product = await getProductWithEnhancements(model, locale)
  
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }
  
  return generateProductMetadata({ product, locale })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ model: string; locale: string }>
}) {
  const { model, locale } = await params
  const t = await getTranslations('products')

  const product = await getProductWithEnhancements(model, locale)

  if (!product) notFound()

  const name = getTranslation(product.translations, locale, 'name')
  const overview = getTranslation(product.translations, locale, 'overview')
  const advantages = getTranslation(product.translations, locale, 'advantages')
  const capabilities = getTranslation(product.translations, locale, 'capabilities')
  const applications = getTranslation(product.translations, locale, 'applications')

  return (
    <>
      <ProductSchema product={product} locale={locale} />
      <div className="py-16">
        <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <ProductGallery
            images={product.images || []}
            videos={product.videos || []}
          />
          <div className="space-y-6">
            <Badge variant="outline" className="font-mono">{product.model}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{name}</h1>
            <p className="text-lg text-gray-600">{overview}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}#demo-form`} className={buttonVariants({ size: 'lg' })}>
                {t('requestDemo')}
              </Link>
              {product.datasheet_url && (
                <DatasheetDownloadButton productModel={product.model} datasheetUrl={product.datasheet_url} />
              )}
            </div>
          </div>
        </div>

        {/* Specs - 使用新组件 */}
        {product.spec_groups && product.spec_groups.length > 0 && !product.compliance_flag && (
          <SpecsSection groups={product.spec_groups} locale={locale} />
        )}

        {/* Compliance notice for C-UAS products */}
        {product.compliance_flag && (
          <section className="mb-16">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <p className="text-yellow-800">
                  {t('complianceNotice')}
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Downloads - 新增 */}
        {product.product_downloads && product.product_downloads.length > 0 && (
          <DownloadsSection downloads={product.product_downloads} locale={locale} />
        )}

        {/* Related Cases - 新增 */}
        {product.related_cases && product.related_cases.length > 0 && (
          <RelatedCasesSection cases={product.related_cases} locale={locale} />
        )}

        {/* Advantages */}
        {advantages && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('advantages')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: advantages }} />
          </section>
        )}

        {/* Capabilities */}
        {capabilities && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('capabilities')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: capabilities }} />
          </section>
        )}

        {/* Applications */}
        {applications && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('applications')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: applications }} />
          </section>
        )}

        {/* Related Products */}
        <RelatedProducts productId={product.id} locale={locale} />
      </div>
    </div>
    </>
  )
}
