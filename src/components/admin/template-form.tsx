'use client'

import { useState, useEffect } from 'react'
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
import { Save, Eye, X, Plus } from 'lucide-react'

const templateSchema = z.object({
  template_key: z.string().min(1, '模板标识不能为空').regex(/^[a-z0-9_]+$/, '只能包含小写字母、数字和下划线'),
  description: z.string().optional(),
  available_variables: z.array(z.string()),
  is_active: z.boolean(),
  translations: z.record(z.object({
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

  // 监听表单变化
  useEffect(() => {
    onUnsavedChange?.(isDirty)
  }, [isDirty, onUnsavedChange])

  // 添加变量
  const handleAddVariable = () => {
    const trimmed = variableInput.trim()
    if (trimmed && !watchedValues.available_variables.includes(trimmed)) {
      setValue('available_variables', [...watchedValues.available_variables, trimmed])
      setVariableInput('')
    }
  }

  // 移除变量
  const handleRemoveVariable = (variable: string) => {
    setValue(
      'available_variables',
      watchedValues.available_variables.filter((v) => v !== variable)
    )
  }

  const onSubmit = (data: TemplateFormData) => {
    onSave(data)
  }

  const handleSaveAndPreview = () => {
    handleSubmit(onSubmit)()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>模板的基本配置和标识</CardDescription>
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
              />
              {errors.template_key && (
                <p className="text-sm text-red-500">{errors.template_key.message}</p>
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
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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

      {/* 多语言内容 */}
      <Card>
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
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={handleSaveAndPreview}>
          <Eye className="w-4 h-4 mr-2" />
          保存并预览
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存模板'}
        </Button>
      </div>
    </form>
  )
}
