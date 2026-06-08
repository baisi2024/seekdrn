'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import { AdminPage } from '@/components/admin/core/admin-page'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Solution {
  id: string
  slug: string
  icon: string
  translations: Record<string, Record<string, string>>
  published: boolean
  sort_order: number
  created_at: string
}

interface SolutionsClientProps {
  solutions: Solution[]
}

export function SolutionsClient({ solutions }: SolutionsClientProps) {
  const t = useAdminTranslations()

  const columns = [
    {
      key: 'slug',
      label: t('slug'),
    },
    {
      key: 'title',
      label: t('title_field'),
      render: (item: Solution) => {
        const title = item.translations?.en?.title || item.translations?.zh?.title || '-'
        return <span>{title}</span>
      }
    },
    {
      key: 'published',
      label: t('status'),
      render: (item: Solution) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? t('published') : t('draft')}
        </Badge>
      )
    },
    {
      key: 'sort_order',
      label: t('sort_order'),
    },
  ]

  return (
    <AdminPage
      title="solutions_page.title"
      actions={
        <Link href="/admin/solutions/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('solutions_page.add')}
        </Link>
      }
    >
      <DataTable
        data={solutions}
        columns={columns}
        searchPlaceholder={t('solutions_page.searchPlaceholder')}
        onRowClick={(item) => window.location.href = `/admin/solutions/${item.id}`}
      />
    </AdminPage>
  )
}
