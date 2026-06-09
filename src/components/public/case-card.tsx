'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  images?: string[]
  video_url?: string
  translations?: Record<string, Record<string, string>>
  metrics?: Array<{ label: string | Record<string, string>; value: string | Record<string, string> }>
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
  const imageUrl = caseStudy.images && caseStudy.images.length > 0 ? caseStudy.images[0] : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1F2E] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0066FF]/40 hover:shadow-md">
      {/* Video/Image Area */}
      <div className="aspect-video bg-[#0A0E17] relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#0A0E17]">
            <Video className="h-12 w-12 text-white/20" />
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
            {metrics.slice(0, 2).map((metric, i) => {
              const metricLabel = getLocalizedValue(metric.label, locale)
              const metricValue = getLocalizedValue(metric.value, locale)
              return (
                <div key={`${metricLabel}-${i}`} className="rounded-xl border border-white/[0.06] bg-[#0A0E17] p-3">
                  <div className="font-mono text-xl font-bold text-[#0066FF]">{metricValue}</div>
                  <div className="mt-1 text-xs text-white/50">{metricLabel}</div>
                </div>
              )
            })}
          </div>
        )}

        <h3 className="font-semibold text-white text-lg leading-snug">
          {title || t('untitled')}
        </h3>

        <p className="text-sm leading-6 text-white/50">
          {t('proofCard.description', { industry: industryLabel, country: caseStudy.country || t('proofCard.global') })}
        </p>

        <div className="mt-auto pt-2">
          <Link
            href={`/${locale}/case-studies/${caseStudy.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066FF] hover:text-[#0052CC] transition-colors"
          >
            {t('readMore')}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
