'use client'

import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { useEffect, useState } from 'react'

export default function ProductsPage() {
  const t = useAdminTranslations()
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('sort_order')
        .order('created_at', { ascending: false })
      setProducts(data || [])
    }
    fetchProducts()
  }, [])

  const columns = [
    { key: 'model', label: t('model') },
    { key: 'category', label: t('category') },
    {
      key: 'published',
      label: t('status'),
      render: (item: any) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? t('published') : t('draft')}
        </Badge>
      )
    },
    {
      key: 'compliance_flag',
      label: t('compliance'),
      render: (item: any) => item.compliance_flag ? <Badge variant="destructive">{t('complianceRequired')}</Badge> : 'No'
    },
    { key: 'featured', label: t('featured'), render: (item: any) => item.featured ? '⭐' : '' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('products_page.title')}</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('products_page.add')}
        </Link>
      </div>
      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder={t('products_page.searchPlaceholder')}
        onRowClick={(item) => window.location.href = `/admin/products/${item.id}`}
      />
    </div>
  )
}
