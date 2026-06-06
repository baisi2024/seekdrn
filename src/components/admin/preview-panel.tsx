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

interface PreviewPanelProps {
  templateKey: string
  availableVariables: string[]
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
]

export function PreviewPanel({ templateKey, availableVariables }: PreviewPanelProps) {
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
        throw new Error('预览失败')
      }
      
      const data = await response.json()
      setPreview(data)
      toast.success('预览加载成功')
    } catch {
      toast.error('预览加载失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTestSend = async () => {
    if (!testEmail) {
      toast.error('请输入测试邮箱地址')
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
        throw new Error('发送失败')
      }
      
      toast.success(`测试邮件已发送至 ${testEmail}`)
    } catch {
      toast.error('发送失败，请重试')
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
            <CardTitle>预览配置</CardTitle>
            <CardDescription>选择语言并填写变量值</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>语言</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="选择语言" />
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
                <Label>变量值</Label>
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
                        placeholder={`输入 ${varName} 的值`}
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
              {loading ? '加载中...' : '生成预览'}
            </Button>
          </CardContent>
        </Card>

        {/* 测试发送 */}
        <Card>
          <CardHeader>
            <CardTitle>测试发送</CardTitle>
            <CardDescription>发送测试邮件到指定邮箱</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">测试邮箱</Label>
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
              {sending ? '发送中...' : '发送测试邮件'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：预览区域 */}
      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle>邮件预览</CardTitle>
          <CardDescription>
            {preview ? '实际邮件效果预览' : '点击"生成预览"查看效果'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preview ? (
            <ScrollArea className="h-[600px] w-full rounded-md border">
              <div className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">主题</Label>
                  <p className="mt-1 text-lg font-semibold">{preview.subject}</p>
                </div>
                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold text-muted-foreground">内容</Label>
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
                <p>预览将在此处显示</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
