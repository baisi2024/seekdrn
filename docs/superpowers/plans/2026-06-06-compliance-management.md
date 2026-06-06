# 合规页面管理功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现后台合规页面管理功能，支持富文本编辑、多语言、多个独立政策页面

**Architecture:** 使用现有 footer_content 表存储政策内容，复用 TipTap 富文本编辑器，创建 API 端点处理 CRUD 操作，前端动态渲染政策页面。

**Tech Stack:** Next.js 15, React, TypeScript, TipTap, Supabase, shadcn/ui, next-intl

---

## 文件结构

### 新增文件

**API 层：**
- `src/app/api/admin/compliance/route.ts` - GET 政策列表
- `src/app/api/admin/compliance/[section]/route.ts` - GET、PUT 单个政策

**后台组件：**
- `src/components/admin/compliance-manager.tsx` - 合规管理主组件
- `src/components/admin/policy-editor.tsx` - 政策编辑器

**前端页面：**
- `src/app/[locale]/compliance/[slug]/page.tsx` - 政策页面动态路由

**工具函数：**
- `src/lib/compliance/constants.ts` - 政策列表常量
- `src/lib/compliance/types.ts` - 类型定义

### 修改文件

- `src/app/admin/compliance/page.tsx` - 更新为管理页面
- `messages/*/compliance.json` - 添加政策页面翻译

---

## Phase 1: 基础设施（0.2天）

### Task 1: 创建类型定义和常量

**Files:**
- Create: `src/lib/compliance/types.ts`
- Create: `src/lib/compliance/constants.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/lib/compliance/types.ts

export interface PolicyItem {
  id: string
  section: string
  translations: Record<string, { title?: string; content: string }>
  published: boolean
  created_at: string
  updated_at?: string
}

export interface PolicyUpdate {
  translations: Record<string, { title?: string; content: string }>
  published?: boolean
}

export interface PolicyConfig {
  section: string
  slug: string
  name: {
    en: string
    zh: string
  }
}
```

- [ ] **Step 2: 创建政策列表常量**

```typescript
// src/lib/compliance/constants.ts
import { PolicyConfig } from './types'

export const POLICIES: PolicyConfig[] = [
  {
    section: 'export_compliance',
    slug: 'export',
    name: {
      en: 'Export Compliance',
      zh: '出口合规'
    }
  },
  {
    section: 'privacy_policy',
    slug: 'privacy',
    name: {
      en: 'Privacy Policy',
      zh: '隐私政策'
    }
  },
  {
    section: 'terms_of_use',
    slug: 'terms',
    name: {
      en: 'Terms of Use',
      zh: '使用条款'
    }
  },
  {
    section: 'cookie_policy',
    slug: 'cookie',
    name: {
      en: 'Cookie Policy',
      zh: 'Cookie 政策'
    }
  }
]

export const POLICY_SLUG_MAP = Object.fromEntries(
  POLICIES.map(p => [p.slug, p.section])
) as Record<string, string>
```

- [ ] **Step 3: 提交类型定义和常量**

```bash
git add src/lib/compliance/types.ts src/lib/compliance/constants.ts
git commit -m "feat(compliance): add types and policy constants"
```

---

## Phase 2: API 端点实现（0.3天）

### Task 2: 实现 GET 政策列表端点

**Files:**
- Create: `src/app/api/admin/compliance/route.ts`

- [ ] **Step 1: 实现 GET 端点**

```typescript
// src/app/api/admin/compliance/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { POLICIES } from '@/lib/compliance/constants'
import { PolicyItem } from '@/lib/compliance/types'

export async function GET() {
  try {
    // 查询所有政策数据
    const { data: policiesData, error } = await supabaseAdmin
      .from('footer_content')
      .select('*')
      .in('section', POLICIES.map(p => p.section))

    if (error) throw error

    // 合并政策配置和数据库数据
    const policies: PolicyItem[] = POLICIES.map(policyConfig => {
      const dbData = policiesData?.find(p => p.section === policyConfig.section)

      return {
        id: dbData?.id || '',
        section: policyConfig.section,
        translations: dbData?.translations || {},
        published: dbData?.published ?? false,
        created_at: dbData?.created_at || new Date().toISOString(),
        updated_at: dbData?.updated_at
      }
    })

    return NextResponse.json({ policies })
  } catch (error) {
    console.error('Error fetching policies:', error)
    return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 提交 API 端点**

```bash
git add src/app/api/admin/compliance/route.ts
git commit -m "feat(compliance): add GET policies API endpoint"
```

---

### Task 3: 实现 GET 和 PUT 单个政策端点

**Files:**
- Create: `src/app/api/admin/compliance/[section]/route.ts`

- [ ] **Step 1: 实现 GET 和 PUT 端点**

```typescript
// src/app/api/admin/compliance/[section]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { POLICIES } from '@/lib/compliance/constants'
import { PolicyUpdate } from '@/lib/compliance/types'
import { revalidatePath } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const { section } = params

    // 验证 section 是否有效
    if (!POLICIES.some(p => p.section === section)) {
      return NextResponse.json({ error: 'Invalid policy section' }, { status: 400 })
    }

    const { data: policy, error } = await supabaseAdmin
      .from('footer_content')
      .select('*')
      .eq('section', section)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ policy })
  } catch (error) {
    console.error('Error fetching policy:', error)
    return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const { section } = params
    const body: PolicyUpdate = await request.json()

    // 验证 section 是否有效
    if (!POLICIES.some(p => p.section === section)) {
      return NextResponse.json({ error: 'Invalid policy section' }, { status: 400 })
    }

    // 检查是否已存在
    const { data: existing } = await supabaseAdmin
      .from('footer_content')
      .select('id')
      .eq('section', section)
      .maybeSingle()

    let result
    if (existing) {
      // 更新
      const { data, error } = await supabaseAdmin
        .from('footer_content')
        .update({
          translations: body.translations,
          published: body.published
        })
        .eq('section', section)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // 插入
      const { data, error } = await supabaseAdmin
        .from('footer_content')
        .insert([{
          section,
          translations: body.translations,
          published: body.published ?? false
        }])
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // 触发 ISR 重新验证
    const policyConfig = POLICIES.find(p => p.section === section)
    if (policyConfig) {
      revalidatePath(`/[locale]/compliance/${policyConfig.slug}`, 'page')
    }

    return NextResponse.json({ policy: result })
  } catch (error) {
    console.error('Error updating policy:', error)
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 提交 API 端点**

```bash
git add src/app/api/admin/compliance/[section]/route.ts
git commit -m "feat(compliance): add GET and PUT policy API endpoints with ISR revalidation"
```

---

## Phase 3: 后台管理组件（0.5天）

### Task 4: 实现 PolicyEditor 组件

**Files:**
- Create: `src/components/admin/policy-editor.tsx`

- [ ] **Step 1: 实现 PolicyEditor 组件**

```typescript
// src/components/admin/policy-editor.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { PolicyItem, PolicyUpdate } from '@/lib/compliance/types'
import { RichEditor } from './rich-editor'

interface Props {
  policy: PolicyItem
  onSave: (data: PolicyUpdate) => void
  onClose: () => void
}

const LANGUAGES = ['en', 'zh', 'ar', 'es', 'fr', 'pt', 'id']

export function PolicyEditor({ policy, onSave, onClose }: Props) {
  const [translations, setTranslations] = useState<Record<string, { title?: string; content: string }>>(
    policy.translations || { en: { content: '' } }
  )
  const [published, setPublished] = useState(policy.published)
  const [activeLang, setActiveLang] = useState('en')

  const handleSave = () => {
    onSave({ translations, published })
  }

  const updateTranslation = (lang: string, field: 'title' | 'content', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value
      }
    }))
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={activeLang} onValueChange={setActiveLang}>
            <TabsList>
              {LANGUAGES.map(lang => (
                <TabsTrigger key={lang} value={lang}>{lang.toUpperCase()}</TabsTrigger>
              ))}
            </TabsList>

            {LANGUAGES.map(lang => (
              <TabsContent key={lang} value={lang} className="space-y-4">
                <div>
                  <Label>Title ({lang})</Label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded"
                    value={translations[lang]?.title || ''}
                    onChange={(e) => updateTranslation(lang, 'title', e.target.value)}
                    placeholder="Policy title"
                  />
                </div>

                <div>
                  <Label>Content ({lang})</Label>
                  <div className="mt-1 border rounded">
                    <RichEditor
                      content={translations[lang]?.content || ''}
                      onChange={(html) => updateTranslation(lang, 'content', html)}
                    />
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} />
            <Label>Published</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: 提交 PolicyEditor 组件**

```bash
git add src/components/admin/policy-editor.tsx
git commit -m "feat(compliance): add PolicyEditor component with rich text editor"
```

---

### Task 5: 实现 ComplianceManager 主组件

**Files:**
- Create: `src/components/admin/compliance-manager.tsx`

- [ ] **Step 1: 实现 ComplianceManager 组件**

```typescript
// src/components/admin/compliance-manager.tsx
'use client'

import { useState } from 'react'
import { PolicyItem, PolicyUpdate } from '@/lib/compliance/types'
import { POLICIES } from '@/lib/compliance/constants'
import { PolicyEditor } from './policy-editor'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Edit } from 'lucide-react'

interface Props {
  initialPolicies: PolicyItem[]
}

export function ComplianceManager({ initialPolicies }: Props) {
  const [policies, setPolicies] = useState<PolicyItem[]>(initialPolicies)
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null)

  const handleSave = async (data: PolicyUpdate) => {
    if (!editingPolicy) return

    try {
      const response = await fetch(`/api/admin/compliance/${editingPolicy.section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to save')

      const { policy } = await response.json()

      setPolicies(policies.map(p =>
        p.section === policy.section ? policy : p
      ))

      setEditingPolicy(null)
    } catch (error) {
      console.error('Error saving policy:', error)
      alert('Failed to save policy')
    }
  }

  const handleTogglePublished = async (policy: PolicyItem, published: boolean) => {
    try {
      const response = await fetch(`/api/admin/compliance/${policy.section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...policy, published })
      })

      if (!response.ok) throw new Error('Failed to update')

      const { policy: updated } = await response.json()

      setPolicies(policies.map(p =>
        p.section === updated.section ? updated : p
      ))
    } catch (error) {
      console.error('Error updating policy:', error)
      alert('Failed to update policy')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Compliance Policies</h2>

      <div className="space-y-4">
        {policies.map(policy => {
          const config = POLICIES.find(p => p.section === policy.section)
          const title = policy.translations?.en?.title || config?.name.en || policy.section

          return (
            <div key={policy.section} className="border rounded p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-gray-500">{config?.name.zh}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={policy.published}
                    onCheckedChange={(checked) => handleTogglePublished(policy, checked)}
                  />
                  <span className="text-sm">{policy.published ? 'Published' : 'Draft'}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPolicy(policy)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {editingPolicy && (
        <PolicyEditor
          policy={editingPolicy}
          onSave={handleSave}
          onClose={() => setEditingPolicy(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: 提交 ComplianceManager 组件**

```bash
git add src/components/admin/compliance-manager.tsx
git commit -m "feat(compliance): add ComplianceManager main component"
```

---

### Task 6: 更新后台管理页面

**Files:**
- Modify: `src/app/admin/compliance/page.tsx`

- [ ] **Step 1: 更新管理页面**

```typescript
// src/app/admin/compliance/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ComplianceManager } from '@/components/admin/compliance-manager'
import { PolicyItem } from '@/lib/compliance/types'
import { POLICIES } from '@/lib/compliance/constants'

export default async function CompliancePage() {
  // 查询所有政策数据
  const { data: policiesData } = await supabaseAdmin
    .from('footer_content')
    .select('*')
    .in('section', POLICIES.map(p => p.section))

  // 合并政策配置和数据库数据
  const policies: PolicyItem[] = POLICIES.map(policyConfig => {
    const dbData = policiesData?.find(p => p.section === policyConfig.section)

    return {
      id: dbData?.id || '',
      section: policyConfig.section,
      translations: dbData?.translations || {},
      published: dbData?.published ?? false,
      created_at: dbData?.created_at || new Date().toISOString(),
      updated_at: dbData?.updated_at
    }
  })

  return (
    <div className="p-6">
      <ComplianceManager initialPolicies={policies} />
    </div>
  )
}
```

- [ ] **Step 2: 提交管理页面**

```bash
git add src/app/admin/compliance/page.tsx
git commit -m "feat(compliance): update admin compliance page with manager component"
```

---

## Phase 4: 前端动态渲染（0.2天）

### Task 7: 创建政策页面动态路由

**Files:**
- Create: `src/app/[locale]/compliance/[slug]/page.tsx`

- [ ] **Step 1: 创建政策页面**

```typescript
// src/app/[locale]/compliance/[slug]/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { POLICY_SLUG_MAP, POLICIES } from '@/lib/compliance/constants'

export default async function PolicyPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const section = POLICY_SLUG_MAP[slug]

  if (!section) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">Policy Not Found</h1>
          <p className="text-gray-600">The requested policy page does not exist.</p>
        </div>
      </div>
    )
  }

  const { data: policy } = await supabaseAdmin
    .from('footer_content')
    .select('*')
    .eq('section', section)
    .eq('published', true)
    .maybeSingle()

  const title = policy
    ? getTranslation(policy.translations, locale, 'title')
    : POLICIES.find(p => p.section === section)?.name.en

  const content = policy
    ? getTranslation(policy.translations, locale, 'content')
    : null

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        {content ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-gray-600">Content not available.</p>
        )}
      </div>
    </div>
  )
}

// ISR 缓存
export const revalidate = 60
```

- [ ] **Step 2: 提交政策页面**

```bash
git add src/app/[locale]/compliance/[slug]/page.tsx
git commit -m "feat(compliance): add dynamic policy page route with ISR caching"
```

---

### Task 8: 添加多语言翻译

**Files:**
- Modify: `messages/en/compliance.json`
- Modify: `messages/zh/compliance.json`
- (其他语言文件)

- [ ] **Step 1: 添加英语翻译**

```json
// messages/en/compliance.json
{
  "title": "Compliance",
  "export": {
    "title": "Export Compliance"
  },
  "privacy": {
    "title": "Privacy Policy"
  },
  "terms": {
    "title": "Terms of Use"
  },
  "cookie": {
    "title": "Cookie Policy"
  }
}
```

- [ ] **Step 2: 添加中文翻译**

```json
// messages/zh/compliance.json
{
  "title": "合规政策",
  "export": {
    "title": "出口合规"
  },
  "privacy": {
    "title": "隐私政策"
  },
  "terms": {
    "title": "使用条款"
  },
  "cookie": {
    "title": "Cookie 政策"
  }
}
```

- [ ] **Step 3: 提交翻译文件**

```bash
git add messages/en/compliance.json messages/zh/compliance.json
git commit -m "feat(i18n): add compliance policy translations"
```

---

### Task 9: 运行测试和构建验证

**Files:**
- 无新增文件

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
npm run type-check
```

Expected: 无类型错误

- [ ] **Step 2: 运行 ESLint 检查**

```bash
npm run lint
```

Expected: 无 lint 错误

- [ ] **Step 3: 运行构建**

```bash
npm run build
```

Expected: 构建成功

- [ ] **Step 4: 提交最终版本**

```bash
git add -A
git commit -m "feat(compliance): complete compliance management feature

- Add policy management API endpoints
- Implement rich text editor for policy content
- Support 4 policy pages (export, privacy, terms, cookie)
- Add multi-language support (7 languages)
- Implement dynamic policy page routes
- Add ISR caching for performance"
```

---

## 验收清单

### 功能验收

- [ ] 管理员可以编辑所有政策页面
- [ ] 支持富文本编辑
- [ ] 支持多语言内容编辑
- [ ] 前端正确渲染政策页面
- [ ] ISR 缓存正常工作

### 技术验收

- [ ] 所有 API 端点正常工作
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 构建成功

### 用户体验验收

- [ ] 富文本编辑器功能完整
- [ ] 多语言切换正确
- [ ] 页面加载快速

---

**计划版本：v1.0**
**最后更新：2026-06-06**
**预计工期：1 天**
