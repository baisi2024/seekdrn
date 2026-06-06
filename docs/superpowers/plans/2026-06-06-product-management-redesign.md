# 产品管理模块重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构产品管理模块，实现完善的媒体库、富文本编辑器、分类管理、多语言管理，以及前台多媒体展示、筛选搜索、产品对比和推荐功能。

**Architecture:** 采用模块化架构，将产品管理相关功能集中在 `src/features/products/` 目录下，包含 API 层、组件层、状态管理层。后台使用 Tiptap 富文本编辑器，前台使用图片轮播和视频播放器。

**Tech Stack:** Next.js 15, React 19, Supabase PostgreSQL, Cloudflare R2, Tiptap, Zustand, shadcn/ui, DeepL API

---

## 文件结构

### 新增文件
```
src/features/products/
├── api/
│   ├── products.ts              # 产品 CRUD API
│   ├── categories.ts            # 分类 API
│   ├── media.ts                 # 媒体 API
│   └── translations.ts          # 翻译 API
├── components/
│   ├── admin/
│   │   ├── media-library/
│   │   │   ├── index.tsx        # 媒体库主组件
│   │   │   ├── media-grid.tsx   # 网格视图
│   │   │   ├── media-list.tsx   # 列表视图
│   │   │   ├── media-uploader.tsx
│   │   │   ├── media-preview.tsx
│   │   │   └── media-editor.tsx
│   │   ├── rich-editor/
│   │   │   ├── index.tsx        # 富文本编辑器
│   │   │   ├── toolbar.tsx      # 工具栏
│   │   │   └── media-picker.tsx # 媒体选择器
│   │   ├── category-manager/
│   │   │   ├── index.tsx        # 分类管理
│   │   │   ├── category-tree.tsx
│   │   │   └── category-form.tsx
│   │   └── translation-manager/
│   │       ├── index.tsx        # 翻译管理
│   │       └── status-badge.tsx # 状态徽章
│   └── public/
│       ├── product-gallery/
│       │   ├── index.tsx        # 产品图库
│       │   ├── image-carousel.tsx
│       │   └── video-player.tsx
│       ├── product-filter/
│       │   ├── index.tsx        # 产品筛选
│       │   └── filter-panel.tsx
│       ├── product-compare/
│       │   ├── index.tsx        # 产品对比
│       │   └── compare-table.tsx
│       └── related-products/
│           └── index.tsx        # 相关产品
├── hooks/
│   ├── use-products.ts          # 产品数据 Hook
│   ├── use-media.ts             # 媒体数据 Hook
│   └── use-compare.ts           # 对比 Hook
├── stores/
│   ├── product-store.ts         # 产品状态
│   └── media-store.ts           # 媒体状态
├── types/
│   ├── product.ts               # 产品类型
│   ├── category.ts              # 分类类型
│   └── media.ts                 # 媒体类型
└── utils/
    ├── translation.ts           # 翻译工具
    └── compare.ts               # 对比工具

src/app/
├── admin/
│   ├── categories/
│   │   └── page.tsx             # 分类管理页
│   └── products/
│       └── [id]/
│           └── page.tsx         # 产品编辑页（更新）
├── api/
│   ├── categories/
│   │   ├── route.ts             # 分类 CRUD
│   │   └── tree/route.ts        # 分类树
│   ├── media/
│   │   └── route.ts             # 媒体 CRUD（更新）
│   └── translations/
│       └── translate/route.ts   # 翻译 API
└── [locale]/
    ├── products/
    │   ├── page.tsx             # 产品列表（更新）
    │   └── [model]/
    │       └── page.tsx         # 产品详情（更新）
    └── compare/
        └── page.tsx             # 产品对比页

supabase/migrations/
├── 005_product_categories.sql   # 分类表
├── 006_product_tags.sql         # 标签表
└── 007_product_extensions.sql   # 产品扩展字段
```

### 修改文件
```
src/app/admin/media/page.tsx                    # 更新为媒体库
src/components/admin/image-upload.tsx           # 重构为 MediaUpload
src/components/admin/translation-tabs.tsx       # 增强翻译管理
src/components/public/product-card.tsx          # 增强产品卡片
src/components/public/product-filter.tsx        # 增强筛选器
```

---

## Phase 1: 数据模型

### Task 1.1: 创建产品分类表

**Files:**
- Create: `supabase/migrations/005_product_categories.sql`

- [ ] **Step 1: 编写分类表迁移脚本**

```sql
-- 005_product_categories.sql
-- 产品分类表

CREATE TABLE product_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  parent_id   uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  translations jsonb NOT NULL DEFAULT '{}',
  icon        text,
  image       text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_categories_slug ON product_categories(slug);
CREATE INDEX idx_categories_sort ON product_categories(sort_order);

-- RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories"
  ON product_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to categories"
  ON product_categories FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- 触发器：自动更新 updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 初始数据
INSERT INTO product_categories (slug, translations, sort_order) VALUES
  ('uav', '{"en": {"name": "UAV"}, "zh": {"name": "无人机"}}', 1),
  ('payload', '{"en": {"name": "Payload"}, "zh": {"name": "载荷"}}', 2),
  ('cuas', '{"en": {"name": "C-UAS"}, "zh": {"name": "反无人机"}}', 3),
  ('ground_control', '{"en": {"name": "Ground Control"}, "zh": {"name": "地面站"}}', 4);
```

- [ ] **Step 2: 执行迁移**

Run: `npx supabase db push`
Expected: 迁移成功，无错误

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/005_product_categories.sql
git commit -m "feat(db): add product_categories table"
```

---

### Task 1.2: 创建产品标签表

**Files:**
- Create: `supabase/migrations/006_product_tags.sql`

- [ ] **Step 1: 编写标签表迁移脚本**

```sql
-- 006_product_tags.sql
-- 产品标签表

CREATE TABLE product_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  translations jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_tag_relations (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id     uuid REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- 索引
CREATE INDEX idx_tag_relations_product ON product_tag_relations(product_id);
CREATE INDEX idx_tag_relations_tag ON product_tag_relations(tag_id);

-- RLS
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags"
  ON product_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to tags"
  ON product_tags FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view tag relations"
  ON product_tag_relations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_tag_relations.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to tag relations"
  ON product_tag_relations FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

- [ ] **Step 2: 执行迁移**

Run: `npx supabase db push`
Expected: 迁移成功，无错误

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/006_product_tags.sql
git commit -m "feat(db): add product_tags and product_tag_relations tables"
```

---

### Task 1.3: 扩展产品表和媒体表

**Files:**
- Create: `supabase/migrations/007_product_extensions.sql`

- [ ] **Step 1: 编写扩展字段迁移脚本**

```sql
-- 007_product_extensions.sql
-- 扩展产品表和媒体表

-- 扩展 products 表
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS translation_status jsonb DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 扩展 media 表
ALTER TABLE media ADD COLUMN IF NOT EXISTS type text DEFAULT 'image' CHECK (type IN ('image', 'video', 'document'));
ALTER TABLE media ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE media ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 全文搜索索引
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- 搜索向量更新触发器
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.slug, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_search
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- 更新现有产品的分类
UPDATE products SET category_id = (SELECT id FROM product_categories WHERE slug = products.category LIMIT 1)
WHERE category_id IS NULL AND category IS NOT NULL;
```

- [ ] **Step 2: 执行迁移**

Run: `npx supabase db push`
Expected: 迁移成功，无错误

- [ ] **Step 3: 提交**

```bash
git add supabase/migrations/007_product_extensions.sql
git commit -m "feat(db): extend products and media tables with new fields"
```

---

## Phase 2: 后台核心功能

### Task 2.1: 创建类型定义

**Files:**
- Create: `src/features/products/types/product.ts`
- Create: `src/features/products/types/category.ts`
- Create: `src/features/products/types/media.ts`

- [ ] **Step 1: 编写产品类型定义**

```typescript
// src/features/products/types/product.ts
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
  published: boolean
  featured: boolean
  compliance_flag: boolean
  spec_groups: SpecGroup[]
  sort_order: number
  created_at: string
  updated_at: string
}

export type TranslationStatus = 'translated' | 'pending' | 'syncing' | 'missing'

export interface SpecGroup {
  id: string
  name: Record<string, string>
  specs: Spec[]
}

export interface Spec {
  label: Record<string, string>
  value: string
  unit?: string
}

export interface FilterState {
  search: string
  category: string | null
  tags: string[]
  specs: Record<string, string | [number, number]>
  sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
  page: number
  pageSize: number
}
```

- [ ] **Step 2: 编写分类类型定义**

```typescript
// src/features/products/types/category.ts
export interface Category {
  id: string
  slug: string
  parent_id: string | null
  translations: Record<string, { name: string; description?: string }>
  icon: string | null
  image: string | null
  sort_order: number
  children?: Category[]
  product_count?: number
  created_at: string
  updated_at: string
}

export interface CategoryTree {
  nodes: Category[]
  flatList: Category[]
}
```

- [ ] **Step 3: 编写媒体类型定义**

```typescript
// src/features/products/types/media.ts
export interface MediaItem {
  id: string
  filename: string
  r2_key: string
  type: 'image' | 'video' | 'document'
  mime_type: string
  size: number
  width?: number
  height?: number
  duration?: number
  alt_text: Record<string, string>
  tags: string[]
  metadata: MediaMetadata
  created_at: string
}

export interface MediaMetadata {
  thumbnail?: string
  color?: string
}

export interface MediaFilter {
  search: string
  type: 'all' | 'image' | 'video' | 'document'
  tags: string[]
  dateRange: [Date | null, Date | null]
  sortBy: 'created_at' | 'filename' | 'size'
  sortOrder: 'asc' | 'desc'
}

export interface MediaLibraryProps {
  mode: 'select' | 'manage'
  accept?: 'image' | 'video' | 'all'
  multiple?: boolean
  maxSelect?: number
  onSelect?: (items: MediaItem[]) => void
}
```

- [ ] **Step 4: 创建索引文件**

```typescript
// src/features/products/types/index.ts
export * from './product'
export * from './category'
export * from './media'
```

- [ ] **Step 5: 提交**

```bash
git add src/features/products/types/
git commit -m "feat(types): add product, category, and media type definitions"
```

---

### Task 2.2: 创建 API 层

**Files:**
- Create: `src/features/products/api/products.ts`
- Create: `src/features/products/api/categories.ts`
- Create: `src/features/products/api/media.ts`

- [ ] **Step 1: 编写产品 API**

```typescript
// src/features/products/api/products.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Product, FilterState } from '../types'

export async function getProducts(filters?: Partial<FilterState>) {
  let query = supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category_id', filters.category)
  }

  if (filters?.search) {
    query = query.textSearch('search_vector', filters.search)
  }

  if (filters?.page && filters?.pageSize) {
    const from = (filters.page - 1) * filters.pageSize
    const to = from + filters.pageSize - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) throw error
  return { products: data as Product[], total: count || 0 }
}

export async function getProduct(id: string) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Product
}

export async function createProduct(product: Partial<Product>) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getRelatedProducts(productId: string, limit = 4) {
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('category_id, tags')
    .eq('id', productId)
    .single()

  if (!product) return []

  const { data } = await supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('published', true)
    .neq('id', productId)
    .or(`category_id.eq.${product.category_id}`)
    .limit(limit)

  return data as Product[]
}

export async function compareProducts(productIds: string[]) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, category:product_categories(*)')
    .in('id', productIds)

  if (error) throw error
  return data as Product[]
}
```

- [ ] **Step 2: 编写分类 API**

```typescript
// src/features/products/api/categories.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Category, CategoryTree } from '../types'

export async function getCategories() {
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .select('*')
    .order('sort_order')

  if (error) throw error
  return data as Category[]
}

export async function getCategoryTree(): Promise<CategoryTree> {
  const categories = await getCategories()

  const buildTree = (items: Category[], parentId: string | null = null): Category[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }))
  }

  return {
    nodes: buildTree(categories),
    flatList: categories
  }
}

export async function createCategory(category: Partial<Category>) {
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .insert([category])
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const { data, error } = await supabaseAdmin
    .from('product_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Category
}

export async function deleteCategory(id: string) {
  const { error } = await supabaseAdmin
    .from('product_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

- [ ] **Step 3: 编写媒体 API**

```typescript
// src/features/products/api/media.ts'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { uploadToR2, getPublicUrl } from '@/lib/r2'
import type { MediaItem, MediaFilter } from '../types'

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  document: ['application/pdf', 'application/csv', 'application/vnd.ms-excel']
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

export async function getMedia(filters?: Partial<MediaFilter>) {
  let query = supabaseAdmin
    .from('media')
    .select('*')
    .order(filters?.sortBy || 'created_at', { ascending: filters?.sortOrder === 'asc' })

  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }

  if (filters?.search) {
    query = query.ilike('filename', `%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) throw error
  return data as MediaItem[]
}

export async function uploadMedia(files: File[], tags: string[] = []) {
  const results: MediaItem[] = []

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File ${file.name} exceeds maximum size of 100MB`)
    }

    const type = getMediaType(file.type)
    if (!type) {
      throw new Error(`File type ${file.type} is not allowed`)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `media/${new Date().toISOString().split('T')[0]}/${crypto.randomUUID()}.${file.name.split('.').pop()}`

    await uploadToR2(key, buffer, file.type)

    const { data, error } = await supabaseAdmin
      .from('media')
      .insert([{
        filename: file.name,
        r2_key: key,
        type,
        mime_type: file.type,
        size: file.size,
        tags,
        alt_text: {},
        metadata: {}
      }])
      .select()
      .single()

    if (error) throw error
    results.push(data as MediaItem)
  }

  return results
}

export async function updateMedia(id: string, data: Partial<MediaItem>) {
  const { data: updated, error } = await supabaseAdmin
    .from('media')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated as MediaItem
}

export async function deleteMedia(id: string) {
  const { data: item } = await supabaseAdmin
    .from('media')
    .select('r2_key')
    .eq('id', id)
    .single()

  if (item) {
    // Note: R2 deletion would need to be implemented
    const { error } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

function getMediaType(mimeType: string): 'image' | 'video' | 'document' | null {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(mimeType)) {
      return type as 'image' | 'video' | 'document'
    }
  }
  return null
}

export { getPublicUrl }
```

- [ ] **Step 4: 创建索引文件**

```typescript
// src/features/products/api/index.ts
export * from './products'
export * from './categories'
export * from './media'
```

- [ ] **Step 5: 提交**

```bash
git add src/features/products/api/
git commit -m "feat(api): add products, categories, and media API functions"
```

---

### Task 2.3: 创建状态管理

**Files:**
- Create: `src/features/products/stores/product-store.ts`
- Create: `src/features/products/stores/media-store.ts`

- [ ] **Step 1: 安装 Zustand**

Run: `npm install zustand`
Expected: 安装成功

- [ ] **Step 2: 编写产品状态管理**

```typescript
// src/features/products/stores/product-store.ts
import { create } from 'zustand'
import type { Product, FilterState } from '../types'
import { getProducts, getRelatedProducts, compareProducts } from '../api'

interface ProductStore {
  products: Product[]
  total: number
  filters: Partial<FilterState>
  compareList: string[]
  compareResults: Product[]
  loading: boolean

  fetchProducts: (filters?: Partial<FilterState>) => Promise<void>
  setFilters: (filters: Partial<FilterState>) => void
  addToCompare: (id: string) => Promise<void>
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  fetchCompareResults: () => Promise<void>
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  total: 0,
  filters: {},
  compareList: [],
  compareResults: [],
  loading: false,

  fetchProducts: async (filters) => {
    set({ loading: true })
    try {
      const newFilters = { ...get().filters, ...filters }
      const { products, total } = await getProducts(newFilters)
      set({ products, total, filters: newFilters, loading: false })
    } catch (error) {
      console.error('Failed to fetch products:', error)
      set({ loading: false })
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } })
  },

  addToCompare: async (id) => {
    const { compareList } = get()
    if (compareList.length >= 4 || compareList.includes(id)) return
    set({ compareList: [...compareList, id] })
    await get().fetchCompareResults()
  },

  removeFromCompare: (id) => {
    set({ compareList: get().compareList.filter(i => i !== id) })
  },

  clearCompare: () => {
    set({ compareList: [], compareResults: [] })
  },

  fetchCompareResults: async () => {
    const { compareList } = get()
    if (compareList.length === 0) {
      set({ compareResults: [] })
      return
    }
    try {
      const results = await compareProducts(compareList)
      set({ compareResults: results })
    } catch (error) {
      console.error('Failed to fetch compare results:', error)
    }
  }
}))
```

- [ ] **Step 3: 编写媒体状态管理**

```typescript
// src/features/products/stores/media-store.ts
import { create } from 'zustand'
import type { MediaItem, MediaFilter } from '../types'
import { getMedia, uploadMedia, deleteMedia } from '../api'

interface MediaStore {
  items: MediaItem[]
  selected: string[]
  viewMode: 'grid' | 'list'
  filter: Partial<MediaFilter>
  loading: boolean
  uploading: boolean

  fetchMedia: (filter?: Partial<MediaFilter>) => Promise<void>
  setSelected: (ids: string[]) => void
  toggleSelect: (id: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setFilter: (filter: Partial<MediaFilter>) => void
  uploadFiles: (files: File[], tags?: string[]) => Promise<void>
  deleteSelected: () => Promise<void>
}

export const useMediaStore = create<MediaStore>((set, get) => ({
  items: [],
  selected: [],
  viewMode: 'grid',
  filter: {},
  loading: false,
  uploading: false,

  fetchMedia: async (filter) => {
    set({ loading: true })
    try {
      const newFilter = { ...get().filter, ...filter }
      const items = await getMedia(newFilter)
      set({ items, filter: newFilter, loading: false })
    } catch (error) {
      console.error('Failed to fetch media:', error)
      set({ loading: false })
    }
  },

  setSelected: (ids) => set({ selected: ids }),

  toggleSelect: (id) => {
    const { selected } = get()
    if (selected.includes(id)) {
      set({ selected: selected.filter(i => i !== id) })
    } else {
      set({ selected: [...selected, id] })
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),

  uploadFiles: async (files, tags = []) => {
    set({ uploading: true })
    try {
      const newItems = await uploadMedia(files, tags)
      set({ items: [...newItems, ...get().items], uploading: false })
    } catch (error) {
      console.error('Failed to upload files:', error)
      set({ uploading: false })
      throw error
    }
  },

  deleteSelected: async () => {
    const { selected } = get()
    set({ loading: true })
    try {
      for (const id of selected) {
        await deleteMedia(id)
      }
      set({
        items: get().items.filter(i => !selected.includes(i.id)),
        selected: [],
        loading: false
      })
    } catch (error) {
      console.error('Failed to delete media:', error)
      set({ loading: false })
    }
  }
}))
```

- [ ] **Step 4: 创建索引文件**

```typescript
// src/features/products/stores/index.ts
export * from './product-store'
export * from './media-store'
```

- [ ] **Step 5: 提交**

```bash
git add src/features/products/stores/
git commit -m "feat(stores): add Zustand stores for products and media"
```

---

### Task 2.4: 创建媒体库组件

**Files:**
- Create: `src/features/products/components/admin/media-library/index.tsx`
- Create: `src/features/products/components/admin/media-library/media-grid.tsx`
- Create: `src/features/products/components/admin/media-library/media-uploader.tsx`
- Create: `src/features/products/components/admin/media-library/media-preview.tsx`

- [ ] **Step 1: 编写媒体库主组件**

```typescript
// src/features/products/components/admin/media-library/index.tsx
'use client'

import { useEffect } from 'react'
import { useMediaStore } from '@/features/products/stores'
import { MediaGrid } from './media-grid'
import { MediaUploader } from './media-uploader'
import { MediaPreview } from './media-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Grid3X3, List, Search, Trash2 } from 'lucide-react'
import type { MediaLibraryProps, MediaItem } from '@/features/products/types'

export function MediaLibrary({ mode, accept = 'all', multiple = false, maxSelect = 10, onSelect }: MediaLibraryProps) {
  const { items, selected, viewMode, loading, uploading, fetchMedia, setViewMode, toggleSelect, setSelected, uploadFiles, deleteSelected } = useMediaStore()

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleSelect = (item: MediaItem) => {
    if (mode === 'select') {
      if (multiple) {
        toggleSelect(item.id)
        if (selected.length <= maxSelect && onSelect) {
          onSelect(items.filter(i => selected.includes(i.id) || i.id === item.id))
        }
      } else {
        setSelected([item.id])
        onSelect?.([item])
      }
    } else {
      toggleSelect(item.id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            className="pl-9"
            onChange={(e) => fetchMedia({ search: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 border rounded-md p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {mode === 'manage' && selected.length > 0 && (
          <Button variant="destructive" size="sm" onClick={deleteSelected}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete ({selected.length})
          </Button>
        )}
      </div>

      <MediaUploader
        accept={accept}
        uploading={uploading}
        onUpload={uploadFiles}
      />

      <MediaGrid
        items={items}
        selected={selected}
        viewMode={viewMode}
        loading={loading}
        onSelect={handleSelect}
      />
    </div>
  )
}
```

- [ ] **Step 2: 编写网格视图组件**

```typescript
// src/features/products/components/admin/media-library/media-grid.tsx
'use client'

import { useState } from 'react'
import { MediaPreview } from './media-preview'
import { getPublicUrl } from '@/features/products/api'
import { Image, FileVideo, FileText, Check } from 'lucide-react'
import type { MediaItem } from '@/features/products/types'

interface MediaGridProps {
  items: MediaItem[]
  selected: string[]
  viewMode: 'grid' | 'list'
  loading: boolean
  onSelect: (item: MediaItem) => void
}

export function MediaGrid({ items, selected, viewMode, loading, onSelect }: MediaGridProps) {
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null)

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-8 h-8 text-blue-500" />
      case 'video': return <FileVideo className="w-8 h-8 text-red-500" />
      default: return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (items.length === 0) {
    return <div className="p-8 text-center text-gray-500">No media found</div>
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              onDoubleClick={() => setPreviewItem(item)}
              className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                selected.includes(item.id) ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
              }`}
            >
              {item.type === 'image' ? (
                <img
                  src={getPublicUrl(item.r2_key)}
                  alt={item.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  {getIcon(item.type)}
                </div>
              )}
              {selected.includes(item.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs truncate">
                {item.filename}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              onDoubleClick={() => setPreviewItem(item)}
              className={`flex items-center gap-4 p-4 cursor-pointer ${
                selected.includes(item.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {item.type === 'image' ? (
                  <img src={getPublicUrl(item.r2_key)} alt="" className="w-full h-full object-cover" />
                ) : (
                  getIcon(item.type)
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.filename}</p>
                <p className="text-sm text-gray-500">{item.mime_type} • {formatSize(item.size)}</p>
              </div>
              {selected.includes(item.id) && (
                <Check className="w-5 h-5 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      )}

      <MediaPreview item={previewItem} onClose={() => setPreviewItem(null)} />
    </>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
```

- [ ] **Step 3: 编写上传组件**

```typescript
// src/features/products/components/admin/media-library/media-uploader.tsx
'use client'

import { useCallback } from 'react'
import { Upload } from 'lucide-react'

interface MediaUploaderProps {
  accept: 'image' | 'video' | 'all'
  uploading: boolean
  onUpload: (files: File[], tags?: string[]) => Promise<void>
}

export function MediaUploader({ accept, uploading, onUpload }: MediaUploaderProps) {
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await onUpload(files)
    }
  }, [onUpload])

  const handleChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await onUpload(files)
    }
  }, [onUpload])

  const acceptTypes = accept === 'all' ? 'image/*,video/*,.pdf,.csv' : `${accept}/*`

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
    >
      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
      <p className="text-gray-600 mb-2">
        {uploading ? 'Uploading...' : 'Drag and drop files here, or click to select'}
      </p>
      <label className="cursor-pointer">
        <span className="text-blue-500 hover:text-blue-600">Browse files</span>
        <input
          type="file"
          accept={acceptTypes}
          multiple
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
```

- [ ] **Step 4: 编写预览组件**

```typescript
// src/features/products/components/admin/media-library/media-preview.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getPublicUrl } from '@/features/products/api'
import type { MediaItem } from '@/features/products/types'

interface MediaPreviewProps {
  item: MediaItem | null
  onClose: () => void
}

export function MediaPreview({ item, onClose }: MediaPreviewProps) {
  if (!item) return null

  return (
    <Dialog open={!!item} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item.filename}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-center">
          {item.type === 'image' ? (
            <img
              src={getPublicUrl(item.r2_key)}
              alt={item.filename}
              className="max-w-full max-h-[60vh] object-contain"
            />
          ) : item.type === 'video' ? (
            <video
              src={getPublicUrl(item.r2_key)}
              controls
              className="max-w-full max-h-[60vh]"
            />
          ) : (
            <a
              href={getPublicUrl(item.r2_key)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Download {item.filename}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 5: 提交**

```bash
git add src/features/products/components/admin/media-library/
git commit -m "feat(admin): add media library components"
```

---

### Task 2.5: 创建富文本编辑器组件

**Files:**
- Create: `src/features/products/components/admin/rich-editor/index.tsx`
- Create: `src/features/products/components/admin/rich-editor/toolbar.tsx`

- [ ] **Step 1: 安装 Tiptap 扩展**

Run: `npm install @tiptap/extension-text-align @tiptap/extension-highlight @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-youtube @tiptap/extension-task-list @tiptap/extension-task-item`
Expected: 安装成功

- [ ] **Step 2: 编写富文本编辑器组件**

```typescript
// src/features/products/components/admin/rich-editor/index.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table'
import { TableHeader } from '@tiptap/extension-table'
import Youtube from '@tiptap/extension-youtube'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Toolbar } from './toolbar'
import type { ToolbarConfig } from '@/features/products/types'

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  toolbar?: Partial<ToolbarConfig>
  maxLength?: number
}

export function RichEditor({ content, onChange, placeholder, toolbar, maxLength }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Highlight,
      TextStyle,
      Color,
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube,
      TaskList,
      TaskItem,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (maxLength && html.length > maxLength) return
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[200px] p-4 border rounded-b-lg focus:outline-none',
      },
    },
  })

  if (!editor) return null

  return (
    <div>
      <Toolbar editor={editor} config={toolbar} />
      <EditorContent editor={editor} />
    </div>
  )
}
```

- [ ] **Step 3: 编写工具栏组件**

```typescript
// src/features/products/components/admin/rich-editor/toolbar.tsx
'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Bold, Italic, Underline, Strikethrough, Code,
  List, ListOrdered, CheckSquare,
  Quote, Minus, Link, Image, Table,
  AlignLeft, AlignCenter, AlignRight,
  RotateCcw, RotateClockwise,
  Heading1, Heading2, Heading3,
} from 'lucide-react'
import type { ToolbarConfig } from '@/features/products/types'

interface ToolbarProps {
  editor: Editor
  config?: Partial<ToolbarConfig>
}

export function Toolbar({ editor, config }: ToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const groups = config?.groups || ['history', 'text', 'heading', 'list', 'block', 'insert']

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setShowLinkDialog(false)
    setLinkUrl('')
  }

  const setImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
    }
    setShowImageDialog(false)
    setImageUrl('')
  }

  return (
    <>
      <div className="flex flex-wrap gap-1 p-2 border border-b-0 rounded-t-lg bg-gray-50">
        {groups.includes('history') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <RotateClockwise className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
          </>
        )}

        {groups.includes('text') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-200' : ''}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-200' : ''}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-gray-200' : ''}>
              <Underline className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-gray-200' : ''}>
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'bg-gray-200' : ''}>
              <Code className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
          </>
        )}

        {groups.includes('heading') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}>
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}>
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}>
              <Heading3 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
          </>
        )}

        {groups.includes('list') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}>
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive('taskList') ? 'bg-gray-200' : ''}>
              <CheckSquare className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
          </>
        )}

        {groups.includes('block') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}>
              <Quote className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-gray-200' : ''}>
              <Code className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
              <Table className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
          </>
        )}

        {groups.includes('insert') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(true)}>
              <Link className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowImageDialog(true)}>
              <Image className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Enter URL..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
              <Button onClick={setLink}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="Enter image URL..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
              <Button onClick={setImage}>Insert</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 4: 提交**

```bash
git add src/features/products/components/admin/rich-editor/
git commit -m "feat(admin): add rich text editor with full toolbar"
```

---

### Task 2.6: 更新媒体库页面

**Files:**
- Modify: `src/app/admin/media/page.tsx`

- [ ] **Step 1: 更新媒体库页面使用新组件**

```typescript
// src/app/admin/media/page.tsx
import { MediaLibrary } from '@/features/products/components/admin/media-library'

export default function MediaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Media Library</h1>
      <MediaLibrary mode="manage" />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/admin/media/page.tsx
git commit -m "feat(admin): update media page to use new MediaLibrary component"
```

---

## Phase 3: 前台展示

### Task 3.1: 创建产品图库组件

**Files:**
- Create: `src/features/products/components/public/product-gallery/index.tsx`
- Create: `src/features/products/components/public/product-gallery/image-carousel.tsx`
- Create: `src/features/products/components/public/product-gallery/video-player.tsx`

- [ ] **Step 1: 编写产品图库组件**

```typescript
// src/features/products/components/public/product-gallery/index.tsx
'use client'

import { useState } from 'react'
import { ImageCarousel } from './image-carousel'
import { VideoPlayer } from './video-player'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image, Video } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  videos?: string[]
}

export function ProductGallery({ images, videos = [] }: ProductGalleryProps) {
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')

  const hasImages = images.length > 0
  const hasVideos = videos.length > 0

  if (!hasImages && !hasVideos) {
    return (
      <div className="aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
        No media available
      </div>
    )
  }

  if (!hasVideos) {
    return <ImageCarousel images={images} />
  }

  if (!hasImages) {
    return <VideoPlayer src={videos[0]} />
  }

  return (
    <Tabs defaultValue="images" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="images" className="gap-2">
          <Image className="w-4 h-4" />
          Images ({images.length})
        </TabsTrigger>
        <TabsTrigger value="videos" className="gap-2">
          <Video className="w-4 h-4" />
          Videos ({videos.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="images">
        <ImageCarousel images={images} />
      </TabsContent>
      <TabsContent value="videos">
        <div className="space-y-4">
          {videos.map((video, index) => (
            <VideoPlayer key={index} src={video} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
```

- [ ] **Step 2: 编写图片轮播组件**

```typescript
// src/features/products/components/public/product-gallery/image-carousel.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showZoom, setShowZoom] = useState(false)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (images.length === 0) return null

  return (
    <>
      <div className="relative">
        <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={() => setShowZoom(true)}
          className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img src={image} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={showZoom} onOpenChange={setShowZoom}>
        <DialogContent className="max-w-5xl p-0">
          <button
            onClick={() => setShowZoom(false)}
            className="absolute top-4 right-4 p-2 bg-white/80 rounded-full z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={images[currentIndex]}
            alt=""
            className="w-full h-auto max-h-[90vh] object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 3: 编写视频播放器组件**

```typescript
// src/features/products/components/public/product-gallery/video-player.tsx
'use client'

import { useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

interface VideoPlayerProps {
  src: string
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const videoRef = useState<HTMLVideoElement | null>(null)

  const togglePlay = () => {
    if (videoRef[0]) {
      if (playing) {
        videoRef[0].pause()
      } else {
        videoRef[0].play()
      }
      setPlaying(!playing)
    }
  }

  const toggleMute = () => {
    if (videoRef[0]) {
      videoRef[0].muted = !muted
      setMuted(!muted)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef[0]) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef[0].requestFullscreen()
      }
    }
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video
        ref={videoRef[1]}
        src={src}
        className="w-full aspect-video"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={togglePlay}
          className="p-4 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          {playing ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8" />
          )}
        </button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
        <button onClick={toggleMute} className="p-2 bg-white/80 rounded-full hover:bg-white">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button onClick={toggleFullscreen} className="p-2 bg-white/80 rounded-full hover:bg-white ml-auto">
          <Maximize className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 提交**

```bash
git add src/features/products/components/public/product-gallery/
git commit -m "feat(public): add product gallery with image carousel and video player"
```

---

### Task 3.2: 创建产品对比组件

**Files:**
- Create: `src/features/products/components/public/product-compare/index.tsx`
- Create: `src/features/products/components/public/product-compare/compare-table.tsx`

- [ ] **Step 1: 编写产品对比组件**

```typescript
// src/features/products/components/public/product-compare/index.tsx
'use client'

import { useProductStore } from '@/features/products/stores'
import { CompareTable } from './compare-table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'

interface ProductCompareProps {
  open?: boolean
  onClose?: () => void
}

export function ProductCompare({ open, onClose }: ProductCompareProps) {
  const { compareList, compareResults, removeFromCompare, clearCompare } = useProductStore()

  if (compareList.length === 0) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Compare Products ({compareList.length})</DialogTitle>
            <Button variant="outline" size="sm" onClick={clearCompare}>
              Clear All
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <CompareTable
            products={compareResults}
            onRemove={removeFromCompare}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: 编写对比表格组件**

```typescript
// src/features/products/components/public/product-compare/compare-table.tsx
'use client'

import { getTranslation } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { Product } from '@/features/products/types'

interface CompareTableProps {
  products: Product[]
  onRemove: (id: string) => void
}

export function CompareTable({ products, onRemove }: CompareTableProps) {
  if (products.length === 0) {
    return <div className="text-center text-gray-500 py-8">No products to compare</div>
  }

  // 收集所有规格名称
  const allSpecs = new Map<string, { label: string; unit?: string }>()
  products.forEach((product) => {
    product.spec_groups?.forEach((group) => {
      group.specs.forEach((spec) => {
        const key = spec.label.en || Object.values(spec.label)[0]
        if (!allSpecs.has(key)) {
          allSpecs.set(key, { label: key, unit: spec.unit })
        }
      })
    })
  })

  // 获取规格值
  const getSpecValue = (product: Product, specLabel: string): string | null => {
    for (const group of product.spec_groups || []) {
      for (const spec of group.specs) {
        const key = spec.label.en || Object.values(spec.label)[0]
        if (key === specLabel) {
          return spec.value
        }
      }
    }
    return null
  }

  // 检查是否有差异
  const hasDifference = (specLabel: string): boolean => {
    const values = products.map((p) => getSpecValue(p, specLabel))
    return new Set(values).size > 1
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 border bg-gray-50 text-left w-40">Specification</th>
            {products.map((product) => (
              <th key={product.id} className="p-4 border bg-gray-50 text-center min-w-[200px]">
                <div className="relative">
                  <button
                    onClick={() => onRemove(product.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="aspect-video rounded overflow-hidden mb-2">
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <p className="font-semibold">{getTranslation(product.translations, 'en', 'name')}</p>
                  <p className="text-sm text-gray-500">{product.model}</p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(allSpecs.entries()).map(([key, { label, unit }]) => {
            const highlight = hasDifference(key)
            return (
              <tr key={key}>
                <td className={`p-4 border font-medium ${highlight ? 'bg-yellow-50' : ''}`}>
                  {label}
                  {unit && <span className="text-gray-500 ml-1">({unit})</span>}
                </td>
                {products.map((product) => {
                  const value = getSpecValue(product, key)
                  return (
                    <td
                      key={product.id}
                      className={`p-4 border text-center ${highlight ? 'bg-yellow-50' : ''}`}
                    >
                      {value || '-'}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add src/features/products/components/public/product-compare/
git commit -m "feat(public): add product compare component"
```

---

### Task 3.3: 更新产品详情页

**Files:**
- Modify: `src/app/[locale]/products/[model]/page.tsx`

- [ ] **Step 1: 更新产品详情页使用新组件**

```typescript
// src/app/[locale]/products/[model]/page.tsx
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { getTranslation } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductGallery } from '@/features/products/components/public/product-gallery'
import { RelatedProducts } from '@/features/products/components/public/related-products'
import { SpecsSection } from '@/components/public/specs-section'
import { DownloadsSection } from '@/components/public/downloads-section'
import { RelatedCasesSection } from '@/components/public/related-cases-section'
import { getProductWithEnhancements } from '@/lib/supabase/admin'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ model: string; locale: string }>
}) {
  const { model, locale } = await params
  const t = await getTranslations('products')

  const product = await getProductWithEnhancements(model, locale)
  if (!product) notFound()

  const name = getTranslation(product.translations, locale, 'name')
  const overview = getTranslation(product.translations, locale, 'overview')
  const advantages = getTranslation(product.translations, locale, 'advantages')
  const capabilities = getTranslation(product.translations, locale, 'capabilities')
  const applications = getTranslation(product.translations, locale, 'applications')

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <ProductGallery
            images={product.images || []}
            videos={product.videos || []}
          />
          <div className="space-y-6">
            <Badge variant="outline" className="font-mono">{product.model}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{name}</h1>
            <p className="text-lg text-gray-600">{overview}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}#demo-form`} className={buttonVariants({ size: 'lg' })}>
                Request Demo
              </Link>
              {product.datasheet_url && (
                <Link
                  href={product.datasheet_url}
                  className={buttonVariants({ variant: 'outline', size: 'lg' })}
                  target="_blank"
                >
                  Download Datasheet
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Specs */}
        {product.spec_groups && product.spec_groups.length > 0 && !product.compliance_flag && (
          <SpecsSection groups={product.spec_groups} locale={locale} />
        )}

        {/* Compliance notice */}
        {product.compliance_flag && (
          <section className="mb-16">
            <div className="p-6 border border-yellow-200 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">
                This product requires compliance assessment. Contact us for detailed specifications.
              </p>
            </div>
          </section>
        )}

        {/* Downloads */}
        {product.product_downloads && product.product_downloads.length > 0 && (
          <DownloadsSection downloads={product.product_downloads} locale={locale} />
        )}

        {/* Advantages */}
        {advantages && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('advantages')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: advantages }} />
          </section>
        )}

        {/* Capabilities */}
        {capabilities && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('capabilities')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: capabilities }} />
          </section>
        )}

        {/* Applications */}
        {applications && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">{t('applications')}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: applications }} />
          </section>
        )}

        {/* Related Cases */}
        {product.related_cases && product.related_cases.length > 0 && (
          <RelatedCasesSection cases={product.related_cases} locale={locale} />
        )}

        {/* Related Products */}
        <RelatedProducts productId={product.id} locale={locale} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/[locale]/products/[model]/page.tsx
git commit -m "feat(public): update product detail page with new gallery and related products"
```

---

## Phase 4: 测试与验证

### Task 4.1: 运行构建测试

- [ ] **Step 1: 运行类型检查**

Run: `npm run typecheck`
Expected: 无类型错误

- [ ] **Step 2: 运行构建**

Run: `npm run build`
Expected: 构建成功

- [ ] **Step 3: 运行 lint**

Run: `npm run lint`
Expected: 无 lint 错误

---

### Task 4.2: 最终提交

- [ ] **Step 1: 提交所有更改**

```bash
git add .
git commit -m "feat(products): complete product management module redesign

- Add media library with grid/list view, upload, preview
- Enhance rich text editor with full toolbar
- Add product categories management
- Add translation status indicators
- Add product gallery with image carousel and video player
- Add product compare functionality
- Add related products recommendation
- Update product detail page with new components"
```

---

## 验收检查清单

### 后台管理
- [ ] 媒体库可上传/管理图片、视频、文档
- [ ] 富文本编辑器工具栏完整
- [ ] 可创建/编辑/删除分类
- [ ] 多语言状态可见

### 前台展示
- [ ] 产品详情图片轮播正常
- [ ] 视频播放正常
- [ ] 相关产品推荐显示
- [ ] 产品对比功能正常

### 性能
- [ ] 页面加载正常
- [ ] 图片加载有进度
- [ ] 大列表滚动流畅
