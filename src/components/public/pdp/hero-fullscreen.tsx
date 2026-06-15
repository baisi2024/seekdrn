'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Product, HeroMetric } from '@/features/products/types/product'

interface HeroFullscreenProps {
  product: Product
  locale: string
}

export function HeroFullscreen({ product, locale }: HeroFullscreenProps) {
  const t = useTranslations('products')
  const name = getTranslation(product.translations || {}, locale, 'name')
  const overview = getTranslation(product.translations || {}, locale, 'overview')
  const metrics: HeroMetric[] = product.hero_metrics || []
  const bgImage = product.hero_image || (product.images && product.images[0]) || ''
  const categoryLabel = product.category?.translations
    ? getTranslation(product.category.translations, locale, 'name')
    : null

  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden">
      {/* Background image */}
      {bgImage && (
        <div className="absolute inset-0">
          <Image src={bgImage} alt={name || product.model || ''} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/70 to-transparent" />
        </div>
      )}
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container relative mx-auto px-4 pb-16 pt-32">
        <div className="max-w-3xl">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.model && <Badge className="font-mono text-xs bg-[#0066FF]">{product.model}</Badge>}
            {categoryLabel && <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">{categoryLabel}</Badge>}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-6xl">{name || product.model}</h1>
          {overview && <p className="mt-4 text-lg text-white/60 max-w-2xl leading-relaxed">{overview}</p>}

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#lead-form" className="inline-flex items-center justify-center rounded-xl bg-[#0066FF] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]">
              {t('requestQuote')}
            </a>
            <a href="#lead-form" className="inline-flex items-center justify-center rounded-xl border border-white/[0.15] bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              {t('scheduleDemo')}
            </a>
          </div>
        </div>

        {/* Hero Metrics */}
        {metrics.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {metrics.slice(0, 4).map((metric) => (
              <div key={metric.key} className="bg-[#1A1F2E] px-6 py-5 text-center">
                <div className="font-mono text-3xl font-semibold text-white">
                  {metric.value}
                  {metric.unit && <span className="text-sm text-white/40 ml-1">{getLocalizedValue(metric.unit, locale)}</span>}
                </div>
                <div className="mt-1 text-xs text-white/40 uppercase tracking-wider">
                  {getTranslation(metric.label, locale, 'label') || getLocalizedValue(metric.label, locale)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
