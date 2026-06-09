// src/app/api/analytics/events/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      event_name,
      event_category,
      page_type,
      locale,
      metadata,
      session_id,
    } = body

    // 验证必需字段
    if (!event_name) {
      return NextResponse.json(
        { error: 'event_name is required' },
        { status: 400 }
      )
    }

    // 插入事件
    const { error } = await supabaseAdmin.from('analytics_events').insert({
      event_name,
      event_category,
      page_type,
      locale,
      metadata: metadata || {},
      session_id,
    })

    if (error) {
      console.error('Error inserting analytics event:', error)
      return NextResponse.json(
        { error: 'Failed to record event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics event API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
