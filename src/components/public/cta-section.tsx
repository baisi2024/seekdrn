import Link from 'next/link'
import { useLocale } from 'next-intl'
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

  const title = config?.title
    ? getTranslation(config.title, locale, 'title')
    : (locale === 'zh' ? '准备好见证我们的解决方案了吗？' : 'Ready to see our solutions in action?')

  const subtitle = config?.subtitle
    ? getTranslation(config.subtitle, locale, 'subtitle')
    : (locale === 'zh' ? '与我们的团队预约现场演示。' : 'Schedule a live demo with our team.')

  const buttonText = config?.button_text
    ? getTranslation(config.button_text, locale, 'text')
    : (locale === 'zh' ? '申请演示' : 'Request a Demo')

  return (
    <section className="py-16 lg:py-24 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">{title}</h2>
        <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">{subtitle}</p>
        <Button
          render={<Link href="#demo-form" />}
          nativeButton={false}
          size="lg"
          variant="secondary"
        >
          {buttonText}
        </Button>
      </div>
    </section>
  )
}