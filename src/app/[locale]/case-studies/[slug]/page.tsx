import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CaseHeroVideo } from '@/components/public/case-hero-video'

interface CaseResult {
  value: string
  metric: string
  unit?: string
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params

  const { data: caseStudy } = await supabaseAdmin
    .from('case_studies')
    .select('translations')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  const title = caseStudy ? getTranslation(caseStudy.translations, locale, 'title') : 'Case Study'

  return {
    title,
    alternates: {
      canonical: `/${locale}/case-studies/${slug}`,
    },
  }
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const t = await getTranslations('case-studies')

  const { data: caseStudy } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!caseStudy) notFound()

  const title = getTranslation(caseStudy.translations, locale, 'title')
  const background = getTranslation(caseStudy.translations, locale, 'background')
  const challenge = getTranslation(caseStudy.translations, locale, 'challenge')
  const solution = getTranslation(caseStudy.translations, locale, 'solution')
  const clientQuote = getTranslation(caseStudy.client_quote || {}, locale, 'text')

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="mb-12">
          {caseStudy.video_url ? (
            <CaseHeroVideo
              videoUrl={caseStudy.video_url}
              poster={caseStudy.images && caseStudy.images[0]}
            />
          ) : caseStudy.images && caseStudy.images[0] ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-6 relative">
              <Image src={caseStudy.images[0]} alt={title} fill className="object-cover" />
            </div>
          ) : null}
          <div className="flex gap-2 mb-4">
            <Badge>{caseStudy.industry}</Badge>
            {caseStudy.country && <Badge variant="outline">{caseStudy.country}</Badge>}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">{title}</h1>
        </div>

        {/* Background */}
        {background && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('background')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: background }} />
          </section>
        )}

        {/* Challenge */}
        {challenge && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('challenge')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: challenge }} />
          </section>
        )}

        {/* Solution */}
        {solution && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('solution')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: solution }} />
          </section>
        )}

        {/* Results */}
        {caseStudy.results && caseStudy.results.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('results')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(caseStudy.results as CaseResult[]).map((r, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="font-mono font-bold text-3xl text-primary mb-2">
                      {r.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{r.metric}</div>
                    {r.unit && <div className="text-xs text-muted-foreground/60 mt-1">{r.unit}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Client Quote */}
        {clientQuote && (
          <section className="mb-12">
            <Card className="bg-muted">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground">
                  &ldquo;{clientQuote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Field Footage */}
        {caseStudy.images && caseStudy.images.length > 1 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('fieldFootage')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {caseStudy.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                  <Image src={img} alt={`Footage ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}