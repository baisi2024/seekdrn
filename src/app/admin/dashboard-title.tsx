'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'

export function DashboardTitle() {
  const t = useAdminTranslations()
  return <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>
}

export function InquiryCardTitle() {
  const t = useAdminTranslations()
  return <>{t('inquiries')}</>
}

export function ProductCardTitle() {
  const t = useAdminTranslations()
  return <>{t('products')}</>
}

export function CaseStudyCardTitle() {
  const t = useAdminTranslations()
  return <>{t('caseStudies')}</>
}
