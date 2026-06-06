import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { replaceVariables } from '@/lib/email-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json()
    const { language, variables } = body

    // 获取模板
    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .select('translations')
      .eq('template_key', params.key)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // 获取指定语言的内容
    const t = template.translations[language] || template.translations['en']
    if (!t) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      )
    }

    // 替换变量
    const subject = replaceVariables(t.subject, variables || {})
    const body_html = replaceVariables(t.body_html, variables || {})

    return NextResponse.json({
      subject,
      body_html,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to preview template' },
      { status: 500 }
    )
  }
}
