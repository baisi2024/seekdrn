import { AdminPage } from '@/components/admin/core'
import { AnalyticsClient } from './analytics-client'

export default function AnalyticsPage() {
  return (
    <AdminPage title="analytics_page.title">
      <AnalyticsClient />
    </AdminPage>
  )
}
