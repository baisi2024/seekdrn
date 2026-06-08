import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'

interface HeroConfig {
  title?: Record<string, string>
  subtitle?: Record<string, string>
  image_url?: string
  category?: string
  indicators?: Array<{ label: string; value: number }>
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
  const category = heroConfig?.category || t('hero.category')
  const imageUrl = heroConfig?.image_url || null
  const indicators = heroConfig?.indicators || []
  const proofItems = [
    { icon: FileText, label: t('hero.indicators.procurement') },
    { icon: ShieldCheck, label: t('hero.indicators.deployment') },
    { icon: CheckCircle2, label: t('hero.indicators.support') },
  ]

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="text-xs font-semibold">
              {category}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-foreground lg:text-6xl">{title}</h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{subtitle}</p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button render={<Link href="#demo-form" />} nativeButton={false} size="lg">
                {tc('cta.requestQuote')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button render={<Link href={`/${locale}/products`} />} nativeButton={false} variant="outline" size="lg">
                {tc('cta.exploreProducts')}
              </Button>
            </div>

            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {proofItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-2xl border border-border bg-muted p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-foreground">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-muted shadow-sm">
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
                <div className="absolute bottom-4 left-4 right-4 grid gap-2 rounded-2xl border border-background/70 bg-background/95 p-4 shadow-sm">
                  {indicators.slice(0, 3).map((indicator) => (
                    <div key={indicator.label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{indicator.label}</span>
                      <span className="font-mono font-semibold text-primary">{indicator.value}</span>
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