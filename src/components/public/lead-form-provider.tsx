'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { InlineLeadForm } from '@/components/public/inline-lead-form'

type Intent = 'quote' | 'demo' | 'datasheet' | 'compliance' | 'partnership'

interface FormContext {
  productModel?: string
  solutionSlug?: string
  caseSlug?: string
}

interface LeadFormState {
  open: boolean
  intent: Intent
  context: FormContext
}

interface LeadFormContextValue {
  openForm: (intent?: Intent, context?: FormContext) => void
}

const LeadFormContext = createContext<LeadFormContextValue | null>(null)

export function useLeadForm() {
  const ctx = useContext(LeadFormContext)
  if (!ctx) throw new Error('useLeadForm must be used within LeadFormProvider')
  return ctx
}

interface LeadFormProviderProps {
  locale: string
  children: React.ReactNode
}

export function LeadFormProvider({ locale, children }: LeadFormProviderProps) {
  const [state, setState] = useState<LeadFormState>({
    open: false,
    intent: 'demo',
    context: {},
  })

  const openForm = useCallback((intent?: Intent, context?: FormContext) => {
    setState({
      open: true,
      intent: intent || 'demo',
      context: context || {},
    })
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, open }))
  }, [])

  return (
    <LeadFormContext.Provider value={{ openForm }}>
      {children}
      <InlineLeadForm
        mode="modal"
        defaultIntent={state.intent}
        productModel={state.context.productModel}
        solutionSlug={state.context.solutionSlug}
        caseSlug={state.context.caseSlug}
        locale={locale}
        open={state.open}
        onOpenChange={handleOpenChange}
      />
    </LeadFormContext.Provider>
  )
}
