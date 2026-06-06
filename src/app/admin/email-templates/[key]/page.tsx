'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TemplateForm } from '@/components/admin/template-form'
import { PreviewPanel } from '@/components/admin/preview-panel'

export default function EmailTemplateEditPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
  }, [params.key])

  const handleSave = async (data: any) => {
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
      router.push('/admin/email-templates')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">
          {params.key === 'new' ? 'New Template' : 'Edit Template'}
        </h1>
        <TemplateForm template={template} onSave={handleSave} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Preview & Test</h2>
        {template && (
          <PreviewPanel
            templateKey={template.template_key}
            availableVariables={template.available_variables}
          />
        )}
      </div>
    </div>
  )
}
