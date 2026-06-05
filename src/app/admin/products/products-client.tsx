'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'

interface Product {
  id: string
  model: string
  category: string
  published: boolean
  compliance_flag: string
  featured: boolean
}

export function ProductsPageHeader() {
  const t = useAdminTranslations()
  return <h1 className="text-2xl font-bold">{t('products_page.title')}</h1>
}

export function ProductsAddButton() {
  const t = useAdminTranslations()
  return <>{t('products_page.add')}</>
}

export function ProductsSearchPlaceholder() {
  const t = useAdminTranslations()
  return t('products_page.searchPlaceholder')
}

export function ProductsColumns() {
  const t = useAdminTranslations()
  
  return [
    { key: 'model', label: t('model') },
    { key: 'category', label: t('category') },
    {
      key: 'published',
      label: t('status'),
      render: (item: Product) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? t('published') : t('draft')}
        </Badge>
      )
    },
    {
      key: 'compliance_flag',
      label: t('compliance'),
      render: (item: Product) => item.compliance_flag ? <Badge variant="destructive">{t('complianceRequired')}</Badge> : 'No'
    },
    { key: 'featured', label: t('featured'), render: (item: Product) => item.featured ? '⭐' : '' },
  ]
}
