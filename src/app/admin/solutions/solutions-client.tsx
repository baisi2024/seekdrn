'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Solution {
  id: string
  title: string
  category: string
  published: boolean
}

interface SolutionsClientProps {
  solutions: Solution[]
}

export function SolutionsClient({ solutions }: SolutionsClientProps) {
  const t = useAdminTranslations()

  const columns = [
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
