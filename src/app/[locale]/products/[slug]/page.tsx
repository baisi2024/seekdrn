import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
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
import { LeadFormCTAButton } from '@/components/public/lead-form-cta-button'
import { InlineLeadForm } from '@/components/public/inline-lead-form'
import { Breadcrumb } from '@/components/public/breadcrumb'
import { RichTextRenderer } from '@/components/public/rich-text-renderer'
import { ProductDetailTracker } from '@/components/analytics/product-detail-tracker'
import type { Spec } from '@/features/products/types/product'
import {
  MessageSquare,
  FileText,
  Calendar,
  Shield,
  Zap,
  Target,
  Compass,
  BookOpen,
} from 'lucide-react'

interface Relation {
  relation_type: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&times;/gi, '×')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&le;/gi, '≤')
    .replace(/&ge;/gi, '≥')
    .replace(/&deg;/gi, '°')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code) => {
      const num = parseInt(code)
      return num > 0 ? String.fromCharCode(num) : ''
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
      const num = parseInt(code, 16)
      return num > 0 ? String.fromCharCode(num) : ''
    })
    .replace(/\s+/g, ' ')
    .trim()
}

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
  const tc = await getTranslations('common')

  const product = await getProductWithEnhancements(slug, locale)

  if (!product) notFound()

  const name = getTranslation(product.translations, locale, 'name')
  const overview = getTranslation(product.translations, locale, 'overview')
  const advantages = getTranslation(product.translations, locale, 'advantages')
  const capabilities = getTranslation(product.translations, locale, 'capabilities')
  const applications = getTranslation(product.translations, locale, 'applications')

  const categoryLabel = product.category?.translations
    ? getTranslation(product.category.translations, locale, 'name')
    : null

  const tags = product.tag_objects || []
  const documents = product.documents || []
  const faqs = product.faqs || []

  const relations = (product.relations || []) as Relation[]
  const caseRelations = relations.filter((r) => r.relation_type === 'case_study')

  // Clean overview for hero display (strip HTML, emojis)
  const cleanOverview = overview ? stripHtml(overview) : ''

  // Extract key specs for hero stats bar (from first spec group, first 6 specs)
  const heroStats: Array<{ label: string; value: string; unit: string }> = product.spec_groups && product.spec_groups.length > 0
    ? product.spec_groups[0].specs.slice(0, 6).map((spec: Spec) => ({
        label: getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale),
        value: getLocalizedValue(spec.value, locale),
        unit: getLocalizedValue(spec.unit, locale),
      }))
    : []

  // Merge advantages and capabilities into core features
  const hasCoreFeatures = !!(advantages || capabilities)
  const hasDownloads = documents && documents.length > 0
  // Check if there are FAQs for the current locale
  const localizedFaqs = faqs.filter((f: { locale: string }) => f.locale === locale)
  const hasFaqs = localizedFaqs.length > 0
  const hasCases = product.related_cases && product.related_cases.length > 0

  // Build anchor nav items dynamically
  const anchorItems = [
    { id: 'overview', label: t('anchorNav.overview') },
    ...(hasCoreFeatures ? [{ id: 'features', label: t('coreFeatures') }] : []),
    ...(applications ? [{ id: 'applications', label: t('applications') }] : []),
    { id: 'specs', label: t('anchorNav.specs') },
    ...(hasDownloads ? [{ id: 'downloads', label: t('downloads') }] : []),
    ...(hasFaqs ? [{ id: 'faq', label: t('faq') }] : []),
    ...(caseRelations.length > 0 ? [{ id: 'cases', label: t('anchorNav.cases') }] : []),
  ]

  return (
    <>
      <ProductSchema product={product} locale={locale} />
      <ProductDetailTracker
        productModel={product.model}
        productName={name || ''}
        category={categoryLabel}
        locale={locale}
      />

      {/* ===== 1. HERO SECTION ===== */}
      <section className="border-b border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            {/* Left: Gallery */}
            <ProductGallery
              images={product.images || []}
              videos={product.videos || []}
            />

            {/* Right: Product Info */}
            <div className="space-y-5">
              {/* Breadcrumb */}
              <Breadcrumb
                items={[
                  { label: tc('breadcrumb.home'), href: `/${locale}` },
                  { label: tc('breadcrumb.products'), href: `/${locale}/products` },
                  ...(categoryLabel ? [{ label: categoryLabel }] : []),
                  { label: name || '' },
                ]}
              />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: { id?: string; slug: string; color?: string; translations?: Record<string, Record<string, string>> }) => {
                    const tagName = getTranslation(tag.translations, locale, 'name') || tag.slug
                    return (
                      <Badge
                        key={tag.id || tag.slug}
                        variant="secondary"
                        style={tag.color ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' } : undefined}
                      >
                        {tagName}
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Model + Name */}
              <div>
                <Badge variant="outline" className="font-mono mb-2">{product.model}</Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{name}</h1>
              </div>

              {/* Overview - clean plain text */}
              {cleanOverview && (
                <p className="text-base text-muted-foreground leading-relaxed">{cleanOverview}</p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <LeadFormCTAButton
                  intent="quote"
                  productModel={product.model}
                  pageType="product"
                  locale={locale}
                  size="lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('requestQuote')}
                </LeadFormCTAButton>

                {documents.length > 0 && (
                  <LeadFormCTAButton
                    intent="datasheet"
                    productModel={product.model}
                    pageType="product"
                    locale={locale}
                    size="lg"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {t('downloadMaterials')}
                  </LeadFormCTAButton>
                )}
              </div>

              {/* Compliance Notice */}
              {product.compliance_flag && (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <Shield className="w-5 h-5 flex-shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {t('complianceNotice')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 2. KEY SPECS BAR ===== */}
      {heroStats.length > 0 && (
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {heroStats.map((stat, i) => (
                <div key={i} className={`py-5 px-4 text-center ${i > 0 ? 'border-l border-border' : ''}`}>
                  <div className="font-mono text-xl lg:text-2xl font-bold text-primary">
                    {stat.value}<span className="text-sm ml-0.5 font-normal text-muted-foreground">{stat.unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 3. ANCHOR NAV ===== */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto py-3 text-sm font-medium scrollbar-none">
            {anchorItems.map((item) => (
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

      {/* ===== 4. CONTENT SECTIONS ===== */}
      <div className="container mx-auto px-4 py-10 lg:py-14 space-y-14">

        {/* Overview Section */}
        {overview && (
          <section id="overview">
            <SectionHeader icon={<BookOpen className="w-5 h-5 text-primary" />} title={t('overview')} />
            <RichTextRenderer content={overview} className="text-muted-foreground" />
          </section>
        )}

        {/* Core Features Section (merged advantages + capabilities) */}
        {hasCoreFeatures && (
          <section id="features">
            <SectionHeader icon={<Target className="w-5 h-5 text-primary" />} title={t('coreFeatures')} />
            <div className="space-y-8">
              {advantages && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t('advantages')}</h3>
                  <RichTextRenderer content={advantages} className="text-muted-foreground" />
                </div>
              )}
              {capabilities && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t('capabilities')}</h3>
                  <RichTextRenderer content={capabilities} className="text-muted-foreground" />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Applications Section */}
        {applications && (
          <section id="applications">
            <SectionHeader icon={<Compass className="w-5 h-5 text-primary" />} title={t('applications')} />
            <RichTextRenderer content={applications} className="text-muted-foreground" />
          </section>
        )}

        {/* Specs Section */}
        {product.spec_groups && product.spec_groups.length > 0 && (
          <section id="specs">
            <SectionHeader icon={<Zap className="w-5 h-5 text-primary" />} title={t('specs')} />
            <SpecsSection groups={product.spec_groups} locale={locale} />
          </section>
        )}

        {/* Downloads Section */}
        {hasDownloads && (
          <section id="downloads">
            <SectionHeader icon={<FileText className="w-5 h-5 text-primary" />} title={t('downloads')} />
            <DownloadsSection downloads={documents} locale={locale} productModel={product.model} />
          </section>
        )}

        {/* FAQ Section */}
        {hasFaqs && (
          <section id="faq">
            <SectionHeader icon={<MessageSquare className="w-5 h-5 text-primary" />} title={t('faq')} />
            <ProductFAQSection faqs={faqs} locale={locale} />
          </section>
        )}

        {/* Related Cases */}
        {hasCases && (
          <section id="cases">
            <RelatedCasesSection cases={product.related_cases} locale={locale} />
          </section>
        )}
      </div>

      {/* ===== 5. BOTTOM CTA ===== */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            {t('bottomCta.title')}
          </h2>
          <p className="text-base text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
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
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t('scheduleDemo')}
            </LeadFormCTAButton>
          </div>
        </div>
      </section>

      {/* ===== 6. RELATED PRODUCTS ===== */}
      <RelatedProducts productId={product.id} locale={locale} />

      {/* ===== 7. INLINE LEAD FORM ===== */}
      <div className="container mx-auto px-4 py-12">
        <InlineLeadForm
          mode="inline"
          defaultIntent="quote"
          productModel={product.model}
          locale={locale}
        />
      </div>
    </>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="rounded-lg bg-primary/10 p-2">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    </div>
  )
}
