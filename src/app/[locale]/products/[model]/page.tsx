import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getTranslation } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/features/products/components/public/product-gallery'
import { ProductFAQSection } from '@/features/products/components/public/product-faq'
import { ProductSchema } from '@/components/seo/product-schema'
import { generateProductMetadata } from '@/lib/seo/product-metadata'
import { getProductWithEnhancements } from '@/lib/supabase/admin'
import { SpecsSection } from '@/components/public/specs-section'
import { DownloadsSection } from '@/components/public/downloads-section'
import { RelatedCasesSection } from '@/components/public/related-cases-section'
import { RelatedProducts } from '@/features/products/components/public/related-products'
import { CTALink } from '@/components/public/cta-link'
import {
  MessageSquare,
  FileText,
  Calendar,
  Shield,
  ChevronRight,
  Zap,
  Target,
  Radio,
} from 'lucide-react'

interface Relation {
  relation_type: string
}

export async function generateMetadata({ params }: { params: Promise<{ model: string; locale: string }> }): Promise<Metadata> {
  const { model, locale } = await params
  const product = await getProductWithEnhancements(model, locale)

  if (!product) {
    return { title: 'Product Not Found' }
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

  const tags = product.tags || []
  const documents = product.documents || []
  const faqs = product.faqs || []

  const relations = (product.relations || []) as Relation[]
  const caseRelations = relations.filter((r) => r.relation_type === 'case_study')

  // Extract key specs for hero stats bar (from first spec group, first 4 specs)
  const heroStats: Array<{ label: string; value: string; unit: string }> = product.spec_groups && product.spec_groups.length > 0
    ? product.spec_groups[0].specs.slice(0, 4).map((spec: any) => ({
        label: getTranslation(spec.label, locale, 'label') || Object.values(spec.label)[0],
        value: spec.value,
        unit: spec.unit || '',
      }))
    : []

  return (
    <>
      <ProductSchema product={product} locale={locale} />

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left: Gallery */}
            <ProductGallery
              images={product.images || []}
              videos={product.videos || []}
            />

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href={`/${locale}/products`} className="hover:text-foreground transition-colors">
                  {t('title')}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground">{name}</span>
              </nav>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Model + Name */}
              <div>
                <Badge variant="outline" className="font-mono mb-3">{product.model}</Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{name}</h1>
                <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{overview}</p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <CTALink
                  href={`/${locale}#demo-form`}
                  size="lg"
                  trackingLocation="product_hero"
                  trackingAction="request_quote"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('requestQuote')}
                </CTALink>

                {documents.length > 0 && (
                  <Link
                    href="#downloads"
                    className={buttonVariants({ size: 'lg', variant: 'outline' })}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('downloadMaterials')}
                  </Link>
                )}

                <CTALink
                  href={`/${locale}#demo-form`}
                  size="lg"
                  variant="outline"
                  trackingLocation="product_hero"
                  trackingAction="schedule_demo"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('scheduleDemo')}
                </CTALink>
              </div>

              {/* Compliance Badges */}
              {product.compliance_flag && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
                  <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {t('complianceNotice')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== KEY STATS BAR ===== */}
      {heroStats.length > 0 && (
        <section className="border-y border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
              {heroStats.map((stat, i) => (
                <div key={i} className="py-6 px-6 text-center">
                  <div className="font-mono text-2xl lg:text-3xl font-bold text-primary">
                    {stat.value}<span className="text-base ml-0.5 font-normal text-muted-foreground">{stat.unit}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ANCHOR NAV ===== */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-medium scrollbar-none">
            {[
              { id: 'specs', label: t('specs') },
              { id: 'advantages', label: t('advantages') },
              { id: 'capabilities', label: t('capabilities') },
              { id: 'applications', label: t('applications') },
              ...(documents.length > 0 ? [{ id: 'downloads', label: t('downloads') }] : []),
              ...(faqs.length > 0 ? [{ id: 'faq', label: t('faq') }] : []),
              ...(caseRelations.length > 0 ? [{ id: 'cases', label: t('relatedCases') }] : []),
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent hover:border-primary pb-0.5"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== CONTENT SECTIONS ===== */}
      <div className="container mx-auto px-4 py-12 lg:py-16 space-y-20">

        {/* Specs Section */}
        {product.spec_groups && product.spec_groups.length > 0 && (
          <section id="specs">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-lg bg-primary/10 p-2">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t('specs')}</h2>
            </div>
            <SpecsSection groups={product.spec_groups} locale={locale} />
          </section>
        )}

        {/* Advantages Section */}
        {advantages && (
          <section id="advantages">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t('advantages')}</h2>
            </div>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: advantages }} />
          </section>
        )}

        {/* Capabilities Section */}
        {capabilities && (
          <section id="capabilities">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-lg bg-primary/10 p-2">
                <Radio className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t('capabilities')}</h2>
            </div>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: capabilities }} />
          </section>
        )}

        {/* Applications Section */}
        {applications && (
          <section id="applications">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-lg bg-primary/10 p-2">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t('applications')}</h2>
            </div>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: applications }} />
          </section>
        )}

        {/* Downloads Section */}
        {documents && documents.length > 0 && (
          <section id="downloads">
            <div className="flex items-center gap-3 mb-8">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">{t('downloads')}</h2>
            </div>
            <DownloadsSection downloads={documents} locale={locale} />
          </section>
        )}

        {/* FAQ Section */}
        {faqs && faqs.length > 0 && (
          <section id="faq">
            <ProductFAQSection faqs={faqs} locale={locale} />
          </section>
        )}

        {/* Related Cases */}
        {product.related_cases && product.related_cases.length > 0 && (
          <section id="cases">
            <RelatedCasesSection cases={product.related_cases} locale={locale} />
          </section>
        )}
      </div>

      {/* ===== BOTTOM CTA BANNER ===== */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            {t('bottomCta.title')}
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t('bottomCta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <CTALink
              href={`/${locale}#demo-form`}
              size="lg"
              variant="secondary"
              trackingLocation="product_bottom"
              trackingAction="request_quote"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('requestQuote')}
            </CTALink>
            <CTALink
              href={`/${locale}#demo-form`}
              size="lg"
              variant="ghost"
              className="text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              trackingLocation="product_bottom"
              trackingAction="schedule_demo"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t('scheduleDemo')}
            </CTALink>
          </div>
        </div>
      </section>

      {/* ===== RELATED PRODUCTS ===== */}
      <RelatedProducts productId={product.id} locale={locale} />
    </>
  )
}