'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { trackFilterApply } from '@/lib/gtm'

interface CaseStudiesFilterProps {
  industries: string[]
  countries: string[]
  currentIndustry: string
  currentCountry: string
  locale: string
}

export function CaseStudiesFilter({
  industries,
  countries,
  currentIndustry,
  currentCountry,
  locale,
}: CaseStudiesFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations('case-studies')

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams],
  )

  const handleIndustryChange = (value: string) => {
    trackFilterApply('industry', value || 'all', { locale })
    router.push(`${pathname}?${createQueryString('industry', value)}`)
  }

  const handleCountryChange = (value: string) => {
    trackFilterApply('country', value || 'all', { locale })
    router.push(`${pathname}?${createQueryString('country', value)}`)
  }

  if (industries.length === 0 && countries.length === 0) return null

  return (
    <div className="mb-8 flex flex-wrap items-center gap-4">
      {industries.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">{t('filter_industry')}:</label>
          <select
            value={currentIndustry}
            onChange={(e) => handleIndustryChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('filter_all')}</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
      )}

      {countries.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">{t('filter_country')}:</label>
          <select
            value={currentCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">{t('filter_all')}</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
