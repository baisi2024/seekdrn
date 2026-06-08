import type { Metadata } from 'next'
import { Video, MessageSquare } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CaseCard } from '@/components/public/case-card'
import { CaseStudiesFilter } from '@/components/public/case-studies-filter'
import { LeadFormCTAButton } from '@/components/public/lead-form-cta-button'
import { Breadcrumb } from '@/components/public/breadcrumb'
import { Pagination } from '@/components/public/pagination'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'case-studies' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/case-studies`,
    },
  }
}

export default async function CaseStudiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ industry?: string; country?: string; page?: string }>
}) {
  const { locale } = await params
  const filters = await searchParams
  const currentPage = Math.max(1, parseInt(filters.page || '1', 10))
  const pageSize = 12
  const t = await getTranslations('case-studies')
  const tc = await getTranslations('common')

  // Build query with filters
  let query = supabaseAdmin
    .from('case_studies')
    .select('*')
    .eq('published', true)

  if (filters.industry) {
    query = query.eq('industry', filters.industry)
  }
  if (filters.country) {
    query = query.eq('country', filters.country)
  }

  const { data: caseStudies } = await query
    .order('sort_order')
    .order('created_at', { ascending: false })

  // Get unique industries and countries for filter options
  const { data: allCaseStudies } = await supabaseAdmin
    .from('case_studies')
    .select('industry, country')
    .eq('published', true)

  const industries = [...new Set((allCaseStudies || []).map((cs) => cs.industry).filter(Boolean))].sort()
  const countries = [...new Set((allCaseStudies || []).map((cs) => cs.country).filter(Boolean))].sort()

  // Pagination
  const totalCount = caseStudies?.length || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedCases = (caseStudies || []).slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Build base search params for pagination (exclude page)
  const paginationSearchParams: Record<string, string> = {}
  if (filters.industry) paginationSearchParams.industry = filters.industry
  if (filters.country) paginationSearchParams.country = filters.country

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <Breadcrumb
          items={[
            { label: tc('breadcrumb.home'), href: `/${locale}` },
            { label: tc('breadcrumb.case_studies') },
          ]}
        />
        <div className="mb-10 rounded-3xl border border-border bg-[#f7f8f5] p-8 lg:p-10">
          <p className="text-sm font-semibold text-primary">{t('proofIntro.eyebrow')}</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground lg:text-5xl">{t('title')}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-7 text-muted-foreground">
            {t('proofIntro.subtitle')}
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {['mission', 'procurement', 'deployment'].map((key) => (
              <div key={key} className="rounded-2xl border border-border bg-background p-4">
                <div className="font-semibold text-foreground">{t(`proofIntro.points.${key}.title`)}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t(`proofIntro.points.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <CaseStudiesFilter
          industries={industries}
          countries={countries}
          currentIndustry={filters.industry || ''}
          currentCountry={filters.country || ''}
          locale={locale}
        />

        {paginatedCases && paginatedCases.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCases.map((cs) => (
                <CaseCard key={cs.id} caseStudy={cs} locale={locale} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`/${locale}/case-studies`}
              searchParams={paginationSearchParams}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <Video className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-6">{t('noCases')}</p>
            <LeadFormCTAButton
              intent="quote"
              pageType="case_studies"
              locale={locale}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('noResultsCta')}
            </LeadFormCTAButton>
          </div>
        )}
      </div>
    </div>
  )
}
