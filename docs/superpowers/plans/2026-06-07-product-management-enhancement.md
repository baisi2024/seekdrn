# 产品管理功能完善实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善产品管理功能，包括后台列表筛选/批量操作、产品编辑向导、富文本编辑器HTML模式、前端产品列表和详情页转化设计。

**Architecture:** 后台使用分步向导创建产品 + Tab式编辑；富文本编辑器支持HTML源码模式；前端围绕转化设计，突出CTA和信任背书。

**Tech Stack:** Next.js 15, React 19, Supabase, Tiptap, Zustand, shadcn/ui

---

## 文件结构

### 新建文件
```
src/components/shared/rich-editor/
  index.tsx                 # 主组件（导出入口）
  editor.tsx                # 编辑器核心
  toolbar.tsx               # 工具栏
  html-mode.tsx             # HTML源码模式
  fullscreen-mode.tsx       # 全屏模式
  dialogs/
    link-dialog.tsx         # 链接弹窗
    image-dialog.tsx        # 图片弹窗
    video-dialog.tsx        # 视频弹窗
    media-dialog.tsx        # 媒体库弹窗
  types.ts                  # 类型定义

src/features/products/components/admin/
  product-wizard/
    index.tsx               # 新建产品向导
    step-basic.tsx          # 步骤1：基础信息
    step-content.tsx        # 步骤2：产品内容
    step-specs.tsx          # 步骤3：规格参数
    step-complete.tsx       # 步骤4：完成
  product-tabs/
    specs-tab.tsx           # 规格Tab（增强）
    relations-tab.tsx       # 关联Tab（增强）

src/components/admin/
  batch-operations.tsx      # 批量操作组件
  product-filters.tsx       # 产品筛选组件
```

### 修改文件
```
src/components/admin/rich-editor.tsx          # 替换为共享组件
src/app/admin/products/page.tsx               # 添加筛选数据获取
src/app/admin/products/products-client.tsx    # 添加筛选和批量操作
src/app/admin/products/[id]/page.tsx          # 重构为向导 + Tab
src/app/[locale]/products/page.tsx            # 更新筛选逻辑
src/app/[locale]/products/[model]/page.tsx    # 添加FAQ和转化设计
src/components/public/product-card.tsx        # 添加标签展示
src/components/public/product-filter.tsx      # 更新分类标签筛选
```

---

## Phase 1: 富文本编辑器重构

### Task 1.1: 创建富文本编辑器类型定义

**Files:**
- Create: `src/components/shared/rich-editor/types.ts`

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/components/shared/rich-editor/types.ts

export type ToolbarGroup = 
  | 'history'   // 撤销/重做
  | 'text'      // 文本格式
  | 'heading'   // 标题
  | 'list'      // 列表
  | 'align'     // 对齐
  | 'block'     // 块元素
  | 'insert'    // 插入
  | 'color'     // 颜色
  | 'tools'     // 工具

export interface ToolbarConfig {
  groups: ToolbarGroup[]
  exclude?: string[]
}

export interface RichEditorFeatures {
  htmlMode?: boolean       // 启用HTML源码模式（默认true）
  fullscreen?: boolean     // 启用全屏模式（默认true）
  mediaLibrary?: boolean   // 启用媒体库（默认true）
  wordCount?: boolean      // 显示字数统计（默认true）
}

export interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  maxLength?: number
  minHeight?: number
  features?: RichEditorFeatures
  toolbar?: Partial<ToolbarConfig>
  mediaConfig?: {
    accept?: 'image' | 'video' | 'all'
    multiple?: boolean
  }
}

export interface MediaItem {
  id: string
  filename: string
  r2_key: string
  mime_type: string
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/shared/rich-editor/types.ts
git commit -m "feat(rich-editor): add type definitions"
```

---

### Task 1.2: 创建HTML源码模式组件

**Files:**
- Create: `src/components/shared/rich-editor/html-mode.tsx`

- [ ] **Step 1: 创建HTML源码模式组件**

```typescript
// src/components/shared/rich-editor/html-mode.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Code, Eye } from 'lucide-react'

interface HtmlModeProps {
  html: string
  onChange: (html: string) => void
  onSwitchToVisual: () => void
}

export function HtmlMode({ html, onChange, onSwitchToVisual }: HtmlModeProps) {
  const [code, setCode] = useState(html)

  useEffect(() => {
    setCode(html)
  }, [html])

  const handleChange = (value: string) => {
    setCode(value)
    onChange(value)
  }

  const formatHtml = () => {
    // 简单的HTML格式化
    try {
      const formatted = code
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/gm, '')
      setCode(formatted)
      onChange(formatted)
    } catch (e) {
      console.error('Format error:', e)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <span className="text-sm text-muted-foreground">HTML 源码</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={formatHtml}>
            格式化
          </Button>
          <Button variant="ghost" size="sm" onClick={onSwitchToVisual}>
            <Eye className="w-4 h-4 mr-1" />
            可视化
          </Button>
        </div>
      </div>
      <textarea
        value={code}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full min-h-[300px] p-4 font-mono text-sm bg-slate-950 text-slate-50 focus:outline-none resize-y"
        spellCheck={false}
      />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/shared/rich-editor/html-mode.tsx
git commit -m "feat(rich-editor): add HTML source mode component"
```

---

### Task 1.3: 创建工具栏组件

**Files:**
- Create: `src/components/shared/rich-editor/toolbar.tsx`

- [ ] **Step 1: 创建工具栏组件**

```typescript
// src/components/shared/rich-editor/toolbar.tsx

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
  Undo2, Redo2,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight,
  Palette, Highlighter, RemoveFormatting,
  Maximize2,
} from 'lucide-react'
import type { ToolbarConfig, ToolbarGroup } from './types'

interface ToolbarProps {
  editor: Editor
  config?: Partial<ToolbarConfig>
  onHtmlMode?: () => void
  onFullscreen?: () => void
  wordCount?: number
}

export function Toolbar({ editor, config, onHtmlMode, onFullscreen, wordCount }: ToolbarProps) {
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
      <div className="flex flex-wrap gap-1 p-2 border border-b-0 rounded-t-lg bg-muted/50">
        {groups.includes('history') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('text') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-muted' : ''}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-muted' : ''}>
              <Underline className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-muted' : ''}>
              <Strikethrough className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive('code') ? 'bg-muted' : ''}>
              <Code className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('heading') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}>
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}>
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}>
              <Heading3 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('list') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-muted' : ''}>
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleTaskList?.().run()} className={editor.isActive('taskList') ? 'bg-muted' : ''}>
              <CheckSquare className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('align') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
              <AlignRight className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('block') && (
          <>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-muted' : ''}>
              <Quote className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'bg-muted' : ''}>
              <Code className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
              <Table className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
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
            <div className="w-px h-6 bg-border mx-1" />
          </>
        )}

        {groups.includes('tools') && (
          <>
            {onHtmlMode && (
              <Button variant="ghost" size="sm" onClick={onHtmlMode}>
                <Code className="w-4 h-4" />
              </Button>
            )}
            {onFullscreen && (
              <Button variant="ghost" size="sm" onClick={onFullscreen}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </>
        )}

        {wordCount !== undefined && (
          <div className="ml-auto text-xs text-muted-foreground flex items-center">
            字数: {wordCount}
          </div>
        )}
      </div>

      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>插入链接</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="输入URL..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>取消</Button>
              <Button onClick={setLink}>插入</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>插入图片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Input placeholder="输入图片URL..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>取消</Button>
              <Button onClick={setImage}>插入</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/shared/rich-editor/toolbar.tsx
git commit -m "feat(rich-editor): add enhanced toolbar component"
```

---

### Task 1.4: 创建富文本编辑器主组件

**Files:**
- Create: `src/components/shared/rich-editor/editor.tsx`
- Create: `src/components/shared/rich-editor/index.tsx`

- [ ] **Step 1: 创建编辑器核心**

```typescript
// src/components/shared/rich-editor/editor.tsx

'use client'

import { useState, useCallback, useMemo } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Toolbar } from './toolbar'
import { HtmlMode } from './html-mode'
import type { RichEditorProps } from './types'

export function RichEditor({
  content,
  onChange,
  placeholder = '请输入内容...',
  maxLength,
  minHeight = 200,
  features,
  toolbar,
}: RichEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const enabledFeatures = useMemo(() => ({
    htmlMode: features?.htmlMode ?? true,
    fullscreen: features?.fullscreen ?? true,
    mediaLibrary: features?.mediaLibrary ?? true,
    wordCount: features?.wordCount ?? true,
  }), [features])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Highlight,
      TextStyle,
      Color,
      Image.configure({ HTMLAttributes: { class: 'max-w-full h-auto rounded-lg' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
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
        class: `prose max-w-none min-h-[${minHeight}px] p-4 border rounded-b-lg focus:outline-none`,
      },
    },
  })

  const wordCount = useMemo(() => {
    if (!editor || !enabledFeatures.wordCount) return undefined
    const text = editor.getText()
    return text.length
  }, [editor, enabledFeatures.wordCount])

  const handleHtmlChange = useCallback((html: string) => {
    onChange(html)
    if (editor) {
      editor.commands.setContent(html)
    }
  }, [editor, onChange])

  const switchToVisual = useCallback(() => {
    setIsHtmlMode(false)
  }, [])

  if (!editor) return null

  if (isHtmlMode) {
    return (
      <HtmlMode
        html={content}
        onChange={handleHtmlChange}
        onSwitchToVisual={switchToVisual}
      />
    )
  }

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}>
      <Toolbar
        editor={editor}
        config={toolbar}
        onHtmlMode={enabledFeatures.htmlMode ? () => setIsHtmlMode(true) : undefined}
        onFullscreen={enabledFeatures.fullscreen ? () => setIsFullscreen(!isFullscreen) : undefined}
        wordCount={wordCount}
      />
      <EditorContent editor={editor} />
    </div>
  )
}
```

- [ ] **Step 2: 创建导出入口**

```typescript
// src/components/shared/rich-editor/index.tsx

export { RichEditor } from './editor'
export type { RichEditorProps, RichEditorFeatures, ToolbarConfig, ToolbarGroup } from './types'
```

- [ ] **Step 3: 提交**

```bash
git add src/components/shared/rich-editor/editor.tsx src/components/shared/rich-editor/index.tsx
git commit -m "feat(rich-editor): add main editor component with HTML mode support"
```

---

### Task 1.5: 替换现有富文本编辑器

**Files:**
- Modify: `src/components/admin/rich-editor.tsx`

- [ ] **Step 1: 更新导出**

```typescript
// src/components/admin/rich-editor.tsx

// 重新导出共享组件
export { RichEditor } from '@/components/shared/rich-editor'
export type { RichEditorProps, RichEditorFeatures, ToolbarConfig, ToolbarGroup } from '@/components/shared/rich-editor'
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/rich-editor.tsx
git commit -m "refactor: replace rich-editor with shared component"
```

---

## Phase 2: 后台产品列表增强

### Task 2.1: 创建产品筛选组件

**Files:**
- Create: `src/components/admin/product-filters.tsx`

- [ ] **Step 1: 创建筛选组件**

```typescript
// src/components/admin/product-filters.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import type { Category, ProductTag } from '@/features/products/types'

interface ProductFiltersProps {
  categories: Category[]
  tags: ProductTag[]
}

export function ProductFilters({ categories, tags }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') || 'all'
  const currentTag = searchParams.get('tag') || 'all'
  const currentStatus = searchParams.get('status') || 'all'
  const currentSearch = searchParams.get('search') || ''

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('')
  }

  const hasFilters = currentCategory !== 'all' || currentTag !== 'all' || currentStatus !== 'all' || currentSearch

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Select value={currentCategory} onValueChange={(v) => updateFilter('category', v)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="分类" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部分类</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.translations?.zh?.name || cat.translations?.en?.name || cat.slug}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentTag} onValueChange={(v) => updateFilter('tag', v)}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="标签" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部标签</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.translations?.zh?.name || tag.translations?.en?.name || tag.slug}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentStatus} onValueChange={(v) => updateFilter('status', v)}>
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="published">已发布</SelectItem>
          <SelectItem value="draft">草稿</SelectItem>
          <SelectItem value="featured">推荐</SelectItem>
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索型号..."
          value={currentSearch}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9 w-[200px]"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" />
          清除筛选
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/product-filters.tsx
git commit -m "feat(admin): add product filters component"
```

---

### Task 2.2: 创建批量操作组件

**Files:**
- Create: `src/components/admin/batch-operations.tsx`

- [ ] **Step 1: 创建批量操作组件**

```typescript
// src/components/admin/batch-operations.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Trash2, FolderOpen, Tag } from 'lucide-react'
import type { Category, ProductTag } from '@/features/products/types'

interface BatchOperationsProps {
  selectedIds: string[]
  categories: Category[]
  tags: ProductTag[]
  onPublish: (ids: string[]) => Promise<void>
  onUnpublish: (ids: string[]) => Promise<void>
  onDelete: (ids: string[]) => Promise<void>
  onSetCategory: (ids: string[], categoryId: string | null) => Promise<void>
  onSetTags: (ids: string[], tagIds: string[]) => Promise<void>
  onClear: () => void
}

export function BatchOperations({
  selectedIds,
  categories,
  tags,
  onPublish,
  onUnpublish,
  onDelete,
  onSetCategory,
  onSetTags,
  onClear,
}: BatchOperationsProps) {
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showTagDialog, setShowTagDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  if (selectedIds.length === 0) return null

  const handlePublish = async () => {
    setLoading(true)
    await onPublish(selectedIds)
    setLoading(false)
    onClear()
  }

  const handleUnpublish = async () => {
    setLoading(true)
    await onUnpublish(selectedIds)
    setLoading(false)
    onClear()
  }

  const handleDelete = async () => {
    if (!confirm(`确定删除 ${selectedIds.length} 个产品？`)) return
    setLoading(true)
    await onDelete(selectedIds)
    setLoading(false)
    onClear()
  }

  const handleSetCategory = async () => {
    setLoading(true)
    await onSetCategory(selectedIds, selectedCategory || null)
    setLoading(false)
    setShowCategoryDialog(false)
    onClear()
  }

  const handleSetTags = async () => {
    setLoading(true)
    await onSetTags(selectedIds, selectedTags)
    setLoading(false)
    setShowTagDialog(false)
    onClear()
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <span className="text-sm">已选 {selectedIds.length} 项</span>
        <div className="flex gap-2">
          <Button size="sm" onClick={handlePublish} disabled={loading}>
            <Check className="w-4 h-4 mr-1" />
            发布
          </Button>
          <Button size="sm" variant="outline" onClick={handleUnpublish} disabled={loading}>
            <X className="w-4 h-4 mr-1" />
            取消发布
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowCategoryDialog(true)} disabled={loading}>
            <FolderOpen className="w-4 h-4 mr-1" />
            设置分类
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowTagDialog(true)} disabled={loading}>
            <Tag className="w-4 h-4 mr-1" />
            设置标签
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={loading}>
            <Trash2 className="w-4 h-4 mr-1" />
            删除
          </Button>
        </div>
      </div>

      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">无分类</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.translations?.zh?.name || cat.translations?.en?.name || cat.slug}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>取消</Button>
              <Button onClick={handleSetCategory} disabled={loading}>确定</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置标签</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id)
                return (
                  <Button
                    key={tag.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedTags(
                        isSelected
                          ? selectedTags.filter((id) => id !== tag.id)
                          : [...selectedTags, tag.id]
                      )
                    }}
                  >
                    {tag.translations?.zh?.name || tag.translations?.en?.name || tag.slug}
                  </Button>
                )
              })}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTagDialog(false)}>取消</Button>
              <Button onClick={handleSetTags} disabled={loading}>确定</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/admin/batch-operations.tsx
git commit -m "feat(admin): add batch operations component"
```

---

### Task 2.3: 更新产品列表页面

**Files:**
- Modify: `src/app/admin/products/page.tsx`
- Modify: `src/app/admin/products/products-client.tsx`

- [ ] **Step 1: 更新服务端页面获取分类和标签**

在 `src/app/admin/products/page.tsx` 中添加分类和标签获取：

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ProductsClient } from './products-client'

export default async function ProductsPage() {
  const [productsRes, categoriesRes, tagsRes] = await Promise.all([
    supabaseAdmin
      .from('products')
      .select('*, category:product_categories(*), tag_objects:product_tags!product_tag_relations(*)')
      .order('sort_order')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('product_categories')
      .select('*')
      .order('sort_order'),
    supabaseAdmin
      .from('product_tags')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  return (
    <ProductsClient
      products={productsRes.data || []}
      categories={categoriesRes.data || []}
      tags={tagsRes.data || []}
    />
  )
}
```

- [ ] **Step 2: 更新客户端组件添加筛选和批量操作**

更新 `src/app/admin/products/products-client.tsx`，集成 `ProductFilters` 和 `BatchOperations` 组件。

- [ ] **Step 3: 提交**

```bash
git add src/app/admin/products/page.tsx src/app/admin/products/products-client.tsx
git commit -m "feat(admin): add filters and batch operations to products list"
```

---

## Phase 3: 后台产品编辑完善

### Task 3.1: 创建产品向导组件

**Files:**
- Create: `src/features/products/components/admin/product-wizard/index.tsx`
- Create: `src/features/products/components/admin/product-wizard/step-basic.tsx`
- Create: `src/features/products/components/admin/product-wizard/step-content.tsx`
- Create: `src/features/products/components/admin/product-wizard/step-specs.tsx`
- Create: `src/features/products/components/admin/product-wizard/step-complete.tsx`

- [ ] **Step 1: 创建向导主组件**

```typescript
// src/features/products/components/admin/product-wizard/index.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { StepBasic } from './step-basic'
import { StepContent } from './step-content'
import { StepSpecs } from './step-specs'
import { StepComplete } from './step-complete'
import type { Category, ProductTag } from '@/features/products/types'

interface ProductWizardProps {
  categories: Category[]
  tags: ProductTag[]
}

export function ProductWizard({ categories, tags }: ProductWizardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [productId, setProductId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 产品数据
  const [productData, setProductData] = useState({
    model: '',
    slug: '',
    category_id: null as string | null,
    tags: [] as string[],
    sort_order: 100,
    translations: {} as Record<string, Record<string, string>>,
    images: [] as string[],
    videos: [] as string[],
    specs_standardized: {} as Record<string, { value: number; unit: string }>,
  })

  const steps = [
    { num: 1, label: '基础信息' },
    { num: 2, label: '产品内容' },
    { num: 3, label: '规格参数' },
    { num: 4, label: '完成' },
  ]

  const handleNext = async () => {
    if (step === 3) {
      // 创建产品
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            ...productData,
            published: true,
          }])
          .select('id')
          .single()

        if (error) throw error
        setProductId(data.id)
        setStep(4)
      } catch (e) {
        console.error('Create error:', e)
        alert('创建失败')
      } finally {
        setLoading(false)
      }
    } else {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleCancel = () => {
    router.push('/admin/products')
  }

  return (
    <div>
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.num}
            </div>
            <span className={`ml-2 ${step >= s.num ? 'text-foreground' : 'text-muted-foreground'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* 步骤内容 */}
      <div className="max-w-3xl mx-auto">
        {step === 1 && (
          <StepBasic
            data={productData}
            categories={categories}
            tags={tags}
            onChange={(data) => setProductData({ ...productData, ...data })}
          />
        )}
        {step === 2 && (
          <StepContent
            data={productData}
            onChange={(data) => setProductData({ ...productData, ...data })}
          />
        )}
        {step === 3 && (
          <StepSpecs
            data={productData}
            onChange={(data) => setProductData({ ...productData, ...data })}
          />
        )}
        {step === 4 && productId && (
          <StepComplete productId={productId} model={productData.model} />
        )}

        {/* 按钮 */}
        {step < 4 && (
          <div className="flex justify-end gap-4 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                上一步
              </Button>
            )}
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleNext} disabled={loading}>
              {loading ? '创建中...' : step === 3 ? '创建产品' : '下一步'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 创建各步骤组件** (step-basic.tsx, step-content.tsx, step-specs.tsx, step-complete.tsx)

- [ ] **Step 3: 提交**

```bash
git add src/features/products/components/admin/product-wizard/
git commit -m "feat(admin): add product creation wizard"
```

---

### Task 3.2: 完善规格Tab

**Files:**
- Create: `src/features/products/components/admin/product-tabs/specs-tab.tsx`

- [ ] **Step 1: 创建规格Tab组件**

实现标准化规格编辑器，支持表格形式编辑规格值和单位。

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/admin/product-tabs/specs-tab.tsx
git commit -m "feat(admin): add enhanced specs tab"
```

---

### Task 3.3: 完善关联Tab

**Files:**
- Create: `src/features/products/components/admin/product-tabs/relations-tab.tsx`

- [ ] **Step 1: 创建关联Tab组件**

实现案例、解决方案、产品的关联管理。

- [ ] **Step 2: 提交**

```bash
git add src/features/products/components/admin/product-tabs/relations-tab.tsx
git commit -m "feat(admin): add relations tab"
```

---

### Task 3.4: 重构产品编辑页面

**Files:**
- Modify: `src/app/admin/products/[id]/page.tsx`

- [ ] **Step 1: 重构页面**

区分新建和编辑模式：
- 新建：使用 ProductWizard 组件
- 编辑：使用 Tab 式布局

- [ ] **Step 2: 提交**

```bash
git add src/app/admin/products/[id]/page.tsx
git commit -m "refactor(admin): use wizard for new product, tabs for edit"
```

---

## Phase 4: 前端产品列表更新

### Task 4.1: 更新产品列表页面

**Files:**
- Modify: `src/app/[locale]/products/page.tsx`
- Modify: `src/components/public/product-filter.tsx`
- Modify: `src/components/public/product-card.tsx`

- [ ] **Step 1: 更新数据获取**

从 product_categories 表获取分类，从 product_tags 表获取标签。

- [ ] **Step 2: 更新产品卡片**

添加标签展示。

- [ ] **Step 3: 提交**

```bash
git add src/app/[locale]/products/page.tsx src/components/public/product-filter.tsx src/components/public/product-card.tsx
git commit -m "feat(frontend): update products list with categories and tags"
```

---

## Phase 5: 前端产品详情完善

### Task 5.1: 更新产品详情页面

**Files:**
- Modify: `src/app/[locale]/products/[model]/page.tsx`

- [ ] **Step 1: 添加FAQ展示**

集成 ProductFAQSection 组件。

- [ ] **Step 2: 更新文档下载**

使用 product_documents 表。

- [ ] **Step 3: 完善关联展示**

使用 product_relations 表。

- [ ] **Step 4: 优化转化设计**

添加首屏CTA按钮（询价、下载资料、预约演示）。

- [ ] **Step 5: 提交**

```bash
git add src/app/[locale]/products/[model]/page.tsx
git commit -m "feat(frontend): enhance product detail with FAQ, documents, and conversion design"
```

---

## 验收清单

### 富文本编辑器
- [ ] HTML源码模式正常
- [ ] 工具栏完整
- [ ] 字数统计显示
- [ ] 全屏模式正常

### 后台产品列表
- [ ] 分类筛选正常
- [ ] 标签筛选正常
- [ ] 搜索功能正常
- [ ] 批量操作正常

### 后台产品编辑
- [ ] 新建向导流程完整
- [ ] 各Tab功能正常
- [ ] 规格编辑正常
- [ ] 关联管理正常

### 前端产品列表
- [ ] 分类导航正常
- [ ] 标签筛选正常
- [ ] 产品卡片展示标签

### 前端产品详情
- [ ] FAQ展示正常
- [ ] 文档下载正常
- [ ] 相关案例展示正常
- [ ] CTA按钮正常
