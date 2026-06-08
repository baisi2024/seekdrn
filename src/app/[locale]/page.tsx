import Link from 'next/link'
import { ArrowRight, PackageOpen, Video } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSiteSettings } from '@/lib/site-settings/api'
import { getFAQs } from '@/lib/faqs/api'
import { Hero } from '@/components/public/hero'
import { TrustBar } from '@/components/public/trust-bar'
import { ProductCard } from '@/components/public/product-card'
import { CaseCard } from '@/components/public/case-card'
import { SolutionsGrid } from '@/components/public/solutions-grid'
import { CTASection } from '@/components/public/cta-section'
import { FAQSection } from '@/components/public/faq-section'
import { DemoForm } from '@/components/public/demo-form'
import { MissionSelector } from '@/components/public/mission-selector'
import type { ProductTag } from '@/features/products/types/tag'
import type { SpecGroup } from '@/features/products/types/product'

interface ProductCategorySummary {
  id?: string
  slug?: string
  translations?: Record<string, Record<string, string>>
}

interface Product {
  id: string
  slug: string
  category_id: string | null
  category?: ProductCategorySummary | null
  images?: string[]
  translations?: Record<string, Record<string, string>>
  specs?: { label: string; value: string }[]
  featured?: boolean
  spec_groups?: SpecGroup[]
  tag_objects?: ProductTag[]
}

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  image_url?: string
  video_url?: string
  translations?: Record<string, Record<string, string>>
  metrics?: { label: string; value: string }[]
  featured?: boolean
}

interface Solution {
  id: string
  slug: string
  icon?: string
  translations: Record<string, Record<string, string>>
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')

  const [settings, faqs, productsRes, casesRes, solutionsRes] = await Promise.allSettled([
    getSiteSettings(),
    getFAQs(),
    supabaseAdmin.from('products')
      .select('id, slug, category_id, category:product_categories(id, slug, translations), images, translations, spec_groups, featured, tag_objects:product_tag_relations(product_tags!inner(*))')
      .eq('featured', true)
      .eq('published', true)
      .limit(6),
    supabaseAdmin.from('case_studies')
      .select('id, slug, industry, country, image_url, video_url, translations, metrics, featured')
      .eq('featured', true)
      .limit(3),
    supabaseAdmin.from('solutions')
      .select('id, slug, icon, translations')
      .eq('published', true)
      .order('sort_order'),
  ])

  const siteSettings = settings.status === 'fulfilled' ? settings.value : null
  const faqList = faqs.status === 'fulfilled' ? faqs.value : []
  const products: Product[] = productsRes.status === 'fulfilled' && productsRes.value.data
    ? (productsRes.value.data as unknown as Array<Omit<Product, 'category'> & { category?: ProductCategorySummary | ProductCategorySummary[] | null }>).map((p) => ({
        ...p,
        category: Array.isArray(p.category) ? p.category[0] : p.category,
      }))
    : []
  const cases: CaseStudy[] = casesRes.status === 'fulfilled' && casesRes.value.data
    ? casesRes.value.data
    : []
  const solutions: Solution[] = solutionsRes.status === 'fulfilled' && solutionsRes.value.data
    ? solutionsRes.value.data
    : []

  const productsByCategory = products.reduce<Record<string, Product[]>>((acc, product) => {
    const cat = (typeof product.category === 'object' && product.category?.slug) || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {})

  const missionOptions = ['publicSafety', 'infrastructureInspection', 'mappingSurvey', 'perimeterSecurity', 'counterUas', 'disasterResponse'].map((key) => ({
    key,
    title: t(`missionSelector.missions.${key}.title`),
    description: t(`missionSelector.missions.${key}.description`),
    href: `/${locale}/products?mission=${key}`,
  }))

  return (
    <>
      <Hero heroConfig={siteSettings?.hero_config} />
      <TrustBar config={siteSettings?.trust_bar_config} />
      <MissionSelector
        title={t('missionSelector.title')}
        subtitle={t('missionSelector.subtitle')}
        viewLabel={t('missionSelector.viewRecommended')}
        options={missionOptions}
      />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground">{t('products.title')}</h2>
            <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t('products.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {Object.keys(productsByCategory).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-foreground/70 mb-6 capitalize">{category.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} locale={locale} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <PackageOpen className="mx-auto mb-4 h-16 w-16 opacity-30" />
              <p className="text-sm">{t('products.empty')}</p>
            </div>
          )}
        </div>
      </section>

      <SolutionsGrid solutions={solutions} locale={locale} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground">{t('cases.title')}</h2>
            <Link href={`/${locale}/case-studies`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t('cases.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseStudy) => (
                <CaseCard key={caseStudy.id} caseStudy={caseStudy} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Video className="mx-auto mb-4 h-16 w-16 opacity-30" />
              <p className="text-sm">{t('cases.empty')}</p>
            </div>
          )}
        </div>
      </section>

      <CTASection config={siteSettings?.cta_config} />
      <DemoForm />
      <FAQSection faqs={faqList} locale={locale} />
    </>
  )
}