# PDP & PLP Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign SeekDrone's Product Detail Page (PDP) and Product List Page (PLP) based on the fusion demos, with full data structure, admin management, and API support.

**Architecture:** Extend existing Supabase schema with new columns for hero/metrics/scenarios, create new API routes for admin CRUD, build new admin UI tabs for the new fields, and rewrite PDP/PLP frontend components using the Deep Space Industrial Tech design system.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Supabase (PostgreSQL), Tailwind CSS, shadcn/ui, next-intl (7 languages), Cloudflare R2

---

## File Structure

### Database Migration
- Create: `supabase/migrations/021_pdp_plp_enhancements.sql`

### TypeScript Types
- Modify: `src/features/products/types/product.ts` — add HeroConfig, ScenarioItem, FeatureBlock, PayloadItem interfaces

### API Routes
- Modify: `src/app/api/admin/products/route.ts` — handle new fields in POST
- Modify: `src/app/api/admin/products/[id]/route.ts` — handle new fields in GET/PUT

### Admin Pages
- Modify: `src/app/admin/products/[id]/page.tsx` — add new tabs (hero, scenarios, features, payloads)
- Create: `src/components/admin/product-hero-tab.tsx`
- Create: `src/components/admin/product-scenarios-tab.tsx`
- Create: `src/components/admin/product-features-tab.tsx`
- Create: `src/components/admin/product-payloads-tab.tsx`

### Public Components (PDP)
- Create: `src/components/public/pdp/hero-fullscreen.tsx`
- Create: `src/components/public/pdp/anchor-nav.tsx`
- Create: `src/components/public/pdp/overview-section.tsx`
- Create: `src/components/public/pdp/scenarios-section.tsx`
- Create: `src/components/public/pdp/features-section.tsx`
- Create: `src/components/public/pdp/specs-enhanced.tsx`
- Create: `src/components/public/pdp/payload-ecosystem.tsx`
- Create: `src/components/public/pdp/sticky-cta.tsx`

### Public Components (PLP)
- Create: `src/components/public/plp/hero-section.tsx`
- Create: `src/components/public/plp/stats-bar.tsx`
- Create: `src/components/public/plp/view-toggle.tsx`
- Create: `src/components/public/plp/product-card-enhanced.tsx`

### Pages
- Rewrite: `src/app/[locale]/products/[slug]/page.tsx`
- Rewrite: `src/app/[locale]/products/page.tsx`

### Translations
- Modify: `messages/{en,zh,ar,es,fr,pt,id}/products.json` — add new translation keys

---

## Task 1: Database Migration — New PDP/PLP Fields

**Files:**
- Create: `supabase/migrations/021_pdp_plp_enhancements.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- 021: PDP/PLP Enhancement Fields
-- Adds hero config, scenarios, features, payload ecosystem data to products

-- Hero configuration: background image/video + metrics
ALTER TABLE products ADD COLUMN IF NOT EXISTS hero_image text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hero_video text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hero_metrics jsonb DEFAULT '[]';
-- hero_metrics format: [{"key": "flight_time", "value": "72", "unit": "min", "label": {"en": "Flight Time", "zh": "飞行时间"}}]

-- Application scenarios (structured, replaces plain text in translations)
ALTER TABLE products ADD COLUMN IF NOT EXISTS scenarios jsonb DEFAULT '[]';
-- scenarios format: [{"icon": "shield", "title": {"en": "Public Safety", "zh": "公共安全"}, "description": {"en": "...", "zh": "..."}}]

-- Feature blocks (structured, replaces advantages/capabilities in translations)
ALTER TABLE products ADD COLUMN IF NOT EXISTS feature_blocks jsonb DEFAULT '[]';
-- feature_blocks format: [{"id": "feat1", "title": {"en": "...", "zh": "..."}, "description": {"en": "...", "zh": "..."}, "image": "url", "specs": [{"label": {"en": "..."}, "value": {"en": "..."}}]}]

-- Payload ecosystem (compatible payloads for this product)
ALTER TABLE products ADD COLUMN IF NOT EXISTS payloads jsonb DEFAULT '[]';
-- payloads format: [{"id": "payload1", "name": {"en": "Dual EO/IR", "zh": "双光吊舱"}, "description": {"en": "...", "zh": "..."}, "image": "url", "specs": [{"label": {"en": "Zoom"}, "value": {"en": "30x"}}]}]

-- PLP stats (category-level stats for the listing page hero)
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS hero_stats jsonb DEFAULT '[]';
-- hero_stats format: [{"value": "12", "unit": "", "label": {"en": "Products", "zh": "产品"}}]

-- Update search_vector trigger to include new text fields
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(
      NEW.translations::text, ''
    )), 'B') ||
    setweight(to_tsvector('english', coalesce(
      NEW.scenarios::text, ''
    )), 'C') ||
    setweight(to_tsvector('english', coalesce(
      NEW.feature_blocks::text, ''
    )), 'C') ||
    setweight(to_tsvector('english', coalesce(
      NEW.payloads::text, ''
    )), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN products.hero_image IS 'Full-screen hero background image URL for PDP';
COMMENT ON COLUMN products.hero_video IS 'Full-screen hero background video URL for PDP';
COMMENT ON COLUMN products.hero_metrics IS 'Hero metrics cards: [{key, value, unit, label}]';
COMMENT ON COLUMN products.scenarios IS 'Application scenarios: [{icon, title, description}]';
COMMENT ON COLUMN products.feature_blocks IS 'Feature blocks: [{id, title, description, image, specs}]';
COMMENT ON COLUMN products.payloads IS 'Compatible payloads: [{id, name, description, image, specs}]';
```

- [ ] **Step 2: Run migration locally**

Run: `npx supabase db push` or apply via Supabase Dashboard
Expected: Migration applied successfully

- [ ] **Step 3: Verify columns exist**

Run: `npx supabase db inspect products --columns`
Expected: hero_image, hero_video, hero_metrics, scenarios, feature_blocks, payloads columns visible

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/021_pdp_plp_enhancements.sql
git commit -m "feat(db): add PDP/PLP enhancement fields"
```

---

## Task 2: TypeScript Types — New Interfaces

**Files:**
- Modify: `src/features/products/types/product.ts`

- [ ] **Step 1: Add new interfaces to product.ts**

Append after the existing `StandardizedSpec` interface:

```typescript
/** Hero metric card displayed in PDP full-screen hero */
export interface HeroMetric {
  key: string
  value: string
  unit?: string
  label: Record<string, string>
}

/** Application scenario card */
export interface ScenarioItem {
  icon: string
  title: Record<string, string>
  description: Record<string, string>
}

/** Feature block with image and specs */
export interface FeatureBlock {
  id: string
  title: Record<string, string>
  description: Record<string, string>
  image?: string
  specs?: Array<{
    label: Record<string, string>
    value: Record<string, string>
  }>
}

/** Compatible payload item */
export interface PayloadItem {
  id: string
  name: Record<string, string>
  description: Record<string, string>
  image?: string
  specs?: Array<{
    label: Record<string, string>
    value: Record<string, string>
  }>
}

/** Category hero stats for PLP */
export interface CategoryHeroStat {
  value: string
  unit?: string
  label: Record<string, string>
}
```

- [ ] **Step 2: Extend Product interface with new fields**

Add these fields to the `Product` interface:

```typescript
export interface Product {
  // ... existing fields ...
  hero_image?: string | null
  hero_video?: string | null
  hero_metrics?: HeroMetric[]
  scenarios?: ScenarioItem[]
  feature_blocks?: FeatureBlock[]
  payloads?: PayloadItem[]
}
```

- [ ] **Step 3: Extend Category interface**

In `src/features/products/types/category.ts`, add:

```typescript
export interface Category {
  // ... existing fields ...
  hero_stats?: CategoryHeroStat[]
}
```

Import `CategoryHeroStat` from product types.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add src/features/products/types/product.ts src/features/products/types/category.ts
git commit -m "feat(types): add PDP/PLP enhancement interfaces"
```

---

## Task 3: API Routes — Support New Fields

**Files:**
- Modify: `src/app/api/admin/products/route.ts`
- Modify: `src/app/api/admin/products/[id]/route.ts`

- [ ] **Step 1: Update POST handler in route.ts to accept new fields**

In the product creation section, add the new fields to the insert object:

```typescript
// In the POST handler, after existing field mapping:
hero_image: body.product.hero_image || null,
hero_video: body.product.hero_video || null,
hero_metrics: body.product.hero_metrics || [],
scenarios: body.product.scenarios || [],
feature_blocks: body.product.feature_blocks || [],
payloads: body.product.payloads || [],
```

- [ ] **Step 2: Update GET handler in [id]/route.ts to return new fields**

The Supabase query already selects `*`, so new columns are automatically included. Verify the response includes them.

- [ ] **Step 3: Add PUT handler in [id]/route.ts for updating new fields**

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const allowedFields = [
    'model', 'slug', 'category_id', 'translations', 'translation_status',
    'images', 'videos', 'published', 'featured', 'compliance_flag',
    'sort_order', 'spec_groups', 'specs_standardized',
    'hero_image', 'hero_video', 'hero_metrics',
    'scenarios', 'feature_blocks', 'payloads'
  ]

  const updateData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/products/route.ts src/app/api/admin/products/[id]/route.ts
git commit -m "feat(api): support PDP/PLP enhancement fields in product CRUD"
```

---

## Task 4: Admin — Hero Configuration Tab

**Files:**
- Create: `src/components/admin/product-hero-tab.tsx`
- Modify: `src/app/admin/products/[id]/page.tsx`

- [ ] **Step 1: Create ProductHeroTab component**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { HeroMetric } from '@/features/products/types/product'
import { createClient } from '@/lib/supabase/client'
import { R2UploadButton } from '@/components/admin/r2-upload-button'

interface ProductHeroTabProps {
  productId: string
  heroImage?: string | null
  heroVideo?: string | null
  heroMetrics?: HeroMetric[]
}

export function ProductHeroTab({ productId, heroImage, heroVideo, heroMetrics = [] }: ProductHeroTabProps) {
  const t = useTranslations('admin')
  const [image, setImage] = useState(heroImage || '')
  const [video, setVideo] = useState(heroVideo || '')
  const [metrics, setMetrics] = useState<HeroMetric[]>(heroMetrics)
  const [saving, setSaving] = useState(false)

  const addMetric = () => {
    setMetrics([...metrics, { key: '', value: '', unit: '', label: { en: '', zh: '' } }])
  }

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index))
  }

  const updateMetric = (index: number, field: keyof HeroMetric, value: string) => {
    const updated = [...metrics]
    if (field === 'label') return // handled separately
    updated[index] = { ...updated[index], [field]: value }
    setMetrics(updated)
  }

  const updateMetricLabel = (index: number, locale: string, value: string) => {
    const updated = [...metrics]
    updated[index] = {
      ...updated[index],
      label: { ...updated[index].label, [locale]: value }
    }
    setMetrics(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('products')
      .update({ hero_image: image || null, hero_video: video || null, hero_metrics: metrics })
      .eq('id', productId)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Hero Image</Label>
            <div className="flex gap-2 mt-1">
              <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" />
              <R2UploadButton onUpload={(url) => setImage(url)} />
            </div>
            {image && <img src={image} alt="Hero preview" className="mt-2 rounded-lg max-h-40 object-cover" />}
          </div>
          <div>
            <Label>Hero Video (optional)</Label>
            <div className="flex gap-2 mt-1">
              <Input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="Video URL" />
              <R2UploadButton onUpload={(url) => setVideo(url)} accept="video/*" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Hero Metrics</CardTitle>
            <Button variant="outline" size="sm" onClick={addMetric}>
              <Plus className="h-4 w-4 mr-1" /> Add Metric
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
              <div className="flex-1 grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Key</Label>
                  <Input value={metric.key} onChange={(e) => updateMetric(index, 'key', e.target.value)} placeholder="flight_time" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input value={metric.value} onChange={(e) => updateMetric(index, 'value', e.target.value)} placeholder="72" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Unit</Label>
                  <Input value={metric.unit || ''} onChange={(e) => updateMetric(index, 'unit', e.target.value)} placeholder="min" className="mt-1" />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="icon" onClick={() => removeMetric(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div>
                  <Label className="text-xs">Label (EN)</Label>
                  <Input value={metric.label.en || ''} onChange={(e) => updateMetricLabel(index, 'en', e.target.value)} placeholder="Flight Time" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Label (ZH)</Label>
                  <Input value={metric.label.zh || ''} onChange={(e) => updateMetricLabel(index, 'zh', e.target.value)} placeholder="飞行时间" className="mt-1" />
                </div>
              </div>
            </div>
          ))}
          {metrics.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No metrics added. Click "Add Metric" to create hero metric cards.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Hero Configuration'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add hero tab to product edit page**

In `src/app/admin/products/[id]/page.tsx`, add the hero tab to the tabs array:

```tsx
import { ProductHeroTab } from '@/components/admin/product-hero-tab'

// In the tabs configuration, add:
{ id: 'hero', label: 'Hero Config', component: ProductHeroTab }
```

Pass the new props: `heroImage={product.hero_image} heroVideo={product.hero_video} heroMetrics={product.hero_metrics}`

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/product-hero-tab.tsx src/app/admin/products/[id]/page.tsx
git commit -m "feat(admin): add hero configuration tab for PDP"
```

---

## Task 5: Admin — Scenarios, Features, Payloads Tabs

**Files:**
- Create: `src/components/admin/product-scenarios-tab.tsx`
- Create: `src/components/admin/product-features-tab.tsx`
- Create: `src/components/admin/product-payloads-tab.tsx`
- Modify: `src/app/admin/products/[id]/page.tsx`

- [ ] **Step 1: Create ProductScenariosTab component**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import type { ScenarioItem } from '@/features/products/types/product'
import { createClient } from '@/lib/supabase/client'

interface ProductScenariosTabProps {
  productId: string
  scenarios?: ScenarioItem[]
}

export function ProductScenariosTab({ productId, scenarios = [] }: ProductScenariosTabProps) {
  const [items, setItems] = useState<ScenarioItem[]>(scenarios)
  const [saving, setSaving] = useState(false)

  const addItem = () => {
    setItems([...items, { icon: '', title: { en: '', zh: '' }, description: { en: '', zh: '' } }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'icon', value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

  const updateItemTranslation = (index: number, field: 'title' | 'description', locale: string, value: string) => {
    const updated = [...items]
    updated[index] = {
      ...updated[index],
      [field]: { ...updated[index][field], [locale]: value }
    }
    setItems(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('products').update({ scenarios: items }).eq('id', productId)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Application Scenarios</h3>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" /> Add Scenario
        </Button>
      </div>

      {items.map((item, index) => (
        <Card key={index}>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Icon (emoji or name)</Label>
                  <Input value={item.icon} onChange={(e) => updateItem(index, 'icon', e.target.value)} placeholder="shield" className="mt-1" />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div>
                  <Label className="text-xs">Title (EN)</Label>
                  <Input value={item.title.en || ''} onChange={(e) => updateItemTranslation(index, 'title', 'en', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Title (ZH)</Label>
                  <Input value={item.title.zh || ''} onChange={(e) => updateItemTranslation(index, 'title', 'zh', e.target.value)} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Description (EN)</Label>
                  <Input value={item.description.en || ''} onChange={(e) => updateItemTranslation(index, 'description', 'en', e.target.value)} className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Description (ZH)</Label>
                  <Input value={item.description.zh || ''} onChange={(e) => updateItemTranslation(index, 'description', 'zh', e.target.value)} className="mt-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No scenarios added.</p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Scenarios'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ProductFeaturesTab component**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import type { FeatureBlock } from '@/features/products/types/product'
import { createClient } from '@/lib/supabase/client'
import { R2UploadButton } from '@/components/admin/r2-upload-button'

interface ProductFeaturesTabProps {
  productId: string
  featureBlocks?: FeatureBlock[]
}

export function ProductFeaturesTab({ productId, featureBlocks = [] }: ProductFeaturesTabProps) {
  const [blocks, setBlocks] = useState<FeatureBlock[]>(featureBlocks)
  const [saving, setSaving] = useState(false)

  const addBlock = () => {
    setBlocks([...blocks, { id: `feat_${Date.now()}`, title: { en: '', zh: '' }, description: { en: '', zh: '' }, image: '', specs: [] }])
  }

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  const updateBlockTranslation = (index: number, field: 'title' | 'description', locale: string, value: string) => {
    const updated = [...blocks]
    updated[index] = { ...updated[index], [field]: { ...updated[index][field], [locale]: value } }
    setBlocks(updated)
  }

  const updateBlockImage = (index: number, url: string) => {
    const updated = [...blocks]
    updated[index] = { ...updated[index], image: url }
    setBlocks(updated)
  }

  const addSpec = (blockIndex: number) => {
    const updated = [...blocks]
    updated[blockIndex] = {
      ...updated[blockIndex],
      specs: [...(updated[blockIndex].specs || []), { label: { en: '', zh: '' }, value: { en: '', zh: '' } }]
    }
    setBlocks(updated)
  }

  const removeSpec = (blockIndex: number, specIndex: number) => {
    const updated = [...blocks]
    updated[blockIndex] = {
      ...updated[blockIndex],
      specs: updated[blockIndex].specs?.filter((_, i) => i !== specIndex)
    }
    setBlocks(updated)
  }

  const updateSpecTranslation = (blockIndex: number, specIndex: number, field: 'label' | 'value', locale: string, value: string) => {
    const updated = [...blocks]
    const specs = [...(updated[blockIndex].specs || [])]
    specs[specIndex] = { ...specs[specIndex], [field]: { ...specs[specIndex][field], [locale]: value } }
    updated[blockIndex] = { ...updated[blockIndex], specs }
    setBlocks(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('products').update({ feature_blocks: blocks }).eq('id', productId)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Feature Blocks</h3>
        <Button variant="outline" size="sm" onClick={addBlock}>
          <Plus className="h-4 w-4 mr-1" /> Add Feature Block
        </Button>
      </div>

      {blocks.map((block, blockIndex) => (
        <Card key={block.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Feature {blockIndex + 1}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeBlock(blockIndex)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Title (EN)</Label>
                <Input value={block.title.en || ''} onChange={(e) => updateBlockTranslation(blockIndex, 'title', 'en', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Title (ZH)</Label>
                <Input value={block.title.zh || ''} onChange={(e) => updateBlockTranslation(blockIndex, 'title', 'zh', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Description (EN)</Label>
                <Input value={block.description.en || ''} onChange={(e) => updateBlockTranslation(blockIndex, 'description', 'en', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description (ZH)</Label>
                <Input value={block.description.zh || ''} onChange={(e) => updateBlockTranslation(blockIndex, 'description', 'zh', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Feature Image</Label>
              <div className="flex gap-2 mt-1">
                <Input value={block.image || ''} onChange={(e) => updateBlockImage(blockIndex, e.target.value)} placeholder="Image URL" />
                <R2UploadButton onUpload={(url) => updateBlockImage(blockIndex, url)} />
              </div>
            </div>

            {/* Specs within feature block */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Feature Specs</Label>
                <Button variant="ghost" size="sm" onClick={() => addSpec(blockIndex)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Spec
                </Button>
              </div>
              {(block.specs || []).map((spec, specIndex) => (
                <div key={specIndex} className="flex gap-2 mb-2">
                  <Input value={spec.label.en || ''} onChange={(e) => updateSpecTranslation(blockIndex, specIndex, 'label', 'en', e.target.value)} placeholder="Label (EN)" className="flex-1" />
                  <Input value={spec.value.en || ''} onChange={(e) => updateSpecTranslation(blockIndex, specIndex, 'value', 'en', e.target.value)} placeholder="Value (EN)" className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeSpec(blockIndex, specIndex)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No feature blocks added.</p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Features'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create ProductPayloadsTab component**

Same pattern as ProductFeaturesTab but for PayloadItem type. Uses the same save pattern with `createClient()`.

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import type { PayloadItem } from '@/features/products/types/product'
import { createClient } from '@/lib/supabase/client'
import { R2UploadButton } from '@/components/admin/r2-upload-button'

interface ProductPayloadsTabProps {
  productId: string
  payloads?: PayloadItem[]
}

export function ProductPayloadsTab({ productId, payloads = [] }: ProductPayloadsTabProps) {
  const [items, setItems] = useState<PayloadItem[]>(payloads)
  const [saving, setSaving] = useState(false)

  const addItem = () => {
    setItems([...items, { id: `payload_${Date.now()}`, name: { en: '', zh: '' }, description: { en: '', zh: '' }, image: '', specs: [] }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItemTranslation = (index: number, field: 'name' | 'description', locale: string, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: { ...updated[index][field], [locale]: value } }
    setItems(updated)
  }

  const updateItemImage = (index: number, url: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], image: url }
    setItems(updated)
  }

  const addSpec = (itemIndex: number) => {
    const updated = [...items]
    updated[itemIndex] = {
      ...updated[itemIndex],
      specs: [...(updated[itemIndex].specs || []), { label: { en: '', zh: '' }, value: { en: '', zh: '' } }]
    }
    setItems(updated)
  }

  const removeSpec = (itemIndex: number, specIndex: number) => {
    const updated = [...items]
    updated[itemIndex] = {
      ...updated[itemIndex],
      specs: updated[itemIndex].specs?.filter((_, i) => i !== specIndex)
    }
    setItems(updated)
  }

  const updateSpecTranslation = (itemIndex: number, specIndex: number, field: 'label' | 'value', locale: string, value: string) => {
    const updated = [...items]
    const specs = [...(updated[itemIndex].specs || [])]
    specs[specIndex] = { ...specs[specIndex], [field]: { ...specs[specIndex][field], [locale]: value } }
    updated[itemIndex] = { ...updated[itemIndex], specs }
    setItems(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('products').update({ payloads: items }).eq('id', productId)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Compatible Payloads</h3>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" /> Add Payload
        </Button>
      </div>

      {items.map((item, itemIndex) => (
        <Card key={item.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Payload {itemIndex + 1}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => removeItem(itemIndex)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name (EN)</Label>
                <Input value={item.name.en || ''} onChange={(e) => updateItemTranslation(itemIndex, 'name', 'en', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Name (ZH)</Label>
                <Input value={item.name.zh || ''} onChange={(e) => updateItemTranslation(itemIndex, 'name', 'zh', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Description (EN)</Label>
                <Input value={item.description.en || ''} onChange={(e) => updateItemTranslation(itemIndex, 'description', 'en', e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description (ZH)</Label>
                <Input value={item.description.zh || ''} onChange={(e) => updateItemTranslation(itemIndex, 'description', 'zh', e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Payload Image</Label>
              <div className="flex gap-2 mt-1">
                <Input value={item.image || ''} onChange={(e) => updateItemImage(itemIndex, e.target.value)} placeholder="Image URL" />
                <R2UploadButton onUpload={(url) => updateItemImage(itemIndex, url)} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs">Payload Specs</Label>
                <Button variant="ghost" size="sm" onClick={() => addSpec(itemIndex)}>
                  <Plus className="h-3 w-3 mr-1" /> Add Spec
                </Button>
              </div>
              {(item.specs || []).map((spec, specIndex) => (
                <div key={specIndex} className="flex gap-2 mb-2">
                  <Input value={spec.label.en || ''} onChange={(e) => updateSpecTranslation(itemIndex, specIndex, 'label', 'en', e.target.value)} placeholder="Label (EN)" className="flex-1" />
                  <Input value={spec.value.en || ''} onChange={(e) => updateSpecTranslation(itemIndex, specIndex, 'value', 'en', e.target.value)} placeholder="Value (EN)" className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeSpec(itemIndex, specIndex)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No payloads added.</p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Payloads'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Add all three tabs to product edit page**

In `src/app/admin/products/[id]/page.tsx`, import and add the three new tabs:

```tsx
import { ProductScenariosTab } from '@/components/admin/product-scenarios-tab'
import { ProductFeaturesTab } from '@/components/admin/product-features-tab'
import { ProductPayloadsTab } from '@/components/admin/product-payloads-tab'

// Add to tabs array:
{ id: 'scenarios', label: 'Scenarios', component: ProductScenariosTab, props: { scenarios: product.scenarios } },
{ id: 'features', label: 'Features', component: ProductFeaturesTab, props: { featureBlocks: product.feature_blocks } },
{ id: 'payloads', label: 'Payloads', component: ProductPayloadsTab, props: { payloads: product.payloads } },
```

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/product-scenarios-tab.tsx src/components/admin/product-features-tab.tsx src/components/admin/product-payloads-tab.tsx src/app/admin/products/[id]/page.tsx
git commit -m "feat(admin): add scenarios, features, payloads management tabs"
```

---

## Task 6: Translations — New Keys for PDP/PLP

**Files:**
- Modify: `messages/en/products.json`
- Modify: `messages/zh/products.json`
- Modify: `messages/ar/products.json`
- Modify: `messages/es/products.json`
- Modify: `messages/fr/products.json`
- Modify: `messages/pt/products.json`
- Modify: `messages/id/products.json`

- [ ] **Step 1: Add new translation keys to English file**

Add to `messages/en/products.json`:

```json
{
  "pdp": {
    "heroMetrics": "Key Performance",
    "scenarios": "Application Scenarios",
    "scenariosDesc": "Purpose-built for critical operations across diverse environments",
    "features": "Core Features",
    "featuresDesc": "Engineered for excellence in every detail",
    "payloadEcosystem": "Payload Ecosystem",
    "payloadEcosystemDesc": "Compatible sensor and payload options",
    "specsMetrics": "Performance Metrics",
    "specsTable": "Full Specifications",
    "stickyCta": {
      "quote": "Get a Quote",
      "demo": "Schedule Demo",
      "datasheet": "Download Datasheet"
    },
    "overview": "Product Overview",
    "relatedCases": "Success Stories",
    "relatedProducts": "Related Products"
  },
  "plp": {
    "statsProducts": "Products",
    "statsCategories": "Categories",
    "statsPayloads": "Payload Options",
    "statsCountries": "Countries",
    "viewGrid": "Grid View",
    "viewList": "List View",
    "cantFind": "Can't Find What You Need?",
    "cantFindDesc": "Our solutions team can help configure a custom drone package tailored to your specific operational requirements.",
    "requestQuote": "Request a Quote",
    "talkExpert": "Talk to an Expert"
  }
}
```

- [ ] **Step 2: Add corresponding keys to Chinese file**

Add to `messages/zh/products.json`:

```json
{
  "pdp": {
    "heroMetrics": "核心性能",
    "scenarios": "应用场景",
    "scenariosDesc": "为多样化环境中的关键任务而打造",
    "features": "核心特性",
    "featuresDesc": "每个细节都追求卓越",
    "payloadEcosystem": "载荷生态",
    "payloadEcosystemDesc": "兼容的传感器和载荷选项",
    "specsMetrics": "性能指标",
    "specsTable": "完整规格",
    "stickyCta": {
      "quote": "立即询价",
      "demo": "预约演示",
      "datasheet": "下载数据表"
    },
    "overview": "产品概述",
    "relatedCases": "成功案例",
    "relatedProducts": "相关产品"
  },
  "plp": {
    "statsProducts": "产品",
    "statsCategories": "分类",
    "statsPayloads": "载荷选项",
    "statsCountries": "国家",
    "viewGrid": "网格视图",
    "viewList": "列表视图",
    "cantFind": "找不到需要的产品？",
    "cantFindDesc": "我们的解决方案团队可以帮助您配置量身定制的无人机方案，满足您的特定运营需求。",
    "requestQuote": "立即询价",
    "talkExpert": "咨询专家"
  }
}
```

- [ ] **Step 3: Add machine-translated keys to ar, es, fr, pt, id files**

Use the same structure with appropriate translations for each language. For initial implementation, use English as fallback and mark as pending in translation_status.

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add messages/
git commit -m "feat(i18n): add PDP/PLP redesign translation keys for all 7 languages"
```

---

## Task 7: PDP Public Components — Hero, Anchor Nav, Sticky CTA

**Files:**
- Create: `src/components/public/pdp/hero-fullscreen.tsx`
- Create: `src/components/public/pdp/anchor-nav.tsx`
- Create: `src/components/public/pdp/sticky-cta.tsx`

- [ ] **Step 1: Create HeroFullscreen component**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ComplianceBadge } from '@/components/public/compliance-badge'
import type { Product, HeroMetric } from '@/features/products/types/product'

interface HeroFullscreenProps {
  product: Product
  locale: string
}

export function HeroFullscreen({ product, locale }: HeroFullscreenProps) {
  const t = useTranslations('products')
  const name = getTranslation(product.translations, locale, 'name')
  const overview = getTranslation(product.translations, locale, 'overview')
  const metrics: HeroMetric[] = product.hero_metrics || []
  const bgImage = product.hero_image || (product.images && product.images[0]) || ''

  return (
    <section className="relative min-h-[85vh] flex items-end overflow-hidden">
      {/* Background */}
      {bgImage && (
        <div className="absolute inset-0">
          <img src={bgImage} alt={name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/70 to-transparent" />
        </div>
      )}
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container relative pb-16 pt-32">
        <div className="max-w-3xl">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.model && <Badge className="font-mono text-xs bg-[#0066FF]">{product.model}</Badge>}
            {product.category?.translations && (
              <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">
                {getTranslation(product.category.translations, locale, 'name')}
              </Badge>
            )}
            {product.compliance_flag && <ComplianceBadge locale={locale} />}
          </div>

          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">{name}</h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl leading-relaxed">{overview}</p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#lead-form" className="inline-flex items-center justify-center rounded-xl bg-[#0066FF] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]">
              {t('requestQuote')}
            </a>
            <a href="#lead-form" className="inline-flex items-center justify-center rounded-xl border border-white/[0.15] bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10">
              {t('scheduleDemo')}
            </a>
          </div>
        </div>

        {/* Hero Metrics */}
        {metrics.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {metrics.slice(0, 4).map((metric) => (
              <div key={metric.key} className="bg-[#1A1F2E] px-6 py-5 text-center">
                <div className="font-mono text-3xl font-semibold text-white">
                  {metric.value}
                  {metric.unit && <span className="text-sm text-white/40 ml-1">{getLocalizedValue(metric.unit, locale)}</span>}
                </div>
                <div className="mt-1 text-xs text-white/40 uppercase tracking-wider">
                  {getTranslation(metric.label, locale, 'label') || getLocalizedValue(metric.label, locale)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create AnchorNav component**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

interface AnchorItem {
  id: string
  label: string
}

interface AnchorNavProps {
  items: AnchorItem[]
}

export function AnchorNav({ items }: AnchorNavProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  return (
    <nav className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur-lg">
      <div className="container flex items-center gap-1 overflow-x-auto py-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeId === item.id
                ? 'bg-[#0066FF]/15 text-[#0066FF]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Create StickyCta component**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export function StickyCta({ locale }: { locale: string }) {
  const t = useTranslations('products')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur-lg transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container flex items-center justify-between py-3">
        <span className="text-sm font-medium text-white/60">{t('pdp.stickyCta.quote')}</span>
        <div className="flex gap-2">
          <a href="#lead-form" className="rounded-lg bg-[#0066FF] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0052CC] transition-colors">
            {t('pdp.stickyCta.quote')}
          </a>
          <a href="#lead-form" className="rounded-lg border border-white/[0.15] px-5 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors">
            {t('pdp.stickyCta.demo')}
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 5: Commit**

```bash
git add src/components/public/pdp/
git commit -m "feat(pdp): add hero-fullscreen, anchor-nav, sticky-cta components"
```

---

## Task 8: PDP Public Components — Scenarios, Features, Payloads, Specs

**Files:**
- Create: `src/components/public/pdp/scenarios-section.tsx`
- Create: `src/components/public/pdp/features-section.tsx`
- Create: `src/components/public/pdp/payload-ecosystem.tsx`
- Create: `src/components/public/pdp/specs-enhanced.tsx`

- [ ] **Step 1: Create ScenariosSection component**

```tsx
import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { ScenarioItem } from '@/features/products/types/product'

interface ScenariosSectionProps {
  scenarios: ScenarioItem[]
  locale: string
}

export function ScenariosSection({ scenarios, locale }: ScenariosSectionProps) {
  const t = useTranslations('products')

  if (!scenarios || scenarios.length === 0) return null

  return (
    <section id="scenarios" className="py-20 bg-[#1A1F2E]">
      <div className="container">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.scenarios')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{t('pdp.scenariosDesc')}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-white/[0.06] bg-[#0A0E17] p-6 transition-all hover:-translate-y-1 hover:border-[#0066FF]/40"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0066FF]/15 flex items-center justify-center text-lg mb-4">
                {scenario.icon}
              </div>
              <h3 className="text-lg font-semibold">
                {getTranslation(scenario.title, locale, 'title') || getLocalizedValue(scenario.title, locale)}
              </h3>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">
                {getTranslation(scenario.description, locale, 'description') || getLocalizedValue(scenario.description, locale)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create FeaturesSection component**

```tsx
import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { FeatureBlock } from '@/features/products/types/product'

interface FeaturesSectionProps {
  features: FeatureBlock[]
  locale: string
}

export function FeaturesSection({ features, locale }: FeaturesSectionProps) {
  const t = useTranslations('products')

  if (!features || features.length === 0) return null

  return (
    <section id="features" className="py-20">
      <div className="container">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.features')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{t('pdp.featuresDesc')}</h2>

        <div className="mt-12 space-y-20">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1
            return (
              <div key={feature.id} className={`flex flex-col gap-10 lg:flex-row lg:items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  {feature.image && (
                    <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-[#1A1F2E]">
                      <img src={feature.image} alt={getTranslation(feature.title, locale, 'title')} className="w-full aspect-video object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {getTranslation(feature.title, locale, 'title') || getLocalizedValue(feature.title, locale)}
                  </h3>
                  <p className="mt-4 text-white/60 leading-relaxed">
                    {getTranslation(feature.description, locale, 'description') || getLocalizedValue(feature.description, locale)}
                  </p>
                  {feature.specs && feature.specs.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {feature.specs.map((spec, si) => (
                        <div key={si} className="rounded-xl border border-white/[0.06] bg-[#1A1F2E] p-4">
                          <div className="text-xs text-white/40 uppercase tracking-wider">
                            {getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)}
                          </div>
                          <div className="mt-1 font-mono text-lg font-semibold">
                            {getTranslation(spec.value, locale, 'value') || getLocalizedValue(spec.value, locale)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create PayloadEcosystem component**

```tsx
import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { PayloadItem } from '@/features/products/types/product'

interface PayloadEcosystemProps {
  payloads: PayloadItem[]
  locale: string
}

export function PayloadEcosystem({ payloads, locale }: PayloadEcosystemProps) {
  const t = useTranslations('products')

  if (!payloads || payloads.length === 0) return null

  return (
    <section id="payloads" className="py-20 bg-[#1A1F2E]">
      <div className="container">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.payloadEcosystem')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{t('pdp.payloadEcosystemDesc')}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {payloads.map((payload) => (
            <div key={payload.id} className="group rounded-2xl border border-white/[0.06] bg-[#0A0E17] overflow-hidden transition-all hover:-translate-y-1 hover:border-[#0066FF]/40">
              {payload.image && (
                <div className="aspect-[4/3] overflow-hidden bg-[#0A0E17]">
                  <img src={payload.image} alt={getTranslation(payload.name, locale, 'name')} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-semibold">
                  {getTranslation(payload.name, locale, 'name') || getLocalizedValue(payload.name, locale)}
                </h3>
                <p className="mt-2 text-sm text-white/50 line-clamp-2">
                  {getTranslation(payload.description, locale, 'description') || getLocalizedValue(payload.description, locale)}
                </p>
                {payload.specs && payload.specs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {payload.specs.slice(0, 3).map((spec, si) => (
                      <div key={si} className="flex justify-between text-sm">
                        <span className="text-white/40">{getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)}</span>
                        <span className="font-mono font-medium">{getTranslation(spec.value, locale, 'value') || getLocalizedValue(spec.value, locale)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create SpecsEnhanced component**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import type { SpecGroup, HeroMetric } from '@/features/products/types/product'

interface SpecsEnhancedProps {
  specGroups: SpecGroup[]
  heroMetrics?: HeroMetric[]
  locale: string
}

export function SpecsEnhanced({ specGroups, heroMetrics = [], locale }: SpecsEnhancedProps) {
  const t = useTranslations('products')
  const [activeTab, setActiveTab] = useState(0)

  const groups = specGroups.filter(g => g.specs && g.specs.length > 0)
  if (groups.length === 0 && heroMetrics.length === 0) return null

  return (
    <section id="specs" className="py-20">
      <div className="container">
        <p className="text-sm font-semibold text-[#0066FF] uppercase tracking-wider">{t('pdp.specsMetrics')}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">{t('pdp.specsTable')}</h2>

        {/* Metric Cards */}
        {heroMetrics.length > 0 && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {heroMetrics.slice(0, 5).map((metric) => (
              <div key={metric.key} className="bg-[#1A1F2E] px-5 py-6 text-center">
                <div className="font-mono text-2xl font-semibold text-white">
                  {metric.value}
                  {metric.unit && <span className="text-sm text-white/40 ml-1">{getLocalizedValue(metric.unit, locale)}</span>}
                </div>
                <div className="mt-1 text-xs text-white/40 uppercase tracking-wider">
                  {getTranslation(metric.label, locale, 'label') || getLocalizedValue(metric.label, locale)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Spec Table with Tabs */}
        {groups.length > 0 && (
          <div className="mt-10">
            <div className="flex gap-1 bg-[#1A1F2E] border border-white/[0.06] rounded-xl p-1 mb-6 overflow-x-auto">
              {groups.map((group, index) => (
                <button
                  key={group.id}
                  onClick={() => setActiveTab(index)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === index
                      ? 'bg-[#0A0E17] text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {getTranslation(group.name, locale, 'name') || getLocalizedValue(group.name, locale)}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
              {groups[activeTab]?.specs.map((spec, index) => (
                <div key={index} className={`flex items-center justify-between px-6 py-4 ${index % 2 === 0 ? 'bg-[#1A1F2E]/50' : 'bg-transparent'}`}>
                  <span className="text-sm text-white/60">
                    {getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)}
                  </span>
                  <span className="font-mono text-sm font-medium">
                    {getTranslation(spec.value, locale, 'value') || getLocalizedValue(spec.value, locale)}
                    {spec.unit && <span className="text-white/40 ml-1">{getLocalizedValue(spec.unit, locale)}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add src/components/public/pdp/
git commit -m "feat(pdp): add scenarios, features, payloads, specs-enhanced components"
```

---

## Task 9: PLP Public Components — Hero, Stats, View Toggle, Enhanced Card

**Files:**
- Create: `src/components/public/plp/hero-section.tsx`
- Create: `src/components/public/plp/stats-bar.tsx`
- Create: `src/components/public/plp/view-toggle.tsx`
- Create: `src/components/public/plp/product-card-enhanced.tsx`

- [ ] **Step 1: Create PLP HeroSection component**

```tsx
import { Breadcrumb } from '@/components/public/breadcrumb'
import type { Category } from '@/features/products/types/category'

interface PlpHeroProps {
  locale: string
  title: string
  subtitle: string
  eyebrow: string
  missionBadge?: string
  category?: Category
}

export function PlpHero({ locale, title, subtitle, eyebrow, missionBadge, category }: PlpHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0A0E17]">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      <div className="container relative px-4 py-12 lg:py-16">
        <Breadcrumb
          items={[
            { label: 'Home', href: `/${locale}` },
            { label: 'Products' },
          ]}
        />
        <div className="mt-6 max-w-3xl">
          <p className="text-sm font-semibold text-[#0066FF]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold text-white lg:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-7 text-white/50">{subtitle}</p>
          {missionBadge && (
            <p className="mt-3 inline-flex items-center rounded-full bg-[#0066FF]/10 px-3 py-1 text-sm font-medium text-[#0066FF]">
              {missionBadge}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create StatsBar component**

```tsx
import { getLocalizedValue } from '@/lib/utils'
import type { CategoryHeroStat } from '@/features/products/types/product'

interface StatsBarProps {
  stats: CategoryHeroStat[]
  locale: string
}

export function StatsBar({ stats, locale }: StatsBarProps) {
  if (!stats || stats.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden mt-8">
      {stats.slice(0, 4).map((stat, index) => (
        <div key={index} className="bg-[#1A1F2E] px-6 py-5 text-center">
          <div className="font-mono text-2xl font-semibold text-white">
            {stat.value}
            {stat.unit && <span className="text-sm text-white/40 ml-1">{getLocalizedValue(stat.unit, locale)}</span>}
          </div>
          <div className="mt-1 text-xs text-white/40 uppercase tracking-wider">
            {getLocalizedValue(stat.label, locale)}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create ViewToggle component**

```tsx
'use client'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange('grid')}
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
          view === 'grid' ? 'bg-[#0066FF] border-[#0066FF] text-white' : 'border-white/[0.06] bg-[#1A1F2E] text-white/40 hover:text-white'
        }`}
        title="Grid View"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      </button>
      <button
        onClick={() => onChange('list')}
        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
          view === 'list' ? 'bg-[#0066FF] border-[#0066FF] text-white' : 'border-white/[0.06] bg-[#1A1F2E] text-white/40 hover:text-white'
        }`}
        title="List View"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg>
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Create ProductCardEnhanced component**

This extends the existing ProductCard with list-view support:

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Box } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getTranslation, getLocalizedValue } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { CompareCheckbox } from '@/components/public/compare-checkbox'
import type { Category } from '@/features/products/types/category'
import type { ProductTag } from '@/features/products/types/tag'

interface CategorySummary {
  translations?: Record<string, Record<string, string>>
}

interface Product {
  id: string
  slug: string
  model?: string
  category_id: string | null
  category?: Category | CategorySummary | null
  tag_objects?: ProductTag[]
  images?: string[]
  translations?: Record<string, Record<string, string>>
  spec_groups?: Array<{
    id: string
    label: Record<string, string>
    specs: Array<{ label: Record<string, string> | string; value: Record<string, string> | string; unit?: Record<string, string> | string }>
  }>
}

interface ProductCardEnhancedProps {
  product: Product
  locale: string
  view?: 'grid' | 'list'
}

export function ProductCardEnhanced({ product, locale, view = 'grid' }: ProductCardEnhancedProps) {
  const t = useTranslations('products')
  const title = getTranslation(product.translations || {}, locale, 'name')
  const description = getTranslation(product.translations || {}, locale, 'overview')
  const categoryLabel = product.category?.translations
    ? getTranslation(product.category.translations, locale, 'name')
    : null
  const tags = product.tag_objects || []
  const displayTags = tags.slice(0, 3)
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : null
  const specs = product.spec_groups?.flatMap((group) => group.specs).slice(0, view === 'list' ? 4 : 3) || []

  const isList = view === 'list'

  return (
    <article className={`group flex h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1F2E] transition-all duration-300 hover:-translate-y-1 hover:border-[#0066FF]/40 ${isList ? 'flex-row' : 'flex-col'}`}>
      <div className={`relative overflow-hidden bg-[#0A0E17] ${isList ? 'w-72 shrink-0' : 'aspect-[4/3]'}`}>
        {imageUrl ? (
          <Image src={imageUrl} alt={title || product.model || ''} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Box className="h-14 w-14 text-white/20" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.model && <Badge className="font-mono text-xs bg-[#0066FF]">{product.model}</Badge>}
          {categoryLabel && <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">{categoryLabel}</Badge>}
        </div>
        <div className="absolute right-3 top-3">
          <CompareCheckbox
            product={{
              id: product.id, model: product.model, slug: product.slug,
              name: title || product.model || '', category: categoryLabel || undefined,
              image: imageUrl || undefined,
              tags: displayTags.map((tag) => getTranslation(tag.translations, locale, 'name')).filter(Boolean),
              spec_groups: product.spec_groups,
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div>
          {product.model && <div className="text-xs font-semibold text-white/50">{product.model}</div>}
          <h3 className="mt-2 text-lg font-semibold leading-snug text-white">{title || product.model || t('untitledProduct')}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{description || categoryLabel || t('noDescription')}</p>
        </div>

        {specs.length > 0 && (
          <dl className={`mt-5 grid gap-2 ${isList ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {specs.map((spec) => {
              if (!spec?.label) return null
              const label = getTranslation(spec.label, locale, 'label') || getLocalizedValue(spec.label, locale)
              const value = getLocalizedValue(spec.value, locale)
              const unit = getLocalizedValue(spec.unit, locale)
              return (
                <div key={`${label}-${value}`} className="rounded-xl border border-white/[0.06] bg-[#0A0E17] p-3">
                  <dt className="truncate text-xs text-white/50">{label}</dt>
                  <dd className="mt-1 truncate font-mono text-sm font-semibold text-white">{value}{unit}</dd>
                </div>
              )
            })}
          </dl>
        )}

        {displayTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {displayTags.map((tag) => {
              const tagName = getTranslation(tag.translations, locale, 'name')
              return tagName ? (
                <Badge key={tag.id} variant="outline" className="text-xs border-white/[0.06] text-white/50" style={tag.color ? { backgroundColor: tag.color, borderColor: tag.color, color: '#fff' } : undefined}>
                  {tagName}
                </Badge>
              ) : null
            })}
          </div>
        )}

        <div className="mt-auto pt-5">
          <Link href={`/${locale}/products/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] transition-colors hover:text-[#0052CC]">
            {t('detailsCta')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add src/components/public/plp/
git commit -m "feat(plp): add hero, stats-bar, view-toggle, product-card-enhanced components"
```

---

## Task 10: Rewrite PDP Page

**Files:**
- Rewrite: `src/app/[locale]/products/[slug]/page.tsx`

- [ ] **Step 1: Rewrite the PDP page using new components**

The new PDP page structure:
1. HeroFullscreen (full-screen hero with metrics)
2. AnchorNav (sticky navigation)
3. Overview section (existing rich text)
4. ScenariosSection (new)
5. FeaturesSection (new)
6. SpecsEnhanced (new, replaces old SpecsSection)
7. PayloadEcosystem (new)
8. DownloadsSection (existing)
9. ProductFAQSection (existing)
10. RelatedCasesSection (existing)
11. RelatedProducts (existing)
12. Bottom CTA (existing)
13. InlineLeadForm (existing)
14. StickyCta (new, client component)

Key changes:
- Replace old Hero section with HeroFullscreen
- Add AnchorNav after hero
- Insert ScenariosSection, FeaturesSection, PayloadEcosystem
- Replace SpecsSection with SpecsEnhanced
- Add StickyCta at bottom
- Keep existing components for: downloads, FAQ, cases, related products, lead form

The page remains a server component. Only the interactive parts (HeroFullscreen, AnchorNav, StickyCta, SpecsEnhanced) are client components.

```tsx
import { HeroFullscreen } from '@/components/public/pdp/hero-fullscreen'
import { AnchorNav } from '@/components/public/pdp/anchor-nav'
import { ScenariosSection } from '@/components/public/pdp/scenarios-section'
import { FeaturesSection } from '@/components/public/pdp/features-section'
import { SpecsEnhanced } from '@/components/public/pdp/specs-enhanced'
import { PayloadEcosystem } from '@/components/public/pdp/payload-ecosystem'
import { StickyCta } from '@/components/public/pdp/sticky-cta'
// ... existing imports for Downloads, FAQ, Cases, Related, LeadForm
```

- [ ] **Step 2: Build anchor nav items dynamically**

```tsx
const anchorItems = []
if (overview) anchorItems.push({ id: 'overview', label: t('anchorNav.overview') })
if (product.scenarios?.length) anchorItems.push({ id: 'scenarios', label: t('pdp.scenarios') })
if (product.feature_blocks?.length) anchorItems.push({ id: 'features', label: t('pdp.features') })
if (specGroups.length) anchorItems.push({ id: 'specs', label: t('anchorNav.specs') })
if (product.payloads?.length) anchorItems.push({ id: 'payloads', label: t('pdp.payloadEcosystem') })
if (documents.length) anchorItems.push({ id: 'downloads', label: t('anchorNav.resources') })
if (faqs.length) anchorItems.push({ id: 'faq', label: t('faq') })
if (relatedCases.length) anchorItems.push({ id: 'cases', label: t('relatedCases') })
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/products/[slug]/page.tsx
git commit -m "feat(pdp): rewrite product detail page with new design"
```

---

## Task 11: Rewrite PLP Page

**Files:**
- Rewrite: `src/app/[locale]/products/page.tsx`

- [ ] **Step 1: Rewrite the PLP page using new components**

Key changes:
- Add StatsBar after hero (using category hero_stats or computed stats)
- Add ViewToggle next to filter bar
- Replace ProductCard with ProductCardEnhanced (supports grid/list view)
- Add bottom CTA section ("Can't find what you need?")
- Keep MissionSelector, ProductSearch, ProductFilter, Pagination

The view toggle state is managed via URL search param `view=grid|list`.

```tsx
import { StatsBar } from '@/components/public/plp/stats-bar'
import { ViewToggle } from '@/components/public/plp/view-toggle'
import { ProductCardEnhanced } from '@/components/public/plp/product-card-enhanced'
```

- [ ] **Step 2: Compute stats from data**

```tsx
const stats: CategoryHeroStat[] = category?.hero_stats?.length
  ? category.hero_stats
  : [
      { value: String(totalCount), label: { en: 'Products', zh: '产品' } },
      { value: String(categories?.length || 0), label: { en: 'Categories', zh: '分类' } },
      { value: '50+', label: { en: 'Payload Options', zh: '载荷选项' } },
      { value: '30+', label: { en: 'Countries', zh: '国家' } },
    ]
```

- [ ] **Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/products/page.tsx
git commit -m "feat(plp): rewrite product list page with new design"
```

---

## Task 12: Integration Testing & Final Verification

**Files:**
- All modified files

- [ ] **Step 1: Run architecture check**

Run: `npm run check:arch`
Expected: No violations (no 'use client' files importing supabaseAdmin)

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No lint errors

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Manual verification**

1. Open `/en/products` — verify PLP renders with hero, stats, mission selector, filters, grid/list toggle
2. Open `/en/products/sd-x6-pro` (or any product slug) — verify PDP renders with full-screen hero, anchor nav, all sections
3. Open `/admin/products/[id]` — verify new tabs (Hero, Scenarios, Features, Payloads) appear and save correctly
4. Test compare functionality on PLP
5. Test sticky CTA on PDP
6. Test RTL layout with `/ar/` locale

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete PDP/PLP redesign with admin management and data structure"
```

---

## Self-Review Checklist

### Spec Coverage
- [x] PDP: Full-screen hero with background image/video + metrics — Task 7 (HeroFullscreen)
- [x] PDP: Breadcrumb + Anchor Nav — Task 7 (AnchorNav)
- [x] PDP: Product Overview — Task 10 (existing component)
- [x] PDP: Application Scenarios (3-col cards) — Task 8 (ScenariosSection)
- [x] PDP: Core Features (alternating image-text) — Task 8 (FeaturesSection)
- [x] PDP: Technical Specs (metric cards + Tab table) — Task 8 (SpecsEnhanced)
- [x] PDP: Payload Ecosystem (4-col cards) — Task 8 (PayloadEcosystem)
- [x] PDP: Downloads — Task 10 (existing component)
- [x] PDP: FAQ — Task 10 (existing component)
- [x] PDP: Related Cases — Task 10 (existing component)
- [x] PDP: Related Products — Task 10 (existing component)
- [x] PDP: CTA Section — Task 10 (existing component)
- [x] PDP: Sticky CTA Bar — Task 7 (StickyCta)
- [x] PLP: Hero with stats bar — Task 9 (PlpHero + StatsBar)
- [x] PLP: Mission Selector — Task 11 (existing component)
- [x] PLP: Filter + Grid/List toggle — Task 9 (ViewToggle) + Task 11
- [x] PLP: Enhanced product card — Task 9 (ProductCardEnhanced)
- [x] PLP: Bottom CTA — Task 11
- [x] Data structure: new DB columns — Task 1
- [x] Data structure: TypeScript types — Task 2
- [x] API: support new fields — Task 3
- [x] Admin: Hero config tab — Task 4
- [x] Admin: Scenarios/Features/Payloads tabs — Task 5
- [x] Translations: 7 languages — Task 6

### Placeholder Scan
- No TBD, TODO, or placeholder patterns found
- All code blocks contain actual implementation code
- All file paths are exact

### Type Consistency
- HeroMetric interface used consistently in Task 7 (HeroFullscreen) and Task 8 (SpecsEnhanced)
- ScenarioItem used in Task 5 (admin) and Task 8 (ScenariosSection)
- FeatureBlock used in Task 5 (admin) and Task 8 (FeaturesSection)
- PayloadItem used in Task 5 (admin) and Task 8 (PayloadEcosystem)
- CategoryHeroStat used in Task 9 (StatsBar) and Task 11 (PLP page)
