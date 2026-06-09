import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslation, getLocalizedValue } from '@/lib/utils'

interface HeroConfig {
  title?: Record<string, string>
  subtitle?: Record<string, string>
  image_url?: string
  category?: string | Record<string, string>
  indicators?: Array<{ label: string | Record<string, string>; value: number | string }>
}

interface HeroProps {
  heroConfig?: HeroConfig | null
}

export function Hero({ heroConfig }: HeroProps) {
  const t = useTranslations('home')
  const tc = useTranslations('common')
  const locale = useLocale()

  const title = heroConfig?.title
    ? getTranslation(heroConfig.title, locale, 'title')
    : t('hero.title')
  const subtitle = heroConfig?.subtitle
    ? getTranslation(heroConfig.subtitle, locale, 'subtitle')
    : t('hero.subtitle')
  const category = heroConfig?.category
    ? getLocalizedValue(heroConfig.category, locale)
    : t('hero.category')
  const imageUrl = heroConfig?.image_url || null
  const indicators = heroConfig?.indicators || []
  const proofItems = [
    { icon: FileText, label: t('hero.indicators.procurement') },
    { icon: ShieldCheck, label: t('hero.indicators.deployment') },
    { icon: CheckCircle2, label: t('hero.indicators.support') },
  ]

  return (
    <section className="relative overflow-hidden bg-[#0A0E17]">
      {/* 背景网格 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-4 py-16 lg:py-20 relative">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="text-xs font-semibold border-[#0066FF]/30 text-[#0066FF] bg-[#0066FF]/8">
              {category}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white lg:text-6xl">{title}</h1>
            <p className="max-w-2xl text-lg leading-8 text-white/50">{subtitle}</p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button render={<Link href="#demo-form" />} nativeButton={false} size="lg" className="bg-[#0066FF] text-white hover:bg-[#0052CC]">
                {tc('cta.requestQuote')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button render={<Link href={`/${locale}/products`} />} nativeButton={false} variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                {tc('cta.exploreProducts')}
              </Button>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {proofItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-[#1A1F2E] p-4">
                    <Icon className="h-5 w-5 text-[#0066FF]" />
                    <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/[0.06] bg-[#1A1F2E]">
              {imageUrl ? (
                <Image src={imageUrl} alt={title} fill className="object-cover" priority />
              ) : (
                <Image
                  src="/globe.svg"
                  alt={title}
                  fill
                  className="object-contain p-16 opacity-70"
                  priority
                />
              )}
              {indicators.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 grid gap-2 rounded-2xl border border-white/[0.06] bg-[#0A0E17]/95 p-4">
                  {indicators.slice(0, 3).map((indicator, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-white/50">{getLocalizedValue(indicator.label, locale)}</span>
                      <span className="font-mono font-semibold text-[#0066FF]">{indicator.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
