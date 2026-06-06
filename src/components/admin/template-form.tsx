'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { VariableValidator } from './variable-validator'

interface TemplateFormProps {
  template?: any
  onSave: (data: any) => void
}

export function TemplateForm({ template, onSave }: TemplateFormProps) {
  const [templateKey, setTemplateKey] = useState(template?.template_key || '')
  const [description, setDescription] = useState(template?.description || '')
  const [availableVariables, setAvailableVariables] = useState<string[]>(
    template?.available_variables || []
  )
  const [translations, setTranslations] = useState(
    template?.translations || { en: { subject: '', body_html: '' } }
  )
  const [isActive, setIsActive] = useState(template?.is_active ?? true)

  const handleSave = () => {
    onSave({
      template_key: templateKey,
      description,
      available_variables: availableVariables,
      translations,
      is_active: isActive,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Template Key</Label>
        <Input
          value={templateKey}
          onChange={(e) => setTemplateKey(e.target.value)}
          placeholder="welcome_email"
          disabled={!!template}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description of this email template"
        />
      </div>

      <div>
        <Label>Available Variables (comma-separated)</Label>
        <Input
          value={availableVariables.join(', ')}
          onChange={(e) =>
            setAvailableVariables(
              e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
            )
          }
          placeholder="name, email, company"
        />
      </div>

      <div>
        <Label>Active</Label>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* English Translation */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-4">English</h3>
        <div className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input
              value={translations.en?.subject || ''}
              onChange={(e) =>
                setTranslations({
                  ...translations,
                  en: { ...translations.en, subject: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Body HTML</Label>
            <Textarea
              value={translations.en?.body_html || ''}
              onChange={(e) =>
                setTranslations({
                  ...translations,
                  en: { ...translations.en, body_html: e.target.value },
                })
              }
              rows={10}
            />
            <VariableValidator
              content={`${translations.en?.subject || ''} ${translations.en?.body_html || ''}`}
              availableVariables={availableVariables}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave}>Save Template</Button>
    </div>
  )
}
