import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { FeatureBlock } from '@/features/products/types/product'

interface FeaturesSectionProps {
  features: FeatureBlock[]
  locale: string
}

export function FeaturesSection({ features, locale }: FeaturesSectionProps) {
  const t = useTranslations('products')

  if (!features || features.length === 0) return null

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.features')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white lg:text-4xl">{t('pdp.featuresDesc')}</h2>

        <div className="mt-12 space-y-20">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1
            return (
              <div key={feature.id} className={`flex flex-col gap-10 lg:flex-row lg:items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  {feature.image && (
                    <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#1A1F2E]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={feature.image} alt={getTranslation(feature.title, locale, 'title') || getLocalizedValue(feature.title, locale)} className="w-full aspect-video object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight text-white">
                    {getTranslation(feature.title, locale, 'title') || getLocalizedValue(feature.title, locale)}
                  </h3>
                  <p className="mt-4 text-white/60 leading-relaxed">
                    {getTranslation(feature.description, locale, 'description') || getLocalizedValue(feature.description, locale)}
                  </p>
                  {feature.specs && feature.specs.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {feature.specs.map((spec, si) => (
                        <div key={si} className="rounded-xl border border-white/[0.06] bg-[#1A1F2E] p-4">
                          <div className="text-xs text-white/40 uppercase tracking-wider">
                            {getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)}
                          </div>
                          <div className="mt-1 font-mono text-lg font-semibold text-white">
                            {getTranslation(spec.value, locale, 'value') || getLocalizedValue(spec.value, locale)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
