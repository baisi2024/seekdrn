'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Eye, Send, RefreshCw } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface PreviewPanelProps {
  templateKey: string
  availableVariables: string[]
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
]

export function PreviewPanel({ templateKey, availableVariables }: PreviewPanelProps) {
  const t = useAdminTranslations()
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<{ subject: string; body_html: string } | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const handlePreview = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${templateKey}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, variables }),
      })
      
      if (!response.ok) {
        throw new Error(t('preview_panel.preview_failed'))
      }
      
      const data = await response.json()
      setPreview(data)
      toast.success(t('preview_panel.preview_loaded'))
    } catch {
      toast.error(t('preview_panel.preview_load_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleTestSend = async () => {
    if (!testEmail) {
      toast.error(t('preview_panel.enter_test_email'))
      return
    }

    setSending(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${templateKey}/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_email: testEmail, language, variables }),
      })
      
      if (!response.ok) {
        throw new Error(t('preview_panel.send_failed'))
      }
      
      toast.success(t('preview_panel.test_email_sent').replace('{email}', testEmail))
    } catch {
      toast.error(t('preview_panel.send_failed_retry'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 左侧：配置区域 */}
      <div className="space-y-6">
        {/* 语言选择 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('preview_panel.config_title')}</CardTitle>
            <CardDescription>{t('preview_panel.config_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('preview_panel.language')}</Label>
              <Select value={language} onValueChange={(value) => value && setLanguage(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('preview_panel.select_language')} />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 变量输入 */}
            {availableVariables.length > 0 && (
              <div className="space-y-3">
                <Label>{t('preview_panel.variable_values')}</Label>
                <div className="space-y-3">
                  {availableVariables.map((varName) => (
                    <div key={varName} className="space-y-1">
                      <Label htmlFor={varName} className="text-sm font-normal">
                        {`{{${varName}}}`}
                      </Label>
                      <Input
                        id={varName}
                        value={variables[varName] || ''}
                        onChange={(e) =>
                          setVariables({ ...variables, [varName]: e.target.value })
                        }
                        placeholder={t('preview_panel.enter_var_value').replace('{name}', varName)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handlePreview} disabled={loading} className="w-full">
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {loading ? t('preview_panel.loading_status') : t('preview_panel.generate_preview')}
            </Button>
          </CardContent>
        </Card>

        {/* 测试发送 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('preview_panel.test_send_title')}</CardTitle>
            <CardDescription>{t('preview_panel.test_send_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">{t('preview_panel.test_email')}</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <Button 
              onClick={handleTestSend} 
              disabled={sending || !testEmail} 
              className="w-full"
              variant="outline"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? t('preview_panel.sending_status') : t('preview_panel.send_test_email')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：预览区域 */}
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle>{t('preview_panel.email_preview')}</CardTitle>
          <CardDescription>
            {preview ? t('preview_panel.actual_preview') : t('preview_panel.click_to_preview')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preview ? (
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">{t('preview_panel.subject')}</Label>
                  <p className="mt-1 text-lg font-semibold">{preview.subject}</p>
                </div>
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold text-muted-foreground">{t('preview_panel.content_label')}</Label>
                  <div 
                    className="mt-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: preview.body_html }} 
                  />
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="h-[400px] flex items-center justify-center border rounded-md">
              <div className="text-center text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t('preview_panel.preview_placeholder')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
