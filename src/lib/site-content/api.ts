import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SiteContent } from './types'

export async function getSiteContent(section: string): Promise<SiteContent[]> {
  const { data } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .eq('section', section)
    .eq('published', true)
    .order('sort_order')

  return data as SiteContent[] || []
}