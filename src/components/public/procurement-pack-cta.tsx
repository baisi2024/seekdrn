import { FileText, MessageSquare, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { LeadFormCTAButton } from './lead-form-cta-button'

interface ProcurementPackCTAProps {
  locale: string
  title: string
  subtitle: string
  datasheetLabel: string
  supportLabel: string
  complianceLabel: string
  hasDocuments?: boolean
  productModel?: string
}

export function ProcurementPackCTA({
  locale,
  title,
  subtitle,
  datasheetLabel,
  supportLabel,
  complianceLabel,
  hasDocuments,
  productModel,
}: ProcurementPackCTAProps) {
  return (
    <section className="rounded-3xl border border-border bg-muted p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold text-primary">
            {complianceLabel}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground lg:text-base">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {hasDocuments && (
            <LeadFormCTAButton
              intent="datasheet"
              productModel={productModel}
              pageType="product"
              locale={locale}
              variant="outline"
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
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {supportLabel}
          </LeadFormCTAButton>
          <Link href={`/${locale}/compliance`} className="inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium hover:bg-secondary/80">
            <ShieldCheck className="mr-2 h-4 w-4" />
            {complianceLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
