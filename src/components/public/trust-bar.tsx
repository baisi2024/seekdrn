import { useTranslations, useLocale } from 'next-intl'
import { getTranslation } from '@/lib/utils'

interface TrustBarConfig {
  stats?: Array<{ label: Record<string, string>; value: string }>
}

interface TrustBarProps {
  config?: TrustBarConfig | null
}

export function TrustBar({ config }: TrustBarProps) {
  const t = useTranslations('home')
  const locale = useLocale()

  const stats = config?.stats?.map(s => ({
    value: s.value,
    label: getTranslation(s.label, locale, 'label') || Object.values(s.label)[0] || ''
  })) || [
    { value: '50,000+', label: t('trustBar.flightHours') },
    { value: '120', label: t('trustBar.countries') },
    { value: '500+', label: t('trustBar.enterpriseClients') },
    { value: '24/7', label: t('trustBar.support') },
  ]

  return (
    <section className="relative border-y border-white/[0.06] bg-[#0A0E17] py-10 overflow-hidden">
      {/* Grid background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-3xl lg:text-4xl font-bold text-[#0066FF]">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-white/50 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}