'use client'

import { useLeadForm } from './lead-form-provider'
import { buttonVariants } from '@/components/ui/button'
import { trackInlineFormOpen } from '@/lib/gtm'
import { useAnalytics } from '@/hooks/use-analytics'
import type { VariantProps } from 'class-variance-authority'

interface LeadFormCTAButtonProps extends VariantProps<typeof buttonVariants> {
  intent: 'quote' | 'demo' | 'datasheet' | 'compliance' | 'partnership'
  productModel?: string
  solutionSlug?: string
  caseSlug?: string
  pageType?: string
  locale?: string
  className?: string
  buttonText?: string
  children: React.ReactNode
}

export function LeadFormCTAButton({
  intent,
  productModel,
  solutionSlug,
  caseSlug,
  pageType = 'product',
  locale = 'en',
  className,
  buttonText,
  children,
  ...variantProps
}: LeadFormCTAButtonProps) {
  const { openForm } = useLeadForm()
  const { trackCTA } = useAnalytics(locale)

  const handleClick = () => {
    // 追踪 CTA 点击
    const location = pageType || 'product'
    const text = buttonText || intent
    trackCTA(location, text, {
      intent,
      product_model: productModel,
      solution_slug: solutionSlug,
      case_slug: caseSlug,
    })

    // 追踪表单打开
    trackInlineFormOpen({
      page_type: pageType,
      intent,
      product_model: productModel,
      solution_slug: solutionSlug,
      case_slug: caseSlug,
      locale,
    })

    openForm(intent, { productModel, solutionSlug, caseSlug })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className || buttonVariants(variantProps)}
    >
      {children}
    </button>
  )
}
