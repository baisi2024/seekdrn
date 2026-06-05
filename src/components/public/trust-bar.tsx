import { useTranslations } from 'next-intl'

export function TrustBar() {
  const t = useTranslations('home')

  const stats = [
    { value: '50,000+', label: t('trustBar.flightHours') },
    { value: '120', label: t('trustBar.countries') },
    { value: '500+', label: t('trustBar.enterpriseClients') },
    { value: '24/7', label: t('trustBar.support') },
  ]

  return (
    <section className="bg-gray-900 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-3xl lg:text-4xl font-bold text-blue-500">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
