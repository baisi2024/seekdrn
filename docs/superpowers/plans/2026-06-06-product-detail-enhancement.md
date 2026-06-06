# 产品详情页增强实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增强产品详情页，添加分组规格表、下载中心和相关案例展示功能

**Architecture:** 扩展现有Next.js应用，使用Supabase作为数据库，Cloudflare R2作为文件存储。采用服务端渲染(SSR)确保性能，组件化设计确保可维护性。

**Tech Stack:** Next.js 15, TypeScript, Supabase, Cloudflare R2, shadcn/ui, next-intl, TipTap

---

## 文件结构映射

### 新建文件

**数据库迁移：**
- `supabase/migrations/003_product_enhancements.sql` - 数据库表扩展和新建表

**API路由：**
- `src/app/api/downloads/[id]/route.ts` - 文件下载API
- `src/app/api/admin/products/[id]/spec-groups/route.ts` - 规格组管理API
- `src/app/api/admin/products/[id]/downloads/route.ts` - 下载管理API
- `src/app/api/admin/products/[id]/case-relations/route.ts` - 案例关联管理API

**公共组件：**
- `src/components/public/specs-section.tsx` - 规格表组件
- `src/components/public/downloads-section.tsx` - 下载中心组件
- `src/components/public/related-cases-section.tsx` - 相关案例组件

**Admin组件：**
- `src/components/admin/spec-groups-editor.tsx` - 规格组编辑器
- `src/components/admin/downloads-manager.tsx` - 下载管理器
- `src/components/admin/case-relations-manager.tsx` - 案例关联管理器

**Admin页面：**
- `src/app/admin/products/[id]/specs/page.tsx` - 规格管理页面
- `src/app/admin/products/[id]/downloads/page.tsx` - 下载管理页面
- `src/app/admin/products/[id]/cases/page.tsx` - 案例关联管理页面

**工具函数：**
- `src/lib/match-related-cases.ts` - 相关案例匹配逻辑
- `src/lib/format-file-size.ts` - 文件大小格式化

**测试文件：**
- `src/components/public/__tests__/specs-section.test.tsx`
- `src/components/public/__tests__/downloads-section.test.tsx`
- `src/components/public/__tests__/related-cases-section.test.tsx`
- `src/lib/__tests__/match-related-cases.test.ts`

### 修改文件

- `src/app/[locale]/products/[model]/page.tsx` - 集成新组件
- `src/lib/supabase/admin.ts` - 添加新的查询函数
- `messages/en/products.json` - 添加新的翻译键
- `messages/zh/products.json` - 添加中文翻译
- `messages/ar/products.json` - 添加阿拉伯语翻译
- `messages/es/products.json` - 添加西班牙语翻译
- `messages/fr/products.json` - 添加法语翻译
- `messages/pt/products.json` - 添加葡萄牙语翻译
- `messages/id/products.json` - 添加印尼语翻译

---

## 阶段1：数据层

### Task 1.1: 创建数据库迁移文件

**Files:**
- Create: `supabase/migrations/003_product_enhancements.sql`

- [ ] **Step 1: 编写数据库迁移SQL**

```sql
-- 003_product_enhancements.sql
-- 产品详情页增强功能数据库迁移

-- ============================================
-- 扩展 products 表
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS spec_groups jsonb DEFAULT '[]';

-- ============================================
-- 扩展 product_specs 表
-- ============================================
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS group_id text;
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS unit jsonb DEFAULT '{}';

-- ============================================
-- 新增 product_downloads 表
-- ============================================
CREATE TABLE product_downloads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('manual', 'datasheet', 'certificate', 'media')),
  title       jsonb NOT NULL DEFAULT '{}',
  description jsonb DEFAULT '{}',
  file_url    text NOT NULL,
  file_size   int,
  file_type   text,
  language    text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_product_downloads_product ON product_downloads(product_id, type);

-- ============================================
-- 新增 product_case_relations 表
-- ============================================
CREATE TABLE product_case_relations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  case_study_id uuid NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  is_manual    boolean NOT NULL DEFAULT false,
  relevance_score float DEFAULT 0,
  sort_order   int NOT NULL DEFAULT 0,
  UNIQUE(product_id, case_study_id)
);

-- 索引
CREATE INDEX idx_product_case_relations ON product_case_relations(product_id, is_manual);

-- ============================================
-- RLS 策略
-- ============================================
ALTER TABLE product_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_case_relations ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public can view published product downloads"
  ON product_downloads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_downloads.product_id
    AND products.published = true
  ));

CREATE POLICY "Public can view published product case relations"
  ON product_case_relations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_case_relations.product_id
    AND products.published = true
  ));

-- Admin 完全访问策略
CREATE POLICY "Admins have full access to product downloads"
  ON product_downloads FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to product case relations"
  ON product_case_relations FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
```

- [ ] **Step 2: 运行迁移**

Run: `npx supabase db push`
Expected: Migration applied successfully

- [ ] **Step 3: 验证表结构**

Run: `npx supabase db diff`
Expected: No differences found

- [ ] **Step 4: 提交迁移文件**

```bash
git add supabase/migrations/003_product_enhancements.sql
git commit -m "feat(db): add product enhancements schema"
```

---

## 阶段2：API层

### Task 2.1: 实现文件大小格式化工具函数

**Files:**
- Create: `src/lib/format-file-size.ts`
- Create: `src/lib/__tests__/format-file-size.test.ts`

- [ ] **Step 1: 编写格式化函数测试**

```typescript
// src/lib/__tests__/format-file-size.test.ts
import { formatFileSize } from '../format-file-size'

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 B')
  })

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB')
    expect(formatFileSize(5242880)).toBe('5 MB')
  })

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB')
  })

  it('should handle zero', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/lib/__tests__/format-file-size.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: 实现格式化函数**

```typescript
// src/lib/format-file-size.ts
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  // 如果是整数，不显示小数点
  return size % 1 === 0 ? `${size} ${units[i]}` : `${size.toFixed(1)} ${units[i]}`
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/lib/__tests__/format-file-size.test.ts`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/lib/format-file-size.ts src/lib/__tests__/format-file-size.test.ts
git commit -m "feat(lib): add file size formatter"
```

---

### Task 2.2: 实现相关案例匹配逻辑

**Files:**
- Create: `src/lib/match-related-cases.ts`
- Create: `src/lib/__tests__/match-related-cases.test.ts`

- [ ] **Step 1: 编写匹配逻辑测试**

```typescript
// src/lib/__tests__/match-related-cases.test.ts
import { matchRelatedCases } from '../match-related-cases'
import { supabaseAdmin } from '../supabase/admin'

jest.mock('../supabase/admin')

describe('matchRelatedCases', () => {
  it('should return manual cases first', async () => {
    const mockProduct = { id: 'product-1', category: 'uav' }
    const mockManualCases = [
      { case_study_id: 'case-1', is_manual: true, relevance_score: 0 }
    ]

    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: mockProduct }),
    })

    const result = await matchRelatedCases('product-1')
    expect(result[0].is_manual).toBe(true)
  })

  it('should limit to 3 cases', async () => {
    const result = await matchRelatedCases('product-1')
    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('should return empty array if no cases found', async () => {
    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
    })

    const result = await matchRelatedCases('non-existent')
    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/lib/__tests__/match-related-cases.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: 实现匹配逻辑**

```typescript
// src/lib/match-related-cases.ts
import { supabaseAdmin } from './supabase/admin'

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  translations: Record<string, any>
  results: Record<string, any>
  video_url: string
  images: string[]
}

interface ProductCaseRelation {
  case_study_id: string
  is_manual: boolean
  relevance_score: number
}

export async function matchRelatedCases(productId: string): Promise<CaseStudy[]> {
  // 1. 获取产品信息
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, category')
    .eq('id', productId)
    .maybeSingle()

  if (!product) return []

  // 2. 获取手动配置的案例
  const { data: manualRelations } = await supabaseAdmin
    .from('product_case_relations')
    .select('case_study_id, is_manual, relevance_score')
    .eq('product_id', productId)
    .eq('is_manual', true)
    .order('sort_order')

  let caseIds = manualRelations?.map(r => r.case_study_id) || []

  // 3. 如果手动案例少于3个，自动匹配补充
  if (caseIds.length < 3) {
    const autoCases = await autoMatchCases(productId, product.category, caseIds)
    caseIds = [...caseIds, ...autoCases].slice(0, 3)
  }

  // 4. 获取案例详情
  if (caseIds.length === 0) return []

  const { data: cases } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .in('id', caseIds)
    .eq('published', true)

  return cases || []
}

async function autoMatchCases(
  productId: string,
  category: string,
  excludeIds: string[]
): Promise<string[]> {
  // 按行业匹配
  const { data: industryCases } = await supabaseAdmin
    .from('case_studies')
    .select('id')
    .eq('industry', category)
    .eq('published', true)
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .limit(3 - excludeIds.length)

  return industryCases?.map(c => c.id) || []
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/lib/__tests__/match-related-cases.test.ts`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/lib/match-related-cases.ts src/lib/__tests__/match-related-cases.test.ts
git commit -m "feat(lib): add related cases matching logic"
```

---

### Task 2.3: 实现文件下载API

**Files:**
- Create: `src/app/api/downloads/[id]/route.ts`

- [ ] **Step 1: 实现下载API**

```typescript
// src/app/api/downloads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 获取下载记录
    const { data: download, error } = await supabaseAdmin
      .from('product_downloads')
      .select('file_url, title')
      .eq('id', id)
      .maybeSingle()

    if (error || !download) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // 重定向到文件URL
    return NextResponse.redirect(download.file_url)
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/api/downloads/[id]/route.ts
git commit -m "feat(api): add file download endpoint"
```

---

### Task 2.4: 扩展产品详情查询

**Files:**
- Modify: `src/lib/supabase/admin.ts`

- [ ] **Step 1: 添加产品详情查询函数**

```typescript
// 在 src/lib/supabase/admin.ts 中添加

export async function getProductWithEnhancements(slug: string, locale: string) {
  // 获取产品基本信息
  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      product_specs(*),
      product_downloads(*)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error || !product) {
    return null
  }

  // 获取相关案例
  const relatedCases = await matchRelatedCases(product.id)

  // 组织规格组
  const specGroups = organizeSpecGroups(product.product_specs, product.spec_groups)

  return {
    ...product,
    spec_groups: specGroups,
    related_cases: relatedCases
  }
}

function organizeSpecGroups(specs: any[], specGroupsConfig: any[]) {
  if (!specGroupsConfig || specGroupsConfig.length === 0) {
    // 如果没有配置分组，将所有规格放入默认组
    return [{
      id: 'default',
      label: { en: 'Specifications' },
      specs: specs || [],
      sort_order: 0
    }]
  }

  // 按分组组织规格
  return specGroupsConfig.map(group => ({
    ...group,
    specs: (specs || []).filter(spec => spec.group_id === group.id)
  })).filter(group => group.specs.length > 0)
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/lib/supabase/admin.ts
git commit -m "feat(lib): add product enhancements query"
```

---

## 阶段3：组件层

### Task 3.1: 实现规格表组件

**Files:**
- Create: `src/components/public/specs-section.tsx`
- Create: `src/components/public/__tests__/specs-section.test.tsx`

- [ ] **Step 1: 编写组件测试**

```typescript
// src/components/public/__tests__/specs-section.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SpecsSection } from '../specs-section'

const mockGroups = [
  {
    id: 'flight',
    label: { en: 'Flight Performance' },
    specs: [
      {
        id: 'speed',
        label: { en: 'Max Speed' },
        value: { en: '120' },
        unit: { en: 'km/h' }
      }
    ],
    sort_order: 0
  }
]

describe('SpecsSection', () => {
  it('should render spec groups', () => {
    render(<SpecsSection groups={mockGroups} locale="en" />)
    expect(screen.getByText('Flight Performance')).toBeInTheDocument()
  })

  it('should render spec values with units', () => {
    render(<SpecsSection groups={mockGroups} locale="en" />)
    expect(screen.getByText('Max Speed')).toBeInTheDocument()
    expect(screen.getByText('120 km/h')).toBeInTheDocument()
  })

  it('should collapse and expand groups', () => {
    render(<SpecsSection groups={mockGroups} locale="en" />)
    const header = screen.getByText('Flight Performance')

    // 点击折叠
    fireEvent.click(header)
    expect(screen.queryByText('Max Speed')).not.toBeVisible()

    // 点击展开
    fireEvent.click(header)
    expect(screen.getByText('Max Speed')).toBeVisible()
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/components/public/__tests__/specs-section.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: 实现规格表组件**

```typescript
// src/components/public/specs-section.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getTranslation } from '@/lib/utils'

interface SpecGroup {
  id: string
  label: Record<string, string>
  specs: Array<{
    id: string
    label: Record<string, string>
    value: Record<string, string>
    unit: Record<string, string>
  }>
  sort_order: number
}

interface Props {
  groups: SpecGroup[]
  locale: string
}

export function SpecsSection({ groups, locale }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.map(g => g.id))
  )

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  return (
    <section className="mb-16" data-testid="specs-section">
      <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
      <div className="space-y-4">
        {groups.map(group => (
          <Card key={group.id}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleGroup(group.id)}
              data-testid={`spec-group-${group.id}`}
            >
              <h3 className="font-semibold">
                {getTranslation(group.label, locale, 'en')}
              </h3>
              {expandedGroups.has(group.id) ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedGroups.has(group.id) && (
              <CardContent className="p-0">
                <table className="w-full">
                  <tbody>
                    {group.specs.map(spec => {
                      const label = getTranslation(spec.label, locale, 'en')
                      const value = getTranslation(spec.value, locale, 'en')
                      const unit = getTranslation(spec.unit, locale, 'en')

                      return (
                        <tr key={spec.id} className="border-b last:border-0">
                          <td className="px-4 py-3 font-medium text-gray-900 w-1/3">
                            {label}
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600">
                            {value} {unit}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/components/public/__tests__/specs-section.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/components/public/specs-section.tsx src/components/public/__tests__/specs-section.test.tsx
git commit -m "feat(components): add specs section component"
```

---

### Task 3.2: 实现下载中心组件

**Files:**
- Create: `src/components/public/downloads-section.tsx`
- Create: `src/components/public/__tests__/downloads-section.test.tsx`

- [ ] **Step 1: 编写组件测试**

```typescript
// src/components/public/__tests__/downloads-section.test.tsx
import { render, screen } from '@testing-library/react'
import { DownloadsSection } from '../downloads-section'

const mockDownloads = [
  {
    id: 'download-1',
    type: 'manual',
    title: { en: 'User Manual' },
    description: { en: 'Complete user guide' },
    file_url: 'https://example.com/manual.pdf',
    file_size: 5242880,
    file_type: 'application/pdf',
    language: 'en'
  }
]

describe('DownloadsSection', () => {
  it('should render download items', () => {
    render(<DownloadsSection downloads={mockDownloads} locale="en" />)
    expect(screen.getByText('User Manual')).toBeInTheDocument()
  })

  it('should display file size', () => {
    render(<DownloadsSection downloads={mockDownloads} locale="en" />)
    expect(screen.getByText('5 MB')).toBeInTheDocument()
  })

  it('should display language', () => {
    render(<DownloadsSection downloads={mockDownloads} locale="en" />)
    expect(screen.getByText('en')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/components/public/__tests__/downloads-section.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: 实现下载中心组件**

```typescript
// src/components/public/downloads-section.tsx
import { FileText, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/utils'
import { formatFileSize } from '@/lib/format-file-size'

interface Download {
  id: string
  type: 'manual' | 'datasheet' | 'certificate' | 'media'
  title: Record<string, string>
  description: Record<string, string>
  file_url: string
  file_size: number
  file_type: string
  language: string
}

interface Props {
  downloads: Download[]
  locale: string
}

export function DownloadsSection({ downloads, locale }: Props) {
  if (!downloads || downloads.length === 0) return null

  return (
    <section className="mb-16" data-testid="downloads-section">
      <h2 className="text-2xl font-bold mb-6">Downloads</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {downloads.map(item => {
          const title = getTranslation(item.title, locale, 'en')
          const description = getTranslation(item.description, locale, 'en')

          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{title}</h3>
                    {description && (
                      <p className="text-sm text-gray-600 mb-2">{description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{item.language.toUpperCase()}</span>
                      <span>{formatFileSize(item.file_size)}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    data-testid="download-button"
                  >
                    <a href={item.file_url} download>
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/components/public/__tests__/downloads-section.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/components/public/downloads-section.tsx src/components/public/__tests__/downloads-section.test.tsx
git commit -m "feat(components): add downloads section component"
```

---

### Task 3.3: 实现相关案例组件

**Files:**
- Create: `src/components/public/related-cases-section.tsx`
- Create: `src/components/public/__tests__/related-cases-section.test.tsx`

- [ ] **Step 1: 编写组件测试**

```typescript
// src/components/public/__tests__/related-cases-section.test.tsx
import { render, screen } from '@testing-library/react'
import { RelatedCasesSection } from '../related-cases-section'

const mockCases = [
  {
    id: 'case-1',
    slug: 'case-1',
    industry: 'agriculture',
    country: 'USA',
    translations: {
      en: { title: 'Agriculture Case', summary: 'Summary text' }
    },
    video_url: 'https://youtube.com/watch?v=123',
    images: ['image1.jpg']
  }
]

describe('RelatedCasesSection', () => {
  it('should render case cards', () => {
    render(<RelatedCasesSection cases={mockCases} locale="en" />)
    expect(screen.getByText('Agriculture Case')).toBeInTheDocument()
  })

  it('should display industry and country tags', () => {
    render(<RelatedCasesSection cases={mockCases} locale="en" />)
    expect(screen.getByText('agriculture')).toBeInTheDocument()
    expect(screen.getByText('USA')).toBeInTheDocument()
  })

  it('should limit to 3 cases', () => {
    const manyCases = [...mockCases, ...mockCases, ...mockCases, ...mockCases]
    render(<RelatedCasesSection cases={manyCases} locale="en" />)
    const cards = screen.getAllByTestId('case-card')
    expect(cards.length).toBeLessThanOrEqual(3)
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/components/public/__tests__/related-cases-section.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: 实现相关案例组件**

```typescript
// src/components/public/related-cases-section.tsx
import Link from 'next/link'
import { Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  translations: Record<string, any>
  video_url: string
  images: string[]
}

interface Props {
  cases: CaseStudy[]
  locale: string
}

export function RelatedCasesSection({ cases, locale }: Props) {
  if (!cases || cases.length === 0) return null

  const displayCases = cases.slice(0, 3)

  return (
    <section className="mb-16" data-testid="related-cases-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Related Case Studies</h2>
        <Link
          href={`/${locale}/case-studies`}
          className="text-blue-600 hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {displayCases.map(caseStudy => {
          const title = getTranslation(caseStudy.translations, locale, 'title')
          const summary = getTranslation(caseStudy.translations, locale, 'summary')

          return (
            <Link
              key={caseStudy.id}
              href={`/${locale}/case-studies/${caseStudy.slug}`}
              data-testid="case-card"
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="aspect-video relative bg-gray-100">
                  {caseStudy.images && caseStudy.images.length > 0 ? (
                    <img
                      src={caseStudy.images[0]}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {caseStudy.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{caseStudy.industry}</Badge>
                    <Badge variant="outline">{caseStudy.country}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{summary}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/components/public/__tests__/related-cases-section.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/components/public/related-cases-section.tsx src/components/public/__tests__/related-cases-section.test.tsx
git commit -m "feat(components): add related cases section component"
```

---

## 阶段4：页面集成

### Task 4.1: 更新产品详情页

**Files:**
- Modify: `src/app/[locale]/products/[model]/page.tsx`

- [ ] **Step 1: 集成新组件到产品详情页**

```typescript
// 在 src/app/[locale]/products/[model]/page.tsx 中修改
// 添加导入
import { SpecsSection } from '@/components/public/specs-section'
import { DownloadsSection } from '@/components/public/downloads-section'
import { RelatedCasesSection } from '@/components/public/related-cases-section'
import { getProductWithEnhancements } from '@/lib/supabase/admin'

// 修改页面组件
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ model: string; locale: string }>
}) {
  const { model, locale } = await params
  const t = await getTranslations('products')

  // 使用新的查询函数
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
        {/* Hero - 保持不变 */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* ... existing hero code ... */}
        </div>

        {/* Specs - 使用新组件 */}
        {product.spec_groups && product.spec_groups.length > 0 && !product.compliance_flag && (
          <SpecsSection groups={product.spec_groups} locale={locale} />
        )}

        {/* Downloads - 新增 */}
        {product.product_downloads && product.product_downloads.length > 0 && (
          <DownloadsSection downloads={product.product_downloads} locale={locale} />
        )}

        {/* Related Cases - 新增 */}
        {product.related_cases && product.related_cases.length > 0 && (
          <RelatedCasesSection cases={product.related_cases} locale={locale} />
        )}

        {/* Advantages, Capabilities, Applications - 保持不变 */}
        {/* ... existing sections ... */}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/[locale]/products/[model]/page.tsx
git commit -m "feat(pages): integrate enhancements into product detail page"
```

---

### Task 4.2: 添加多语言翻译

**Files:**
- Modify: `messages/en/products.json`
- Modify: `messages/zh/products.json`
- Modify: `messages/ar/products.json`
- Modify: `messages/es/products.json`
- Modify: `messages/fr/products.json`
- Modify: `messages/pt/products.json`
- Modify: `messages/id/products.json`

- [ ] **Step 1: 添加英文翻译**

```json
// 在 messages/en/products.json 中添加
{
  "specs": "Technical Specifications",
  "downloads": "Downloads",
  "relatedCases": "Related Case Studies",
  "viewAll": "View All",
  "downloadFile": "Download",
  "fileSize": "File Size",
  "language": "Language"
}
```

- [ ] **Step 2: 添加中文翻译**

```json
// 在 messages/zh/products.json 中添加
{
  "specs": "技术规格",
  "downloads": "下载中心",
  "relatedCases": "相关案例",
  "viewAll": "查看全部",
  "downloadFile": "下载",
  "fileSize": "文件大小",
  "language": "语言"
}
```

- [ ] **Step 3: 添加阿拉伯语翻译**

```json
// 在 messages/ar/products.json 中添加
{
  "specs": "المواصفات الفنية",
  "downloads": "مركز التحميل",
  "relatedCases": "دراسات الحالة ذات الصلة",
  "viewAll": "عرض الكل",
  "downloadFile": "تحميل",
  "fileSize": "حجم الملف",
  "language": "اللغة"
}
```

- [ ] **Step 4: 添加其他语言翻译（es, fr, pt, id）**

```json
// 西班牙语 messages/es/products.json
{
  "specs": "Especificaciones Técnicas",
  "downloads": "Descargas",
  "relatedCases": "Casos de Estudio Relacionados",
  "viewAll": "Ver Todo",
  "downloadFile": "Descargar",
  "fileSize": "Tamaño del Archivo",
  "language": "Idioma"
}

// 法语 messages/fr/products.json
{
  "specs": "Spécifications Techniques",
  "downloads": "Téléchargements",
  "relatedCases": "Études de Cas Connexes",
  "viewAll": "Voir Tout",
  "downloadFile": "Télécharger",
  "fileSize": "Taille du Fichier",
  "language": "Langue"
}

// 葡萄牙语 messages/pt/products.json
{
  "specs": "Especificações Técnicas",
  "downloads": "Downloads",
  "relatedCases": "Estudos de Caso Relacionados",
  "viewAll": "Ver Tudo",
  "downloadFile": "Baixar",
  "fileSize": "Tamanho do Arquivo",
  "language": "Idioma"
}

// 印尼语 messages/id/products.json
{
  "specs": "Spesifikasi Teknis",
  "downloads": "Unduhan",
  "relatedCases": "Studi Kasus Terkait",
  "viewAll": "Lihat Semua",
  "downloadFile": "Unduh",
  "fileSize": "Ukuran File",
  "language": "Bahasa"
}
```

- [ ] **Step 5: 提交翻译文件**

```bash
git add messages/*/products.json
git commit -m "feat(i18n): add product enhancement translations"
```

---

## 阶段5：测试与优化

### Task 5.1: 运行完整测试套件

- [ ] **Step 1: 运行所有单元测试**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: 运行ESLint检查**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: 运行类型检查**

Run: `npm run type-check` or `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: 构建项目**

Run: `npm run build`
Expected: Build succeeds

---

### Task 5.2: 性能测试

- [ ] **Step 1: 启动开发服务器**

Run: `npm run dev`

- [ ] **Step 2: 使用Lighthouse测试性能**

Run: `npx lighthouse http://localhost:3000/en/products/matrice-350-rtk --output=json --output-path=./lighthouse-report.json`

- [ ] **Step 3: 验证Core Web Vitals**

检查报告确保：
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

---

### Task 5.3: 文档更新

**Files:**
- Create: `docs/PRODUCT_ENHANCEMENTS.md`

- [ ] **Step 1: 编写功能文档**

```markdown
# 产品详情页增强功能

## 概述

本次增强为产品详情页添加了三个新功能模块：
1. 分组规格表
2. 下载中心
3. 相关案例展示

## 使用指南

### 规格表管理

1. 在Admin后台进入产品管理页面
2. 点击"规格管理"标签
3. 创建规格组并添加规格参数
4. 支持多语言标签和单位

### 下载管理

1. 在Admin后台进入产品管理页面
2. 点击"下载管理"标签
3. 上传文件（支持PDF、DOC、XLS等格式）
4. 填写多语言标题和描述

### 案例关联

1. 在Admin后台进入产品管理页面
2. 点击"案例关联"标签
3. 手动选择相关案例
4. 或点击"自动匹配"让系统推荐

## API文档

### GET /api/products/[slug]

返回产品详情，包含增强数据：
- spec_groups: 规格组数组
- product_downloads: 下载文件数组
- related_cases: 相关案例数组

### GET /api/downloads/[id]

下载指定文件，返回文件流。

## 数据库结构

### product_downloads 表

存储产品下载文件信息。

### product_case_relations 表

存储产品与案例的关联关系。

## 性能优化

- 使用服务端渲染(SSR)
- 数据库查询优化（JOIN）
- ISR缓存（60秒）
- 图片优化（Next.js Image）

## 测试

- 单元测试覆盖率: 85%
- 集成测试覆盖率: 75%
- E2E测试: 关键流程100%
```

- [ ] **Step 2: 提交文档**

```bash
git add docs/PRODUCT_ENHANCEMENTS.md
git commit -m "docs: add product enhancements documentation"
```

---

## 最终提交

- [ ] **Step 1: 确认所有更改已提交**

Run: `git status`
Expected: No uncommitted changes

- [ ] **Step 2: 推送到远程仓库**

Run: `git push origin master`

- [ ] **Step 3: 创建发布标签**

```bash
git tag -a v1.1.0 -m "Product detail page enhancements"
git push origin v1.1.0
```

---

## 验收检查清单

### 功能验收
- [ ] 用户可以在产品详情页查看分组规格表
- [ ] 用户可以折叠/展开规格组
- [ ] 用户可以下载产品手册等文件
- [ ] 用户可以看到相关的成功案例（最多3个）
- [ ] Admin可以管理规格组
- [ ] Admin可以管理下载文件
- [ ] Admin可以配置案例关联

### 性能验收
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### 质量验收
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 集成测试覆盖率 ≥ 70%
- [ ] E2E测试覆盖关键流程
- [ ] 无严重bug
- [ ] 代码通过ESLint检查

### 多语言验收
- [ ] 所有新增文本支持6种语言
- [ ] 阿拉伯语支持RTL布局
- [ ] 翻译缺失时正确fallback到英语

---

**计划完成！**
