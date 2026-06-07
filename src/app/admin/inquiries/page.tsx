import { supabaseAdmin } from '@/lib/supabase/admin'
import { InquiriesTableClient } from './inquiries-client'

export default async function InquiriesPage() {
  const { data: inquiries } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  return <InquiriesTableClient inquiries={inquiries || []} />
}
