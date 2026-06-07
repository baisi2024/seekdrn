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
import { ProductFAQSection } from '@/features/products/components/public/product-faq'
import { ProductSchema } from '@/components/seo/product-schema'
import { generateProductMetadata } from '@/lib/seo/product-metadata'
import { getProductWithEnhancements } from '@/lib/supabase/admin'
import { FileText, Calendar, MessageSquare } from 'lucide-react'

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

  // 获取标签
  const tags = product.tags || []

  // 准备文档数据
  const documents = product.documents || []

  // 准备FAQ数据
  const faqs = product.faqs || []

  // 准备关联数据
  const relations = product.relations || []
  const caseRelations = relations.filter((r: any) => r.relation_type === 'case_study')
  const solutionRelations = relations.filter((r: any) => r.relation_type === 'solution')
  const productRelations = relations.filter((r: any) => r.relation_type === 'related_product')

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
            {/* 标签展示 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <Badge variant="outline" className="font-mono">{product.model}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{name}</h1>
            <p className="text-lg text-gray-600">{overview}</p>
            
            {/* 三个CTA按钮 */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href={`/${locale}#demo-form`} 
                className={buttonVariants({ size: 'lg' })}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t('requestQuote')}
              </Link>
              
              {documents.length > 0 && (
                <Link 
                  href="#downloads-section"
                  className={buttonVariants({ size: 'lg', variant: 'outline' })}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {t('downloadMaterials')}
                </Link>
              )}
              
              <Link 
                href={`/${locale}#demo-form`}
                className={buttonVariants({ size: 'lg', variant: 'secondary' })}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t('scheduleDemo')}
              </Link>
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

        {/* Downloads - 更新数据源 */}
        {documents && documents.length > 0 && (
          <div id="downloads-section">
            <DownloadsSection downloads={documents} locale={locale} />
          </div>
        )}

        {/* FAQ */}
        {faqs && faqs.length > 0 && (
          <section className="mb-16">
            <ProductFAQSection faqs={faqs} locale={locale} />
          </section>
        )}

        {/* Related Cases - 信任背书 */}
        {product.related_cases && product.related_cases.length > 0 && (
          <RelatedCasesSection cases={product.related_cases} locale={locale} />
        )}

        {/* Related Products */}
        <RelatedProducts productId={product.id} locale={locale} />
      </div>
    </div>
    </>
  )
}
