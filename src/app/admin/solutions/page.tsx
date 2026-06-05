import { supabaseAdmin } from '@/lib/supabase/admin'
import { SolutionsClient } from './solutions-client'

export default async function SolutionsPage() {
  const { data: solutions } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  return <SolutionsClient solutions={solutions || []} />
}
