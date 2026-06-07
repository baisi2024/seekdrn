import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CaseCard } from '@/components/public/case-card'

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
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('case-studies')

  const { data: caseStudies } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .eq('published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {caseStudies && caseStudies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((cs) => (
              <CaseCard key={cs.id} caseStudy={cs} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">{t('noCases')}</p>
          </div>
        )}
      </div>
    </div>
  )
}