import { CheckCircle2, FileText, MessageSquare } from 'lucide-react'
import { LeadFormCTAButton } from './lead-form-cta-button'

interface DecisionItem {
  label: string
  value: string
}

interface ProcurementDecisionBarProps {
  locale: string
  title: string
  items: DecisionItem[]
  quoteLabel: string
  datasheetLabel: string
  hasDocuments?: boolean
  productModel?: string
}

export function ProcurementDecisionBar({ locale, title, items, quoteLabel, datasheetLabel, hasDocuments, productModel }: ProcurementDecisionBarProps) {
  return (
    <section className="border-y border-border bg-background">
      <div className="container mx-auto px-4 py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {items.map((item) => (
                <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-foreground">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasDocuments && (
              <LeadFormCTAButton
                intent="datasheet"
                productModel={productModel}
                pageType="product"
                locale={locale}
                variant="outline"
                size="sm"
              >
                <FileText className="mr-2 h-4 w-4" />
                {datasheetLabel}
              </LeadFormCTAButton>
            )}
            <LeadFormCTAButton
              intent="quote"
              productModel={productModel}
              pageType="product"
              locale={locale}
              size="sm"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {quoteLabel}
            </LeadFormCTAButton>
          </div>
        </div>
      </div>
    </section>
  )
}
