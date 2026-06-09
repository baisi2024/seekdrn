import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getTranslation } from '@/lib/utils'
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
import { ShareButtons } from '@/components/public/share-buttons'
import { ProcurementPackCTA } from '@/components/public/procurement-pack-cta'
import { ProcurementDecisionBar } from '@/components/public/procurement-decision-bar'
import { InlineLeadForm } from '@/components/public/inline-lead-form'
import { AddToCompareButton } from '@/components/public/add-to-compare-button'
import { Breadcrumb } from '@/components/public/breadcrumb'
import type { Spec } from '@/features/products/types/product'
import {
  MessageSquare,
  FileText,
  Calendar,
  Shield,
  Zap,
  Target,
  Radio,
} from 'lucide-react'

interface Relation {
  relation_type: string
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

  // Extract key specs for hero stats bar (from first spec group, first 4 specs)
  const heroStats: Array<{ label: string; value: string; unit: string }> = product.spec_groups && product.spec_groups.length > 0
    ? product.spec_groups[0].specs.slice(0, 4).map((spec: Spec) => ({
        label: getTranslation(spec.label, locale, 'label') || Object.values(spec.label)[0],
        value: spec.value,
        unit: spec.unit || '',
      }))
    : []
  const decisionItems = heroStats.slice(0, 3).map((stat) => ({
    label: stat.label,
    value: `${stat.value}${stat.unit}`,
  }))

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
                  {tags.map((tag: any) => {
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
                <Badge variant="outline" className="font-mono mb-3">{product.model}</Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{name}</h1>
                <p className="mt-3 text-lg text-muted-foreground leading-relaxed">{overview}</p>
                <div className="mt-3">
                  <ShareButtons title={name} description={overview} pageType="product" locale={locale} />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <AddToCompareButton
                  product={{
                    id: product.id,
                    model: product.model,
                    slug: product.slug,
                    name: name || '',
                    category: categoryLabel || undefined,
                    image: product.images && product.images.length > 0 ? product.images[0] : undefined,
                    tags: tags.map((tag: any) => getTranslation(tag.translations, locale, 'name') || tag.slug),
                    spec_groups: product.spec_groups,
                  }}
                />

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

                <LeadFormCTAButton
                  intent="demo"
                  productModel={product.model}
                  pageType="product"
                  locale={locale}
                  size="lg"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('scheduleDemo')}
                </LeadFormCTAButton>
              </div>

              {/* Compliance Badges */}
              {product.compliance_flag && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <Shield className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <p className="text-sm text-amber-900">
                    {t('complianceNotice')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {decisionItems.length > 0 && (
        <ProcurementDecisionBar
          locale={locale}
          title={t('procurementDecision.title')}
          items={decisionItems}
          quoteLabel={t('requestQuote')}
          datasheetLabel={t('downloadMaterials')}
          hasDocuments={documents.length > 0}
          productModel={product.model}
        />
      )}

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
        <ProcurementPackCTA
          locale={locale}
          title={t('procurementPack.title')}
          subtitle={t('procurementPack.subtitle')}
          datasheetLabel={t('downloadMaterials')}
          supportLabel={t('procurementPack.supportLabel')}
          complianceLabel={t('procurementPack.complianceLabel')}
          hasDocuments={documents.length > 0}
          productModel={product.model}
        />

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
            <DownloadsSection downloads={documents} locale={locale} productModel={product.model} />
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
            <LeadFormCTAButton
              intent="quote"
              productModel={product.model}
              pageType="product"
              locale={locale}
              size="lg"
              variant="secondary"
              className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground px-6 py-3 text-sm font-medium hover:bg-secondary/90 transition-colors"
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
              variant="ghost"
              className="inline-flex items-center justify-center rounded-md border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t('scheduleDemo')}
            </LeadFormCTAButton>
          </div>
        </div>
      </section>

      {/* ===== RELATED PRODUCTS ===== */}
      <RelatedProducts productId={product.id} locale={locale} />

      {/* ===== INLINE LEAD FORM ===== */}
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
