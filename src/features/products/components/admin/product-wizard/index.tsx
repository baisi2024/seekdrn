'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { StepBasic } from './step-basic'
import { StepContent } from './step-content'
import { StepSpecs } from './step-specs'
import { StepComplete } from './step-complete'
import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category, ProductTag } from '@/features/products/types'

const STEPS = [
  { key: 'basic', label: '基础信息', labelEn: 'Basic Info' },
  { key: 'content', label: '产品内容', labelEn: 'Content' },
  { key: 'specs', label: '规格参数', labelEn: 'Specifications' },
  { key: 'complete', label: '完成', labelEn: 'Complete' },
]

interface SpecValue {
  value: number
  unit: string
}

interface ProductWizardData {
  model: string
  slug: string
  category_id: string | null
  tags: string[]
  sort_order: number
  published: boolean
  featured: boolean
  compliance_flag: boolean
  translations: Record<string, Record<string, string>>
  images: string[]
  videos: string[]
  specs_standardized: Record<string, SpecValue>
}

interface ProductWizardProps {
  categories: Category[]
  tags: ProductTag[]
}

export function ProductWizard({ categories, tags }: ProductWizardProps) {
  const t = useAdminTranslations()
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [createdProductId, setCreatedProductId] = useState<string | null>(null)
  
  const [data, setData] = useState<ProductWizardData>({
    model: '',
    slug: '',
    category_id: null,
    tags: [],
    sort_order: 0,
    published: false,
    featured: false,
    compliance_flag: false,
    translations: {},
    images: [],
    videos: [],
    specs_standardized: {},
  })

  const updateData = (updates: Partial<ProductWizardData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return data.model.trim() !== '' && data.slug.trim() !== ''
      case 1: // Content
        return true // Optional
      case 2: // Specs
        return true // Optional
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  const handleCreateProduct = async () => {
    setSaving(true)
    try {
      const productData = {
        model: data.model,
        slug: data.slug,
        category_id: data.category_id,
        tags: data.tags,
        sort_order: data.sort_order,
        published: data.published,
        featured: data.featured,
        compliance_flag: data.compliance_flag,
        translations: data.translations,
        images: data.images,
        videos: data.videos,
        specs_standardized: data.specs_standardized,
        spec_groups: [],
      }

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([productData])
        .select('id')
        .single()

      if (error) throw error
      
      setCreatedProductId(newProduct.id)
      handleNext()
    } catch (error) {
      console.error('Failed to create product:', error)
      alert(t('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepBasic
            data={data}
            onChange={updateData}
            categories={categories}
            tags={tags}
          />
        )
      case 1:
        return (
          <StepContent
            data={data}
            onChange={updateData}
          />
        )
      case 2:
        return (
          <StepSpecs
            data={data}
            onChange={updateData}
          />
        )
      case 3:
        return (
          <StepComplete
            productId={createdProductId}
            productModel={data.model}
            published={data.published}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                index < currentStep
                  ? 'bg-primary border-primary text-primary-foreground'
                  : index === currentStep
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background border-border text-muted-foreground'
              )}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <div className="ml-2">
              <p className={cn(
                'text-sm font-medium',
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </p>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'w-16 h-0.5 mx-4',
                index < currentStep ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? handleCancel : handlePrev}
          >
            {currentStep === 0 ? t('cancel') : '上一步'}
          </Button>
          
          {currentStep === 2 ? (
            <Button
              onClick={handleCreateProduct}
              disabled={saving || !canProceed()}
            >
              {saving ? t('saving') : '创建产品'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              下一步
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
