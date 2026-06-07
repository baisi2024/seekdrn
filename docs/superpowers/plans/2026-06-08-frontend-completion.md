# SeekDrone 独立站前端完善 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将独立站前端与 Supabase 后端完全联通，实现 8 模块动态首页、完整 SEO/GEO/GTM 基础设施、品牌化设计系统。

**Architecture:** 所有数据通过 `supabaseAdmin` 在服务端组件中读取，客户端组件通过 props 接收。新建 `faqs`、`site_content` 表，扩展 `site_settings`。使用 `design-taste-frontend` 技能生成品牌设计系统。

**Tech Stack:** Next.js 15 App Router, Supabase, next-intl, Tailwind CSS, shadcn/ui, Zod

---

## 前置：数据库迁移

### Task 0: 数据库迁移 — 新建 faqs 表

**Files:**
- Create: `supabase/migrations/001_add_faqs.sql`

- [ ] **Step 1: 创建 SQL 迁移文件**

```sql
-- 001_add_faqs.sql
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translations JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON faqs FOR SELECT USING (published = true);
```

- [ ] **Step 2: 在 Supabase SQL Editor 中执行上述 SQL**

Run: 打开 Supabase Dashboard → SQL Editor → 粘贴执行

### Task 0b: 数据库迁移 — 新建 site_content 表

**Files:**
- Create: `supabase/migrations/002_add_site_content.sql`

- [ ] **Step 1: 创建 SQL 迁移文件**

```sql
-- 002_add_site_content.sql
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR NOT NULL,
  key VARCHAR NOT NULL,
  translations JSONB DEFAULT '{}',
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section, key)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON site_content FOR SELECT USING (published = true);
```

- [ ] **Step 2: 在 Supabase SQL Editor 中执行上述 SQL**

### Task 0c: 数据库迁移 — 扩展 site_settings 表

**Files:**
- Create: `supabase/migrations/003_extend_site_settings.sql`

- [ ] **Step 1: 创建 SQL 迁移文件**

```sql
-- 003_extend_site_settings.sql
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS trust_bar_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cta_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gtm_id TEXT,
  ADD COLUMN IF NOT EXISTS about_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS advantages_config JSONB DEFAULT '{}';
```

- [ ] **Step 2: 在 Supabase SQL Editor 中执行上述 SQL**

---

## Phase 1: 设计系统

### Task 1: 运行 design-taste-frontend 生成品牌设计系统

**Files:**
- Create: `src/styles/brand.css` (或更新现有 globals.css)
- Modify: `tailwind.config.ts` (如需要)
- Modify: `src/app/globals.css`

- [ ] **Step 1: 调用 design-taste-frontend 技能**

在对话中调用 `design-taste-frontend` 技能，提供以下品牌简报：

```
品牌：SeekDrone
行业：工业无人机 / 反无人机系统 / 国防安全
品牌定位：经实战验证的无人机平台，服务于国防、安全和关键基础设施
品牌关键词：精密、可靠、军事级、实战验证、工业
目标受众：政府机构、国防承包商、能源公司、测绘公司
竞品参考：DJI Enterprise, Anduril, Shield AI
设计要求：拒绝 AI 模板化风格，需要独特的设计语言
```

- [ ] **Step 2: 根据 skill 输出，将设计变量写入 CSS**

将生成的 CSS 变量（配色、字体、间距、阴影）写入 `src/app/globals.css`，替换现有 Tailwind 默认主题。

- [ ] **Step 3: 更新 tailwind.config.ts 映射设计变量**

```typescript
// tailwind.config.ts 中扩展 theme
theme: {
  extend: {
    colors: {
      brand: {
        50: 'var(--brand-50)',
        100: 'var(--brand-100)',
        // ... 根据 design-taste-frontend 输出
      },
      surface: {
        DEFAULT: 'var(--surface)',
        muted: 'var(--surface-muted)',
        elevated: 'var(--surface-elevated)',
      }
    },
    fontFamily: {
      display: ['var(--font-display)', 'sans-serif'],
      body: ['var(--font-body)', 'sans-serif'],
      mono: ['var(--font-mono)', 'monospace'],
    }
  }
}
```

- [ ] **Step 4: 验证设计系统**

Run: `npm run dev`
Check: 打开首页确认设计变量生效

---

## Phase 2: 数据层

### Task 2: 扩展 site_settings API 和类型

**Files:**
- Modify: `src/app/api/site-settings/route.ts`
- Create: `src/lib/site-settings/types.ts`
- Create: `src/lib/site-settings/api.ts`

- [ ] **Step 1: 创建 site_settings 类型定义**

```typescript
// src/lib/site-settings/types.ts
export interface HeroConfig {
  title?: Record<string, string>
  subtitle?: Record<string, string>
  image_url?: string
  category?: string
  indicators?: Array<{ label: string; value: number }>
}

export interface TrustBarConfig {
  stats?: Array<{ label: Record<string, string>; value: string }>
}

export interface CtaConfig {
  title?: Record<string, string>
  subtitle?: Record<string, string>
  button_text?: Record<string, string>
}

export interface SeoMetadata {
  default_title?: Record<string, string>
  default_description?: Record<string, string>
  og_image?: string
}

export interface SiteSettings {
  id: number
  site_name: Record<string, string>
  seo_description: Record<string, string>
  contact_email: string
  contact_whatsapp: string
  enabled_languages: string[]
  enable_chinese: boolean
  enable_chinese_by_ip: boolean
  hero_config?: HeroConfig
  trust_bar_config?: TrustBarConfig
  cta_config?: CtaConfig
  seo_metadata?: SeoMetadata
  gtm_id?: string
  about_config?: Record<string, any>
  advantages_config?: Record<string, any>
}
```

- [ ] **Step 2: 创建 site_settings API 辅助函数**

```typescript
// src/lib/site-settings/api.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SiteSettings } from './types'

let cached: SiteSettings | null = null
let cachedAt = 0
const TTL = 60_000 // 1 minute

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (cached && Date.now() - cachedAt < TTL) return cached

  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .single()

  if (data) {
    cached = data as SiteSettings
    cachedAt = Date.now()
  }
  return cached
}
```

- [ ] **Step 3: 更新 site-settings API route**

```typescript
// src/app/api/site-settings/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const { data } = await supabaseAdmin
    .from('site_settings')
    .select('*')
    .single()

  return NextResponse.json(data || {})
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .update(body)
    .eq('id', 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
```

- [ ] **Step 4: 提交**

```bash
git add src/lib/site-settings/ src/app/api/site-settings/
git commit -m "feat: extend site_settings API with types and caching"
```

### Task 3: 创建 faqs API

**Files:**
- Create: `src/lib/faqs/types.ts`
- Create: `src/lib/faqs/api.ts`
- Create: `src/app/api/faqs/route.ts`

- [ ] **Step 1: 创建 FAQ 类型**

```typescript
// src/lib/faqs/types.ts
export interface FAQ {
  id: string
  translations: Record<string, { question: string; answer: string }>
  sort_order: number
  published: boolean
  created_at: string
}
```

- [ ] **Step 2: 创建 FAQ API 函数**

```typescript
// src/lib/faqs/api.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { FAQ } from './types'

export async function getFAQs(): Promise<FAQ[]> {
  const { data } = await supabaseAdmin
    .from('faqs')
    .select('*')
    .eq('published', true)
    .order('sort_order')

  return data as FAQ[] || []
}
```

- [ ] **Step 3: 创建 FAQ API route**

```typescript
// src/app/api/faqs/route.ts
import { NextResponse } from 'next/server'
import { getFAQs } from '@/lib/faqs/api'

export async function GET() {
  const faqs = await getFAQs()
  return NextResponse.json(faqs)
}
```

- [ ] **Step 4: 提交**

```bash
git add src/lib/faqs/ src/app/api/faqs/
git commit -m "feat: add faqs data layer and API"
```

### Task 4: 创建 site_content API

**Files:**
- Create: `src/lib/site-content/types.ts`
- Create: `src/lib/site-content/api.ts`

- [ ] **Step 1: 创建 site_content 类型和 API**

```typescript
// src/lib/site-content/types.ts
export interface SiteContent {
  id: string
  section: string
  key: string
  translations: Record<string, any>
  image_url?: string
  sort_order: number
  published: boolean
}

// src/lib/site-content/api.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SiteContent } from './types'

export async function getSiteContent(section: string): Promise<SiteContent[]> {
  const { data } = await supabaseAdmin
    .from('site_content')
    .select('*')
    .eq('section', section)
    .eq('published', true)
    .order('sort_order')

  return data as SiteContent[] || []
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/site-content/
git commit -m "feat: add site_content data layer"
```

---

## Phase 3: 首页组件重构

### Task 5: 重构 Hero 组件（服务端数据驱动）

**Files:**
- Modify: `src/components/public/hero.tsx`

- [ ] **Step 1: 将 Hero 改为纯展示组件，接收 props**

```typescript
// src/components/public/hero.tsx
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getTranslation } from '@/lib/utils'
import type { HeroConfig } from '@/lib/site-settings/types'

interface HeroProps {
  heroConfig?: HeroConfig | null
}

export function Hero({ heroConfig }: HeroProps) {
  const t = useTranslations('home')
  const tc = useTranslations('common')
  const locale = useLocale()

  const title = heroConfig?.title
    ? getTranslation(heroConfig.title, locale, 'title')
    : t('hero.title')
  const subtitle = heroConfig?.subtitle
    ? getTranslation(heroConfig.subtitle, locale, 'subtitle')
    : t('hero.subtitle')
  const category = heroConfig?.category || 'Industrial UAV'
  const imageUrl = heroConfig?.image_url || null
  const indicators = heroConfig?.indicators || [
    { label: 'Flight Range', value: 85 },
    { label: 'Payload Capacity', value: 70 },
    { label: 'Wind Resistance', value: 90 },
  ]

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-muted overflow-hidden relative">
              {imageUrl ? (
                <Image src={imageUrl} alt={title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <svg className="w-24 h-24 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <Badge>{category}</Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-background/90 shadow-lg flex items-center justify-center cursor-pointer hover:bg-background transition-colors">
                  <Play className="w-6 h-6 text-primary ml-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider">
              {category}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{subtitle}</p>

            <div className="space-y-4">
              {indicators.map((indicator) => (
                <div key={indicator.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{indicator.label}</span>
                    <span className="font-mono text-primary">{indicator.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${indicator.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button render={<Link href="#demo-form" />} nativeButton={false} size="lg">
                {tc('cta.requestDemo')}
              </Button>
              <Button variant="outline" size="lg">
                {tc('cta.downloadSpec')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/hero.tsx
git commit -m "refactor: Hero component accepts dynamic config from DB"
```

### Task 6: 重构 TrustBar 组件（服务端数据驱动）

**Files:**
- Modify: `src/components/public/trust-bar.tsx`

- [ ] **Step 1: 将 TrustBar 改为数据驱动**

```typescript
// src/components/public/trust-bar.tsx
import { useTranslations, useLocale } from 'next-intl'
import { getTranslation } from '@/lib/utils'
import type { TrustBarConfig } from '@/lib/site-settings/types'

interface TrustBarProps {
  config?: TrustBarConfig | null
}

export function TrustBar({ config }: TrustBarProps) {
  const t = useTranslations('home')
  const locale = useLocale()

  const stats = config?.stats?.map(s => ({
    value: s.value,
    label: getTranslation(s.label, locale, 'label') || s.label
  })) || [
    { value: '50,000+', label: t('trustBar.flightHours') },
    { value: '120', label: t('trustBar.countries') },
    { value: '500+', label: t('trustBar.enterpriseClients') },
    { value: '24/7', label: t('trustBar.support') },
  ]

  return (
    <section className="bg-foreground py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono text-3xl lg:text-4xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/trust-bar.tsx
git commit -m "refactor: TrustBar accepts dynamic config from DB"
```

### Task 7: 创建 SolutionsGrid 组件（替换硬编码）

**Files:**
- Create: `src/components/public/solutions-grid.tsx`

- [ ] **Step 1: 创建动态解决方案网格组件**

```typescript
// src/components/public/solutions-grid.tsx
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Shield, Zap, Map, Leaf, Radar, Cog } from 'lucide-react'
import { getTranslation } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield, zap: Zap, map: Map, leaf: Leaf,
  radar: Radar, cog: Cog, drone: Shield, default: Shield,
}

interface Solution {
  id: string
  slug: string
  icon?: string
  translations: Record<string, Record<string, string>>
}

interface SolutionsGridProps {
  solutions: Solution[]
  locale: string
}

export function SolutionsGrid({ solutions, locale }: SolutionsGridProps) {
  const t = useTranslations('home')

  if (solutions.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-12">{t('solutions.title')}</h2>
          <p className="text-muted-foreground">Solutions coming soon.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">{t('solutions.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {solutions.map((solution) => {
            const Icon = iconMap[solution.icon || ''] || iconMap.default
            const label = getTranslation(solution.translations, locale, 'title')

            return (
              <Link
                key={solution.id}
                href={`/${locale}/solutions/${solution.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/solutions-grid.tsx
git commit -m "feat: add dynamic SolutionsGrid component"
```

### Task 8: 创建 FAQ 组件

**Files:**
- Create: `src/components/public/faq-section.tsx`

- [ ] **Step 1: 创建 FAQ 手风琴组件**

```typescript
// src/components/public/faq-section.tsx
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { getTranslation } from '@/lib/utils'
import type { FAQ } from '@/lib/faqs/types'

interface FAQSectionProps {
  faqs: FAQ[]
  locale: string
}

export function FAQSection({ faqs, locale }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (faqs.length === 0) return null

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
          {locale === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => {
            const t = faq.translations[locale] || faq.translations['en']
            if (!t) return null
            const isOpen = openId === faq.id

            return (
              <div key={faq.id} className="rounded-lg border border-border bg-background overflow-hidden">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-foreground pr-4">{t.question}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">
                    {t.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/faq-section.tsx
git commit -m "feat: add FAQ accordion component"
```

### Task 9: 创建 CTA Section 组件

**Files:**
- Create: `src/components/public/cta-section.tsx`

- [ ] **Step 1: 创建动态 CTA 组件**

```typescript
// src/components/public/cta-section.tsx
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { getTranslation } from '@/lib/utils'
import type { CtaConfig } from '@/lib/site-settings/types'

interface CTASectionProps {
  config?: CtaConfig | null
}

export function CTASection({ config }: CTASectionProps) {
  const locale = useLocale()

  const title = config?.title
    ? getTranslation(config.title, locale, 'title')
    : (locale === 'zh' ? '准备好见证我们的解决方案了吗？' : 'Ready to see our solutions in action?')

  const subtitle = config?.subtitle
    ? getTranslation(config.subtitle, locale, 'subtitle')
    : (locale === 'zh' ? '与我们的团队预约现场演示。' : 'Schedule a live demo with our team.')

  const buttonText = config?.button_text
    ? getTranslation(config.button_text, locale, 'text')
    : (locale === 'zh' ? '申请演示' : 'Request a Demo')

  return (
    <section className="py-16 lg:py-24 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">{title}</h2>
        <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">{subtitle}</p>
        <Button
          render={<Link href="#demo-form" />}
          nativeButton={false}
          size="lg"
          variant="secondary"
        >
          {buttonText}
        </Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/public/cta-section.tsx
git commit -m "feat: add dynamic CTA section component"
```

### Task 10: 重构首页 page.tsx（聚合所有模块）

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: 重写首页，聚合所有动态模块**

```typescript
// src/app/[locale]/page.tsx
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSiteSettings } from '@/lib/site-settings/api'
import { getFAQs } from '@/lib/faqs/api'
import { Hero } from '@/components/public/hero'
import { TrustBar } from '@/components/public/trust-bar'
import { ProductCard } from '@/components/public/product-card'
import { CaseCard } from '@/components/public/case-card'
import { SolutionsGrid } from '@/components/public/solutions-grid'
import { CTASection } from '@/components/public/cta-section'
import { FAQSection } from '@/components/public/faq-section'
import { DemoForm } from '@/components/public/demo-form'

interface Product {
  id: string
  slug: string
  category_id: string | null
  category?: any
  images?: string[]
  translations?: Record<string, Record<string, string>>
  specs?: { label: string; value: string }[]
  featured?: boolean
  spec_groups?: any[]
  tag_objects?: any[]
}

interface CaseStudy {
  id: string
  slug: string
  industry: string
  country: string
  image_url?: string
  video_url?: string
  translations?: Record<string, Record<string, string>>
  metrics?: { label: string; value: string }[]
  featured?: boolean
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')

  // 并行获取所有数据
  const [settings, faqs, productsRes, casesRes, solutionsRes] = await Promise.allSettled([
    getSiteSettings(),
    getFAQs(),
    supabaseAdmin.from('products').select('id, slug, category_id, category:product_categories(id, slug, translations), images, translations, spec_groups, featured, tag_objects:product_tags!product_tag_relations(*)').eq('featured', true).eq('published', true).limit(6),
    supabaseAdmin.from('case_studies').select('id, slug, industry, country, image_url, video_url, translations, metrics, featured').eq('featured', true).limit(3),
    supabaseAdmin.from('solutions').select('id, slug, icon, translations').eq('published', true).order('sort_order'),
  ])

  const siteSettings = settings.status === 'fulfilled' ? settings.value : null
  const faqList = faqs.status === 'fulfilled' ? faqs.value : []
  const products: Product[] = productsRes.status === 'fulfilled' && productsRes.value.data
    ? productsRes.value.data.map((p: any) => ({
        ...p,
        category: Array.isArray(p.category) ? p.category[0] : p.category
      }))
    : []
  const cases: CaseStudy[] = casesRes.status === 'fulfilled' && casesRes.value.data
    ? casesRes.value.data
    : []
  const solutions = solutionsRes.status === 'fulfilled' && solutionsRes.value.data
    ? solutionsRes.value.data
    : []

  // 按分类分组产品
  const productsByCategory = products.reduce<Record<string, Product[]>>((acc, product) => {
    const cat = (typeof product.category === 'object' && product.category?.slug) || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {})

  return (
    <>
      <Hero heroConfig={siteSettings?.hero_config} />
      <TrustBar config={siteSettings?.trust_bar_config} />

      {/* Products Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground">{t('products.title')}</h2>
            <Link href={`/${locale}/products`} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t('products.viewAll')} →
            </Link>
          </div>

          {Object.keys(productsByCategory).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-foreground/70 mb-6 capitalize">{category.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product as any} locale={locale} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm">Featured products coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Solutions Section */}
      <SolutionsGrid solutions={solutions} locale={locale} />

      {/* Case Studies Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-foreground">{t('cases.title')}</h2>
            <Link href={`/${locale}/case-studies`} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              {t('cases.viewAll')} →
            </Link>
          </div>

          {cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((caseStudy) => (
                <CaseCard key={caseStudy.id} caseStudy={caseStudy} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Featured case studies coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection config={siteSettings?.cta_config} />

      {/* Demo Form */}
      <DemoForm />

      {/* FAQ Section */}
      <FAQSection faqs={faqList} locale={locale} />
    </>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/[locale]/page.tsx
git commit -m "refactor: dynamic homepage with all 8 modules from DB"
```

---

## Phase 4: SEO/GEO

### Task 11: 添加全局 SEO Metadata

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: 在 layout 中添加 generateMetadata**

```typescript
// 在 src/app/[locale]/layout.tsx 顶部添加
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/site-settings/api'
import { routing } from '@/i18n/routing'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings()

  const defaultTitle = settings?.seo_metadata?.default_title?.[locale]
    || settings?.site_name?.[locale]
    || 'SeekDrone'
  const defaultDescription = settings?.seo_metadata?.default_description?.[locale]
    || settings?.seo_description?.[locale]
    || 'Industrial UAV solutions and counter-drone systems'

  const alternates: Record<string, string> = {}
  for (const lang of routing.locales) {
    alternates[lang] = `/${lang}`
  }

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${defaultTitle}`,
    },
    description: defaultDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrone.com'),
    alternates: {
      canonical: `/${locale}`,
      languages: alternates,
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      images: settings?.seo_metadata?.og_image ? [{ url: settings.seo_metadata.og_image }] : [],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat: add dynamic SEO metadata from site_settings"
```

### Task 12: 创建动态 Sitemap

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: 创建动态 sitemap 生成器**

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { routing } from '@/i18n/routing'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrone.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面
  const staticPages = [
    { path: '', priority: 1, changeFreq: 'daily' as const },
    { path: '/products', priority: 0.9, changeFreq: 'weekly' as const },
    { path: '/case-studies', priority: 0.8, changeFreq: 'weekly' as const },
    { path: '/compliance', priority: 0.7, changeFreq: 'monthly' as const },
  ]

  // 动态页面
  const { data: products } = await supabaseAdmin.from('products').select('slug, updated_at').eq('published', true)
  const { data: cases } = await supabaseAdmin.from('case_studies').select('slug, updated_at')
  const { data: solutions } = await supabaseAdmin.from('solutions').select('slug, updated_at').eq('published', true)

  const entries: MetadataRoute.Sitemap = []

  for (const page of staticPages) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFreq,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}${page.path}`])
          ),
        },
      })
    }
  }

  for (const product of products || []) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}/products/${product.slug}`])
          ),
        },
      })
    }
  }

  for (const c of cases || []) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/case-studies/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}/case-studies/${c.slug}`])
          ),
        },
      })
    }
  }

  for (const solution of solutions || []) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${BASE_URL}/${locale}/solutions/${solution.slug}`,
        lastModified: solution.updated_at ? new Date(solution.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map(lang => [lang, `${BASE_URL}/${lang}/solutions/${solution.slug}`])
          ),
        },
      })
    }
  }

  return entries
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/sitemap.ts
git commit -m "feat: add dynamic sitemap with hreflang alternates"
```

### Task 13: 创建 robots.ts

**Files:**
- Create: `src/app/robots.ts`

- [ ] **Step 1: 创建 robots.ts**

```typescript
// src/app/robots.ts
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrone.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/robots.ts
git commit -m "feat: add robots.txt"
```

### Task 14: 产品详情页添加 JSON-LD 结构化数据

**Files:**
- Modify: `src/app/[locale]/products/[model]/page.tsx`

- [ ] **Step 1: 读取当前产品详情页**

```bash
# 先读取当前文件内容
```

- [ ] **Step 2: 在页面中添加 JSON-LD script**

在 `src/app/[locale]/products/[model]/page.tsx` 的返回 JSX 中添加：

```tsx
import { getTranslation } from '@/lib/utils'

// 在 return 语句中添加（在第一个子元素前）：
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: getTranslation(product.translations, locale, 'name'),
      description: getTranslation(product.translations, locale, 'description'),
      image: product.images?.[0] || undefined,
      category: product.category ? getTranslation(product.category.translations, locale, 'name') : undefined,
      manufacturer: {
        '@type': 'Organization',
        name: 'SeekDrone',
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
      },
    }),
  }}
/>
```

- [ ] **Step 3: 提交**

```bash
git add src/app/[locale]/products/[model]/page.tsx
git commit -m "feat: add JSON-LD structured data for product pages"
```

---

## Phase 5: GTM 集成

### Task 15: 在 layout 中注入 GTM

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: 在 layout 中添加 GTM script 注入**

```typescript
// 在 LocaleLayout 函数中添加 GTM 逻辑
// 在 <NextIntlClientProvider> 之前添加：

const settings = await getSiteSettings()
const gtmId = settings?.gtm_id
```

然后在 JSX 中 head 部分添加：

```tsx
{gtmId && (
  <>
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
      }}
    />
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  </>
)}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat: integrate GTM from site_settings"
```

---

## Phase 6: 翻译完善

### Task 16: 补充翻译键

**Files:**
- Modify: `messages/zh/home.json`
- Modify: `messages/en/home.json`
- Modify: (其他 9 种语言)

- [ ] **Step 1: 更新中文翻译**

```json
// messages/zh/home.json
{
  "hero": {
    "title": "工业级无人机，在最关键的环境中经过实战验证",
    "subtitle": "经实战验证的无人机平台和反无人机解决方案，服务于国防、安全和关键基础设施领域。",
    "cta": "申请演示"
  },
  "trustBar": {
    "flightHours": "飞行小时",
    "countries": "国家",
    "enterpriseClients": "企业客户",
    "support": "支持"
  },
  "products": {
    "title": "我们的产品",
    "viewAll": "查看所有产品"
  },
  "solutions": {
    "title": "行业解决方案"
  },
  "cases": {
    "title": "案例研究",
    "viewAll": "查看所有案例"
  },
  "ctaSection": {
    "title": "准备好见证我们的解决方案了吗？",
    "subtitle": "与我们的团队预约现场演示。",
    "button": "申请演示"
  },
  "faq": {
    "title": "常见问题"
  }
}
```

- [ ] **Step 2: 更新英文翻译**

```json
// messages/en/home.json
{
  "hero": {
    "title": "Battle-Proven Industrial UAVs for Critical Environments",
    "subtitle": "Combat-tested drone platforms and counter-UAS solutions for defense, security, and critical infrastructure.",
    "cta": "Request Demo"
  },
  "trustBar": {
    "flightHours": "Flight Hours",
    "countries": "Countries",
    "enterpriseClients": "Enterprise Clients",
    "support": "Support"
  },
  "products": {
    "title": "Our Products",
    "viewAll": "View All Products"
  },
  "solutions": {
    "title": "Industry Solutions"
  },
  "cases": {
    "title": "Case Studies",
    "viewAll": "View All Cases"
  },
  "ctaSection": {
    "title": "Ready to See Our Solutions in Action?",
    "subtitle": "Schedule a live demo with our team.",
    "button": "Request Demo"
  },
  "faq": {
    "title": "Frequently Asked Questions"
  }
}
```

- [ ] **Step 3: 同步其他 9 种语言翻译文件**

为 `ar`, `es`, `fr`, `pt`, `id`, `th`, `vi`, `fa`, `ru` 创建对应的 `home.json`，至少包含英文 fallback。

- [ ] **Step 4: 提交**

```bash
git add messages/
git commit -m "feat: update translations for all 11 languages"
```

---

## Phase 7: 管理后台完善

### Task 17: 更新 settings 管理页面支持新字段

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

- [ ] **Step 1: 扩展 settings 页面**

在现有 settings 页面中添加：
- Trust Bar 配置（统计数字编辑）
- CTA 配置（标题/副标题/按钮文案）
- SEO Metadata 配置（默认标题/描述/OG图片）
- GTM ID 输入框
- Hero 配置（已有 hero_config 但需完善编辑 UI）

由于这是较大的 UI 任务，使用 `Task` 工具分派给子 agent 执行。

- [ ] **Step 2: 提交**

```bash
git add src/app/admin/settings/page.tsx
git commit -m "feat: expand admin settings with trust_bar, cta, seo, gtm fields"
```

---

## Phase 8: 验证

### Task 18: 类型检查和 Lint

**Files:** (无新增)

- [ ] **Step 1: 运行类型检查**

```bash
npm run typecheck
```

Expected: 无错误

- [ ] **Step 2: 运行 Lint**

```bash
npm run lint
```

Expected: 无错误

- [ ] **Step 3: 运行架构检查**

```bash
npm run check:arch
```

Expected: 无违规

- [ ] **Step 4: 构建验证**

```bash
npm run build
```

Expected: 构建成功

### Task 19: 多语言页面测试

- [ ] **Step 1: 启动 dev server**

```bash
npm run dev
```

- [ ] **Step 2: 验证各语言首页**
  - `/en` — 英文首页
  - `/zh` — 中文首页
  - `/ar` — 阿拉伯语首页
  - `/es` — 西班牙语首页

- [ ] **Step 3: 验证 sitemap**

访问 `http://localhost:3000/sitemap.xml` 确认生成正确

- [ ] **Step 4: 验证 robots.txt**

访问 `http://localhost:3000/robots.txt` 确认生成正确

---

## 总结

| Phase | Tasks | 描述 |
|-------|-------|------|
| 0 | 0a-0c | 数据库迁移 |
| 1 | 1 | 品牌设计系统 |
| 2 | 2-4 | 数据层 API |
| 3 | 5-10 | 首页组件重构 |
| 4 | 11-14 | SEO/GEO |
| 5 | 15 | GTM 集成 |
| 6 | 16 | 翻译完善 |
| 7 | 17 | 管理后台 |
| 8 | 18-19 | 验证 |