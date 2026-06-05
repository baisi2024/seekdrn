import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('enabled_languages, enable_chinese')
    .single()

  return NextResponse.json(data || {})
}
