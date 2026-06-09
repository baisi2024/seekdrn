import { Resend } from 'resend'
import { supabaseAdmin } from './supabase/admin'
import { replaceVariables } from './email-helpers'

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set. Email sending will be skipped.')
      return null
    }
    resend = new Resend(apiKey)
  }
  return resend
}

export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  language: string,
  variables: Record<string, string>
) {
  const resendClient = getResend()
  if (!resendClient) {
    console.log('Email sending skipped: RESEND_API_KEY not configured')
    return
  }

  // 获取模板
  const { data: template } = await supabaseAdmin
    .from('email_templates')
    .select('translations, is_active')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .maybeSingle()

  let subject = 'Thank you from SeekDrone'
  let html = '<p>Thank you for your request.</p>'

  if (template) {
    const t = template.translations[language] || template.translations['en']
    if (t) {
      subject = t.subject
      html = t.body_html
    }
  }

  // 替换变量
  subject = replaceVariables(subject, variables)
  html = replaceVariables(html, variables)

  // 准备日志记录
  const logEntry = {
    template_key: templateKey,
    recipient_email: to,
    language,
    subject,
    body_html: html,
    variables,
    status: 'pending' as const,
  }

  try {
    // 发送邮件
    const result = await resendClient.emails.send({
      from: 'SeekDrone <noreply@seekdrn.com>',
      to,
      subject,
      html,
    })

    // 记录成功
    await supabaseAdmin.from('email_logs').insert({
      ...logEntry,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return result
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    // 记录失败
    await supabaseAdmin.from('email_logs').insert({
      ...logEntry,
      status: 'failed',
      error_message: errorMessage,
    })

    throw error
  }
}
