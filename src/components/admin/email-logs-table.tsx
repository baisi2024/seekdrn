'use client'

import { DataTable } from './data-table'
import { ColumnDef } from '@tanstack/react-table'
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

const columns: ColumnDef<EmailLog>[] = [
  {
    accessorKey: 'recipient_email',
    header: 'Recipient',
  },
  {
    accessorKey: 'template_key',
    header: 'Template',
  },
  {
    accessorKey: 'language',
    header: 'Language',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      const variant =
        status === 'sent'
          ? 'default'
          : status === 'failed'
          ? 'destructive'
          : 'secondary'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'sent_at',
    header: 'Sent At',
    cell: ({ row }) => {
      const sentAt = row.getValue('sent_at')
      if (!sentAt) return '-'
      return new Date(sentAt as string).toLocaleString()
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const log = row.original
      return (
        <Link href={`/admin/email-logs/${log.id}`}>
          <Button size="sm" variant="outline">
            View
          </Button>
        </Link>
      )
    },
  },
]

interface EmailLogsTableProps {
  data: EmailLog[]
}

export function EmailLogsTable({ data }: EmailLogsTableProps) {
  return <DataTable columns={columns} data={data} />
}
