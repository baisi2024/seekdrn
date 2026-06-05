import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface HeroConfig {
  title?: string
  subtitle?: string
  image_url?: string
  category?: string
  indicators?: { label: string; value: number }[]
}

interface HeroProps {
  heroConfig?: HeroConfig
}

export function Hero({ heroConfig }: HeroProps) {
  const t = useTranslations('home')
  const tc = useTranslations('common')

  const indicators = heroConfig?.indicators || [
    { label: 'Flight Range', value: 85 },
    { label: 'Payload Capacity', value: 70 },
    { label: 'Wind Resistance', value: 90 },
  ]

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Product Image Area */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gray-100 overflow-hidden relative">
              {heroConfig?.image_url ? (
                <img
                  src={heroConfig.image_url}
                  alt={heroConfig.title || t('hero.title')}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center text-gray-400">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm">Product Image</p>
                  </div>
                </div>
              )}
              {/* NEW Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600 text-white hover:bg-blue-700">NEW</Badge>
              </div>
              {/* Play Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
                  <Play className="w-6 h-6 text-blue-600 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content */}
          <div className="space-y-6">
            <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
              {heroConfig?.category || 'Industrial UAV'}
            </Badge>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {heroConfig?.title || t('hero.title')}
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed">
              {heroConfig?.subtitle || t('hero.subtitle')}
            </p>

            {/* Performance Indicators */}
            <div className="space-y-4">
              {indicators.map((indicator) => (
                <div key={indicator.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">{indicator.label}</span>
                    <span className="font-mono text-blue-600">{indicator.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${indicator.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Button render={<Link href="#demo-form" />} size="lg">
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
