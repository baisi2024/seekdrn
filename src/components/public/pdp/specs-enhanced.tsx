'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { SpecGroup, HeroMetric } from '@/features/products/types/product'

interface SpecsEnhancedProps {
  specGroups: SpecGroup[]
  heroMetrics?: HeroMetric[]
  locale: string
}

export function SpecsEnhanced({ specGroups, heroMetrics = [], locale }: SpecsEnhancedProps) {
  const t = useTranslations('products')
  const [activeTab, setActiveTab] = useState(0)

  const groups = specGroups.filter(g => g.specs && g.specs.length > 0)
  if (groups.length === 0 && heroMetrics.length === 0) return null

  return (
    <section id="specs" className="py-20">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.specsMetrics')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white lg:text-4xl">{t('pdp.specsTable')}</h2>

        {/* Metric Cards */}
        {heroMetrics.length > 0 && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {heroMetrics.slice(0, 5).map((metric) => (
              <div key={metric.key} className="bg-[#1A1F2E] px-5 py-6 text-center">
                <div className="font-mono text-2xl font-semibold text-white">
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

        {/* Spec Table with Tabs */}
        {groups.length > 0 && (
          <div className="mt-10">
            <div className="flex gap-1 bg-[#1A1F2E] border border-white/[0.06] rounded-xl p-1 mb-6 overflow-x-auto">
              {groups.map((group, index) => (
                <button
                  key={group.id}
                  onClick={() => setActiveTab(index)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === index
                      ? 'bg-[#0A0E17] text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {getTranslation(group.name, locale, 'name') || getLocalizedValue(group.name, locale)}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
              {groups[activeTab]?.specs.map((spec, index) => (
                <div key={index} className={`flex items-center justify-between px-6 py-4 ${index % 2 === 0 ? 'bg-[#1A1F2E]/50' : 'bg-transparent'}`}>
                  <span className="text-sm text-white/60">
                    {getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)}
                  </span>
                  <span className="font-mono text-sm font-medium text-white">
                    {getTranslation(spec.value, locale, 'value') || getLocalizedValue(spec.value, locale)}
                    {spec.unit && <span className="text-white/40 ml-1">{getLocalizedValue(spec.unit, locale)}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
