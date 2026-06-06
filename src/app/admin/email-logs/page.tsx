import { supabaseAdmin } from '@/lib/supabase/admin'
import { EmailLogsClient } from '@/components/admin/email-logs/email-logs-client'

export default async function EmailLogsPage() {
  const { data: logs } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: templates } = await supabaseAdmin
    .from('email_templates')
    .select('key')

  const uniqueTemplates = templates?.map((t) => t.key) || []

  return (
    <EmailLogsClient
      initialLogs={logs || []}
      templates={uniqueTemplates}
    />
  )
}
