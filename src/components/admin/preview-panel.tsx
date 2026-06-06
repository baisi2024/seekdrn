'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PreviewPanelProps {
  templateKey: string
  availableVariables: string[]
}

export function PreviewPanel({ templateKey, availableVariables }: PreviewPanelProps) {
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<{ subject: string; body_html: string } | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [language, setLanguage] = useState('en')

  const handlePreview = async () => {
    const response = await fetch(`/api/admin/email-templates/${templateKey}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, variables }),
    })
    const data = await response.json()
    setPreview(data)
  }

  const handleTestSend = async () => {
    await fetch(`/api/admin/email-templates/${templateKey}/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_email: testEmail, language, variables }),
    })
    alert('Test email sent!')
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Language</Label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {availableVariables.map((varName) => (
        <div key={varName}>
          <Label>{varName}</Label>
          <Input
            value={variables[varName] || ''}
            onChange={(e) =>
              setVariables({ ...variables, [varName]: e.target.value })
            }
            placeholder={`Enter ${varName}`}
          />
        </div>
      ))}

      <Button onClick={handlePreview}>Preview</Button>

      {preview && (
        <div className="border p-4 rounded">
          <h3 className="font-bold">{preview.subject}</h3>
          <div
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: preview.body_html }}
          />
        </div>
      )}

      <div className="border-t pt-4">
        <Label>Test Email Address</Label>
        <Input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="test@example.com"
        />
        <Button onClick={handleTestSend} className="mt-2">
          Send Test Email
        </Button>
      </div>
    </div>
  )
}
