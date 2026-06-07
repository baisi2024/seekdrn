'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus, Edit } from 'lucide-react'
import { AdminPage } from '@/components/admin/core'

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
    {
      key: 'actions',
      label: t('actions'),
      render: (item: CaseStudy) => (
        <Link href={`/admin/case-studies/${item.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <Edit className="w-4 h-4 mr-1" />
          {t('edit')}
        </Link>
      )
    },
  ]

  return (
    <AdminPage
      title="case_studies_page.title"
      actions={
        <Link href="/admin/case-studies/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('case_studies_page.add')}
        </Link>
      }
    >
      <DataTable
        data={caseStudies}
        columns={columns}
        searchPlaceholder={t('case_studies_page.searchPlaceholder')}
      />
    </AdminPage>
  )
}
