import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .single()

  return NextResponse.json(data || {})
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .update(body)
    .eq('id', 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}