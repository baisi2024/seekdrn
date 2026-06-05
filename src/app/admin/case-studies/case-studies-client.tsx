'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'

interface CaseStudy {
  id: string
  created_at: string
  title: string
  category: string
  published: boolean
}

export function CaseStudiesPageHeader() {
  const t = useAdminTranslations()
  return <h1 className="text-2xl font-bold">{t('case_studies_page.title')}</h1>
}

export function CaseStudiesAddButton() {
  const t = useAdminTranslations()
  return <>{t('case_studies_page.add')}</>
}

export function CaseStudiesSearchPlaceholder() {
  const t = useAdminTranslations()
  return t('case_studies_page.searchPlaceholder')
}

export function CaseStudiesColumns() {
  const t = useAdminTranslations()
  
  return [
    { key: 'created_at', label: t('date'), render: (item: CaseStudy) => new Date(item.created_at).toLocaleDateString() },
    { key: 'title', label: t('title_field') },
    { key: 'category', label: t('category') },
    {
      key: 'published',
      label: t('status'),
      render: (item: CaseStudy) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? t('published') : t('draft')}
        </Badge>
      )
    },
  ]
}
