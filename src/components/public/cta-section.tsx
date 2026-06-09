import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/utils'

interface CtaConfig {
  title?: Record<string, string>
  subtitle?: Record<string, string>
  button_text?: Record<string, string>
}

interface CTASectionProps {
  config?: CtaConfig | null
}

export function CTASection({ config }: CTASectionProps) {
  const locale = useLocale()
  const t = useTranslations('home')

  const title = config?.title
    ? getTranslation(config.title, locale, 'title')
    : t('ctaSection.title')

  const subtitle = config?.subtitle
    ? getTranslation(config.subtitle, locale, 'subtitle')
    : t('ctaSection.subtitle')

  const buttonText = config?.button_text
    ? getTranslation(config.button_text, locale, 'text')
    : t('ctaSection.button')

  return (
    <section className="bg-[#1A1F2E] py-16 lg:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.06] bg-[#0A0E17] p-8 lg:p-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-white/50 mb-8 max-w-2xl mx-auto">{subtitle}</p>
          <Button
            render={<Link href="#demo-form" />}
            nativeButton={false}
            size="lg"
            className="bg-[#0066FF] text-white hover:bg-[#0052CC]"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  )
}
