'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { VariableValidator } from './variable-validator'
import { RichEditor } from './rich-editor'
import { Save, Eye, X, Plus, Check, Loader2 } from 'lucide-react'
import { useAutoSave } from '@/hooks/use-auto-save'
import { useDebounce } from '@/hooks/use-debounce'
import { AdminCard } from '@/components/admin/core'
import { AdminButton } from '@/components/admin/core'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

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
  { code: 'zh', name: 'Chinese' },
]

type TemplateFormData = {
  template_key: string
  description?: string
  available_variables: string[]
  is_active: boolean
  translations: Record<string, { subject: string; body_html: string }>
}

export function TemplateForm({ template, onSave, saving, onUnsavedChange }: TemplateFormProps) {
  const t = useAdminTranslations()
  const [variableInput, setVariableInput] = useState('')
  const [activeLanguage, setActiveLanguage] = useState('en')

  const templateSchema = useMemo(() => z.object({
    template_key: z.string().min(1, t('template_form_validation.template_key_required')).regex(/^[a-z0-9_]+$/, t('template_form_validation.template_key_pattern')),
    description: z.string().optional(),
    available_variables: z.array(z.string()),
    is_active: z.boolean(),
    translations: z.record(z.string(), z.object({
      subject: z.string().min(1, t('template_form_validation.subject_required')),
      body_html: z.string().min(1, t('template_form_validation.content_required')),
    })),
  }), [t])

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
  
  const debouncedValues = useDebounce(watchedValues, 500)
  
  const { isSaving: isAutoSaving, lastSaved, hasUnsavedChanges } = useAutoSave({
    data: debouncedValues,
    onSave: async (data) => {
      console.log('Auto saving:', data)
    },
    delay: 3000,
    enabled: isDirty,
  })

  useEffect(() => {
    onUnsavedChange?.(isDirty)
  }, [isDirty, onUnsavedChange])

  const handleAddVariable = useCallback(() => {
    const trimmed = variableInput.trim()
    if (trimmed && !watchedValues.available_variables.includes(trimmed)) {
      setValue('available_variables', [...watchedValues.available_variables, trimmed])
      setVariableInput('')
    }
  }, [variableInput, watchedValues.available_variables, setValue])

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

  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return t('template_form_validation.just_now')
    if (seconds < 3600) return t('template_form_validation.minutes_ago').replace('{count}', String(Math.floor(seconds / 60)))
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  }

  const variablesList = useMemo(() => watchedValues.available_variables, [watchedValues.available_variables])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 自动保存提示 */}
      {(isAutoSaving || lastSaved) && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-background border shadow-lg animate-fade-in">
          {isAutoSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">{t('email_templates_page.autoSaving')}</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {t('email_templates_page.saved')} · {formatLastSaved(lastSaved)}
              </span>
            </>
          ) : null}
        </div>
      )}
      
      {/* 基本信息 */}
      <AdminCard title="email_templates_page.basicInfoTitle" description="email_templates_page.basicInfoDesc" variant="bordered">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_key">
                {t('email_templates_page.templateKeyLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="template_key"
                {...register('template_key')}
                placeholder="welcome_email"
                disabled={!!template}
                className={errors.template_key ? 'border-destructive' : ''}
                aria-invalid={errors.template_key ? 'true' : 'false'}
              />
              {errors.template_key && (
                <p className="text-sm text-destructive" role="alert">{errors.template_key.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('email_templates_page.templateKeyHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="is_active">{t('email_templates_page.activeStatus')}</Label>
              <div className="flex items-center gap-2 pt-2">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      aria-label={t('email_templates_page.activeStatus')}
                    />
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {watchedValues.is_active ? t('email_templates_page.statusActive') : t('email_templates_page.statusInactive')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="description">{t('email_templates_page.descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('email_templates_page.descriptionPlaceholder')}
              rows={3}
            />
          </div>
      </AdminCard>

      {/* 变量配置 */}
      <AdminCard title="email_templates_page.variablesTitle" description="email_templates_page.variablesDesc" variant="bordered">
          <div className="flex gap-2">
            <Input
              value={variableInput}
              onChange={(e) => setVariableInput(e.target.value)}
              placeholder={t('email_templates_page.variablePlaceholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddVariable()
                }
              }}
            />
            <AdminButton type="button" onClick={handleAddVariable} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              {t('email_templates_page.addVariable')}
            </AdminButton>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {watchedValues.available_variables.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('email_templates_page.noVariables')}</p>
            ) : (
              watchedValues.available_variables.map((variable) => (
                <Badge key={variable} variant="secondary" className="px-3 py-1">
                  {`{{${variable}}}`}
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(variable)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
      </AdminCard>

      {/* 邮件内容 */}
      <AdminCard title="email_templates_page.emailContentTitle" description="email_templates_page.emailContentDesc" variant="bordered">
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
                    {t('email_templates_page.subjectLabel')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name={`translations.${lang.code}.subject`}
                    control={control}
                    render={({ field }) => (
                      <>
                        <Input
                          {...field}
                          placeholder={t('email_templates_page.subjectPlaceholder')}
                          className={errors.translations?.[lang.code]?.subject ? 'border-destructive' : ''}
                        />
                        {errors.translations?.[lang.code]?.subject && (
                          <p className="text-sm text-destructive">
                            {errors.translations[lang.code]?.subject?.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('email_templates_page.bodyLabel')} <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name={`translations.${lang.code}.body_html`}
                    control={control}
                    render={({ field }) => (
                      <>
                        <RichEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder={t('email_templates_page.bodyPlaceholder')}
                        />
                        {errors.translations?.[lang.code]?.body_html && (
                          <p className="text-sm text-destructive">
                            {errors.translations[lang.code]?.body_html?.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <VariableValidator
                  content={`${watchedValues.translations[lang.code]?.subject || ''} ${watchedValues.translations[lang.code]?.body_html || ''}`}
                  availableVariables={watchedValues.available_variables}
                />
              </TabsContent>
            ))}
          </Tabs>
      </AdminCard>

      {/* 操作按钮 */}
      <div className="flex gap-4 justify-end sticky bottom-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg border">
        <AdminButton 
          type="button" 
          variant="outline" 
          onClick={handleSaveAndPreview}
        >
          <Eye className="w-4 h-4 mr-2" />
          {t('email_templates_page.saveAndPreview')}
        </AdminButton>
        <AdminButton 
          type="submit" 
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('email_templates_page.saving')}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {t('email_templates_page.saveTemplate')}
            </>
          )}
        </AdminButton>
      </div>
    </form>
  )
}