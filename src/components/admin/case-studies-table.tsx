'use client'

import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'

interface CaseStudy {
  id: string
  created_at: string
  title: string
  category: string
  published: boolean
}

export function CaseStudiesTable({ caseStudies }: { caseStudies: CaseStudy[] }) {
  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (item: CaseStudy) => new Date(item.created_at).toLocaleDateString()
    },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    {
      key: 'published',
      label: 'Status',
      render: (item: CaseStudy) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
  ]

  return (
    <DataTable
      data={caseStudies}
      columns={columns}
      searchPlaceholder="Search case studies..."
    />
  )
}
