'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RichEditor } from '@/components/admin/rich-editor'
import { MediaUpload } from '@/components/admin/image-upload'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

const LOCALES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
]

const TRANSLATION_FIELDS = [
  { key: 'name', label: '产品名称', labelEn: 'Product Name', required: true },
  { key: 'overview', label: '产品概述', labelEn: 'Overview', richText: true },
  { key: 'advantages', label: '核心优势', labelEn: 'Advantages', richText: true },
  { key: 'capabilities', label: '核心能力', labelEn: 'Capabilities', richText: true },
  { key: 'applications', label: '应用场景', labelEn: 'Applications', richText: true },
]

interface StepContentProps {
  data: {
    translations: Record<string, Record<string, string>>
    images: string[]
    videos: string[]
  }
  onChange: (data: Partial<StepContentProps['data']>) => void
}

export function StepContent({ data, onChange }: StepContentProps) {
  const t = useAdminTranslations()
  const [activeLocale, setActiveLocale] = useState('zh')

  const updateTranslation = (locale: string, field: string, value: string) => {
    onChange({
      translations: {
        ...data.translations,
        [locale]: {
          ...data.translations[locale],
          [field]: value,
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <Tabs value={activeLocale} onValueChange={setActiveLocale}>
        <TabsList className="mb-4">
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale.code} value={locale.code}>
              {locale.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map((locale) => (
          <TabsContent key={locale.code} value={locale.code} className="space-y-4">
            {TRANSLATION_FIELDS.map((field) => (
              <div key={field.key}>
                <Label className="text-base font-medium">
                  {locale.code === 'zh' ? field.label : field.labelEn}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {field.richText ? (
                  <div className="mt-2">
                    <RichEditor
                      content={data.translations[locale.code]?.[field.key] || ''}
                      onChange={(value) => updateTranslation(locale.code, field.key, value)}
                      placeholder={`输入${field.label}...`}
                    />
                  </div>
                ) : (
                  <Input
                    value={data.translations[locale.code]?.[field.key] || ''}
                    onChange={(e) => updateTranslation(locale.code, field.key, e.target.value)}
                    placeholder={`输入${field.label}...`}
                    className="mt-2"
                  />
                )}
              </div>
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>{t('images')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload
            images={data.images || []}
            onChange={(images) => onChange({ images })}
            accept="image/*"
          />
          <p className="text-sm text-muted-foreground mt-2">
            支持上传多张产品图片，建议尺寸：800x600px
          </p>
        </CardContent>
      </Card>

      {/* Videos */}
      <Card>
        <CardHeader>
          <CardTitle>{t('videos')}</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUpload
            images={data.videos || []}
            onChange={(videos) => onChange({ videos })}
            accept="video/*"
            max={5}
          />
          <p className="text-sm text-muted-foreground mt-2">
            支持上传最多5个产品演示视频
          </p>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">提示</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 产品名称为必填项，其他内容可选</li>
          <li>• 建议填写中英文双语内容</li>
          <li>• 富文本字段支持格式化文本和链接</li>
          <li>• 图片和视频可在后续继续添加</li>
        </ul>
      </div>
    </div>
  )
}
