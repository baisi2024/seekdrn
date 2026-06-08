'use client'

import { useState } from 'react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { DataTable } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Inquiry {
  id: string
  created_at: string
  full_name: string
  company: string
  country: string
  email: string
  phone: string
  application_interest: string
  product_interest: string
  intent: string
  compliance_status: string
  follow_up_status: string
}

const STATUS_OPTIONS = ['all', 'pending', 'contacted', 'qualified', 'closed_won', 'closed_lost']

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  contacted: 'outline',
  qualified: 'default',
  closed_won: 'default',
  closed_lost: 'destructive',
}

export function InquiriesTable({ inquiries }: { inquiries: Inquiry[] }) {
  const t = useAdminTranslations()
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInquiries = statusFilter === 'all'
    ? inquiries
    : inquiries.filter((item) => item.follow_up_status === statusFilter)

  const columns = [
    {
      key: 'created_at',
      label: t('date'),
      render: (item: Inquiry) => new Date(item.created_at).toLocaleDateString()
    },
    { key: 'full_name', label: t('name') },
    { key: 'company', label: t('company') },
    { key: 'country', label: t('country') },
    {
      key: 'phone',
      label: t('inquiries_page.phone'),
      render: (item: Inquiry) => item.phone || '-'
    },
    {
      key: 'product_interest',
      label: t('inquiries_page.productInterest'),
      render: (item: Inquiry) => item.product_interest || '-'
    },
    {
      key: 'intent',
      label: t('inquiries_page.intent'),
      render: (item: Inquiry) => item.intent || '-'
    },
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
        <Badge variant={STATUS_VARIANTS[item.follow_up_status] || 'outline'}>
          {item.follow_up_status}
        </Badge>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex items-center gap-2">
        {STATUS_OPTIONS.map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? t('inquiries_page.allStatus') : status}
          </Button>
        ))}
      </div>

      <DataTable
        data={filteredInquiries}
        columns={columns}
        searchPlaceholder={t('inquiries_page.searchPlaceholder')}
        onRowClick={(item) => window.location.href = `/admin/inquiries/${item.id}`}
      />
    </div>
  )
}
