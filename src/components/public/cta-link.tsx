'use client'

import Link from 'next/link'
import { trackCTAClick } from '@/lib/gtm'
import { buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'

interface CTALinkProps extends VariantProps<typeof buttonVariants> {
  href: string
  children: React.ReactNode
  trackingLocation: string
  trackingAction: string
  className?: string
}

export function CTALink({
  href,
  children,
  trackingLocation,
  trackingAction,
  className,
  ...variantProps
}: CTALinkProps) {
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
