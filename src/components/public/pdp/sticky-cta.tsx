'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export function StickyCta() {
  const t = useTranslations('products')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur-lg transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <span className="text-sm font-medium text-white/60">{t('pdp.stickyCta.quote')}</span>
        <div className="flex gap-2">
          <a href="#lead-form" className="rounded-lg bg-[#0066FF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0052CC] transition-colors">
            {t('pdp.stickyCta.quote')}
          </a>
          <a href="#lead-form" className="rounded-lg border border-white/[0.15] px-5 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors">
            {t('pdp.stickyCta.demo')}
          </a>
        </div>
      </div>
    </div>
  )
}
