import { getLocalizedValue } from '@/lib/utils'
import type { CategoryHeroStat } from '@/features/products/types/product'

interface StatsBarProps {
  stats: CategoryHeroStat[]
  locale: string
}

export function StatsBar({ stats, locale }: StatsBarProps) {
  if (!stats || stats.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden mt-8">
      {stats.slice(0, 4).map((stat, index) => (
        <div key={index} className="bg-[#1A1F2E] px-6 py-5 text-center">
          <div className="font-mono text-2xl font-semibold text-white">
            {stat.value}
            {stat.unit && <span className="text-sm text-white/40 ml-1">{getLocalizedValue(stat.unit, locale)}</span>}
          </div>
          <div className="mt-1 text-xs text-white/40 uppercase tracking-wider">
            {getLocalizedValue(stat.label, locale)}
          </div>
        </div>
      ))}
    </div>
  )
}
