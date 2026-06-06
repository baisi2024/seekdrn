'use client'

import { DataTable } from './data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface EmailTemplate {
  id: string
  template_key: string
  description: string | null
  is_active: boolean
  updated_at: string
}

interface EmailTemplatesTableProps {
  data: EmailTemplate[]
}

export function EmailTemplatesTable({ data }: EmailTemplatesTableProps) {
  const columns = [
    {
      key: 'template_key' as const,
      label: 'Template Key',
    },
    {
      key: 'description' as const,
      label: 'Description',
    },
    {
      key: 'is_active' as const,
      label: 'Status',
      render: (item: EmailTemplate) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'updated_at' as const,
      label: 'Updated',
      render: (item: EmailTemplate) => {
        const date = new Date(item.updated_at)
        return date.toLocaleDateString()
      },
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (item: EmailTemplate) => (
        <div className="flex gap-2">
          <Link href={`/admin/email-templates/${item.template_key}`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={data} />
}
