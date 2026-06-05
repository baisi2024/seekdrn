'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CaseStudy {
  id: string
  created_at: string
  title: string
  category: string
  published: boolean
}

interface CaseStudiesClientProps {
  caseStudies: CaseStudy[]
}

export function CaseStudiesClient({ caseStudies }: CaseStudiesClientProps) {
  const t = useAdminTranslations()

  const columns = [
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
