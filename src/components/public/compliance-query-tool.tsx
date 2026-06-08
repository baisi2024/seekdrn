'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LeadFormCTAButton } from '@/components/public/lead-form-cta-button'
import { screen } from '@/lib/compliance'

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Bulgaria', 'Cambodia', 'Cameroon',
  'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cuba', 'Czech Republic',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Ethiopia', 'Finland',
  'France', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Hungary', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan',
  'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Libya',
  'Lithuania', 'Malaysia', 'Mexico', 'Morocco', 'Myanmar', 'Nepal',
  'Netherlands', 'New Zealand', 'Nigeria', 'North Korea', 'Norway', 'Oman',
  'Pakistan', 'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Singapore', 'Slovakia', 'South Africa', 'South Korea', 'Spain',
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
]

interface ComplianceQueryToolProps {
  locale: string
}

export function ComplianceQueryTool({ locale }: ComplianceQueryToolProps) {
  const t = useTranslations('compliance.query_tool')
  const [selectedCountry, setSelectedCountry] = useState<string>('')

  const status = selectedCountry ? screen(selectedCountry, '') : null

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t('title')}</h2>
        </div>

        <Select value={selectedCountry} onValueChange={(value) => setSelectedCountry(value ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('select_country')} />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {status && (
          <div className="mt-4">
            {status === 'blocked' ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('restricted')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('contact_compliance')}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <LeadFormCTAButton
                    intent="compliance"
                    pageType="compliance"
                    locale={locale}
                    size="sm"
                  >
                    {t('contact_compliance')}
                  </LeadFormCTAButton>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{t('available')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('request_availability')}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <LeadFormCTAButton
                    intent="quote"
                    pageType="compliance"
                    locale={locale}
                    size="sm"
                  >
                    {t('request_availability')}
                  </LeadFormCTAButton>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
