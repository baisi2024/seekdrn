# 完整B2B产品管理系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建完整的B2B产品管理系统，包含分类管理、标签管理、SEO优化、GEO/AI优化、产品文档、FAQ、关联管理等功能。

**Architecture:** 采用模块化架构，按功能域划分文件。后台使用Tab式产品编辑页面，前台优化产品详情页展示。SEO通过Schema.org结构化数据和元数据实现，GEO通过标准化规格和FAQ实现AI友好。

**Tech Stack:** Next.js 15, React 19, Supabase PostgreSQL, Zustand, shadcn/ui, Tiptap

---

## 文件结构

### 新建文件
```
supabase/migrations/
  008_product_seo.sql           # SEO元数据表
  009_product_faqs.sql          # FAQ表
  010_product_documents.sql     # 文档表
  011_product_relations.sql     # 关联表

src/features/products/
  types/
    seo.ts                      # SEO类型
    faq.ts                      # FAQ类型
    document.ts                 # 文档类型
    tag.ts                      # 标签类型
  api/
    seo.ts                      # SEO API
    faqs.ts                     # FAQ API
    documents.ts                # 文档 API
    tags.ts                     # 标签 API
    relations.ts                # 关联 API
  components/admin/
    product-tabs/
      index.tsx                 # Tab容器
      basic-info-tab.tsx        # 基本信息Tab
      content-tab.tsx           # 内容Tab
      specs-tab.tsx             # 规格Tab
      documents-tab.tsx         # 文档Tab
      seo-tab.tsx               # SEO Tab
      faq-tab.tsx               # FAQ Tab
      relations-tab.tsx         # 关联Tab
    category-manager/
      index.tsx                 # 分类管理器
      category-tree.tsx         # 分类树
      category-form.tsx         # 分类表单
    tag-manager/
      index.tsx                 # 标签管理器
      tag-form.tsx              # 标签表单
    standardized-specs/
      index.tsx                 # 标准化规格编辑器
      spec-field.tsx            # 规格字段

src/app/admin/
  categories/page.tsx           # 分类管理页
  tags/page.tsx                 # 标签管理页

src/components/seo/
  product-schema.tsx            # 产品结构化数据
  meta-tags.tsx                 # 元数据标签
```

### 修改文件
```
src/features/products/types/product.ts    # 扩展Product类型
src/features/products/types/index.ts      # 导出新类型
src/features/products/api/products.ts     # 扩展产品API
src/app/admin/products/[id]/page.tsx      # 重构为Tab式
src/app/admin/products/page.tsx           # 增强列表页
src/app/admin/products/products-client.tsx # 批量操作
```

---

## Phase 1: 数据模型

### Task 1.1: 创建SEO元数据表迁移

**Files:**
- Create: `supabase/migrations/008_product_seo.sql`

- [ ] **Step 1: 创建迁移文件**

```sql
-- 008_product_seo.sql
-- 产品SEO元数据表

CREATE TABLE product_seo (
  product_id       uuid REFERENCES products(id) ON DELETE CASCADE,
  locale           text NOT NULL,
  meta_title       text,
  meta_description text,
  meta_keywords    text[],
  og_title         text,
  og_description   text,
  og_image         text,
  structured_data  jsonb,
  PRIMARY KEY (product_id, locale)
);

-- 索引
CREATE INDEX idx_product_seo_product ON product_seo(product_id);

-- RLS
ALTER TABLE product_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product SEO"
  ON product_seo FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_seo.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product SEO"
  ON product_seo FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE product_seo IS '产品SEO元数据表，按语言存储';
```

- [ ] **Step 2: 运行迁移**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/008_product_seo.sql
git commit -m "feat(db): add product_seo table for SEO metadata"
```

---

### Task 1.2: 创建FAQ表迁移

**Files:**
- Create: `supabase/migrations/009_product_faqs.sql`

- [ ] **Step 1: 创建迁移文件**

```sql
-- 009_product_faqs.sql
-- 产品FAQ表（GEO/AI优化）

CREATE TABLE product_faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE,
  locale      text NOT NULL,
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_faqs_product ON product_faqs(product_id, locale);
CREATE INDEX idx_faqs_sort ON product_faqs(sort_order);

-- RLS
ALTER TABLE product_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product FAQs"
  ON product_faqs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_faqs.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product FAQs"
  ON product_faqs FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE product_faqs IS '产品FAQ表，用于GEO/AI优化';
```

- [ ] **Step 2: 运行迁移**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/009_product_faqs.sql
git commit -m "feat(db): add product_faqs table for GEO/AI optimization"
```

---

### Task 1.3: 创建文档表迁移

**Files:**
- Create: `supabase/migrations/010_product_documents.sql`

- [ ] **Step 1: 创建迁移文件**

```sql
-- 010_product_documents.sql
-- 产品文档表

CREATE TABLE product_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid REFERENCES products(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('manual', 'datasheet', 'certificate', 'brochure', 'other')),
  translations jsonb NOT NULL DEFAULT '{}',
  file_url     text NOT NULL,
  file_size    int,
  file_type    text,
  language     text,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_documents_product ON product_documents(product_id);
CREATE INDEX idx_documents_type ON product_documents(type);
CREATE INDEX idx_documents_sort ON product_documents(sort_order);

-- RLS
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product documents"
  ON product_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_documents.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product documents"
  ON product_documents FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE product_documents IS '产品文档表，支持手册、数据表、证书等';
```

- [ ] **Step 2: 运行迁移**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/010_product_documents.sql
git commit -m "feat(db): add product_documents table"
```

---

### Task 1.4: 创建关联表迁移

**Files:**
- Create: `supabase/migrations/011_product_relations.sql`

- [ ] **Step 1: 创建迁移文件**

```sql
-- 011_product_relations.sql
-- 产品关联表

CREATE TABLE product_relations (
  product_id     uuid REFERENCES products(id) ON DELETE CASCADE,
  related_id     uuid NOT NULL,
  relation_type  text NOT NULL CHECK (relation_type IN ('case_study', 'solution', 'related_product')),
  sort_order     int NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, related_id, relation_type)
);

-- 索引
CREATE INDEX idx_relations_product ON product_relations(product_id);
CREATE INDEX idx_relations_related ON product_relations(related_id, relation_type);
CREATE INDEX idx_relations_type ON product_relations(relation_type);

-- RLS
ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product relations"
  ON product_relations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_relations.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product relations"
  ON product_relations FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE product_relations IS '产品关联表，支持案例、解决方案、相关产品关联';
```

- [ ] **Step 2: 运行迁移**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/011_product_relations.sql
git commit -m "feat(db): add product_relations table"
```

---

### Task 1.5: 扩展产品表字段

**Files:**
- Create: `supabase/migrations/012_product_standardized_specs.sql`

- [ ] **Step 1: 创建迁移文件**

```sql
-- 012_product_standardized_specs.sql
-- 扩展产品表，添加标准化规格字段

ALTER TABLE products ADD COLUMN IF NOT EXISTS specs_standardized jsonb DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

-- 更新现有产品的sort_order
UPDATE products SET sort_order = EXTRACT(EPOCH FROM created_at)::int WHERE sort_order IS NULL OR sort_order = 0;

CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);

COMMENT ON COLUMN products.specs_standardized IS '标准化规格，格式: {key: {value: number, unit: string}}';
COMMENT ON COLUMN products.sort_order IS '排序权重';
```

- [ ] **Step 2: 运行迁移**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/012_product_standardized_specs.sql
git commit -m "feat(db): add specs_standardized and sort_order to products"
```

---

## Phase 2: 类型定义和API

### Task 2.1: 创建SEO类型定义

**Files:**
- Create: `src/features/products/types/seo.ts`
- Modify: `src/features/products/types/index.ts`

- [ ] **Step 1: 创建SEO类型**

```typescript
// src/features/products/types/seo.ts

export interface ProductSEO {
  product_id: string
  locale: string
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[]
  og_title: string | null
  og_description: string | null
  og_image: string | null
  structured_data: Record<string, unknown> | null
}

export interface SEOFormData {
  meta_title: string
  meta_description: string
  meta_keywords: string[]
  og_title: string
  og_description: string
  og_image: string
}

export const SEO_LIMITS = {
  meta_title: 60,
  meta_description: 160,
  og_title: 60,
  og_description: 200,
} as const
```

- [ ] **Step 2: 更新类型导出**

在 `src/features/products/types/index.ts` 中添加:

```typescript
export * from './seo'
export * from './faq'
export * from './document'
export * from './tag'
```

- [ ] **Step 3: 提交**

```bash
git add src/features/products/types/seo.ts src/features/products/types/index.ts
git commit -m "feat(types): add ProductSEO type definition"
```

---

### Task 2.2: 创建FAQ类型定义

**Files:**
- Create: `src/features/products/types/faq.ts`

- [ ] **Step 1: 创建FAQ类型**

```typescript
// src/features/products/types/faq.ts

export interface ProductFAQ {
  id: string
  product_id: string
  locale: string
  question: string
  answer: string
  sort_order: number
  created_at: string
}

export interface FAQFormData {
  question: string
  answer: string
}

export interface FAQWithLocale extends ProductFAQ {
  locale_name?: string
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/types/faq.ts
git commit -m "feat(types): add ProductFAQ type definition"
```

---

### Task 2.3: 创建文档类型定义

**Files:**
- Create: `src/features/products/types/document.ts`

- [ ] **Step 1: 创建文档类型**

```typescript
// src/features/products/types/document.ts

export type DocumentType = 'manual' | 'datasheet' | 'certificate' | 'brochure' | 'other'

export interface ProductDocument {
  id: string
  product_id: string
  type: DocumentType
  translations: Record<string, { title: string; description?: string }>
  file_url: string
  file_size: number | null
  file_type: string | null
  language: string | null
  sort_order: number
  created_at: string
}

export interface DocumentFormData {
  type: DocumentType
  translations: Record<string, { title: string; description?: string }>
  file_url: string
  language: string
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, Record<string, string>> = {
  manual: { en: 'Manual', zh: '手册' },
  datasheet: { en: 'Datasheet', zh: '数据表' },
  certificate: { en: 'Certificate', zh: '证书' },
  brochure: { en: 'Brochure', zh: '宣传册' },
  other: { en: 'Other', zh: '其他' },
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/types/document.ts
git commit -m "feat(types): add ProductDocument type definition"
```

---

### Task 2.4: 创建标签类型定义

**Files:**
- Create: `src/features/products/types/tag.ts`

- [ ] **Step 1: 创建标签类型**

```typescript
// src/features/products/types/tag.ts

export interface ProductTag {
  id: string
  slug: string
  translations: Record<string, { name: string }>
  color: string
  created_at: string
  product_count?: number
}

export interface TagFormData {
  slug: string
  translations: Record<string, { name: string }>
  color: string
}

export interface ProductTagRelation {
  product_id: string
  tag_id: string
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/types/tag.ts
git commit -m "feat(types): add ProductTag type definition"
```

---

### Task 2.5: 扩展Product类型

**Files:**
- Modify: `src/features/products/types/product.ts`

- [ ] **Step 1: 添加标准化规格类型**

在 `src/features/products/types/product.ts` 中添加:

```typescript
// 标准化规格
export interface StandardizedSpec {
  value: number
  unit: string
  label?: Record<string, string>
}

export interface ProductSpecsStandardized {
  weight?: StandardizedSpec
  maxTakeOffWeight?: StandardizedSpec
  wingspan?: StandardizedSpec
  length?: StandardizedSpec
  maxEndurance?: StandardizedSpec
  maxRange?: StandardizedSpec
  cruiseSpeed?: StandardizedSpec
  maxSpeed?: StandardizedSpec
  maxCeiling?: StandardizedSpec
  payloadCapacity?: StandardizedSpec
  maxControlDistance?: StandardizedSpec
  [key: string]: StandardizedSpec | undefined
}

// 在 Product interface 中添加:
// specs_standardized: ProductSpecsStandardized
// seo?: Record<string, ProductSEO>
// faqs?: ProductFAQ[]
// documents?: ProductDocument[]
// relations?: ProductRelation[]
```

- [ ] **Step 2: 更新Product接口**

```typescript
import type { Category } from './category'
import type { ProductSEO } from './seo'
import type { ProductFAQ } from './faq'
import type { ProductDocument } from './document'
import type { ProductTag } from './tag'

export interface Product {
  id: string
  model: string
  slug: string
  category_id: string | null
  category?: Category
  translations: Record<string, Record<string, string>>
  translation_status: Record<string, Record<string, TranslationStatus>>
  images: string[]
  videos: string[]
  tags: string[]
  tag_objects?: ProductTag[]
  published: boolean
  featured: boolean
  compliance_flag: boolean
  spec_groups: SpecGroup[]
  specs_standardized: ProductSpecsStandardized
  sort_order: number
  seo?: Record<string, ProductSEO>
  faqs?: ProductFAQ[]
  documents?: ProductDocument[]
  created_at: string
  updated_at: string
}
```

- [ ] **Step 3: 提交**

```bash
git add src/features/products/types/product.ts
git commit -m "feat(types): extend Product with standardized specs and relations"
```

---

### Task 2.6: 创建SEO API

**Files:**
- Create: `src/features/products/api/seo.ts`

- [ ] **Step 1: 创建SEO API**

```typescript
// src/features/products/api/seo.ts

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductSEO, SEOFormData } from '../types'

export async function getProductSEO(productId: string): Promise<Record<string, ProductSEO>> {
  const { data, error } = await supabaseAdmin
    .from('product_seo')
    .select('*')
    .eq('product_id', productId)

  if (error) throw error

  return data.reduce((acc, seo) => {
    acc[seo.locale] = seo
    return acc
  }, {} as Record<string, ProductSEO>)
}

export async function updateProductSEO(
  productId: string,
  locale: string,
  seo: SEOFormData
): Promise<ProductSEO> {
  const { data, error } = await supabaseAdmin
    .from('product_seo')
    .upsert({
      product_id: productId,
      locale,
      ...seo,
      meta_keywords: seo.meta_keywords || [],
    })
    .select()
    .single()

  if (error) throw error
  return data as ProductSEO
}

export async function generateSEOFromProduct(
  productId: string,
  locale: string
): Promise<SEOFormData> {
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('id', productId)
    .single()

  if (error) throw error

  const translation = product.translations?.[locale] || {}
  const siteName = 'SEEKDRN'

  return {
    meta_title: translation.name ? `${translation.name} | ${siteName}` : '',
    meta_description: truncate(translation.overview || '', 160),
    meta_keywords: extractKeywords(translation),
    og_title: translation.name || '',
    og_description: truncate(translation.overview || '', 200),
    og_image: product.images?.[0] || '',
  }
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

function extractKeywords(translation: Record<string, string>): string[] {
  const text = `${translation.name || ''} ${translation.overview || ''} ${translation.advantages || ''}`
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  return [...new Set(words)].slice(0, 10)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/api/seo.ts
git commit -m "feat(api): add product SEO API"
```

---

### Task 2.7: 创建FAQ API

**Files:**
- Create: `src/features/products/api/faqs.ts`

- [ ] **Step 1: 创建FAQ API**

```typescript
// src/features/products/api/faqs.ts

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductFAQ, FAQFormData } from '../types'

export async function getProductFAQs(productId: string, locale?: string): Promise<ProductFAQ[]> {
  let query = supabaseAdmin
    .from('product_faqs')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')

  if (locale) {
    query = query.eq('locale', locale)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProductFAQ[]
}

export async function createProductFAQ(
  productId: string,
  locale: string,
  faq: FAQFormData
): Promise<ProductFAQ> {
  const { data: maxOrder } = await supabaseAdmin
    .from('product_faqs')
    .select('sort_order')
    .eq('product_id', productId)
    .eq('locale', locale)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabaseAdmin
    .from('product_faqs')
    .insert([{
      product_id: productId,
      locale,
      ...faq,
      sort_order: (maxOrder?.sort_order || 0) + 1,
    }])
    .select()
    .single()

  if (error) throw error
  return data as ProductFAQ
}

export async function updateProductFAQ(
  faqId: string,
  faq: Partial<FAQFormData>
): Promise<ProductFAQ> {
  const { data, error } = await supabaseAdmin
    .from('product_faqs')
    .update(faq)
    .eq('id', faqId)
    .select()
    .single()

  if (error) throw error
  return data as ProductFAQ
}

export async function deleteProductFAQ(faqId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('product_faqs')
    .delete()
    .eq('id', faqId)

  if (error) throw error
}

export async function reorderProductFAQs(
  productId: string,
  locale: string,
  faqIds: string[]
): Promise<void> {
  const updates = faqIds.map((id, index) =>
    supabaseAdmin
      .from('product_faqs')
      .update({ sort_order: index })
      .eq('id', id)
  )

  await Promise.all(updates)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/api/faqs.ts
git commit -m "feat(api): add product FAQ API"
```

---

### Task 2.8: 创建文档API

**Files:**
- Create: `src/features/products/api/documents.ts`

- [ ] **Step 1: 创建文档API**

```typescript
// src/features/products/api/documents.ts

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductDocument, DocumentFormData, DocumentType } from '../types'

export async function getProductDocuments(
  productId: string,
  type?: DocumentType
): Promise<ProductDocument[]> {
  let query = supabaseAdmin
    .from('product_documents')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProductDocument[]
}

export async function createProductDocument(
  productId: string,
  doc: DocumentFormData
): Promise<ProductDocument> {
  const { data: maxOrder } = await supabaseAdmin
    .from('product_documents')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabaseAdmin
    .from('product_documents')
    .insert([{
      product_id: productId,
      ...doc,
      sort_order: (maxOrder?.sort_order || 0) + 1,
    }])
    .select()
    .single()

  if (error) throw error
  return data as ProductDocument
}

export async function updateProductDocument(
  docId: string,
  doc: Partial<DocumentFormData>
): Promise<ProductDocument> {
  const { data, error } = await supabaseAdmin
    .from('product_documents')
    .update(doc)
    .eq('id', docId)
    .select()
    .single()

  if (error) throw error
  return data as ProductDocument
}

export async function deleteProductDocument(docId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('product_documents')
    .delete()
    .eq('id', docId)

  if (error) throw error
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/api/documents.ts
git commit -m "feat(api): add product documents API"
```

---

### Task 2.9: 创建标签API

**Files:**
- Create: `src/features/products/api/tags.ts`

- [ ] **Step 1: 创建标签API**

```typescript
// src/features/products/api/tags.ts

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ProductTag, TagFormData } from '../types'

export async function getTags(): Promise<ProductTag[]> {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .select('*, product_tag_relations(count)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(tag => ({
    ...tag,
    product_count: tag.product_tag_relations?.[0]?.count || 0,
  })) as ProductTag[]
}

export async function createTag(tag: TagFormData): Promise<ProductTag> {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .insert([tag])
    .select()
    .single()

  if (error) throw error
  return data as ProductTag
}

export async function updateTag(id: string, tag: Partial<TagFormData>): Promise<ProductTag> {
  const { data, error } = await supabaseAdmin
    .from('product_tags')
    .update(tag)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ProductTag
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('product_tags')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getProductTags(productId: string): Promise<ProductTag[]> {
  const { data, error } = await supabaseAdmin
    .from('product_tag_relations')
    .select('tag:product_tags(*)')
    .eq('product_id', productId)

  if (error) throw error

  return data.map(r => r.tag) as ProductTag[]
}

export async function updateProductTags(productId: string, tagIds: string[]): Promise<void> {
  // 删除现有关联
  await supabaseAdmin
    .from('product_tag_relations')
    .delete()
    .eq('product_id', productId)

  // 添加新关联
  if (tagIds.length > 0) {
    const relations = tagIds.map(tagId => ({
      product_id: productId,
      tag_id: tagId,
    }))

    const { error } = await supabaseAdmin
      .from('product_tag_relations')
      .insert(relations)

    if (error) throw error
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/api/tags.ts
git commit -m "feat(api): add product tags API"
```

---

### Task 2.10: 创建关联API

**Files:**
- Create: `src/features/products/api/relations.ts`

- [ ] **Step 1: 创建关联API**

```typescript
// src/features/products/api/relations.ts

import { supabaseAdmin } from '@/lib/supabase/admin'

export type RelationType = 'case_study' | 'solution' | 'related_product'

export interface ProductRelation {
  product_id: string
  related_id: string
  relation_type: RelationType
  sort_order: number
}

export interface RelatedItem {
  id: string
  type: RelationType
  data: Record<string, unknown>
}

export async function getProductRelations(
  productId: string,
  type?: RelationType
): Promise<ProductRelation[]> {
  let query = supabaseAdmin
    .from('product_relations')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')

  if (type) {
    query = query.eq('relation_type', type)
  }

  const { data, error } = await query

  if (error) throw error
  return data as ProductRelation[]
}

export async function addProductRelation(
  productId: string,
  relatedId: string,
  type: RelationType
): Promise<ProductRelation> {
  const { data: maxOrder } = await supabaseAdmin
    .from('product_relations')
    .select('sort_order')
    .eq('product_id', productId)
    .eq('relation_type', type)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const { data, error } = await supabaseAdmin
    .from('product_relations')
    .insert([{
      product_id: productId,
      related_id: relatedId,
      relation_type: type,
      sort_order: (maxOrder?.sort_order || 0) + 1,
    }])
    .select()
    .single()

  if (error) throw error
  return data as ProductRelation
}

export async function removeProductRelation(
  productId: string,
  relatedId: string,
  type: RelationType
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('product_relations')
    .delete()
    .eq('product_id', productId)
    .eq('related_id', relatedId)
    .eq('relation_type', type)

  if (error) throw error
}

export async function getRelatedCaseStudies(productId: string): Promise<RelatedItem[]> {
  const relations = await getProductRelations(productId, 'case_study')

  if (relations.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .in('id', relations.map(r => r.related_id))

  if (error) throw error

  return data.map(item => ({
    id: item.id,
    type: 'case_study' as RelationType,
    data: item,
  }))
}

export async function getRelatedSolutions(productId: string): Promise<RelatedItem[]> {
  const relations = await getProductRelations(productId, 'solution')

  if (relations.length === 0) return []

  const { data, error } = await supabaseAdmin
    .from('solutions')
    .select('*')
    .in('id', relations.map(r => r.related_id))

  if (error) throw error

  return data.map(item => ({
    id: item.id,
    type: 'solution' as RelationType,
    data: item,
  }))
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/api/relations.ts
git commit -m "feat(api): add product relations API"
```

---

## Phase 3: 后台管理组件

### Task 3.1: 创建Tab容器组件

**Files:**
- Create: `src/features/products/components/admin/product-tabs/index.tsx`

- [ ] **Step 1: 创建Tab容器**

```typescript
// src/features/products/components/admin/product-tabs/index.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  href?: string
}

interface ProductTabsProps {
  activeTab: string
  children: React.ReactNode
}

const TABS: Tab[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'content', label: 'Content' },
  { id: 'specs', label: 'Specifications' },
  { id: 'documents', label: 'Documents' },
  { id: 'seo', label: 'SEO' },
  { id: 'faq', label: 'FAQ' },
  { id: 'relations', label: 'Relations' },
]

export function ProductTabs({ activeTab, children }: ProductTabsProps) {
  const params = useParams()
  const productId = params.id as string

  return (
    <div>
      <div className="flex gap-1 border-b mb-6">
        {TABS.map(tab => (
          <Link
            key={tab.id}
            href={`/admin/products/${productId}?tab=${tab.id}`}
            className={cn(
              'px-4 py-2 rounded-t-lg transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/admin/product-tabs/index.tsx
git commit -m "feat(ui): add ProductTabs container component"
```

---

### Task 3.2: 创建基本信息Tab

**Files:**
- Create: `src/features/products/components/admin/product-tabs/basic-info-tab.tsx`

- [ ] **Step 1: 创建基本信息Tab**

```typescript
// src/features/products/components/admin/product-tabs/basic-info-tab.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category, ProductTag } from '@/features/products/types'

interface BasicInfoTabProps {
  product: Product
  onChange: (product: Partial<Product>) => void
}

export function BasicInfoTab({ product, onChange }: BasicInfoTabProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<ProductTag[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const [catRes, tagRes] = await Promise.all([
        supabase.from('product_categories').select('*').order('sort_order'),
        supabase.from('product_tags').select('*'),
      ])

      if (catRes.data) setCategories(catRes.data)
      if (tagRes.data) setTags(tagRes.data)
    }
    loadData()
  }, [supabase])

  const handleTagToggle = (tagId: string) => {
    const currentTags = product.tag_objects?.map(t => t.id) || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId]

    const selectedTags = tags.filter(t => newTags.includes(t.id))
    onChange({ tag_objects: selectedTags, tags: newTags })
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
              <Label>Model *</Label>
              <Input
                value={product.model}
                onChange={e => onChange({ model: e.target.value })}
                placeholder="PTX500"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={product.slug}
                onChange={e => onChange({ slug: e.target.value })}
                placeholder="ptx500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={product.category_id || ''}
                onValueChange={v => onChange({ category_id: v || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.translations?.en?.name || cat.slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={product.sort_order}
                onChange={e => onChange({ sort_order: parseInt(e.target.value) || 0 })}
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
            {tags.map(tag => {
              const isSelected = product.tag_objects?.some(t => t.id === tag.id)
              return (
                <Button
                  key={tag.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTagToggle(tag.id)}
                  style={{
                    backgroundColor: isSelected ? tag.color : undefined,
                    borderColor: tag.color,
                  }}
                >
                  {tag.translations?.en?.name || tag.slug}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={product.published}
              onCheckedChange={v => onChange({ published: v })}
            />
            <Label>Published</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={product.featured}
              onCheckedChange={v => onChange({ featured: v })}
            />
            <Label>Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={product.compliance_flag}
              onCheckedChange={v => onChange({ compliance_flag: v })}
            />
            <Label>Compliance Required</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/admin/product-tabs/basic-info-tab.tsx
git commit -m "feat(ui): add BasicInfoTab component"
```

---

### Task 3.3: 创建SEO Tab

**Files:**
- Create: `src/features/products/components/admin/product-tabs/seo-tab.tsx`

- [ ] **Step 1: 创建SEO Tab**

```typescript
// src/features/products/components/admin/product-tabs/seo-tab.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { SEO_LIMITS, type SEOFormData } from '@/features/products/types'
import { generateSEOFromProduct, updateProductSEO, getProductSEO } from '@/features/products/api/seo'

interface SEOTabProps {
  productId: string
}

const LOCALES = ['en', 'zh']

export function SEOTab({ productId }: SEOTabProps) {
  const [seoData, setSeoData] = useState<Record<string, SEOFormData>>({})
  const [activeLocale, setActiveLocale] = useState('en')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSEO() {
      try {
        const seo = await getProductSEO(productId)
        const formatted: Record<string, SEOFormData> = {}
        for (const locale of LOCALES) {
          formatted[locale] = {
            meta_title: seo[locale]?.meta_title || '',
            meta_description: seo[locale]?.meta_description || '',
            meta_keywords: seo[locale]?.meta_keywords || [],
            og_title: seo[locale]?.og_title || '',
            og_description: seo[locale]?.og_description || '',
            og_image: seo[locale]?.og_image || '',
          }
        }
        setSeoData(formatted)
      } catch (error) {
        console.error('Failed to load SEO:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSEO()
  }, [productId])

  const handleGenerate = async () => {
    const generated = await generateSEOFromProduct(productId, activeLocale)
    setSeoData(prev => ({
      ...prev,
      [activeLocale]: generated,
    }))
  }

  const handleSave = async () => {
    const data = seoData[activeLocale]
    await updateProductSEO(productId, activeLocale, data)
    alert('SEO saved!')
  }

  const updateField = (field: keyof SEOFormData, value: string | string[]) => {
    setSeoData(prev => ({
      ...prev,
      [activeLocale]: {
        ...prev[activeLocale],
        [field]: value,
      },
    }))
  }

  if (loading) return <div>Loading...</div>

  const current = seoData[activeLocale] || {}

  return (
    <div className="space-y-6">
      <Tabs value={activeLocale} onValueChange={setActiveLocale}>
        <TabsList>
          {LOCALES.map(locale => (
            <TabsTrigger key={locale} value={locale}>{locale.toUpperCase()}</TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map(locale => (
          <TabsContent key={locale} value={locale}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meta Data</CardTitle>
                <Button variant="outline" onClick={handleGenerate}>
                  Auto Generate
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <Label>Page Title</Label>
                    <Badge variant="outline">
                      {current.meta_title?.length || 0}/{SEO_LIMITS.meta_title}
                    </Badge>
                  </div>
                  <Input
                    value={current.meta_title || ''}
                    onChange={e => updateField('meta_title', e.target.value)}
                    maxLength={SEO_LIMITS.meta_title}
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Meta Description</Label>
                    <Badge variant="outline">
                      {current.meta_description?.length || 0}/{SEO_LIMITS.meta_description}
                    </Badge>
                  </div>
                  <textarea
                    className="w-full min-h-[100px] p-2 border rounded"
                    value={current.meta_description || ''}
                    onChange={e => updateField('meta_description', e.target.value)}
                    maxLength={SEO_LIMITS.meta_description}
                  />
                </div>

                <div>
                  <Label>Keywords</Label>
                  <Input
                    value={(current.meta_keywords || []).join(', ')}
                    onChange={e => updateField('meta_keywords', e.target.value.split(', '))}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Open Graph</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>OG Title</Label>
                  <Input
                    value={current.og_title || ''}
                    onChange={e => updateField('og_title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>OG Description</Label>
                  <textarea
                    className="w-full min-h-[80px] p-2 border rounded"
                    value={current.og_description || ''}
                    onChange={e => updateField('og_description', e.target.value)}
                  />
                </div>
                <div>
                  <Label>OG Image</Label>
                  <Input
                    value={current.og_image || ''}
                    onChange={e => updateField('og_image', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave}>Save SEO</Button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/admin/product-tabs/seo-tab.tsx
git commit -m "feat(ui): add SEOTab component"
```

---

### Task 3.4: 创建FAQ Tab

**Files:**
- Create: `src/features/products/components/admin/product-tabs/faq-tab.tsx`

- [ ] **Step 1: 创建FAQ Tab**

```typescript
// src/features/products/components/admin/product-tabs/faq-tab.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ProductFAQ } from '@/features/products/types'
import {
  getProductFAQs,
  createProductFAQ,
  updateProductFAQ,
  deleteProductFAQ,
} from '@/features/products/api/faqs'

interface FAQTabProps {
  productId: string
}

const LOCALES = ['en', 'zh']

export function FAQTab({ productId }: FAQTabProps) {
  const [faqs, setFaqs] = useState<Record<string, ProductFAQ[]>>({})
  const [activeLocale, setActiveLocale] = useState('en')
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState({ question: '', answer: '' })

  useEffect(() => {
    async function loadFAQs() {
      const data: Record<string, ProductFAQ[]> = {}
      for (const locale of LOCALES) {
        data[locale] = await getProductFAQs(productId, locale)
      }
      setFaqs(data)
    }
    loadFAQs()
  }, [productId])

  const handleAdd = async () => {
    if (!form.question || !form.answer) return

    const newFaq = await createProductFAQ(productId, activeLocale, form)
    setFaqs(prev => ({
      ...prev,
      [activeLocale]: [...(prev[activeLocale] || []), newFaq],
    }))
    setForm({ question: '', answer: '' })
  }

  const handleUpdate = async (faqId: string) => {
    await updateProductFAQ(faqId, form)
    setFaqs(prev => ({
      ...prev,
      [activeLocale]: prev[activeLocale].map(f =>
        f.id === faqId ? { ...f, ...form } : f
      ),
    }))
    setEditing(null)
    setForm({ question: '', answer: '' })
  }

  const handleDelete = async (faqId: string) => {
    if (!confirm('Delete this FAQ?')) return
    await deleteProductFAQ(faqId)
    setFaqs(prev => ({
      ...prev,
      [activeLocale]: prev[activeLocale].filter(f => f.id !== faqId),
    }))
  }

  const startEdit = (faq: ProductFAQ) => {
    setEditing(faq.id)
    setForm({ question: faq.question, answer: faq.answer })
  }

  const currentFaqs = faqs[activeLocale] || []

  return (
    <div className="space-y-6">
      <Tabs value={activeLocale} onValueChange={setActiveLocale}>
        <TabsList>
          {LOCALES.map(locale => (
            <TabsTrigger key={locale} value={locale}>{locale.toUpperCase()}</TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map(locale => (
          <TabsContent key={locale} value={locale}>
            <Card>
              <CardHeader>
                <CardTitle>FAQ List ({currentFaqs.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentFaqs.map(faq => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    {editing === faq.id ? (
                      <div className="space-y-2">
                        <Input
                          value={form.question}
                          onChange={e => setForm({ ...form, question: e.target.value })}
                          placeholder="Question"
                        />
                        <Textarea
                          value={form.answer}
                          onChange={e => setForm({ ...form, answer: e.target.value })}
                          placeholder="Answer"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdate(faq.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">{faq.question}</p>
                        <p className="text-muted-foreground mt-1">{faq.answer}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(faq)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(faq.id)}>Delete</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {currentFaqs.length === 0 && (
                  <p className="text-muted-foreground">No FAQs yet. Add one below.</p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Add New FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={form.question}
                    onChange={e => setForm({ ...form, question: e.target.value })}
                    placeholder="What is the maximum range?"
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea
                    value={form.answer}
                    onChange={e => setForm({ ...form, answer: e.target.value })}
                    placeholder="The maximum range is 110km..."
                  />
                </div>
                <Button onClick={handleAdd} disabled={!form.question || !form.answer}>
                  Add FAQ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/admin/product-tabs/faq-tab.tsx
git commit -m "feat(ui): add FAQTab component"
```

---

### Task 3.5: 创建文档Tab

**Files:**
- Create: `src/features/products/components/admin/product-tabs/documents-tab.tsx`

- [ ] **Step 1: 创建文档Tab**

```typescript
// src/features/products/components/admin/product-tabs/documents-tab.tsx

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ProductDocument, DocumentType } from '@/features/products/types'
import { DOCUMENT_TYPE_LABELS } from '@/features/products/types'
import {
  getProductDocuments,
  createProductDocument,
  deleteProductDocument,
} from '@/features/products/api/documents'

interface DocumentsTabProps {
  productId: string
}

export function DocumentsTab({ productId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<ProductDocument[]>([])
  const [form, setForm] = useState({
    type: 'manual' as DocumentType,
    title: '',
    file_url: '',
    language: 'en',
  })

  useEffect(() => {
    getProductDocuments(productId).then(setDocuments)
  }, [productId])

  const handleUpload = async () => {
    if (!form.title || !form.file_url) return

    const newDoc = await createProductDocument(productId, {
      type: form.type,
      translations: {
        en: { title: form.title },
        zh: { title: form.title },
      },
      file_url: form.file_url,
      language: form.language,
    })

    setDocuments([...documents, newDoc])
    setForm({ type: 'manual', title: '', file_url: '', language: 'en' })
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return
    await deleteProductDocument(docId)
    setDocuments(documents.filter(d => d.id !== docId))
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium">
                    {doc.translations?.en?.title || 'Untitled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {DOCUMENT_TYPE_LABELS[doc.type]?.en} | {doc.language} | {formatFileSize(doc.file_size)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}

            {documents.length === 0 && (
              <p className="text-muted-foreground">No documents yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={v => setForm({ ...form, type: v as DocumentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, labels]) => (
                    <SelectItem key={key} value={key}>{labels.en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Language</Label>
              <Select
                value={form.language}
                onValueChange={v => setForm({ ...form, language: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Product Manual"
            />
          </div>

          <div>
            <Label>File URL</Label>
            <Input
              value={form.file_url}
              onChange={e => setForm({ ...form, file_url: e.target.value })}
              placeholder="https://storage.example.com/manual.pdf"
            />
          </div>

          <Button onClick={handleUpload} disabled={!form.title || !form.file_url}>
            Add Document
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/admin/product-tabs/documents-tab.tsx
git commit -m "feat(ui): add DocumentsTab component"
```

---

### Task 3.6: 创建分类管理页

**Files:**
- Create: `src/app/admin/categories/page.tsx`
- Create: `src/features/products/components/admin/category-manager/index.tsx`
- Create: `src/features/products/components/admin/category-manager/category-tree.tsx`

- [ ] **Step 1: 创建分类管理页**

```typescript
// src/app/admin/categories/page.tsx

import { supabaseAdmin } from '@/lib/supabase/admin'
import { CategoryManager } from '@/features/products/components/admin/category-manager'

export default async function CategoriesPage() {
  const { data: categories } = await supabaseAdmin
    .from('product_categories')
    .select('*')
    .order('sort_order')

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      <CategoryManager initialCategories={categories || []} />
    </div>
  )
}
```

- [ ] **Step 2: 创建分类管理器**

```typescript
// src/features/products/components/admin/category-manager/index.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/features/products/types'
import { CategoryTree } from './category-tree'

interface CategoryManagerProps {
  initialCategories: Category[]
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({
    slug: '',
    name_en: '',
    name_zh: '',
    parent_id: '',
  })
  const supabase = createClient()

  const handleSave = async () => {
    if (!form.slug || !form.name_en) return

    const data = {
      slug: form.slug,
      translations: {
        en: { name: form.name_en },
        zh: { name: form.name_zh },
      },
      parent_id: form.parent_id || null,
    }

    if (editing) {
      await supabase.from('product_categories').update(data).eq('id', editing.id)
    } else {
      await supabase.from('product_categories').insert([data])
    }

    // Refresh
    const { data: updated } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order')
    setCategories(updated || [])
    setEditing(null)
    setForm({ slug: '', name_en: '', name_zh: '', parent_id: '' })
  }

  const handleEdit = (category: Category) => {
    setEditing(category)
    setForm({
      slug: category.slug,
      name_en: category.translations?.en?.name || '',
      name_zh: category.translations?.zh?.name || '',
      parent_id: category.parent_id || '',
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await supabase.from('product_categories').delete().eq('id', id)
    setCategories(categories.filter(c => c.id !== id))
  }

  const rootCategories = categories.filter(c => !c.parent_id)

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Category Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryTree
            categories={rootCategories}
            allCategories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Category' : 'Add Category'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              placeholder="uav"
            />
          </div>
          <div>
            <Label>Name (EN)</Label>
            <Input
              value={form.name_en}
              onChange={e => setForm({ ...form, name_en: e.target.value })}
              placeholder="UAV"
            />
          </div>
          <div>
            <Label>Name (ZH)</Label>
            <Input
              value={form.name_zh}
              onChange={e => setForm({ ...form, name_zh: e.target.value })}
              placeholder="无人机"
            />
          </div>
          <div>
            <Label>Parent Category</Label>
            <select
              className="w-full border rounded p-2"
              value={form.parent_id}
              onChange={e => setForm({ ...form, parent_id: e.target.value })}
            >
              <option value="">None (Root)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.translations?.en?.name || c.slug}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              {editing ? 'Update' : 'Create'}
            </Button>
            {editing && (
              <Button variant="outline" onClick={() => {
                setEditing(null)
                setForm({ slug: '', name_en: '', name_zh: '', parent_id: '' })
              }}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: 创建分类树组件**

```typescript
// src/features/products/components/admin/category-manager/category-tree.tsx

'use client'

import { Button } from '@/components/ui/button'
import type { Category } from '@/features/products/types'

interface CategoryTreeProps {
  categories: Category[]
  allCategories: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  level?: number
}

export function CategoryTree({
  categories,
  allCategories,
  onEdit,
  onDelete,
  level = 0,
}: CategoryTreeProps) {
  if (categories.length === 0) return <p className="text-muted-foreground">No categories</p>

  return (
    <div className="space-y-1">
      {categories.map(category => {
        const children = allCategories.filter(c => c.parent_id === category.id)

        return (
          <div key={category.id}>
            <div
              className="flex items-center justify-between p-2 rounded hover:bg-muted"
              style={{ paddingLeft: `${level * 20 + 8}px` }}
            >
              <div className="flex items-center gap-2">
                {children.length > 0 && <span className="text-muted-foreground">▼</span>}
                <span>{category.translations?.en?.name || category.slug}</span>
                <span className="text-xs text-muted-foreground">({category.slug})</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onEdit(category)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(category.id)}>Delete</Button>
              </div>
            </div>
            {children.length > 0 && (
              <CategoryTree
                categories={children}
                allCategories={allCategories}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: 提交**

```bash
git add src/app/admin/categories/page.tsx src/features/products/components/admin/category-manager/
git commit -m "feat(ui): add category management page"
```

---

### Task 3.7: 创建标签管理页

**Files:**
- Create: `src/app/admin/tags/page.tsx`
- Create: `src/features/products/components/admin/tag-manager/index.tsx`

- [ ] **Step 1: 创建标签管理页**

```typescript
// src/app/admin/tags/page.tsx

import { supabaseAdmin } from '@/lib/supabase/admin'
import { TagManager } from '@/features/products/components/admin/tag-manager'

export default async function TagsPage() {
  const { data: tags } = await supabaseAdmin
    .from('product_tags')
    .select('*, product_tag_relations(count)')
    .order('created_at', { ascending: false })

  const tagsWithCount = tags?.map(tag => ({
    ...tag,
    product_count: (tag.product_tag_relations as unknown as { count: number }[])?.[0]?.count || 0,
  })) || []

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Tag Management</h1>
      <TagManager initialTags={tagsWithCount} />
    </div>
  )
}
```

- [ ] **Step 2: 创建标签管理器**

```typescript
// src/features/products/components/admin/tag-manager/index.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { ProductTag } from '@/features/products/types'

interface TagManagerProps {
  initialTags: ProductTag[]
}

export function TagManager({ initialTags }: TagManagerProps) {
  const [tags, setTags] = useState<ProductTag[]>(initialTags)
  const [editing, setEditing] = useState<ProductTag | null>(null)
  const [form, setForm] = useState({
    slug: '',
    name_en: '',
    name_zh: '',
    color: '#6366f1',
  })
  const supabase = createClient()

  const handleSave = async () => {
    if (!form.slug || !form.name_en) return

    const data = {
      slug: form.slug,
      translations: {
        en: { name: form.name_en },
        zh: { name: form.name_zh },
      },
      color: form.color,
    }

    if (editing) {
      await supabase.from('product_tags').update(data).eq('id', editing.id)
    } else {
      await supabase.from('product_tags').insert([data])
    }

    const { data: updated } = await supabase
      .from('product_tags')
      .select('*, product_tag_relations(count)')
      .order('created_at', { ascending: false })

    setTags(updated?.map(t => ({
      ...t,
      product_count: (t.product_tag_relations as unknown as { count: number }[])?.[0]?.count || 0,
    })) || [])

    setEditing(null)
    setForm({ slug: '', name_en: '', name_zh: '', color: '#6366f1' })
  }

  const handleEdit = (tag: ProductTag) => {
    setEditing(tag)
    setForm({
      slug: tag.slug,
      name_en: tag.translations?.en?.name || '',
      name_zh: tag.translations?.zh?.name || '',
      color: tag.color || '#6366f1',
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return
    await supabase.from('product_tags').delete().eq('id', id)
    setTags(tags.filter(t => t.id !== id))
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Tags ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span>{tag.translations?.en?.name || tag.slug}</span>
                  <span className="text-xs text-muted-foreground">
                    ({tag.product_count} products)
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(tag)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(tag.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? 'Edit Tag' : 'Add Tag'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={e => setForm({ ...form, slug: e.target.value })}
              placeholder="military"
            />
          </div>
          <div>
            <Label>Name (EN)</Label>
            <Input
              value={form.name_en}
              onChange={e => setForm({ ...form, name_en: e.target.value })}
              placeholder="Military"
            />
          </div>
          <div>
            <Label>Name (ZH)</Label>
            <Input
              value={form.name_zh}
              onChange={e => setForm({ ...form, name_zh: e.target.value })}
              placeholder="军用"
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-12"
              />
              <Input
                value={form.color}
                onChange={e => setForm({ ...form, color: e.target.value })}
                placeholder="#6366f1"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
            {editing && (
              <Button variant="outline" onClick={() => {
                setEditing(null)
                setForm({ slug: '', name_en: '', name_zh: '', color: '#6366f1' })
              }}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/admin/tags/page.tsx src/features/products/components/admin/tag-manager/
git commit -m "feat(ui): add tag management page"
```

---

### Task 3.8: 重构产品编辑页为Tab式

**Files:**
- Modify: `src/app/admin/products/[id]/page.tsx`

- [ ] **Step 1: 重构产品编辑页**

将现有的产品编辑页重构为Tab式布局，集成所有Tab组件。

```typescript
// src/app/admin/products/[id]/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ProductTabs } from '@/features/products/components/admin/product-tabs'
import { BasicInfoTab } from '@/features/products/components/admin/product-tabs/basic-info-tab'
import { SEOTab } from '@/features/products/components/admin/product-tabs/seo-tab'
import { FAQTab } from '@/features/products/components/admin/product-tabs/faq-tab'
import { DocumentsTab } from '@/features/products/components/admin/product-tabs/documents-tab'
import type { Product } from '@/features/products/types'

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'basic'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Partial<Product>>({
    model: '',
    slug: '',
    category_id: null,
    translations: {},
    images: [],
    videos: [],
    tags: [],
    published: true,
    featured: false,
    compliance_flag: false,
    specs_standardized: {},
    sort_order: 0,
  })

  const supabase = createClient()

  const fetchProduct = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*, category:product_categories(*), tag_objects:product_tags!product_tag_relations(*)')
      .eq('id', params.id)
      .single()

    if (data) {
      setProduct(data)
    }
    setLoading(false)
  }, [params.id, supabase])

  useEffect(() => {
    if (params.id !== 'new') {
      fetchProduct()
    } else {
      setLoading(false)
    }
  }, [params.id, fetchProduct])

  async function handleSave() {
    setSaving(true)
    try {
      const data = {
        ...product,
        tags: product.tag_objects?.map(t => t.id) || [],
      }

      if (params.id === 'new') {
        const { error } = await supabase.from('products').insert([data])
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').update(data).eq('id', params.id)
        if (error) throw error
      }
      router.push('/admin/products')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const updateProduct = (updates: Partial<Product>) => {
    setProduct(prev => ({ ...prev, ...updates }))
  }

  if (loading) return <div>Loading...</div>

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            product={product as Product}
            onChange={updateProduct}
          />
        )
      case 'seo':
        return <SEOTab productId={params.id as string} />
      case 'faq':
        return <FAQTab productId={params.id as string} />
      case 'documents':
        return <DocumentsTab productId={params.id as string} />
      case 'specs':
        return <div>Specs Tab - Use existing specs page</div>
      case 'content':
        return <div>Content Tab - Translations, images, videos</div>
      case 'relations':
        return <div>Relations Tab - Case studies, solutions</div>
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {params.id === 'new' ? 'Add Product' : 'Edit Product'}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {params.id !== 'new' && (
        <ProductTabs activeTab={activeTab}>
          {renderTabContent()}
        </ProductTabs>
      )}

      {params.id === 'new' && (
        <BasicInfoTab product={product as Product} onChange={updateProduct} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/admin/products/[id]/page.tsx
git commit -m "feat(ui): refactor product edit page to tab-based layout"
```

---

## Phase 4: SEO和结构化数据

### Task 4.1: 创建产品结构化数据组件

**Files:**
- Create: `src/components/seo/product-schema.tsx`

- [ ] **Step 1: 创建结构化数据组件**

```typescript
// src/components/seo/product-schema.tsx

import type { Product } from '@/features/products/types'

interface ProductSchemaProps {
  product: Product
  locale: string
}

export function ProductSchema({ product, locale }: ProductSchemaProps) {
  const translation = product.translations?.[locale] || {}
  const siteName = 'SEEKDRN'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrn.com'

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: translation.name || product.model,
    description: translation.overview || '',
    image: product.images?.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`) || [],
    sku: product.model,
    category: product.category?.translations?.[locale]?.name || undefined,
    manufacturer: {
      '@type': 'Organization',
      name: siteName,
    },
    ...(product.specs_standardized?.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: product.specs_standardized.weight.value,
        unitCode: getUnitCode(product.specs_standardized.weight.unit),
      },
    }),
    additionalProperty: Object.entries(product.specs_standardized || {})
      .filter(([key]) => key !== 'weight')
      .map(([key, spec]) => ({
        '@type': 'PropertyValue',
        name: formatSpecName(key),
        value: `${spec.value} ${spec.unit}`,
      })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function getUnitCode(unit: string): string {
  const unitMap: Record<string, string> = {
    kg: 'KGM',
    g: 'GRM',
    lb: 'LBR',
    km: 'KMT',
    m: 'MTR',
    cm: 'CMT',
    mm: 'MMT',
    min: 'MIN',
    h: 'HUR',
    s: 'SEC',
    'km/h': 'KMH',
    'm/s': 'MTS',
  }
  return unitMap[unit] || unit
}

function formatSpecName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/seo/product-schema.tsx
git commit -m "feat(seo): add ProductSchema structured data component"
```

---

### Task 4.2: 创建元数据生成函数

**Files:**
- Create: `src/lib/seo/product-metadata.ts`

- [ ] **Step 1: 创建元数据生成函数**

```typescript
// src/lib/seo/product-metadata.ts

import type { Metadata } from 'next'
import type { Product } from '@/features/products/types'

interface GenerateProductMetadataOptions {
  product: Product
  locale: string
  seo?: Record<string, { meta_title?: string; meta_description?: string; meta_keywords?: string[] }>
}

export function generateProductMetadata({
  product,
  locale,
  seo,
}: GenerateProductMetadataOptions): Metadata {
  const translation = product.translations?.[locale] || {}
  const seoData = seo?.[locale]
  const siteName = 'SEEKDRN'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrn.com'

  const title = seoData?.meta_title || `${translation.name || product.model} | ${siteName}`
  const description = seoData?.meta_description || truncate(translation.overview || '', 160)
  const keywords = seoData?.meta_keywords || extractKeywords(translation)
  const image = seo?.[locale]?.og_image || product.images?.[0] || ''

  return {
    title,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title: seoData?.meta_title || translation.name || product.model,
      description: seoData?.meta_description || truncate(translation.overview || '', 200),
      images: image ? [{ url: image }] : [],
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData?.meta_title || translation.name || product.model,
      description: seoData?.meta_description || truncate(translation.overview || '', 200),
      images: image ? [image] : [],
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/products/${product.slug}`,
      languages: {
        en: `${baseUrl}/en/products/${product.slug}`,
        zh: `${baseUrl}/zh/products/${product.slug}`,
      },
    },
  }
}

function truncate(str: string, max: number): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 3) + '...' : str
}

function extractKeywords(translation: Record<string, string>): string[] {
  const text = [
    translation.name,
    translation.overview,
    translation.advantages,
    translation.capabilities,
  ].filter(Boolean).join(' ')

  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const unique = [...new Set(words)]

  return unique.slice(0, 10)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/seo/product-metadata.ts
git commit -m "feat(seo): add product metadata generation function"
```

---

## Phase 5: 前台优化

### Task 5.1: 更新产品详情页SEO

**Files:**
- Modify: `src/app/[locale]/products/[slug]/page.tsx` (查找并更新)

- [ ] **Step 1: 查找产品详情页**

Run: `find src/app -name "page.tsx" -path "*/products/*" | head -5`

- [ ] **Step 2: 集成SEO组件**

在产品详情页中添加:
1. 导入 `ProductSchema` 组件
2. 导入 `generateProductMetadata` 函数
3. 在页面组件中渲染 `<ProductSchema product={product} locale={locale} />`
4. 在 `generateMetadata` 函数中使用 `generateProductMetadata`

- [ ] **Step 3: 提交**

```bash
git add src/app/[locale]/products/[slug]/page.tsx
git commit -m "feat(seo): integrate SEO into product detail page"
```

---

### Task 5.2: 添加FAQ展示到产品详情页

**Files:**
- Create: `src/features/products/components/public/product-faq/index.tsx`

- [ ] **Step 1: 创建FAQ展示组件**

```typescript
// src/features/products/components/public/product-faq/index.tsx

import type { ProductFAQ } from '@/features/products/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface ProductFAQProps {
  faqs: ProductFAQ[]
  locale: string
}

export function ProductFAQSection({ faqs, locale }: ProductFAQProps) {
  const localizedFaqs = faqs.filter(f => f.locale === locale)

  if (localizedFaqs.length === 0) return null

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {localizedFaqs.map((faq, index) => (
          <AccordionItem key={faq.id} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/public/product-faq/index.tsx
git commit -m "feat(ui): add ProductFAQSection for public product page"
```

---

## 验收清单

### 数据模型
- [ ] product_categories 表存在且可用
- [ ] product_tags 表存在且可用
- [ ] product_seo 表存在且可用
- [ ] product_faqs 表存在且可用
- [ ] product_documents 表存在且可用
- [ ] product_relations 表存在且可用
- [ ] products.specs_standardized 字段存在

### 后台管理
- [ ] 分类管理页可访问 (/admin/categories)
- [ ] 标签管理页可访问 (/admin/tags)
- [ ] 产品编辑页Tab切换正常
- [ ] 基本信息Tab可编辑
- [ ] SEO Tab可编辑并保存
- [ ] FAQ Tab可添加/编辑/删除FAQ
- [ ] 文档Tab可上传/删除文档

### SEO
- [ ] 产品详情页有正确的meta标签
- [ ] 产品详情页有Schema.org结构化数据
- [ ] Open Graph标签正确

### GEO/AI
- [ ] 标准化规格格式正确
- [ ] FAQ数据可被AI理解
- [ ] 结构化数据包含规格信息

---

## 执行说明

**推荐使用 Subagent-Driven Development:**
- 每个Task由独立的subagent执行
- Task之间进行review
- 快速迭代

**执行命令:**
```bash
# 运行迁移
npx supabase db push

# 启动开发服务器
npm run dev

# 访问管理页面
http://localhost:3000/admin/categories
http://localhost:3000/admin/tags
http://localhost:3000/admin/products
```
