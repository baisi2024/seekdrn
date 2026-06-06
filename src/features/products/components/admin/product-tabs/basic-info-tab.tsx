'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCategories } from '@/features/products/api/categories'
import { getTags } from '@/features/products/api/tags'
import type { Category, ProductTag } from '@/features/products/types'

interface BasicInfoTabProps {
  productId: string
  initialData: {
    model: string
    slug: string
    category_id: string | null
    tags: string[]
    sort_order: number
    published: boolean
    featured: boolean
    compliance_flag: boolean
  }
  onChange: (data: Partial<BasicInfoTabProps['initialData']>) => void
}

export function BasicInfoTab({ initialData, onChange }: BasicInfoTabProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<ProductTag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getCategories(),
          getTags(),
        ])
        setCategories(categoriesData)
        setAllTags(tagsData)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const toggleTag = (tagSlug: string) => {
    const newTags = initialData.tags.includes(tagSlug)
      ? initialData.tags.filter((t) => t !== tagSlug)
      : [...initialData.tags, tagSlug]
    onChange({ tags: newTags })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={initialData.model}
                onChange={(e) => onChange({ model: e.target.value })}
                placeholder="Product model number"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={initialData.slug}
                onChange={(e) => onChange({ slug: e.target.value })}
                placeholder="URL-friendly identifier"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={initialData.category_id || ''}
                onValueChange={(value) => onChange({ category_id: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="sort_order">Sort Order</Label>
              <Input
                id="sort_order"
                type="number"
                value={initialData.sort_order}
                onChange={(e) => onChange({ sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={initialData.tags.includes(tag.slug) ? 'default' : 'outline'}
                style={{
                  backgroundColor: initialData.tags.includes(tag.slug) ? tag.color : 'transparent',
                  borderColor: tag.color,
                  color: initialData.tags.includes(tag.slug) ? 'white' : tag.color,
                }}
                className="cursor-pointer"
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.translations.en?.name || tag.slug}
              </Badge>
            ))}
          </div>
          {allTags.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No tags available. Create tags in the Tags management page.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={initialData.published}
              onCheckedChange={(checked) => onChange({ published: checked })}
            />
            <Label htmlFor="published">Published</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="featured"
              checked={initialData.featured}
              onCheckedChange={(checked) => onChange({ featured: checked })}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="compliance"
              checked={initialData.compliance_flag}
              onCheckedChange={(checked) => onChange({ compliance_flag: checked })}
            />
            <Label htmlFor="compliance">Compliance Required</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
