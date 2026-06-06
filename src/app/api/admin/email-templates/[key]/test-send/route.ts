import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { replaceVariables } from '@/lib/email-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  try {
    const body = await request.json()
    const { test_email, language, variables } = body

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(test_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // 获取模板
    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .select('translations')
      .eq('template_key', key)
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

    // 发送测试邮件
    const result = await resend.emails.send({
      from: 'SeekDrone <noreply@seekdrn.com>',
      to: test_email,
      subject: `[TEST] ${subject}`,
      html: body_html,
    })

    // 记录到日志
    await supabaseAdmin.from('email_logs').insert({
      template_key: key,
      recipient_email: test_email,
      language,
      subject: `[TEST] ${subject}`,
      body_html,
      variables: variables || {},
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message_id: result.data?.id,
    })
  } catch (error: any) {
    // 记录失败日志
    try {
      const body = await request.json()
      await supabaseAdmin.from('email_logs').insert({
        template_key: key,
        recipient_email: body.test_email,
        language: body.language,
        subject: '',
        body_html: '',
        variables: {},
        status: 'failed',
        error_message: error.message || 'Unknown error',
      })
    } catch {}

    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    )
  }
}
