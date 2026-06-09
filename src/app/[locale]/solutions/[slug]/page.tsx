import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MissionWorkflow } from '@/components/public/mission-workflow'
import { LeadFormCTAButton } from '@/components/public/lead-form-cta-button'
import { InlineLeadForm } from '@/components/public/inline-lead-form'
import { CaseCard } from '@/components/public/case-card'
import { ArrowRight, Box } from 'lucide-react'
import { Breadcrumb } from '@/components/public/breadcrumb'
import { SolutionPageTracker } from '@/components/public/solution-page-tracker'

interface SolutionMetric {
  value: string
  metric: string
}

interface RelatedProduct {
  id: string
  slug: string
  model?: string
  images?: string[]
  translations?: Record<string, Record<string, string>>
}

interface RelatedCase {
  id: string
  slug: string
  industry: string
  country: string
  image_url?: string
  video_url?: string
  translations?: Record<string, Record<string, string>>
  metrics?: { label: string; value: string }[]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params

  const { data: solution } = await supabaseAdmin
    .from('solutions')
    .select('translations')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  const title = solution ? getTranslation(solution.translations, locale, 'title') : 'Solution'

  return {
    title,
    alternates: {
      canonical: `/${locale}/solutions/${slug}`,
    },
  }
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const t = await getTranslations('solutions')
  const tc = await getTranslations('common')

  const { data: solution } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!solution) notFound()

  const title = getTranslation(solution.translations, locale, 'title')
  const challenge = getTranslation(solution.translations, locale, 'challenge')
  const solutionText = getTranslation(solution.translations, locale, 'solution')
  const workflow = getTranslation(solution.translations, locale, 'workflow')
  const workflowSteps = ['assess', 'configure', 'deploy'].map((key) => ({
    title: t(`missionWorkflow.steps.${key}.title`),
    description: t(`missionWorkflow.steps.${key}.description`),
  }))

  // Query related products
  const { data: solutionProducts } = await supabaseAdmin
    .from('solution_products')
    .select('product_id, products(*)')
    .eq('solution_id', solution.id)
    .order('sort_order')

  // Query related cases
  const { data: solutionCases } = await supabaseAdmin
    .from('solution_cases')
    .select('case_study_id, case_studies(*)')
    .eq('solution_id', solution.id)
    .order('sort_order')

  const relatedProducts = (solutionProducts
    ?.map((sp) => sp.products)
    .filter(Boolean) || []) as unknown as RelatedProduct[]

  const relatedCases = (solutionCases
    ?.map((sc) => sc.case_studies)
    .filter(Boolean) || []) as unknown as RelatedCase[]

  return (
    <div className="bg-background py-16">
      <SolutionPageTracker
        solutionSlug={solution.slug}
        solutionName={title || ''}
        locale={locale}
      />
      <div className="container mx-auto px-4">
        <Breadcrumb
          items={[
            { label: tc('breadcrumb.home'), href: `/${locale}` },
            { label: tc('breadcrumb.solutions'), href: `/${locale}/solutions` },
            { label: title || '' },
          ]}
        />
        {/* Hero */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          {solution.icon && <div className="mb-4 text-6xl">{solution.icon}</div>}
          <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground lg:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">{t('detailSubtitle')}</p>
        </div>

        <div className="space-y-12">
          <MissionWorkflow
            title={t('missionWorkflow.title')}
            subtitle={t('missionWorkflow.subtitle')}
            steps={workflowSteps}
            locale={locale}
            ctaLabel={t('requestDemo')}
            secondaryCtaLabel={t('exploreProducts')}
            solutionSlug={solution.slug}
          />

          {/* Challenge */}
        {challenge && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('challenge')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: challenge }} />
          </section>
        )}

        {/* Solution */}
        {solutionText && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('solution')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: solutionText }} />
          </section>
        )}

        {/* Workflow */}
        {workflow && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('workflow')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: workflow }} />
          </section>
        )}

        {/* Key Metrics */}
        {solution.metrics && solution.metrics.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('keyMetrics')}</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {(solution.metrics as SolutionMetric[]).map((m, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="font-mono font-bold text-2xl text-primary mb-2">
                      {m.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{m.metric}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('recommendedProducts')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <div key={product.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={getTranslation(product.translations || {}, locale, 'name') || product.model || ''}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Box className="h-14 w-14 text-muted-foreground/40" />
                      </div>
                    )}
                    {product.model && (
                      <Badge className="absolute left-3 top-3 font-mono text-xs">{product.model}</Badge>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold text-foreground text-lg leading-snug">
                      {getTranslation(product.translations || {}, locale, 'name') || product.model || 'Product'}
                    </h3>
                    <div className="mt-auto pt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/${locale}/products/${product.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        {t('exploreProducts')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <LeadFormCTAButton
                        intent="quote"
                        productModel={product.model}
                        solutionSlug={solution.slug}
                        pageType="solution"
                        locale={locale}
                        variant="outline"
                        size="sm"
                      >
                        {t('talkToTeam')}
                      </LeadFormCTAButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Cases */}
        {relatedCases.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('relatedCases')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCases.map((caseStudy) => (
                <CaseCard key={caseStudy.id} caseStudy={caseStudy} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
          <section className="rounded-3xl border border-border bg-[#f7f8f5] p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground">{t('solutionCta.title')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t('solutionCta.subtitle')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LeadFormCTAButton
              intent="quote"
              solutionSlug={solution.slug}
              pageType="solution"
              locale={locale}
            >
              {t('requestDemo')}
            </LeadFormCTAButton>
            <Link href={`/${locale}/case-studies`} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              {t('relatedCases')}
            </Link>
          </div>
        </section>
        </div>

        {/* Inline Lead Form */}
        <div className="mt-12">
          <InlineLeadForm
            mode="inline"
            defaultIntent="quote"
            solutionSlug={solution.slug}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
