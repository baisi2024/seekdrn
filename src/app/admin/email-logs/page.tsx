import { supabaseAdmin } from '@/lib/supabase/admin'
import { EmailLogsTable } from '@/components/admin/email-logs-table'

export default async function EmailLogsPage() {
  const { data: logs } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Email Logs</h1>
      <EmailLogsTable data={logs || []} />
    </div>
  )
}
