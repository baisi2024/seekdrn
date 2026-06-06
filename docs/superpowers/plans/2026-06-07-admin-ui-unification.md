# 后台管理UI统一化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建统一的UI组件库并重构所有后台管理页面，实现UI样式统一、国际化完整、交互体验一致。

**Architecture:** 创建核心组件库（AdminPage、AdminCard、TranslatedText等），建立样式工具系统（颜色映射、效果系统），按优先级分四批重构17个管理页面。

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, next-intl

---

## 文件结构

### 新建文件
- `src/components/admin/core/admin-page.tsx` - 页面容器组件
- `src/components/admin/core/admin-card.tsx` - 卡片组件
- `src/components/admin/core/admin-button.tsx` - 按钮组件
- `src/components/admin/core/admin-badge.tsx` - 徽章组件
- `src/components/admin/core/translated-text.tsx` - 翻译文本组件
- `src/components/admin/core/index.ts` - 核心组件导出
- `src/components/admin/styles/colors.ts` - 颜色映射工具
- `src/components/admin/styles/effects.ts` - 效果系统
- `src/components/admin/styles/index.ts` - 样式工具导出

### 修改文件（按优先级）
**第一批（核心页面）**:
- `src/app/admin/products/products-client.tsx`
- `src/app/admin/case-studies/case-studies-client.tsx`
- `src/app/admin/solutions/solutions-client.tsx`
- `src/app/admin/inquiries/inquiries-client.tsx`

**第二批（配置页面）**:
- `src/app/admin/categories/page.tsx`
- `src/app/admin/tags/page.tsx`
- `src/components/admin/nav-tree.tsx`
- `src/components/admin/nav-drag-overlay.tsx`

**第三批（系统页面）**:
- `src/app/admin/email-templates/[key]/page.tsx`
- `src/app/admin/email-logs/[id]/page.tsx`
- `src/components/admin/language-switcher.tsx`
- `src/app/admin/login/page.tsx`

**第四批（编辑器组件）**:
- `src/components/admin/rich-editor.tsx`
- `src/features/products/components/admin/rich-editor/toolbar.tsx`
- `src/components/admin/image-upload.tsx`
- `src/components/admin/downloads-manager.tsx`
- `src/features/products/components/admin/media-library/media-grid.tsx`
- `src/features/products/components/admin/media-library/media-uploader.tsx`
- `src/features/products/components/admin/media-library/index.tsx`
- `src/app/admin/products/[id]/cases/page.tsx`
- `src/components/admin/case-relations-manager.tsx`
- `src/app/admin/products/[id]/downloads/page.tsx`
- `src/app/admin/products/[id]/specs/page.tsx`

### 翻译文件
- `messages/en/admin.json` - 添加缺失的翻译键
- `messages/zh/admin.json` - 添加缺失的翻译键

---

## Task 1: 创建样式工具系统

**Files:**
- Create: `src/components/admin/styles/colors.ts`
- Create: `src/components/admin/styles/effects.ts`
- Create: `src/components/admin/styles/index.ts`

- [ ] **Step 1: 创建颜色映射工具**

创建文件 `src/components/admin/styles/colors.ts`:

```typescript
/**
 * 颜色映射工具
 * 将硬编码的 gray 颜色映射到设计系统变量
 */

export const colorMap: Record<string, string> = {
  // 背景色映射
  'bg-gray-50': 'bg-muted/50',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted/80',
  'bg-gray-300': 'bg-muted/60',

  // 文本色映射
  'text-gray-400': 'text-muted-foreground/80',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-foreground/80',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',

  // 边框色映射
  'border-gray-100': 'border-border/50',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border/80',
}

/**
 * 替换单个颜色类名
 */
export function normalizeColor(className: string): string {
  return colorMap[className] || className
}

/**
 * 替换类名字符串中的所有硬编码颜色
 */
export function normalizeColors(classNames: string): string {
  return classNames
    .split(' ')
    .map(normalizeColor)
    .join(' ')
}

/**
 * 检查是否包含硬编码颜色
 */
export function hasHardcodedColors(classNames: string): boolean {
  return Object.keys(colorMap).some(color => classNames.includes(color))
}
```

- [ ] **Step 2: 创建效果系统**

创建文件 `src/components/admin/styles/effects.ts`:

```typescript
/**
 * 统一的视觉效果系统
 */

export const effects = {
  // 卡片效果
  card: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
  cardElevated: 'shadow-xl hover:shadow-2xl transition-shadow duration-300',
  cardBordered: 'border border-border hover:border-primary/50 transition-colors duration-200',

  // 按钮效果
  button: 'transition-all duration-200 hover:scale-105',
  buttonGentle: 'transition-all duration-200',

  // 渐变背景
  gradientPage: 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
  gradientCard: 'bg-gradient-to-br from-background to-muted/50',
  gradientSidebar: 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800',

  // 边框效果
  border: 'border border-border hover:border-primary/50 transition-colors duration-200',
  borderSubtle: 'border border-border/50 hover:border-border transition-colors duration-200',

  // 悬停效果
  hover: 'hover:bg-muted/50 transition-colors duration-200',
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverLift: 'hover:-translate-y-1 transition-transform duration-200',

  // 焦点效果
  focus: 'focus:ring-2 focus:ring-primary/50 focus:outline-none',
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',

  // 动画效果
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
} as const

/**
 * 组合多个效果
 */
export function combineEffects(...effectNames: (keyof typeof effects)[]): string {
  return effectNames.map(name => effects[name]).join(' ')
}
```

- [ ] **Step 3: 创建样式工具导出**

创建文件 `src/components/admin/styles/index.ts`:

```typescript
export * from './colors'
export * from './effects'
```

- [ ] **Step 4: 提交样式工具**

```bash
git add src/components/admin/styles/
git commit -m "feat(admin): 添加样式工具系统 - 颜色映射和效果系统"
```

---

## Task 2: 创建核心组件 - TranslatedText

**Files:**
- Create: `src/components/admin/core/translated-text.tsx`

- [ ] **Step 1: 创建 TranslatedText 组件**

创建文件 `src/components/admin/core/translated-text.tsx`:

```typescript
'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'

export interface TranslatedTextProps {
  /**
   * 翻译键
   * @example 'products_page.title'
   */
  textKey: string

  /**
   * 备用文本（翻译键不存在时显示）
   */
  fallback?: string

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 插值变量
   * @example { count: 5, name: 'Product' }
   */
  variables?: Record<string, string | number>

  /**
   * HTML 标签
   * @default 'span'
   */
  as?: 'span' | 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * 统一的翻译文本组件
 * 自动处理翻译和插值
 */
export function TranslatedText({
  textKey,
  fallback,
  className,
  variables,
  as: Component = 'span',
}: TranslatedTextProps) {
  const t = useAdminTranslations()

  let text = t(textKey)

  // 如果翻译键不存在，使用 fallback
  if (text === textKey && fallback) {
    text = fallback
  }

  // 处理插值变量
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
    })
  }

  return <Component className={className}>{text}</Component>
}
```

- [ ] **Step 2: 提交 TranslatedText 组件**

```bash
git add src/components/admin/core/translated-text.tsx
git commit -m "feat(admin): 添加 TranslatedText 组件 - 统一翻译文本处理"
```

---

## Task 3: 创建核心组件 - AdminPage

**Files:**
- Create: `src/components/admin/core/admin-page.tsx`

- [ ] **Step 1: 创建 AdminPage 组件**

创建文件 `src/components/admin/core/admin-page.tsx`:

```typescript
'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { effects } from '../styles'
import { cn } from '@/lib/utils'

export interface AdminPageProps {
  /**
   * 页面标题翻译键
   * @example 'products_page.title'
   */
  title: string

  /**
   * 页面操作按钮（如添加按钮）
   */
  actions?: React.ReactNode

  /**
   * 页面内容
   */
  children: React.ReactNode

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 是否显示渐变背景
   * @default true
   */
  gradient?: boolean

  /**
   * 页面描述翻译键
   */
  description?: string
}

/**
 * 统一的管理页面容器组件
 * 提供一致的页面布局、标题翻译和视觉效果
 */
export function AdminPage({
  title,
  actions,
  children,
  className,
  gradient = true,
  description,
}: AdminPageProps) {
  const t = useAdminTranslations()

  return (
    <div
      className={cn(
        'min-h-screen',
        gradient && effects.gradientPage,
        className
      )}
    >
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t(title)}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {t(description)}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* 页面内容 */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交 AdminPage 组件**

```bash
git add src/components/admin/core/admin-page.tsx
git commit -m "feat(admin): 添加 AdminPage 组件 - 统一页面容器"
```

---

## Task 4: 创建核心组件 - AdminCard

**Files:**
- Create: `src/components/admin/core/admin-card.tsx`

- [ ] **Step 1: 创建 AdminCard 组件**

创建文件 `src/components/admin/core/admin-card.tsx`:

```typescript
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { effects, combineEffects } from '../styles'
import { cn } from '@/lib/utils'

export interface AdminCardProps {
  /**
   * 卡片标题翻译键
   */
  title?: string

  /**
   * 卡片描述翻译键
   */
  description?: string

  /**
   * 卡片变体
   * - default: 标准卡片
   * - elevated: 提升阴影
   * - bordered: 边框强调
   */
  variant?: 'default' | 'elevated' | 'bordered'

  /**
   * 是否启用悬停效果
   * @default true
   */
  hover?: boolean

  /**
   * 卡片内容
   */
  children: React.ReactNode

  /**
   * 自定义类名
   */
  className?: string

  /**
   * 卡片头部自定义内容
   */
  headerContent?: React.ReactNode

  /**
   * 是否显示渐变背景
   */
  gradient?: boolean
}

/**
 * 统一的管理卡片组件
 * 提供一致的卡片样式、翻译和交互效果
 */
export function AdminCard({
  title,
  description,
  variant = 'default',
  hover = true,
  children,
  className,
  headerContent,
  gradient = false,
}: AdminCardProps) {
  const t = useAdminTranslations()

  const variantEffects = {
    default: effects.card,
    elevated: effects.cardElevated,
    bordered: effects.cardBordered,
  }

  return (
    <Card
      className={cn(
        'bg-background text-foreground',
        hover && variantEffects[variant],
        gradient && effects.gradientCard,
        className
      )}
    >
      {(title || description || headerContent) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-foreground">
              {t(title)}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-muted-foreground">
              {t(description)}
            </CardDescription>
          )}
          {headerContent}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: 提交 AdminCard 组件**

```bash
git add src/components/admin/core/admin-card.tsx
git commit -m "feat(admin): 添加 AdminCard 组件 - 统一卡片样式"
```

---

## Task 5: 创建核心组件 - AdminButton 和 AdminBadge

**Files:**
- Create: `src/components/admin/core/admin-button.tsx`
- Create: `src/components/admin/core/admin-badge.tsx`

- [ ] **Step 1: 创建 AdminButton 组件**

创建文件 `src/components/admin/core/admin-button.tsx`:

```typescript
'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import { effects } from '../styles'
import { cn } from '@/lib/utils'

export interface AdminButtonProps extends ButtonProps {
  /**
   * 是否启用缩放效果
   * @default false
   */
  scaleOnHover?: boolean

  /**
   * 是否启用提升效果
   * @default false
   */
  liftOnHover?: boolean
}

/**
 * 统一的管理按钮组件
 * 提供一致的交互效果
 */
export function AdminButton({
  scaleOnHover = false,
  liftOnHover = false,
  className,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <Button
      className={cn(
        effects.buttonGentle,
        scaleOnHover && effects.hoverScale,
        liftOnHover && effects.hoverLift,
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
```

- [ ] **Step 2: 创建 AdminBadge 组件**

创建文件 `src/components/admin/core/admin-badge.tsx`:

```typescript
'use client'

import { Badge, BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface AdminBadgeProps extends BadgeProps {
  /**
   * 是否启用脉冲动画
   */
  pulse?: boolean
}

/**
 * 统一的管理徽章组件
 */
export function AdminBadge({
  pulse = false,
  className,
  children,
  ...props
}: AdminBadgeProps) {
  return (
    <Badge
      className={cn(
        'transition-all duration-200',
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </Badge>
  )
}
```

- [ ] **Step 3: 提交按钮和徽章组件**

```bash
git add src/components/admin/core/admin-button.tsx src/components/admin/core/admin-badge.tsx
git commit -m "feat(admin): 添加 AdminButton 和 AdminBadge 组件"
```

---

## Task 6: 创建核心组件导出

**Files:**
- Create: `src/components/admin/core/index.ts`

- [ ] **Step 1: 创建核心组件导出文件**

创建文件 `src/components/admin/core/index.ts`:

```typescript
export { AdminPage } from './admin-page'
export type { AdminPageProps } from './admin-page'

export { AdminCard } from './admin-card'
export type { AdminCardProps } from './admin-card'

export { AdminButton } from './admin-button'
export type { AdminButtonProps } from './admin-button'

export { AdminBadge } from './admin-badge'
export type { AdminBadgeProps } from './admin-badge'

export { TranslatedText } from './translated-text'
export type { TranslatedTextProps } from './translated-text'
```

- [ ] **Step 2: 提交导出文件**

```bash
git add src/components/admin/core/index.ts
git commit -m "feat(admin): 添加核心组件导出"
```

---

## Task 7: 更新翻译文件

**Files:**
- Modify: `messages/en/admin.json`
- Modify: `messages/zh/admin.json`

- [ ] **Step 1: 检查并添加缺失的翻译键**

读取现有翻译文件，识别硬编码文本，添加缺失的翻译键。

需要添加的翻译键（基于代码审查）:

```json
// messages/en/admin.json 添加
{
  "media_page": {
    "title": "Media Library",
    "upload": "Upload",
    "searchPlaceholder": "Search media..."
  },
  "compliance_page": {
    "title": "Compliance Management",
    "add": "Add Section",
    "searchPlaceholder": "Search compliance..."
  },
  "footer_page": {
    "title": "Footer Management",
    "add": "Add Footer Item"
  },
  "login_page": {
    "title": "Admin Login",
    "email": "Email",
    "password": "Password",
    "submit": "Sign In",
    "error": "Invalid credentials"
  },
  "rich_editor": {
    "bold": "Bold",
    "italic": "Italic",
    "underline": "Underline",
    "link": "Link",
    "heading": "Heading",
    "list": "List",
    "quote": "Quote",
    "code": "Code"
  },
  "image_upload": {
    "upload": "Upload Image",
    "dragDrop": "Drag and drop or click to upload",
    "remove": "Remove",
    "error": "Upload failed"
  },
  "downloads": {
    "title": "Downloads",
    "add": "Add Download",
    "fileName": "File Name",
    "fileSize": "File Size",
    "uploadedAt": "Uploaded At"
  },
  "specs": {
    "title": "Specifications",
    "addGroup": "Add Group",
    "addItem": "Add Item"
  },
  "cases": {
    "title": "Related Cases",
    "add": "Add Case",
    "remove": "Remove"
  }
}
```

```json
// messages/zh/admin.json 添加
{
  "media_page": {
    "title": "媒体库",
    "upload": "上传",
    "searchPlaceholder": "搜索媒体..."
  },
  "compliance_page": {
    "title": "合规管理",
    "add": "添加章节",
    "searchPlaceholder": "搜索合规..."
  },
  "footer_page": {
    "title": "页脚管理",
    "add": "添加页脚项"
  },
  "login_page": {
    "title": "管理后台登录",
    "email": "邮箱",
    "password": "密码",
    "submit": "登录",
    "error": "凭证无效"
  },
  "rich_editor": {
    "bold": "粗体",
    "italic": "斜体",
    "underline": "下划线",
    "link": "链接",
    "heading": "标题",
    "list": "列表",
    "quote": "引用",
    "code": "代码"
  },
  "image_upload": {
    "upload": "上传图片",
    "dragDrop": "拖放或点击上传",
    "remove": "删除",
    "error": "上传失败"
  },
  "downloads": {
    "title": "下载",
    "add": "添加下载",
    "fileName": "文件名",
    "fileSize": "文件大小",
    "uploadedAt": "上传时间"
  },
  "specs": {
    "title": "规格",
    "addGroup": "添加组",
    "addItem": "添加项"
  },
  "cases": {
    "title": "相关案例",
    "add": "添加案例",
    "remove": "移除"
  }
}
```

- [ ] **Step 2: 提交翻译文件更新**

```bash
git add messages/en/admin.json messages/zh/admin.json
git commit -m "feat(i18n): 添加管理页面缺失的翻译键"
```

---

## Task 8: 重构第一批页面 - Products

**Files:**
- Modify: `src/app/admin/products/products-client.tsx`

- [ ] **Step 1: 重构 products-client.tsx**

修改文件，应用新组件和颜色映射：

```typescript
'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/admin/data-table'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AdminPage } from '@/components/admin/core'
import { normalizeColors } from '@/components/admin/styles'

interface Product {
  id: string
  model: string
  category: string
  published: boolean
  compliance_flag: string
  featured: boolean
}

interface ProductsClientProps {
  products: Product[]
}

export function ProductsClient({ products }: ProductsClientProps) {
  const t = useAdminTranslations()

  const columns = [
    { key: 'model', label: t('model') },
    { key: 'category', label: t('category') },
    {
      key: 'published',
      label: t('status'),
      render: (item: Product) => (
        <Badge variant={item.published ? 'default' : 'secondary'}>
          {item.published ? t('published') : t('draft')}
        </Badge>
      )
    },
    {
      key: 'compliance_flag',
      label: t('compliance'),
      render: (item: Product) => item.compliance_flag ? <Badge variant="destructive">{t('complianceRequired')}</Badge> : 'No'
    },
    { key: 'featured', label: t('featured'), render: (item: Product) => item.featured ? '⭐' : '' },
  ]

  return (
    <AdminPage
      title="products_page.title"
      actions={
        <Link href="/admin/products/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('products_page.add')}
        </Link>
      }
    >
      <DataTable
        data={products}
        columns={columns}
        searchPlaceholder={t('products_page.searchPlaceholder')}
        onRowClick={(item) => window.location.href = `/admin/products/${item.id}`}
      />
    </AdminPage>
  )
}
```

- [ ] **Step 2: 提交 products 重构**

```bash
git add src/app/admin/products/products-client.tsx
git commit -m "refactor(admin): 重构产品管理页面 - 使用统一组件"
```

---

## Task 9: 重构第一批页面 - Case Studies

**Files:**
- Modify: `src/app/admin/case-studies/case-studies-client.tsx`

- [ ] **Step 1: 重构 case-studies-client.tsx**

应用 AdminPage 组件和颜色映射。

- [ ] **Step 2: 提交 case-studies 重构**

```bash
git add src/app/admin/case-studies/case-studies-client.tsx
git commit -m "refactor(admin): 重构案例研究页面 - 使用统一组件"
```

---

## Task 10: 重构第一批页面 - Solutions

**Files:**
- Modify: `src/app/admin/solutions/solutions-client.tsx`

- [ ] **Step 1: 重构 solutions-client.tsx**

应用 AdminPage 组件和颜色映射。

- [ ] **Step 2: 提交 solutions 重构**

```bash
git add src/app/admin/solutions/solutions-client.tsx
git commit -m "refactor(admin): 重构解决方案页面 - 使用统一组件"
```

---

## Task 11: 重构第一批页面 - Inquiries

**Files:**
- Modify: `src/app/admin/inquiries/inquiries-client.tsx`

- [ ] **Step 1: 重构 inquiries-client.tsx**

应用 AdminPage 组件和颜色映射。

- [ ] **Step 2: 提交 inquiries 重构**

```bash
git add src/app/admin/inquiries/inquiries-client.tsx
git commit -m "refactor(admin): 重构咨询管理页面 - 使用统一组件"
```

---

## Task 12: 验证第一批重构

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
npm run typecheck
```

Expected: 无错误

- [ ] **Step 2: 运行 ESLint 检查**

```bash
npm run lint
```

Expected: 无错误

- [ ] **Step 3: 手动测试第一批页面**

启动开发服务器并测试：
- 产品管理页面
- 案例研究页面
- 解决方案页面
- 咨询管理页面

验证：
- 页面正常加载
- 中英文切换正常
- 样式一致
- 交互效果正常

---

## Task 13-20: 重构第二批页面（配置页面）

按照相同的模式重构：
- Task 13: categories/page.tsx
- Task 14: tags/page.tsx
- Task 15: nav-tree.tsx
- Task 16: nav-drag-overlay.tsx
- Task 17-20: 验证第二批重构

---

## Task 21-28: 重构第三批页面（系统页面）

按照相同的模式重构：
- Task 21: email-templates/[key]/page.tsx
- Task 22: email-logs/[id]/page.tsx
- Task 23: language-switcher.tsx
- Task 24: login/page.tsx
- Task 25-28: 验证第三批重构

---

## Task 29-40: 重构第四批页面（编辑器组件）

按照相同的模式重构：
- Task 29: rich-editor.tsx
- Task 30: rich-editor/toolbar.tsx
- Task 31: image-upload.tsx
- Task 32: downloads-manager.tsx
- Task 33: media-library/media-grid.tsx
- Task 34: media-library/media-uploader.tsx
- Task 35: media-library/index.tsx
- Task 36: products/[id]/cases/page.tsx
- Task 37: case-relations-manager.tsx
- Task 38: products/[id]/downloads/page.tsx
- Task 39: products/[id]/specs/page.tsx
- Task 40: 验证第四批重构

---

## Task 41: 最终验证和质量检查

- [ ] **Step 1: 运行所有自动化测试**

```bash
npm run typecheck
npm run lint
```

Expected: 全部通过

- [ ] **Step 2: 检查硬编码颜色是否已全部替换**

使用 grep 搜索是否还有硬编码颜色：

```bash
grep -r "bg-gray-\|text-gray-\|border-gray-" src/components/admin/ src/app/admin/ src/features/products/components/admin/
```

Expected: 无结果（所有硬编码颜色已替换）

- [ ] **Step 3: 检查国际化是否完整**

检查所有管理页面是否使用 useAdminTranslations hook。

- [ ] **Step 4: 手动测试所有页面**

测试所有17个重构的页面：
- 页面正常加载
- 中英文切换正常
- 样式一致
- 交互效果正常
- 响应式布局正常

---

## Task 42: 更新开发规范文档

**Files:**
- Modify: `.trae/rules/admin-development-guidelines.md`

- [ ] **Step 1: 添加新组件使用说明**

在开发规范中添加：

```markdown
### 6. 统一UI组件库

**强制要求**：
- 所有新页面必须使用 AdminPage 组件
- 所有卡片必须使用 AdminCard 组件
- 所有文本必须使用 TranslatedText 组件或 useAdminTranslations hook
- 禁止使用硬编码颜色（bg-gray-*, text-gray-*, border-gray-*）

**使用示例**：

```typescript
import { AdminPage, AdminCard } from '@/components/admin/core'

export function MyPage() {
  return (
    <AdminPage title="my_page.title" actions={<AddButton />}>
      <AdminCard title="my_card.title">
        {/* 内容 */}
      </AdminCard>
    </AdminPage>
  )
}
```

**颜色替换**：
使用 `normalizeColors()` 函数替换硬编码颜色：

```typescript
import { normalizeColors } from '@/components/admin/styles'

// 替换前
className="bg-gray-100 text-gray-500"

// 替换后
className={normalizeColors('bg-gray-100 text-gray-500')}
// 结果: "bg-muted text-muted-foreground"
```
```

- [ ] **Step 2: 提交文档更新**

```bash
git add .trae/rules/admin-development-guidelines.md
git commit -m "docs: 更新开发规范 - 添加统一UI组件库使用说明"
```

---

## Task 43: 创建最终提交和总结

- [ ] **Step 1: 创建最终提交**

```bash
git add .
git commit -m "feat(admin): 完成后台管理UI统一化重构

- 创建统一UI组件库（AdminPage, AdminCard, TranslatedText等）
- 建立样式工具系统（颜色映射、效果系统）
- 重构所有17个管理页面
- 完善国际化翻译文件
- 更新开发规范文档

✅ 所有页面使用设计系统变量
✅ 所有文本使用翻译函数
✅ 统一的交互效果
✅ 通过 typecheck 和 lint 检查
✅ 中英文切换功能正常"
```

- [ ] **Step 2: 推送到远程仓库**

```bash
git push origin master
```

---

## 验收标准

- [x] 组件库开发完成
- [ ] 第一批页面重构完成并验证通过
- [ ] 第二批页面重构完成并验证通过
- [ ] 第三批页面重构完成并验证通过
- [ ] 第四批页面重构完成并验证通过
- [ ] 所有自动化测试通过
- [ ] 无硬编码颜色
- [ ] 国际化完整
- [ ] 文档更新完成

---

## 风险和缓解

**风险1: 组件API不兼容**
- 缓解: 保持与现有组件相同的API，渐进式迁移

**风险2: 样式冲突**
- 缓解: 使用CSS模块作用域，测试所有页面

**风险3: 翻译键缺失**
- 缓解: 提前添加所有翻译键，测试中英文切换

**风险4: 功能破坏**
- 缓解: 每批重构后立即验证，保持回退能力

---

## 时间估算

- Task 1-6: 组件库开发 (2-3小时)
- Task 7: 翻译文件更新 (30分钟)
- Task 8-12: 第一批重构 (1小时)
- Task 13-20: 第二批重构 (1小时)
- Task 21-28: 第三批重构 (1小时)
- Task 29-40: 第四批重构 (1.5小时)
- Task 41-43: 验证和文档 (1小时)

**总计**: 约8-9小时
