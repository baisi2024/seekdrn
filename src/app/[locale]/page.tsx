import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Shield, Zap, Map, Leaf, Radar } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Hero } from '@/components/public/hero'
import { TrustBar } from '@/components/public/trust-bar'
import { ProductCard } from '@/components/public/product-card'
import { CaseCard } from '@/components/public/case-card'
import { DemoForm } from '@/components/public/demo-form'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  slug: string
  category: string
  image_url?: string
  translations?: Record<string, Record<string, string>>
  specs?: { label: string; value: string }[]
  featured?: boolean
}

interface Solution {
  id: string
  slug: string
  translations?: Record<string, Record<string, string>>
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

interface SiteSettings {
  hero_config?: {
    title?: string
    subtitle?: string
    image_url?: string
    category?: string
    indicators?: { label: string; value: number }[]
  }
}

const solutionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'public-safety': Shield,
  'energy': Zap,
  'surveying': Map,
  'environmental': Leaf,
  'counter-uas': Radar,
}

const solutionSlugs = ['public-safety', 'energy', 'surveying', 'environmental', 'counter-uas']

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('home')
  const tc = await getTranslations('common')

  // Fetch data with graceful error handling
  let products: Product[] = []
  let cases: CaseStudy[] = []
  let heroConfig: SiteSettings['hero_config'] | undefined

  try {
    const [productsRes, casesRes] = await Promise.all([
      supabaseAdmin
        .from('products')
        .select('id, slug, category, image_url, translations, specs, featured')
        .eq('featured', true)
        .limit(6),
      supabaseAdmin
        .from('case_studies')
        .select('id, slug, industry, country, image_url, video_url, translations, metrics, featured')
        .eq('featured', true)
        .limit(3),
    ])

    if (productsRes.data) products = productsRes.data
    if (casesRes.data) cases = casesRes.data
  } catch {
    // Supabase not connected — show empty states
  }

  try {
    const { data: settings } = await supabaseAdmin
      .from('site_settings')
      .select('hero_config')
      .single()

    if (settings?.hero_config) heroConfig = settings.hero_config
  } catch {
    // Site settings not available — use defaults
  }

  // Group products by category
  const productsByCategory = products.reduce<Record<string, Product[]>>((acc, product) => {
    const cat = product.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {})

  return (
    <>
      {/* Hero Section */}
      <Hero heroConfig={heroConfig} />

      {/* Trust Bar */}
      <TrustBar />

      {/* Products Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{t('products.title')}</h2>
            <Link
              href={`/${locale}/products`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t('products.viewAll')} →
            </Link>
          </div>

          {Object.keys(productsByCategory).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-6 capitalize">{category.replace('_', ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} locale={locale} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm">Featured products coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t('solutions.title')}</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {solutionSlugs.map((slug) => {
              const Icon = solutionIcons[slug] || Shield
              const label = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

              return (
                <Link
                  key={slug}
                  href={`/${locale}/solutions/${slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center transition-colors group-hover:bg-blue-100">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{t('cases.title')}</h2>
            <Link
              href={`/${locale}/case-studies`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t('cases.viewAll')} →
            </Link>
          </div>

          {cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseStudy) => (
                <CaseCard key={caseStudy.id} caseStudy={caseStudy} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Featured case studies coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t('ctaSection.title')}
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('ctaSection.subtitle')}
          </p>
          <Button
            render={<Link href="#demo-form" />}
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50"
          >
            {t('ctaSection.button')}
          </Button>
        </div>
      </section>

      {/* Demo Form Section */}
      <DemoForm />
    </>
  )
}
