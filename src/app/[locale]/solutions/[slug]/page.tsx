import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const t = await getTranslations('solutions')

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

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          {solution.icon && <div className="text-6xl mb-4">{solution.icon}</div>}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{title}</h1>
        </div>

        {/* Challenge */}
        {challenge && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('challenge')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: challenge }} />
          </section>
        )}

        {/* Solution */}
        {solutionText && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('solution')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: solutionText }} />
          </section>
        )}

        {/* Workflow */}
        {workflow && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('workflow')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: workflow }} />
          </section>
        )}

        {/* Key Metrics */}
        {solution.metrics && solution.metrics.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{t('keyMetrics')}</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {solution.metrics.map((m: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="font-mono font-bold text-2xl text-blue-600 mb-2">
                      {m.value}
                    </div>
                    <div className="text-sm text-gray-600">{m.metric}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="text-center">
          <Button asChild size="lg">
            <Link href={`/${locale}#demo-form`}>Request a Demo</Link>
          </Button>
        </section>
      </div>
    </div>
  )
}
