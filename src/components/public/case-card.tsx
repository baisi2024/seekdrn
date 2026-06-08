'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Video } from 'lucide-react'
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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
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
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Video className="h-12 w-12 text-muted-foreground/30" />
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
      <div className="flex flex-1 flex-col p-5 space-y-4">
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metrics.slice(0, 2).map((metric) => (
              <div key={metric.label} className="rounded-xl border border-border bg-muted p-3">
                <div className="font-mono text-xl font-bold text-primary">{metric.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        )}

        <h3 className="font-semibold text-foreground text-lg leading-snug">
          {title || t('untitled')}
        </h3>

        <p className="text-sm leading-6 text-muted-foreground">
          {t('proofCard.description', { industry: industryLabel, country: caseStudy.country || t('proofCard.global') })}
        </p>

        <div className="mt-auto pt-2">
          <Link
            href={`/${locale}/case-studies/${caseStudy.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t('readMore')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
