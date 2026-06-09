'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'

interface CaseStudyTrackerProps {
  caseSlug: string
  caseName: string
  locale: string
}

export function CaseStudyTracker({
  caseSlug,
  caseName,
  locale,
}: CaseStudyTrackerProps) {
  const analytics = useAnalytics(locale)

  useEffect(() => {
    analytics.trackPageView('case', {
      case_slug: caseSlug,
      case_name: caseName,
    })
  }, [analytics, caseSlug, caseName])

  return null
}
