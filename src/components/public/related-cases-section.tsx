import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  translations: Record<string, Record<string, string>>
  video_url: string
  images: string[]
}

interface Props {
  cases: CaseStudy[]
  locale: string
}

export function RelatedCasesSection({ cases, locale }: Props) {
  const t = useTranslations('products')

  if (!cases || cases.length === 0) return null

  const displayCases = cases.slice(0, 3)

  return (
    <section className="mb-16" data-testid="related-cases-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t('relatedCases')}</h2>
        <Link
          href={`/${locale}/case-studies`}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t('viewAll')} &rarr;
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {displayCases.map(caseStudy => {
          const title = getTranslation(caseStudy.translations, locale, 'title')
          const summary = getTranslation(caseStudy.translations, locale, 'summary')

          return (
            <Link
              key={caseStudy.id}
              href={`/${locale}/case-studies/${caseStudy.slug}`}
              data-testid="case-card"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-muted">
                  {caseStudy.images && caseStudy.images.length > 0 ? (
                    <Image
                      src={caseStudy.images[0]}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {caseStudy.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{caseStudy.industry}</Badge>
                    <Badge variant="outline">{caseStudy.country}</Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}