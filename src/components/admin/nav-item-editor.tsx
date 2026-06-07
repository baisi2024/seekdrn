'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NavigationItem, NavigationItemCreate, NavigationItemUpdate } from '@/lib/navigation/types'
import { LOCALES } from '@/lib/constants/locales'

interface NavItemEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: NavigationItem | null
  position: 'header' | 'footer'
  onSave: (data: NavigationItemCreate | NavigationItemUpdate) => Promise<void>
}

export function NavItemEditor({ open, onOpenChange, item, position, onSave }: NavItemEditorProps) {
  const isEditing = !!item
  
  // 表单状态
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [linkType, setLinkType] = useState<'internal' | 'external'>('internal')
  const [url, setUrl] = useState('')
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      if (item) {
        // 编辑模式：填充现有数据
        setTranslations(item.translations || {})
        setLinkType(item.link_type)
        setUrl(item.url)
        setPublished(item.published)
      } else {
        // 创建模式：初始化空翻译
        const emptyTranslations: Record<string, string> = {}
        LOCALES.forEach(locale => {
          emptyTranslations[locale.code] = ''
        })
        setTranslations(emptyTranslations)
        setLinkType('internal')
        setUrl('')
        setPublished(true)
      }
      setErrors({})
    }
  }, [open, item])

  // 更新翻译
  const handleTranslationChange = (locale: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [locale]: value,
    }))
    // 清除错误
    if (errors[`translation_${locale}`]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`translation_${locale}`]
        return newErrors
      })
    }
  }

  // 表单验证
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 至少有一个语言的标签
    const hasAnyLabel = LOCALES.some(locale => translations[locale.code]?.trim())
    if (!hasAnyLabel) {
      newErrors.translations = 'At least one language label is required'
    }

    // URL 必填
    if (!url.trim()) {
      newErrors.url = 'URL is required'
    }

    // 内部链接应该以 / 开头
    if (linkType === 'internal' && url.trim() && !url.trim().startsWith('/')) {
      newErrors.url = 'Internal links should start with /'
    }

    // 外部链接应该包含协议
    if (linkType === 'external' && url.trim() && !url.trim().match(/^https?:\/\//)) {
      newErrors.url = 'External links should start with http:// or https://'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 保存
  const handleSave = async () => {
    if (!validate()) return

    setLoading(true)
    try {
      const data: NavigationItemCreate = {
        position,
        link_type: linkType,
        url: url.trim(),
        translations,
        published,
        parent_id: null,
        order_index: 0,
      }

      await onSave(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving navigation item:', error)
      setErrors({ submit: 'Failed to save. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Navigation Item' : 'Create Navigation Item'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 多语言标签编辑 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Labels <span className="text-red-500">*</span>
            </label>
            <Tabs defaultValue="en">
              <TabsList className="mb-3">
                {LOCALES.map((locale) => (
                  <TabsTrigger key={locale.code} value={locale.code}>
                    {locale.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {LOCALES.map((locale) => (
                <TabsContent key={locale.code} value={locale.code}>
                  <Input
                    value={translations[locale.code] || ''}
                    onChange={(e) => handleTranslationChange(locale.code, e.target.value)}
                    placeholder={`Enter label in ${locale.label}...`}
                    className={errors[`translation_${locale.code}`] ? 'border-red-500' : ''}
                  />
                </TabsContent>
              ))}
            </Tabs>
            {errors.translations && (
              <p className="text-sm text-red-500 mt-1">{errors.translations}</p>
            )}
          </div>

          {/* 链接类型 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Link Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={linkType}
              onValueChange={(value) => {
                if (value === 'internal' || value === 'external') {
                  setLinkType(value)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Link</SelectItem>
                <SelectItem value="external">External Link</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <Input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                if (errors.url) {
                  setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors.url
                    return newErrors
                  })
                }
              }}
              placeholder={linkType === 'internal' ? '/path/to/page' : 'https://example.com'}
              className={errors.url ? 'border-red-500' : ''}
            />
            {errors.url && (
              <p className="text-sm text-red-500 mt-1">{errors.url}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {linkType === 'internal'
                ? 'Internal links should start with / (e.g., /products, /about)'
                : 'External links should include the full URL (e.g., https://example.com)'}
            </p>
          </div>

          {/* 发布状态 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Published
            </label>
            <Switch
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>
        </div>

        {errors.submit && (
          <p className="text-sm text-red-500 text-center">{errors.submit}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
