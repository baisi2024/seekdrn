import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - 获取所有模板列表
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch templates'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// POST - 创建新模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_key, description, translations, available_variables } = body

    // 验证必填字段
    if (!template_key || !translations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证 template_key 格式
    if (!/^[a-z0-9_]+$/.test(template_key)) {
      return NextResponse.json(
        { error: 'template_key must only contain lowercase letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .insert({
        template_key,
        description,
        translations,
        available_variables: available_variables || [],
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create template'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
