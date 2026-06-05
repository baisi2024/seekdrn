'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'

interface Solution {
  id: string
  title: string
  category: string
  published: boolean
}

export function SolutionsPageHeader() {
  const t = useAdminTranslations()
  return <h1 className="text-2xl font-bold">{t('solutions_page.title')}</h1>
}

export function SolutionsAddButton() {
  const t = useAdminTranslations()
  return <>{t('solutions_page.add')}</>
}

export function SolutionsSearchPlaceholder() {
  const t = useAdminTranslations()
  return t('solutions_page.searchPlaceholder')
}

export function SolutionsColumns() {
  const t = useAdminTranslations()
  
  return [
    { key: 'title', label: t('title_field') },
    { key: 'category', label: t('category') },
    {
      key: 'published',
      label: t('status'),
      render: (item: Solution) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? t('published') : t('draft')}
        </Badge>
      )
    },
  ]
}
