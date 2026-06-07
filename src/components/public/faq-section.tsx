'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

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

  if (faqs.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
          {locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const t = faq.translations?.[locale] || faq.translations?.['en']
            if (!t) return null
            const isOpen = openId === faq.id

            return (
              <div key={faq.id} className="rounded-lg border border-border bg-background overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{t.question}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">
                    {t.answer}
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