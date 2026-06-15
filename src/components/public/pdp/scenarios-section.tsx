import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { ScenarioItem } from '@/features/products/types/product'

interface ScenariosSectionProps {
  scenarios: ScenarioItem[]
  locale: string
}

export function ScenariosSection({ scenarios, locale }: ScenariosSectionProps) {
  const t = useTranslations('products')

  if (!scenarios || scenarios.length === 0) return null

  return (
    <section id="scenarios" className="py-20 bg-[#1A1F2E]">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.scenarios')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white lg:text-4xl">{t('pdp.scenariosDesc')}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-white/[0.06] bg-[#0A0E17] p-6 transition-all hover:-translate-y-1 hover:border-[#0066FF]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/15 flex items-center justify-center text-lg mb-4">
                {scenario.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">
                {getTranslation(scenario.title, locale, 'title') || getLocalizedValue(scenario.title, locale)}
              </h3>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">
                {getTranslation(scenario.description, locale, 'description') || getLocalizedValue(scenario.description, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
