import { useTranslations } from 'next-intl'

export function PlpBottomCta() {
  const t = useTranslations('products')

  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-br from-[#0066FF]/8 to-[#0A0E17]">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">{t('plp.cantFind')}</h2>
          <p className="mt-4 text-white/60">{t('plp.cantFindDesc')}</p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="#lead-form" className="inline-flex items-center justify-center rounded-xl bg-[#0066FF] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]">
              {t('plp.requestQuote')}
            </a>
            <a href="#lead-form" className="inline-flex items-center justify-center rounded-xl border border-white/[0.15] bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              {t('plp.talkExpert')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
