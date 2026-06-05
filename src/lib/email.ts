import { Resend } from 'resend'
import { supabaseAdmin } from './supabase/admin'

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

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, value)
    html = html.replace(regex, value)
  }

  await resendClient.emails.send({
    from: 'SeekDrone <noreply@seekdrn.com>',
    to,
    subject,
    html,
  })
}
