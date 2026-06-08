import Link from 'next/link'
import { ArrowRight, FileCheck2, Handshake, ShieldCheck } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

interface ComplianceSupportBlockProps {
  locale: string
  title: string
  subtitle: string
  quoteLabel: string
  packLabel: string
  policyLabel: string
}

export function ComplianceSupportBlock({ locale, title, subtitle, quoteLabel, packLabel, policyLabel }: ComplianceSupportBlockProps) {
  const items = [
    { icon: ShieldCheck, label: policyLabel },
    { icon: FileCheck2, label: packLabel },
    { icon: Handshake, label: quoteLabel },
  ]

  return (
    <section className="rounded-3xl border border-border bg-background p-6 shadow-sm lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-primary">{policyLabel}</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground lg:text-base">{subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/${locale}#demo-form`} className={buttonVariants()}>
              {quoteLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href={`/${locale}/products`} className={buttonVariants({ variant: 'outline' })}>
              {packLabel}
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-2xl border border-border bg-muted p-4">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
