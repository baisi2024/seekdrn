'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AdminPage } from '@/components/admin/core'

interface Product {
  id: string
  model: string
  category: string
  published: boolean
  compliance_flag: string
  featured: boolean
}

interface ProductsClientProps {
  products: Product[]
}

export function ProductsClient({ products }: ProductsClientProps) {
  const t = useAdminTranslations()

  const columns = [
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

  return (
    <AdminPage
      title="products_page.title"
      actions={
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('products_page.add')}
        </Link>
      }
    >
      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder={t('products_page.searchPlaceholder')}
        onRowClick={(item) => window.location.href = `/admin/products/${item.id}`}
      />
    </AdminPage>
  )
}
