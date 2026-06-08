'use client'

import Link from 'next/link'
import { trackCTAClick } from '@/lib/gtm'
import { buttonVariants } from '@/components/ui/button'
import { useLeadForm } from '@/components/public/lead-form-provider'
import type { VariantProps } from 'class-variance-authority'

interface CTALinkProps extends VariantProps<typeof buttonVariants> {
  href: string
  children: React.ReactNode
  trackingLocation: string
  trackingAction: string
  className?: string
  openForm?: boolean
  formIntent?: 'quote' | 'demo' | 'datasheet' | 'compliance' | 'partnership'
  formContext?: {
    productModel?: string
    solutionSlug?: string
    caseSlug?: string
  }
}

export function CTALink({
  href,
  children,
  trackingLocation,
  trackingAction,
  className,
  openForm: shouldOpenForm,
  formIntent,
  formContext,
  ...variantProps
}: CTALinkProps) {
  const { openForm } = useLeadForm()

  if (shouldOpenForm) {
    return (
      <button
        type="button"
        className={className || buttonVariants(variantProps)}
        onClick={() => {
          trackCTAClick(trackingLocation, trackingAction)
          openForm(formIntent, formContext)
        }}
      >
        {children}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className={className || buttonVariants(variantProps)}
      onClick={() => trackCTAClick(trackingLocation, trackingAction)}
    >
      {children}
    </Link>
  )
}
