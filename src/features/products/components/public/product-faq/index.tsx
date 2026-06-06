import type { ProductFAQ } from '@/features/products/types'
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
  const localizedFaqs = faqs.filter(f => f.locale === locale)

  if (localizedFaqs.length === 0) return null

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
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
