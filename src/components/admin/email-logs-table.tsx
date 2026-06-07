'use client'

import { DataTable } from './data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface EmailLog {
  id: string
  template_key: string
  recipient_email: string
  language: string
  status: string
  sent_at: string | null
  created_at: string
}

interface EmailLogsTableProps {
  data: EmailLog[]
}

export function EmailLogsTable({ data }: EmailLogsTableProps) {
  const columns = [
    { key: 'recipient_email', label: 'Recipient' },
    { key: 'template_key', label: 'Template' },
    { key: 'language', label: 'Language' },
    {
      key: 'status',
      label: 'Status',
      render: (item: EmailLog) => {
        const variant =
          item.status === 'sent'
            ? 'default'
            : item.status === 'failed'
            ? 'destructive'
            : 'secondary'
        return <Badge variant={variant}>{item.status}</Badge>
      },
    },
    {
      key: 'sent_at',
      label: 'Sent At',
      render: (item: EmailLog) => {
        if (!item.sent_at) return '-'
        return new Date(item.sent_at).toLocaleString()
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: EmailLog) => (
        <Link href={`/admin/email-logs/${item.id}`}>
          <Button size="sm" variant="outline">
            View
          </Button>
        </Link>
      ),
    },
  ]

  return <DataTable columns={columns} data={data} />
}