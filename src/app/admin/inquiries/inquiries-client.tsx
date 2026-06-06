'use client'

import { AdminPage } from '@/components/admin/core'
import { InquiriesTable } from '@/components/admin/inquiries-table'

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

export function InquiriesTableClient({ inquiries }: { inquiries: Inquiry[] }) {
  return (
    <AdminPage title="inquiries_page.title">
      <InquiriesTable inquiries={inquiries} />
    </AdminPage>
  )
}
