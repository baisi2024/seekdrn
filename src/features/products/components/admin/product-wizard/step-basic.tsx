'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import type { Category, ProductTag } from '@/features/products/types'

interface StepBasicProps {
  data: {
    model: string
    slug: string
    category_id: string | null
    tags: string[]
    sort_order: number
  }
  onChange: (data: Partial<StepBasicProps['data']>) => void
  categories: Category[]
  tags: ProductTag[]
}

export function StepBasic({ data, onChange, categories, tags }: StepBasicProps) {
  const t = useAdminTranslations()

  // Auto-generate slug from model
  useEffect(() => {
    if (data.model && !data.slug) {
      const slug = data.model
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      onChange({ slug })
    }
  }, [data.model, data.slug, onChange])

  const toggleTag = (tagSlug: string) => {
    const newTags = data.tags.includes(tagSlug)
      ? data.tags.filter((t) => t !== tagSlug)
      : [...data.tags, tagSlug]
    onChange({ tags: newTags })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="model" className="text-base font-medium">
              {t('model')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="model"
              value={data.model}
              onChange={(e) => onChange({ model: e.target.value })}
              placeholder={t('product_model_placeholder')}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              产品型号，例如：SD-1000
            </p>
          </div>
          <div>
            <Label htmlFor="slug" className="text-base font-medium">
              {t('slug')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={data.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder={t('slug_placeholder')}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              URL友好的标识符，自动从型号生成
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category" className="text-base font-medium">
              {t('category')}
            </Label>
            <Select
              value={data.category_id || ''}
              onValueChange={(value) => onChange({ category_id: value || null })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('select_category')}>
                  {data.category_id && categories.find(c => c.id === data.category_id) && (
                    categories.find(c => c.id === data.category_id)?.translations.en?.name ||
                    categories.find(c => c.id === data.category_id)?.slug
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.translations.en?.name || cat.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sort_order" className="text-base font-medium">
              {t('sort_order')}
            </Label>
            <Input
              id="sort_order"
              type="number"
              value={data.sort_order}
              onChange={(e) => onChange({ sort_order: parseInt(e.target.value) || 0 })}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              数值越大排序越靠前
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tags')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant={data.tags.includes(tag.slug) ? 'default' : 'outline'}
                style={{
                  backgroundColor: data.tags.includes(tag.slug) ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: data.tags.includes(tag.slug) ? 'white' : tag.color,
                }}
                className="cursor-pointer"
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.translations.en?.name || tag.slug}
              </Badge>
            ))}
          </div>
          {tags.length === 0 && (
            <p className="text-muted-foreground text-sm">
              {t('no_tags_available')}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">提示</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 产品型号和 Slug 为必填项</li>
          <li>• 分类和标签可在后续编辑时修改</li>
          <li>• 排序权重影响产品在列表中的显示顺序</li>
        </ul>
      </div>
    </div>
  )
}
