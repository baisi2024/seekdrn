'use client'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { useEffect, useState } from 'react'

export default function CaseStudiesPage() {
  const t = useAdminTranslations()
  const [caseStudies, setCaseStudies] = useState<any[]>([])

  useEffect(() => {
    async function fetchCaseStudies() {
      const { data } = await supabaseAdmin
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false })
      setCaseStudies(data || [])
    }
    fetchCaseStudies()
  }, [])

  const columns = [
    { key: 'created_at', label: t('date'), render: (item: any) => new Date(item.created_at).toLocaleDateString() },
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
        <h1 className="text-2xl font-bold">{t('case_studies_page.title')}</h1>
        <Link href="/admin/case-studies/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('case_studies_page.add')}
        </Link>
      </div>
      <DataTable
        data={caseStudies}
        columns={columns}
        searchPlaceholder={t('case_studies_page.searchPlaceholder')}
      />
    </div>
  )
}
