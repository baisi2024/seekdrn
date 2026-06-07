'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TemplateForm } from '@/components/admin/template-form'
import { PreviewPanel } from '@/components/admin/preview-panel'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { z } from 'zod'
import { AdminPage } from '@/components/admin/core'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface Template {
  template_key: string
  description?: string
  available_variables?: string[]
  is_active?: boolean
  translations?: Record<string, { subject: string; body_html: string }>
}

// 定义表单验证 schema
const templateFormSchema = z.object({
  template_key: z.string(),
  description: z.string().optional(),
  available_variables: z.array(z.string()),
  is_active: z.boolean(),
  translations: z.record(z.string(), z.object({
    subject: z.string(),
    body_html: z.string(),
  })),
})

type TemplateFormData = z.infer<typeof templateFormSchema>

export default function EmailTemplateEditPage() {
  const params = useParams()
  const router = useRouter()
  const t = useAdminTranslations()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const isNew = params.key === 'new'

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }

    fetch(`/api/admin/email-templates/${params.key}`)
      .then((res) => res.json())
      .then((data) => {
        setTemplate(data.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error(t('email_templates_page.loadFailed'))
        setLoading(false)
      })
  }, [params.key, isNew, t])

  const handleSave = useCallback(async (data: TemplateFormData) => {
    setSaving(true)
    try {
      const url = isNew
        ? '/api/admin/email-templates'
        : `/api/admin/email-templates/${params.key}`

      const method = isNew ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(t('email_templates_page.saveSuccess'))
        setHasUnsavedChanges(false)
        if (isNew) {
          router.push('/admin/email-templates')
        }
      } else {
        const error = await response.json()
        toast.error(error.message || t('email_templates_page.saveFailed'))
      }
    } catch {
      toast.error(t('email_templates_page.saveFailed'))
    } finally {
      setSaving(false)
    }
  }, [params.key, isNew, router, t])

  // 离开页面时的未保存提示
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const titleKey = isNew
    ? 'email_templates_page.newTitle'
    : 'email_templates_page.editTitle'

  const descriptionKey = isNew
    ? 'email_templates_page.newDescription'
    : 'email_templates_page.editDescription'

  return (
    <AdminPage
      title={titleKey}
      description={descriptionKey}
      actions={
        <Link href="/admin/email-templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('email_templates_page.backToList')}
          </Button>
        </Link>
      }
    >
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {t('email_templates_page.editTab')}
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            {t('email_templates_page.previewTab')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6">
          <TemplateForm
            template={template ?? undefined}
            onSave={handleSave}
            saving={saving}
            onUnsavedChange={setHasUnsavedChanges}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {template ? (
            <PreviewPanel
              templateKey={template.template_key}
              availableVariables={template.available_variables || []}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t('email_templates_page.saveBeforePreview')}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AdminPage>
  )
}