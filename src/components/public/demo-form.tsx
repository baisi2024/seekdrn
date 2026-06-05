'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const demoSchema = z.object({
  fullName: z.string().min(1, 'This field is required'),
  company: z.string().min(1, 'This field is required'),
  email: z.email('Please enter a valid email'),
  country: z.string().min(1, 'This field is required'),
  applicationInterest: z.string().min(1, 'This field is required'),
})

const countries = [
  'Middle East',
  'Africa',
  'South America',
  'Southeast Asia',
  'North America',
  'Europe',
  'East Asia',
  'Central Asia',
  'Oceania',
]

const applications = [
  'Public Safety',
  'Energy',
  'Surveying',
  'Environmental',
  'Counter-UAS',
  'Logistics',
  'Other',
]

export function DemoForm() {
  const t = useTranslations('common')
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    country: '',
    applicationInterest: '',
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

    const result = demoSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Submission failed')
      }

      toast.success('Demo request submitted successfully!')
      setFormData({
        fullName: '',
        company: '',
        email: '',
        country: '',
        applicationInterest: '',
      })
    } catch {
      toast.error(t('error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="demo-form" className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Request a Demo</h2>
            <p className="mt-3 text-gray-600">
              Fill out the form below and our team will get back to you within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-gray-200 p-8">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{t('form.fullName')}</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder={t('form.fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Company */}
            <div className="space-y-1.5">
              <Label htmlFor="company">{t('form.company')}</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder={t('form.company')}
              />
              {errors.company && (
                <p className="text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('form.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t('form.email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <Label>{t('form.country')}</Label>
              <Select
                value={formData.country}
                onValueChange={(val) => handleChange('country', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('form.country')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            {/* Application Interest */}
            <div className="space-y-1.5">
              <Label>{t('form.applicationInterest')}</Label>
              <Select
                value={formData.applicationInterest}
                onValueChange={(val) => handleChange('applicationInterest', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('form.applicationInterest')} />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.applicationInterest && (
                <p className="text-sm text-red-600">{errors.applicationInterest}</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t('form.submitting') : t('form.submit')}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
