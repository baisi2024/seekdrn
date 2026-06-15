import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { PayloadItem } from '@/features/products/types/product'

interface PayloadEcosystemProps {
  payloads: PayloadItem[]
  locale: string
}

export function PayloadEcosystem({ payloads, locale }: PayloadEcosystemProps) {
  const t = useTranslations('products')

  if (!payloads || payloads.length === 0) return null

  return (
    <section id="payloads" className="py-20 bg-[#1A1F2E]">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.payloadEcosystem')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white lg:text-4xl">{t('pdp.payloadEcosystemDesc')}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {payloads.map((payload) => (
            <div key={payload.id} className="group rounded-2xl border border-white/[0.06] bg-[#0A0E17] overflow-hidden transition-all hover:-translate-y-1 hover:border-[#0066FF]/40">
              {payload.image && (
                <div className="aspect-[4/3] overflow-hidden bg-[#0A0E17]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={payload.image} alt={getTranslation(payload.name, locale, 'name') || getLocalizedValue(payload.name, locale)} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold text-white">
                  {getTranslation(payload.name, locale, 'name') || getLocalizedValue(payload.name, locale)}
                </h3>
                <p className="mt-2 text-sm text-white/50 line-clamp-2">
                  {getTranslation(payload.description, locale, 'description') || getLocalizedValue(payload.description, locale)}
                </p>
                {payload.specs && payload.specs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {payload.specs.slice(0, 3).map((spec, si) => (
                      <div key={si} className="flex justify-between text-sm">
                        <span className="text-white/40">{getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)}</span>
                        <span className="font-mono font-medium text-white">{getTranslation(spec.value, locale, 'value') || getLocalizedValue(spec.value, locale)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
