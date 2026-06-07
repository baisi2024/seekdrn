import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6">
              <video src={caseStudy.video_url} controls className="w-full h-full object-cover" />
            </div>
          ) : caseStudy.images && caseStudy.images[0] ? (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-6 relative">
              <Image src={caseStudy.images[0]} alt={title} fill className="object-cover" />
            </div>
          ) : null}
          <div className="flex gap-2 mb-4">
            <Badge>{caseStudy.industry}</Badge>
            {caseStudy.country && <Badge variant="outline">{caseStudy.country}</Badge>}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Background */}
        {background && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('background')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: background }} />
          </section>
        )}

        {/* Challenge */}
        {challenge && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('challenge')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: challenge }} />
          </section>
        )}

        {/* Solution */}
        {solution && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('solution')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: solution }} />
          </section>
        )}

        {/* Results */}
        {caseStudy.results && caseStudy.results.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('results')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {caseStudy.results.map((r: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="font-mono font-bold text-3xl text-blue-600 mb-2">
                      {r.value}
                    </div>
                    <div className="text-sm text-gray-600">{r.metric}</div>
                    {r.unit && <div className="text-xs text-gray-400 mt-1">{r.unit}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Client Quote */}
        {clientQuote && (
          <section className="mb-12">
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-gray-700">
                  "{clientQuote}"
                </blockquote>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Field Footage */}
        {caseStudy.images && caseStudy.images.length > 1 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('fieldFootage')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {caseStudy.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-video rounded-lg overflow-hidden bg-gray-100 relative">
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
