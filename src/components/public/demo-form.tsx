'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  trackDemoFormSubmit,
  trackDemoRequestSuccess,
  trackFormSubmitError,
  trackFormSubmitStart,
  trackFormSubmitSuccess,
} from '@/lib/gtm'

const leadSchema = z.object({
  fullName: z.string().min(1, 'This field is required'),
  company: z.string().min(1, 'This field is required'),
  email: z.email('Please enter a valid email'),
  country: z.string().min(1, 'This field is required'),
  applicationInterest: z.string().min(1, 'This field is required'),
  intent: z.enum(['quote', 'demo', 'datasheet', 'compliance', 'partnership']),
  message: z.string().optional(),
})

const countries = ['Middle East', 'Africa', 'South America', 'Southeast Asia', 'North America', 'Europe', 'East Asia', 'Central Asia', 'Oceania']

const applications = ['Public Safety', 'Energy', 'Surveying', 'Environmental', 'Counter-UAS', 'Logistics', 'Other']

const intents = ['quote', 'demo', 'datasheet', 'compliance', 'partnership'] as const

type LeadIntent = typeof intents[number]

export function DemoForm() {
  const t = useTranslations('common')
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    country: '',
    applicationInterest: '',
    intent: 'quote' as LeadIntent,
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = leadSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.path[0] === 'email' ? t('error.invalidEmail') : t('error.required')
        }
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    trackFormSubmitStart(formData.intent, {
      country: formData.country,
      application: formData.applicationInterest,
      source_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
    trackDemoFormSubmit(formData.country, formData.applicationInterest)

    try {
      const payload = {
        full_name: formData.fullName,
        company: formData.company,
        email: formData.email,
        country: formData.country,
        application_interest: formData.applicationInterest,
        inquiry_intent: formData.intent,
        message: formData.message,
        source_page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      }

      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Submission failed')
      }

      const data = await res.json()
      trackFormSubmitSuccess(formData.intent, { compliance_status: data.compliance_status || 'standard' })
      trackDemoRequestSuccess(data.compliance_status || 'standard')

      toast.success(t(`form.successByIntent.${formData.intent}`))
      setFormData({
        fullName: '',
        company: '',
        email: '',
        country: '',
        applicationInterest: '',
        intent: 'quote',
        message: '',
      })
    } catch {
      trackFormSubmitError(formData.intent, { country: formData.country, application: formData.applicationInterest })
      toast.error(t('error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="demo-form" className="bg-[#1A1F2E] py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0066FF]">{t('form.eyebrow')}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white lg:text-4xl">{t('form.title')}</h2>
            <p className="mt-4 text-base leading-7 text-white/50">
              {t('form.subtitle')}
            </p>
            <div className="mt-6 grid gap-3 text-sm text-white/50">
              {intents.slice(0, 4).map((intent) => (
                <div key={intent} className="rounded-2xl border border-white/[0.06] bg-[#0A0E17] p-4">
                  <span className="font-semibold text-white">{t(`form.intents.${intent}`)}</span>
                  <p className="mt-1 text-xs leading-5 text-white/50">{t(`form.intentHelp.${intent}`)}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/[0.06] bg-[#0A0E17] p-6 lg:p-8">
            <div className="space-y-1.5">
              <Label className="text-white/70">{t('form.intent')}</Label>
              <Select value={formData.intent} onValueChange={(val) => handleChange('intent', val || 'quote')}>
                <SelectTrigger className="w-full bg-[#1A1F2E] border-white/[0.06] text-white">
                  <SelectValue placeholder={t('form.intent')} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-white/[0.06]">
                  {intents.map((intent) => (
                    <SelectItem key={intent} value={intent} className="text-white hover:bg-white/[0.04]">
                      {t(`form.intents.${intent}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-white/70">{t('form.fullName')}</Label>
                <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="bg-[#1A1F2E] border-white/[0.06] text-white placeholder:text-white/30" />
                {errors.fullName && <p className="text-sm text-red-400">{errors.fullName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-white/70">{t('form.company')}</Label>
                <Input id="company" value={formData.company} onChange={(e) => handleChange('company', e.target.value)} className="bg-[#1A1F2E] border-white/[0.06] text-white placeholder:text-white/30" />
                {errors.company && <p className="text-sm text-red-400">{errors.company}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70">{t('form.email')}</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="bg-[#1A1F2E] border-white/[0.06] text-white placeholder:text-white/30" />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-white/70">{t('form.country')}</Label>
                <Select value={formData.country} onValueChange={(val) => handleChange('country', val || '')}>
                  <SelectTrigger className="w-full bg-[#1A1F2E] border-white/[0.06] text-white">
                    <SelectValue placeholder={t('form.country')} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F2E] border-white/[0.06]">
                    {countries.map((c) => <SelectItem key={c} value={c} className="text-white hover:bg-white/[0.04]">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-sm text-red-400">{errors.country}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70">{t('form.applicationInterest')}</Label>
                <Select value={formData.applicationInterest} onValueChange={(val) => handleChange('applicationInterest', val || '')}>
                  <SelectTrigger className="w-full bg-[#1A1F2E] border-white/[0.06] text-white">
                    <SelectValue placeholder={t('form.applicationInterest')} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1F2E] border-white/[0.06]">
                    {applications.map((a) => <SelectItem key={a} value={a} className="text-white hover:bg-white/[0.04]">{a}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.applicationInterest && <p className="text-sm text-red-400">{errors.applicationInterest}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-white/70">{t('form.message')}</Label>
              <Textarea id="message" value={formData.message} onChange={(e) => handleChange('message', e.target.value)} placeholder={t('form.messagePlaceholder')} rows={4} className="bg-[#1A1F2E] border-white/[0.06] text-white placeholder:text-white/30" />
            </div>

            <Button type="submit" size="lg" className="w-full bg-[#0066FF] text-white hover:bg-[#0052CC]" disabled={submitting}>
              {submitting ? t('form.submitting') : t(`form.submitByIntent.${formData.intent}`)}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
