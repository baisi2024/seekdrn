import { Resend } from 'resend'
import { supabaseAdmin } from './supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  language: string,
  variables: Record<string, string>
) {
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

  await resend.emails.send({
    from: 'SeekDrone <noreply@seekdrn.com>',
    to,
    subject,
    html,
  })
}
