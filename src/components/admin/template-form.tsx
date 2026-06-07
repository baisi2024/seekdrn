'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { VariableValidator } from './variable-validator'
import { RichEditor } from './rich-editor'
import { Save, Eye, X, Plus, Check, Loader2 } from 'lucide-react'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useDebounce } from '@/hooks/use-debounce'

const templateSchema = z.object({
  template_key: z.string().min(1, '模板标识不能为空').regex(/^[a-z0-9_]+$/, '只能包含小写字母、数字和下划线'),
  description: z.string().optional(),
  available_variables: z.array(z.string()),
  is_active: z.boolean(),
  translations: z.record(z.string(), z.object({
    subject: z.string().min(1, '主题不能为空'),
    body_html: z.string().min(1, '内容不能为空'),
  })),
})

type TemplateFormData = z.infer<typeof templateSchema>

interface Template {
  template_key?: string
  description?: string
  available_variables?: string[]
  is_active?: boolean
  translations?: Record<string, { subject: string; body_html: string }>
}

interface TemplateFormProps {
  template?: Template
  onSave: (data: TemplateFormData) => void
  saving?: boolean
  onUnsavedChange?: (hasChanges: boolean) => void
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
]

export function TemplateForm({ template, onSave, saving, onUnsavedChange }: TemplateFormProps) {
  const [variableInput, setVariableInput] = useState('')
  const [activeLanguage, setActiveLanguage] = useState('en')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      template_key: template?.template_key || '',
      description: template?.description || '',
      available_variables: template?.available_variables || [],
      is_active: template?.is_active ?? true,
      translations: template?.translations || {
        en: { subject: '', body_html: '' },
        zh: { subject: '', body_html: '' },
      },
    },
  })

  const watchedValues = watch()
  
  // 防抖表单数据
  const debouncedValues = useDebounce(watchedValues, 500)
  
  // 自动保存
  const { isSaving: isAutoSaving, lastSaved, hasUnsavedChanges } = useAutoSave({
    data: debouncedValues,
    onSave: async (data) => {
      // 这里可以调用实际的保存 API
      console.log('Auto saving:', data)
    },
    delay: 3000,
    enabled: isDirty,
  })

  // 监听表单变化
  useEffect(() => {
    onUnsavedChange?.(isDirty)
  }, [isDirty, onUnsavedChange])

  // 添加变量
  const handleAddVariable = useCallback(() => {
    const trimmed = variableInput.trim()
    if (trimmed && !watchedValues.available_variables.includes(trimmed)) {
      setValue('available_variables', [...watchedValues.available_variables, trimmed])
      setVariableInput('')
    }
  }, [variableInput, watchedValues.available_variables, setValue])

  // 移除变量
  const handleRemoveVariable = useCallback((variable: string) => {
    setValue(
      'available_variables',
      watchedValues.available_variables.filter((v) => v !== variable)
    )
  }, [watchedValues.available_variables, setValue])

  const onSubmit = (data: TemplateFormData) => {
    onSave(data)
  }

  const handleSaveAndPreview = () => {
    handleSubmit(onSubmit)()
  }

  // 格式化最后保存时间
  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return '刚刚'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 变量列表
  const variablesList = useMemo(() => watchedValues.available_variables, [watchedValues.available_variables])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 自动保存提示 */}
      {(isAutoSaving || lastSaved) && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-background border shadow-lg animate-fade-in">
          {isAutoSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm">自动保存中...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                已保存 · {formatLastSaved(lastSaved)}
              </span>
            </>
          ) : null}
        </div>
      )}
      
      {/* 基本信息 */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>模板的基本配置和标识</CardDescription>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                未保存更改
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_key">
                模板标识 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="template_key"
                {...register('template_key')}
                placeholder="welcome_email"
                disabled={!!template}
                className={errors.template_key ? 'border-red-500' : ''}
                aria-invalid={errors.template_key ? 'true' : 'false'}
              />
              {errors.template_key && (
                <p className="text-sm text-red-500" role="alert">{errors.template_key.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                唯一标识符，只能包含小写字母、数字和下划线
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">激活状态</Label>
              <div className="flex items-center gap-2 pt-2">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      aria-label="激活状态"
                    />
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {watchedValues.is_active ? '已激活' : '未激活'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="描述这个邮件模板的用途..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* 变量配置 */}
      <Card>
        <CardHeader>
          <CardTitle>变量配置</CardTitle>
          <CardDescription>定义模板中可用的变量</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={variableInput}
              onChange={(e) => setVariableInput(e.target.value)}
              placeholder="输入变量名（如：name, email）"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddVariable()
                }
              }}
            />
            <Button type="button" onClick={handleAddVariable} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              添加
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {watchedValues.available_variables.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无变量，请添加模板中使用的变量</p>
            ) : (
              watchedValues.available_variables.map((variable) => (
                <Badge key={variable} variant="secondary" className="px-3 py-1">
                  {`{{${variable}}}`}
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(variable)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 邮件内容 */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500" />
        <CardHeader>
          <CardTitle>邮件内容</CardTitle>
          <CardDescription>配置不同语言的邮件主题和内容</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
            <TabsList className="mb-4">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TabsTrigger key={lang.code} value={lang.code}>
                  {lang.name}
                  {!watchedValues.translations[lang.code]?.subject && (
                    <span className="ml-2 text-xs text-yellow-500">●</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {SUPPORTED_LANGUAGES.map((lang) => (
              <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    邮件主题 <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name={`translations.${lang.code}.subject`}
                    control={control}
                    render={({ field }) => (
                      <>
                        <Input
                          {...field}
                          placeholder="输入邮件主题..."
                          className={errors.translations?.[lang.code]?.subject ? 'border-red-500' : ''}
                        />
                        {errors.translations?.[lang.code]?.subject && (
                          <p className="text-sm text-red-500">
                            {errors.translations[lang.code]?.subject?.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    邮件内容 <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name={`translations.${lang.code}.body_html`}
                    control={control}
                    render={({ field }) => (
                      <>
                        <RichEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="输入邮件内容..."
                        />
                        {errors.translations?.[lang.code]?.body_html && (
                          <p className="text-sm text-red-500">
                            {errors.translations[lang.code]?.body_html?.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* 变量验证 */}
                <VariableValidator
                  content={`${watchedValues.translations[lang.code]?.subject || ''} ${watchedValues.translations[lang.code]?.body_html || ''}`}
                  availableVariables={watchedValues.available_variables}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-4 justify-end sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleSaveAndPreview}
          className="hover:bg-purple-100 hover:text-purple-600"
        >
          <Eye className="w-4 h-4 mr-2" />
          保存并预览
        </Button>
        <Button 
          type="submit" 
          disabled={saving}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              保存模板
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
