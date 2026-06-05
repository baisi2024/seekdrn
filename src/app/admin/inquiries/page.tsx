import { supabaseAdmin } from '@/lib/supabase/admin'
import { InquiriesTable } from '@/components/admin/inquiries-table'

export default async function InquiriesPage() {
  const { data: inquiries } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inquiries</h1>
      <InquiriesTable inquiries={inquiries || []} />
    </div>
  )
}
