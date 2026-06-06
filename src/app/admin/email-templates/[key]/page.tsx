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

interface Template {
  template_key: string
  description?: string
  available_variables?: string[]
  is_active?: boolean
  translations?: Record<string, { subject: string; body_html: string }>
}

type TemplateFormData = z.infer<typeof z.object({
  template_key: z.string(),
  description: z.string().optional(),
  available_variables: z.array(z.string()),
  is_active: z.boolean(),
  translations: z.record(z.object({
    subject: z.string(),
    body_html: z.string(),
  })),
})>

export default function EmailTemplateEditPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    if (params.key === 'new') {
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
        toast.error('加载模板失败')
        setLoading(false)
      })
  }, [params.key])

  const handleSave = useCallback(async (data: TemplateFormData) => {
    setSaving(true)
    try {
      const url =
        params.key === 'new'
          ? '/api/admin/email-templates'
          : `/api/admin/email-templates/${params.key}`

      const method = params.key === 'new' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('模板保存成功')
        setHasUnsavedChanges(false)
        if (params.key === 'new') {
          router.push('/admin/email-templates')
        }
      } else {
        const error = await response.json()
        toast.error(error.message || '保存失败')
      }
    } catch {
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }, [params.key, router])

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/email-templates">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回列表
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              {params.key === 'new' ? '新建邮件模板' : '编辑邮件模板'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {params.key === 'new' ? '创建一个新的邮件模板' : `编辑模板: ${params.key}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs 布局 */}
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            编辑模板
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            预览测试
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6">
          <TemplateForm
            template={template}
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
              请先保存模板后再进行预览测试
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
