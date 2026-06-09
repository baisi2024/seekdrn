'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  trackInlineFormOpen,
  trackInlineFormStart,
  trackInlineFormSubmitStart,
  trackInlineFormSubmitSuccess,
  trackInlineFormSubmitError,
  trackDemoRequestSuccess,
} from '@/lib/gtm'
import { CheckCircle, AlertCircle } from 'lucide-react'

type Intent = 'quote' | 'demo' | 'datasheet' | 'compliance' | 'partnership'

interface InlineLeadFormProps {
  mode: 'inline' | 'modal'
  defaultIntent?: Intent
  productModel?: string
  solutionSlug?: string
  caseSlug?: string
  locale: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const INTENT_OPTIONS: Intent[] = ['quote', 'demo', 'datasheet', 'compliance', 'partnership']

export function InlineLeadForm({
  mode,
  defaultIntent = 'demo',
  productModel,
  solutionSlug,
  caseSlug,
  locale,
  open,
  onOpenChange,
}: InlineLeadFormProps) {
  const t = useTranslations('inline_form')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [intent, setIntent] = useState<Intent>(defaultIntent)
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [message, setMessage] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; compliance_status?: string } | null>(null)

  // 追踪表单是否已经开始填写
  const hasStartedFilling = useRef(false)

  const productInterest = productModel || solutionSlug || caseSlug || ''

  // 获取当前页面类型
  const getPageType = () => {
    if (typeof window === 'undefined') return 'unknown'
    const path = window.location.pathname
    if (path.includes('/products/')) return 'product'
    if (path.includes('/solutions/')) return 'solution'
    if (path.includes('/cases/')) return 'case'
    return 'other'
  }

  // 追踪表单打开（modal 模式）
  useEffect(() => {
    if (mode === 'modal' && open) {
      trackInlineFormOpen({
        page_type: getPageType(),
        intent: defaultIntent,
        product_model: productModel,
        solution_slug: solutionSlug,
        case_slug: caseSlug,
        locale,
      })
      // 重置开始填写状态
      hasStartedFilling.current = false
    }
  }, [mode, open, defaultIntent, productModel, solutionSlug, caseSlug, locale])

  // 追踪表单打开（inline 模式）- 组件挂载时
  useEffect(() => {
    if (mode === 'inline') {
      trackInlineFormOpen({
        page_type: getPageType(),
        intent: defaultIntent,
        product_model: productModel,
        solution_slug: solutionSlug,
        case_slug: caseSlug,
        locale,
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 追踪表单开始填写
  const trackFormStart = () => {
    if (!hasStartedFilling.current) {
      hasStartedFilling.current = true
      trackInlineFormStart({
        page_type: getPageType(),
        intent,
        locale,
      })
    }
  }

  function resetForm() {
    setStep(1)
    setIntent(defaultIntent)
    setCompany('')
    setCountry('')
    setMessage('')
    setFullName('')
    setEmail('')
    setPhone('')
    setResult(null)
  }

  async function handleSubmit() {
    if (!fullName || !email || !company || !country) return

    setSubmitting(true)
    trackInlineFormSubmitStart({
      page_type: getPageType(),
      intent,
      locale,
    })

    try {
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          company,
          email,
          country,
          phone,
          application_interest: productInterest || intent,
          inquiry_intent: intent,
          message,
          source_page: typeof window !== 'undefined' ? window.location.pathname : '',
          locale,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        trackInlineFormSubmitError({
          page_type: getPageType(),
          intent,
          error: data.error || 'unknown',
          locale,
        })
        setResult({ success: false })
      } else {
        trackInlineFormSubmitSuccess({
          page_type: getPageType(),
          intent,
          product_model: productModel,
          locale,
        })
        trackDemoRequestSuccess(data.compliance_status)
        setResult({ success: true, compliance_status: data.compliance_status })
      }
    } catch {
      trackInlineFormSubmitError({
        page_type: getPageType(),
        intent,
        error: 'network',
        locale,
      })
      setResult({ success: false })
    } finally {
      setSubmitting(false)
    }
  }

  const formContent = (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Success state */}
      {result?.success && (
        <div className="py-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('success_title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('success_message')}</p>
          {result.compliance_status === 'review_required' && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm text-accent-foreground">
              <AlertCircle className="h-4 w-4" />
              {t('review_notice')}
            </p>
          )}
          {mode === 'modal' && onOpenChange && (
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }}
            >
              {t('submit_button')}
            </Button>
          )}
        </div>
      )}

      {/* Error state */}
      {result && !result.success && (
        <div className="py-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <p className="text-sm text-muted-foreground">{t('submit_error')}</p>
          <Button variant="outline" className="mt-4" onClick={() => setResult(null)}>
            {t('submit_button')}
          </Button>
        </div>
      )}

      {/* Form steps */}
      {!result && (
        <>
          {/* Step 1: Intent selection */}
          {step === 1 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{t('step1_title')}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {INTENT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIntent(opt)}
                    className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      intent === opt
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-foreground hover:border-primary/50'
                    }`}
                  >
                    {t(`intent_${opt}`)}
                  </button>
                ))}
              </div>
              <Button className="mt-6 w-full" onClick={() => setStep(2)}>
                {t('submit_button')}
              </Button>
            </div>
          )}

          {/* Step 2: Project background */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('step2_title')}</h3>
              <div>
                <Label htmlFor="inline-company">{t('company_label')}</Label>
                <Input
                  id="inline-company"
                  value={company}
                  onChange={(e) => {
                    trackFormStart()
                    setCompany(e.target.value)
                  }}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="inline-country">{t('country_label')}</Label>
                <Input
                  id="inline-country"
                  value={country}
                  onChange={(e) => {
                    trackFormStart()
                    setCountry(e.target.value)
                  }}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="inline-message">{t('message_label')}</Label>
                <Textarea
                  id="inline-message"
                  value={message}
                  onChange={(e) => {
                    trackFormStart()
                    setMessage(e.target.value)
                  }}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {t('back_button')}
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!company || !country}>
                  {t('submit_button')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact info */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">{t('step3_title')}</h3>
              <div>
                <Label htmlFor="inline-name">{t('name_label')}</Label>
                <Input
                  id="inline-name"
                  value={fullName}
                  onChange={(e) => {
                    trackFormStart()
                    setFullName(e.target.value)
                  }}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="inline-email">{t('email_label')}</Label>
                <Input
                  id="inline-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    trackFormStart()
                    setEmail(e.target.value)
                  }}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="inline-phone">{t('phone_label')}</Label>
                <Input
                  id="inline-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    trackFormStart()
                    setPhone(e.target.value)
                  }}
                  className="mt-1.5"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  {t('back_button')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting || !fullName || !email}
                >
                  {submitting ? t('submitting_button') : t('submit_button')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  if (mode === 'modal') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('step1_title')}</DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background p-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{t('title')}</h2>
      {formContent}
    </div>
  )
}
