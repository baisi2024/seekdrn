import { supabaseAdmin } from '@/lib/supabase/admin'
import { EmailTemplatesClientPage } from '@/components/admin/email-templates/email-templates-client-page'
import { EmailTemplate } from '@/components/admin/email-templates-table'

export default async function EmailTemplatesPage() {
  const { data: templates } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .order('updated_at', { ascending: false })

  return <EmailTemplatesClientPage templates={(templates as EmailTemplate[]) || []} />
}
