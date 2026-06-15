import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getTranslation } from '@/lib/utils'
import { ProductFAQSection } from '@/features/products/components/public/product-faq'
import { ProductSchema } from '@/components/seo/product-schema'
import { generateProductMetadata } from '@/lib/seo/product-metadata'
import { getProductWithEnhancements } from '@/lib/supabase/admin'
import { DownloadsSection } from '@/components/public/downloads-section'
import { RelatedCasesSection } from '@/components/public/related-cases-section'
import { RelatedProducts } from '@/features/products/components/public/related-products'
import { LeadFormCTAButton } from '@/components/public/lead-form-cta-button'
import { InlineLeadForm } from '@/components/public/inline-lead-form'
import { RichTextRenderer } from '@/components/public/rich-text-renderer'
import { ProductDetailTracker } from '@/components/analytics/product-detail-tracker'
import { HeroFullscreen } from '@/components/public/pdp/hero-fullscreen'
import { AnchorNav } from '@/components/public/pdp/anchor-nav'
import { ScenariosSection } from '@/components/public/pdp/scenarios-section'
import { FeaturesSection } from '@/components/public/pdp/features-section'
import { SpecsEnhanced } from '@/components/public/pdp/specs-enhanced'
import { PayloadEcosystem } from '@/components/public/pdp/payload-ecosystem'
import { StickyCta } from '@/components/public/pdp/sticky-cta'
import {
  MessageSquare,
  Calendar,
  FileText,
  BookOpen,
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params
  const product = await getProductWithEnhancements(slug, locale)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return generateProductMetadata({ product, locale })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const t = await getTranslations('products')

  const product = await getProductWithEnhancements(slug, locale)

  if (!product) notFound()

  const overview = getTranslation(product.translations, locale, 'overview')
  const documents = product.documents || []
  const faqs = product.faqs || []

  // Check localized FAQs
  const localizedFaqs = faqs.filter((f: { locale: string }) => f.locale === locale)
  const hasDownloads = documents && documents.length > 0
  const hasFaqs = localizedFaqs.length > 0
  const hasCases = product.related_cases && product.related_cases.length > 0

  // Build spec groups for SpecsEnhanced
  const specGroups = product.spec_groups || []

  // Build anchor nav items dynamically based on available data
  const anchorItems = []
  if (overview) anchorItems.push({ id: 'overview', label: t('anchorNav.overview') })
  if (product.scenarios?.length) anchorItems.push({ id: 'scenarios', label: t('pdp.scenarios') })
  if (product.feature_blocks?.length) anchorItems.push({ id: 'features', label: t('pdp.features') })
  if (specGroups.length) anchorItems.push({ id: 'specs', label: t('anchorNav.specs') })
  if (product.payloads?.length) anchorItems.push({ id: 'payloads', label: t('pdp.payloadEcosystem') })
  if (hasDownloads) anchorItems.push({ id: 'downloads', label: t('anchorNav.resources') })
  if (hasFaqs) anchorItems.push({ id: 'faq', label: t('faq') })
  if (hasCases) anchorItems.push({ id: 'cases', label: t('relatedCases') })

  // Category label for tracker
  const categoryLabel = product.category?.translations
    ? getTranslation(product.category.translations, locale, 'name')
    : null

  const name = getTranslation(product.translations, locale, 'name')

  return (
    <>
      <ProductSchema product={product} locale={locale} />
      <ProductDetailTracker
        productModel={product.model}
        productName={name || ''}
        category={categoryLabel}
        locale={locale}
      />

      {/* ===== 1. HERO FULLSCREEN ===== */}
      <HeroFullscreen product={product} locale={locale} />

      {/* ===== 2. ANCHOR NAV ===== */}
      <AnchorNav items={anchorItems} />

      {/* ===== 3. OVERVIEW SECTION ===== */}
      {overview && (
        <section id="overview" className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-[#0066FF]/15 p-2">
                <BookOpen className="w-5 h-5 text-[#0066FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('pdp.overview')}</h2>
            </div>
            <RichTextRenderer content={overview} className="text-white/60" />
          </div>
        </section>
      )}

      {/* ===== 4. SCENARIOS SECTION ===== */}
      <ScenariosSection scenarios={product.scenarios || []} locale={locale} />

      {/* ===== 5. FEATURES SECTION ===== */}
      <FeaturesSection features={product.feature_blocks || []} locale={locale} />

      {/* ===== 6. SPECS ENHANCED ===== */}
      <SpecsEnhanced specGroups={specGroups} heroMetrics={product.hero_metrics} locale={locale} />

      {/* ===== 7. PAYLOAD ECOSYSTEM ===== */}
      <PayloadEcosystem payloads={product.payloads || []} locale={locale} />

      {/* ===== 8. DOWNLOADS SECTION ===== */}
      {hasDownloads && (
        <section id="downloads" className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-[#0066FF]/15 p-2">
                <FileText className="w-5 h-5 text-[#0066FF]" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t('downloads')}</h2>
            </div>
            <DownloadsSection downloads={documents} locale={locale} productModel={product.model} />
          </div>
        </section>
      )}

      {/* ===== 9. FAQ SECTION ===== */}
      {hasFaqs && (
        <section id="faq" className="py-20 bg-[#1A1F2E]">
          <div className="container mx-auto px-4">
            <ProductFAQSection faqs={faqs} locale={locale} />
          </div>
        </section>
      )}

      {/* ===== 10. RELATED CASES ===== */}
      {hasCases && (
        <section id="cases" className="py-20">
          <div className="container mx-auto px-4">
            <RelatedCasesSection cases={product.related_cases} locale={locale} />
          </div>
        </section>
      )}

      {/* ===== 11. BOTTOM CTA ===== */}
      <section className="bg-[#0066FF]">
        <div className="container mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3 text-white">
            {t('bottomCta.title')}
          </h2>
          <p className="text-base text-white/80 mb-8 max-w-2xl mx-auto">
            {t('bottomCta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <LeadFormCTAButton
              intent="quote"
              productModel={product.model}
              pageType="product"
              locale={locale}
              size="lg"
              variant="secondary"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('requestQuote')}
            </LeadFormCTAButton>
            <LeadFormCTAButton
              intent="demo"
              productModel={product.model}
              pageType="product"
              locale={locale}
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t('scheduleDemo')}
            </LeadFormCTAButton>
          </div>
        </div>
      </section>

      {/* ===== 12. RELATED PRODUCTS ===== */}
      <RelatedProducts productId={product.id} locale={locale} />

      {/* ===== 13. INLINE LEAD FORM ===== */}
      <div id="lead-form" className="container mx-auto px-4 py-12">
        <InlineLeadForm
          mode="inline"
          defaultIntent="quote"
          productModel={product.model}
          locale={locale}
        />
      </div>

      {/* ===== 14. STICKY CTA ===== */}
      <StickyCta />
    </>
  )
}
