import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Play } from 'lucide-react'
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
  const category = heroConfig?.category || 'Industrial UAV'
  const imageUrl = heroConfig?.image_url || null
  const indicators = heroConfig?.indicators || [
    { label: 'Flight Range', value: 85 },
    { label: 'Payload Capacity', value: 70 },
    { label: 'Wind Resistance', value: 90 },
  ]

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-muted overflow-hidden relative">
              {imageUrl ? (
                <Image src={imageUrl} alt={title} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <svg className="w-24 h-24 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge>{category}</Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-background/90 shadow-lg flex items-center justify-center cursor-pointer hover:bg-background transition-colors">
                  <Play className="w-6 h-6 text-primary ml-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
              {category}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{subtitle}</p>

            <div className="space-y-4">
              {indicators.map((indicator) => (
                <div key={indicator.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{indicator.label}</span>
                    <span className="font-mono text-primary">{indicator.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${indicator.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button render={<Link href="#demo-form" />} nativeButton={false} size="lg">
                {tc('cta.requestDemo')}
              </Button>
              <Button variant="outline" size="lg">
                {tc('cta.downloadSpec')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}