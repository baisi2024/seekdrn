import { supabaseAdmin } from '@/lib/supabase/admin'
import type { FAQ } from './types'

export async function getFAQs(): Promise<FAQ[]> {
  const { data } = await supabaseAdmin
    .from('faqs')
    .select('*')
    .eq('published', true)
    .order('sort_order')

  return data as FAQ[] || []
}