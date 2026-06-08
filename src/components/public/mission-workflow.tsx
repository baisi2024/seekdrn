import Link from 'next/link'
import { ArrowRight, FileCheck2, Route, ShieldCheck } from 'lucide-react'
import { LeadFormCTAButton } from './lead-form-cta-button'

interface WorkflowStep {
  title: string
  description: string
}

interface MissionWorkflowProps {
  title: string
  subtitle: string
  steps: WorkflowStep[]
  locale?: string
  ctaLabel?: string
  secondaryCtaLabel?: string
  solutionSlug?: string
}

export function MissionWorkflow({ title, subtitle, steps, locale, ctaLabel, secondaryCtaLabel, solutionSlug }: MissionWorkflowProps) {
  return (
    <section className="rounded-3xl border border-border bg-muted p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1 text-xs font-semibold text-primary">
            <Route className="h-3.5 w-3.5" />
            {title}
          </div>
          <p className="text-sm font-medium text-primary">{subtitle}</p>
          {locale && ctaLabel && secondaryCtaLabel && (
            <div className="mt-6 flex flex-wrap gap-3">
              <LeadFormCTAButton
                intent="quote"
                solutionSlug={solutionSlug}
                pageType="solution"
                locale={locale}
              >
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </LeadFormCTAButton>
              <Link href={`/${locale}/products`} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                {secondaryCtaLabel}
              </Link>
            </div>
          )}
        </div>
        <div className="grid gap-4">
          {steps.map((step, index) => {
            const Icon = index === 0 ? FileCheck2 : index === 1 ? ShieldCheck : Route
            return (
              <div key={step.title} className="grid gap-4 rounded-2xl border border-border bg-background p-5 sm:grid-cols-[auto_1fr]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
