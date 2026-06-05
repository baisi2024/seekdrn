'use client'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { useEffect, useState } from 'react'

export default function SolutionsPage() {
  const t = useAdminTranslations()
  const [solutions, setSolutions] = useState<any[]>([])

  useEffect(() => {
    async function fetchSolutions() {
      const { data } = await supabaseAdmin
        .from('solutions')
        .select('*')
        .order('sort_order')
        .order('created_at', { ascending: false })
      setSolutions(data || [])
    }
    fetchSolutions()
  }, [])

  const columns = [
    { key: 'title', label: t('title_field') },
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
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('solutions_page.title')}</h1>
        <Link href="/admin/solutions/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('solutions_page.add')}
        </Link>
      </div>
      <DataTable
        data={solutions}
        columns={columns}
        searchPlaceholder={t('solutions_page.searchPlaceholder')}
      />
    </div>
  )
}
