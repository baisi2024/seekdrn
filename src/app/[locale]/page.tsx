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

interface Product {
  id: string
  slug: string
  category_id: string | null
  images?: string[]
  translations?: Record<string, Record<string, string>>
  specs?: { label: string; value: string }[]
  featured?: boolean
  spec_groups?: Array<{
    id: string
    label: Record<string, string>
    specs: Array<{ label: Record<string, string> | string; value: Record<string, string> | string; unit?: Record<string, string> | string }>
    sort_order?: number
  }>
  tag_objects?: ProductTag[]
}

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  images?: string[]
  video_url?: string
  translations?: Record<string, Record<string, string>>
  metrics?: Array<{ label: string | Record<string, string>; value: string | Record<string, string> }>
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
      .select('id, slug, model, category_id, images, translations, spec_groups, product_specs(id, label, value, unit, group_id, sort_order), featured, tag_objects:product_tag_relations(product_tags!inner(*))')
      .eq('published', true)
      .order('featured', { ascending: false })
      .order('sort_order')
      .limit(6),
    supabaseAdmin.from('case_studies')
      .select('id, slug, industry, country, images, video_url, translations, metrics, featured')
      .limit(3),
    supabaseAdmin.from('solutions')
      .select('id, slug, icon, translations')
      .eq('published', true)
      .order('sort_order'),
  ])

  const siteSettings = settings.status === 'fulfilled' ? settings.value : null
  const faqList = faqs.status === 'fulfilled' ? faqs.value : []
  const products: Product[] = productsRes.status === 'fulfilled' && productsRes.value.data
    ? (productsRes.value.data as unknown as Array<Omit<Product, never> & { product_specs?: Array<{ id: string; label: Record<string, string>; value: Record<string, string>; unit: Record<string, string>; group_id: string; sort_order: number }> }>).map((p) => {
        // 组装 spec_groups：将 product_specs 合并到 spec_groups 配置中
        const specGroupsConfig = (p.spec_groups || []) as Array<{ id: string; label: Record<string, string>; sort_order?: number }>
        const productSpecs = p.product_specs || []
        let assembledSpecGroups = p.spec_groups
        if (specGroupsConfig.length > 0 && productSpecs.length > 0) {
          assembledSpecGroups = specGroupsConfig.map(group => ({
            ...group,
            specs: productSpecs.filter(spec => spec.group_id === group.id)
          })).filter(group => group.specs.length > 0)
        } else if (productSpecs.length > 0) {
          assembledSpecGroups = [{
            id: 'default',
            label: { en: 'Specifications' },
            specs: productSpecs,
            sort_order: 0,
          }]
        }

        return {
          ...p,
          spec_groups: assembledSpecGroups,
        }
      })
    : []
  const cases: CaseStudy[] = casesRes.status === 'fulfilled' && casesRes.value.data
    ? casesRes.value.data
    : []
  const solutions: Solution[] = solutionsRes.status === 'fulfilled' && solutionsRes.value.data
    ? solutionsRes.value.data
    : []

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

      <section className="py-16 lg:py-24 bg-[#1A1F2E]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-white">{t('products.title')}</h2>
            <Link href={`/${locale}/products`} className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:text-[#0052CC] transition-colors">
              {t('products.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-white/30">
              <PackageOpen className="mx-auto mb-4 h-16 w-16 opacity-30" />
              <p className="text-sm">{t('products.empty')}</p>
            </div>
          )}
        </div>
      </section>

      <SolutionsGrid solutions={solutions} locale={locale} />

      <section className="py-16 lg:py-24 bg-[#0A0E17]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-white">{t('cases.title')}</h2>
            <Link href={`/${locale}/case-studies`} className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:text-[#0052CC] transition-colors">
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
            <div className="text-center py-16 text-white/30">
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