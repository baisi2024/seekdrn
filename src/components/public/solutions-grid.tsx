import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Shield, Zap, Map, Leaf, Radar, Cog } from 'lucide-react'
import { getTranslation } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield, zap: Zap, map: Map, leaf: Leaf,
  radar: Radar, cog: Cog, drone: Shield, default: Shield,
}

interface Solution {
  id: string
  slug: string
  icon?: string
  translations: Record<string, Record<string, string>>
}

interface SolutionsGridProps {
  solutions: Solution[]
  locale: string
}

export function SolutionsGrid({ solutions, locale }: SolutionsGridProps) {
  const t = useTranslations('home')

  if (solutions.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">{t('solutions.title')}</h2>
          <p className="text-muted-foreground">Solutions coming soon.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t('solutions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {solutions.map((solution) => {
            const Icon = iconMap[solution.icon || ''] || iconMap.default
            const label = getTranslation(solution.translations, locale, 'title')

            return (
              <Link
                key={solution.id}
                href={`/${locale}/solutions/${solution.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}