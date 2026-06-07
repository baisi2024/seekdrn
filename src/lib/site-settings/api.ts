import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SiteSettings } from './types'

let cached: SiteSettings | null = null
let cachedAt = 0
const TTL = 60_000 // 1 minute

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (cached && Date.now() - cachedAt < TTL) return cached

  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .single()

  if (data) {
    cached = data as SiteSettings
    cachedAt = Date.now()
  }
  return cached
}