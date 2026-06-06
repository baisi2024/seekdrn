'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PolicyItem, PolicyUpdate } from '@/lib/compliance/types'
import { RichEditor } from './rich-editor'

interface Props {
  policy: PolicyItem
  onSave: (data: PolicyUpdate) => void
  onClose: () => void
}

const LANGUAGES = ['en', 'zh', 'ar', 'es', 'fr', 'pt', 'id']

export function PolicyEditor({ policy, onSave, onClose }: Props) {
  const [translations, setTranslations] = useState<Record<string, { title?: string; content: string }>>(
    policy.translations || { en: { content: '' } }
  )
  const [published, setPublished] = useState(policy.published)
  const [activeLang, setActiveLang] = useState('en')

  const handleSave = () => {
    onSave({ translations, published })
  }

  const updateTranslation = (lang: string, field: 'title' | 'content', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value
      }
    }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={activeLang} onValueChange={setActiveLang}>
            <TabsList>
              {LANGUAGES.map(lang => (
                <TabsTrigger key={lang} value={lang}>{lang.toUpperCase()}</TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map(lang => (
              <TabsContent key={lang} value={lang} className="space-y-4">
                <div>
                  <Label>Title ({lang})</Label>
                  <Input
                    type="text"
                    className="w-full mt-1"
                    value={translations[lang]?.title || ''}
                    onChange={(e) => updateTranslation(lang, 'title', e.target.value)}
                    placeholder="Policy title"
                  />
                </div>

                <div>
                  <Label>Content ({lang})</Label>
                  <div className="mt-1 border rounded">
                    <RichEditor
                      content={translations[lang]?.content || ''}
                      onChange={(html) => updateTranslation(lang, 'content', html)}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} />
            <Label>Published</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
