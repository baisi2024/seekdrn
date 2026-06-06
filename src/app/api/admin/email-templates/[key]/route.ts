import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - 获取单个模板详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('template_key', key)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PUT - 更新模板
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const body = await request.json()
    const { description, translations, available_variables, is_active } = body

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .update({
        description,
        translations,
        available_variables,
        is_active,
      })
      .eq('template_key', key)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - 删除模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params
    const { error } = await supabaseAdmin
      .from('email_templates')
      .delete()
      .eq('template_key', key)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}
