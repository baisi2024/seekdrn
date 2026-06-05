'use client'

import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'

interface Solution {
  id: string
  title: string
  category: string
  published: boolean
}

export function SolutionsTable({ solutions }: { solutions: Solution[] }) {
  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    {
      key: 'published',
      label: 'Status',
      render: (item: Solution) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? 'Published' : 'Draft'}
        </Badge>
      )
    },
  ]

  return (
    <DataTable
      data={solutions}
      columns={columns}
      searchPlaceholder="Search solutions..."
    />
  )
}
