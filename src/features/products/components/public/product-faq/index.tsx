import type { ProductFAQ } from '@/features/products/types'
import { useTranslations } from 'next-intl'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface ProductFAQProps {
  faqs: ProductFAQ[]
  locale: string
}

export function ProductFAQSection({ faqs, locale }: ProductFAQProps) {
  const t = useTranslations('products')
  const localizedFaqs = faqs.filter(f => f.locale === locale)

  if (localizedFaqs.length === 0) return null

  return (
    <section className="py-4">
      <Accordion type="single" collapsible className="w-full">
        {localizedFaqs.map((faq, index) => (
          <AccordionItem key={faq.id} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
