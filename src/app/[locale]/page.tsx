import Link from 'next/link'
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

interface Product {
  id: string
  slug: string
  category_id: string | null
  category?: any
  images?: string[]
  translations?: Record<string, Record<string, string>>
  specs?: { label: string; value: string }[]
  featured?: boolean
  spec_groups?: any[]
  tag_objects?: any[]
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
    ? productsRes.value.data.map((p: any) => ({
        ...p,
        category: Array.isArray(p.category) ? p.category[0] : p.category
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

  return (
    <>
      <Hero heroConfig={siteSettings?.hero_config} />
      <TrustBar config={siteSettings?.trust_bar_config} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground">{t('products.title')}</h2>
            <Link href={`/${locale}/products`} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t('products.viewAll')} &rarr;
            </Link>
          </div>

          {Object.keys(productsByCategory).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-foreground/70 mb-6 capitalize">{category.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product as any} locale={locale} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm">Featured products coming soon.</p>
            </div>
          )}
        </div>
      </section>

      <SolutionsGrid solutions={solutions} locale={locale} />

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground">{t('cases.title')}</h2>
            <Link href={`/${locale}/case-studies`} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t('cases.viewAll')} &rarr;
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
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Featured case studies coming soon.</p>
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