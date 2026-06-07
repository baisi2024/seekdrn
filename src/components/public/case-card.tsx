import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  image_url?: string
  video_url?: string
  translations?: Record<string, Record<string, string>>
  metrics?: { label: string; value: string }[]
}

interface CaseCardProps {
  caseStudy: CaseStudy
  locale: string
}

export function CaseCard({ caseStudy, locale }: CaseCardProps) {
  const t = useTranslations('case-studies')
  const title = getTranslation(caseStudy.translations || {}, locale, 'title')
  const industryLabel = getTranslation(caseStudy.translations || {}, locale, 'industry') || caseStudy.industry

  const metrics = caseStudy.metrics || []

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Video/Image Area */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {caseStudy.image_url ? (
          <Image
            src={caseStudy.image_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <svg className="w-12 h-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="text-xs">{industryLabel}</Badge>
          {caseStudy.country && (
            <Badge variant="outline" className="text-xs">{caseStudy.country}</Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <h3 className="font-semibold text-foreground text-lg leading-snug">
          {title || t('untitled')}
        </h3>

        {/* Results Metrics Grid */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg bg-accent p-3 text-center">
                <div className="font-mono text-lg font-bold text-primary">{metric.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{metric.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Link */}
        <Link
          href={`/${locale}/case-studies/${caseStudy.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t('readMore')}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
