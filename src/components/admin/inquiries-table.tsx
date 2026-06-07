'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
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
  const t = useAdminTranslations()

  const columns = [
    {
      key: 'created_at',
      label: t('date'),
      render: (item: Inquiry) => new Date(item.created_at).toLocaleDateString()
    },
    { key: 'full_name', label: t('name') },
    { key: 'company', label: t('company') },
    { key: 'country', label: t('country') },
    { key: 'application_interest', label: t('application') },
    {
      key: 'compliance_status',
      label: t('compliance_field'),
      render: (item: Inquiry) => (
        <Badge variant={item.compliance_status === 'approved' ? 'default' : item.compliance_status === 'review_required' ? 'secondary' : 'destructive'}>
          {item.compliance_status}
        </Badge>
      )
    },
    {
      key: 'follow_up_status',
      label: t('status'),
      render: (item: Inquiry) => (
        <Badge variant="outline">{item.follow_up_status}</Badge>
      )
    },
  ]

  return (
    <DataTable
      data={inquiries}
      columns={columns}
      searchPlaceholder={t('inquiries_page.searchPlaceholder')}
      onRowClick={(item) => window.location.href = `/admin/inquiries/${item.id}`}
    />
  )
}
