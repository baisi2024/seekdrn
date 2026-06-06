import { supabaseAdmin } from '@/lib/supabase/admin'
import { EmailTemplatesTable } from '@/components/admin/email-templates-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function EmailTemplatesPage() {
  const { data: templates } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Link href="/admin/email-templates/new">
          <Button>New Template</Button>
        </Link>
      </div>
      <EmailTemplatesTable data={templates || []} />
    </div>
  )
}
