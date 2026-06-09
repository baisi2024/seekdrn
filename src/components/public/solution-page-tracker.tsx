'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'

interface SolutionPageTrackerProps {
  solutionSlug: string
  solutionName: string
  locale: string
}

export function SolutionPageTracker({
  solutionSlug,
  solutionName,
  locale,
}: SolutionPageTrackerProps) {
  const analytics = useAnalytics(locale)

  useEffect(() => {
    analytics.trackPageView('solution', {
      solution_slug: solutionSlug,
      solution_name: solutionName,
    })
  }, [analytics, solutionSlug, solutionName])

  return null
}
