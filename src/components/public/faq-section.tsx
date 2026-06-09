'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FAQ {
  id: string
  translations: Record<string, { question: string; answer: string }>
  sort_order: number
  published: boolean
  created_at: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  locale: string
}

export function FAQSection({ faqs, locale }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const t = useTranslations('home')

  if (faqs.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-[#1A1F2E]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          {t('faq.title')}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const ft = faq.translations?.[locale] || faq.translations?.['en']
            if (!ft) return null
            const isOpen = openId === faq.id

            return (
              <div key={faq.id} className="rounded-2xl border border-white/[0.06] bg-[#0A0E17] overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-white pr-4">{ft.question}</span>
                  <ChevronDown className={`w-5 h-5 text-white/50 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-white/50 text-sm leading-relaxed">
                    {ft.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}