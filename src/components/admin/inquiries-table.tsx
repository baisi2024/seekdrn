'use client'

import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'

interface Inquiry {
  id: string
  created_at: string
  full_name: string
  company: string
  country: string
  application_interest: string
  compliance_status: string
  follow_up_status: string
}

export function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (item: Inquiry) => new Date(item.created_at).toLocaleDateString()
    },
    { key: 'full_name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'country', label: 'Country' },
    { key: 'application_interest', label: 'Application' },
    {
      key: 'compliance_status',
      label: 'Compliance',
      render: (item: Inquiry) => (
        <Badge variant={item.compliance_status === 'approved' ? 'default' : item.compliance_status === 'review_required' ? 'secondary' : 'destructive'}>
          {item.compliance_status}
        </Badge>
      )
    },
    {
      key: 'follow_up_status',
      label: 'Status',
      render: (item: Inquiry) => (
        <Badge variant="outline">{item.follow_up_status}</Badge>
      )
    },
  ]

  return (
    <DataTable
      data={inquiries}
      columns={columns}
      searchPlaceholder="Search inquiries..."
      onRowClick={(item) => window.location.href = `/admin/inquiries/${item.id}`}
    />
  )
}
