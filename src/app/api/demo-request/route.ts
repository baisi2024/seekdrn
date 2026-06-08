import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { screen } from '@/lib/compliance'
import { sendTemplateEmail } from '@/lib/email'

const schema = z.object({
  full_name: z.string().min(1),
  company: z.string().min(1),
  email: z.string().email(),
  country: z.string().min(1),
  application_interest: z.string().min(1),
  source_page: z.string().optional(),
  inquiry_intent: z.enum(['quote', 'demo', 'datasheet', 'compliance', 'partnership']).optional(),
  message: z.string().optional(),
  phone: z.string().optional(),
  product_interest: z.string().optional(),
  intent: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  locale: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    // Compliance screening
    const complianceStatus = screen(data.country, data.application_interest)

    if (complianceStatus === 'blocked') {
      return NextResponse.json(
        { error: 'Service not available in your region' },
        { status: 403 }
      )
    }

    // Insert inquiry
    const { error: insertError } = await supabaseAdmin
      .from('inquiries')
      .insert({
        full_name: data.full_name,
        company: data.company,
        email: data.email,
        country: data.country,
        application_interest: data.inquiry_intent
          ? `${data.application_interest} | intent:${data.inquiry_intent}${data.message ? ` | note:${data.message}` : ''}`
          : data.message
            ? `${data.application_interest} | note:${data.message}`
            : data.application_interest,
        source_page: data.source_page || null,
        compliance_status: complianceStatus,
        phone: data.phone || null,
        product_interest: data.product_interest || null,
        intent: data.intent || data.inquiry_intent || null,
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        locale: data.locale || null,
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save inquiry' },
        { status: 500 }
      )
    }

    // Send emails (async, don't wait)
    const language = 'en' // TODO: detect from source_page or accept-language header

    // Thank you email to customer
    sendTemplateEmail('demo_request_thank_you', data.email, language, {
      full_name: data.full_name,
      company: data.company,
      email: data.email,
      country: data.country,
      application_interest: data.application_interest,
      source_page: data.source_page || '',
      inquiry_intent: data.inquiry_intent || 'demo',
      message: data.message || '',
      current_year: new Date().getFullYear().toString(),
    }).catch(console.error)

    // Internal notification
    const internalEmail = complianceStatus === 'review_required'
      ? 'compliance@seekdrn.com'
      : 'sales@seekdrn.com'

    sendTemplateEmail('demo_request_internal', internalEmail, 'en', {
      full_name: data.full_name,
      company: data.company,
      email: data.email,
      country: data.country,
      application_interest: data.application_interest,
      source_page: data.source_page || '',
      compliance_status: complianceStatus,
      inquiry_intent: data.inquiry_intent || 'demo',
      message: data.message || '',
      current_year: new Date().getFullYear().toString(),
    }).catch(console.error)

    return NextResponse.json({ success: true, compliance_status: complianceStatus })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
