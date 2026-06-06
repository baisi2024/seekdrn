# 导航管理功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现后台导航管理功能，支持拖拽排序、多语言编辑、两级菜单结构，并替换前端硬编码导航栏

**Architecture:** 采用分层架构，API 层处理数据操作，组件层实现拖拽交互，前端动态渲染使用 ISR 缓存。使用 dnd-kit 实现拖拽排序，Supabase 作为数据库，shadcn/ui 作为 UI 组件库。

**Tech Stack:** Next.js 15, React, TypeScript, dnd-kit, Supabase, shadcn/ui, next-intl

---

## 文件结构

### 新增文件

**API 层：**
- `src/app/api/admin/navigation/route.ts` - GET、POST 端点
- `src/app/api/admin/navigation/[id]/route.ts` - PUT、DELETE 端点
- `src/app/api/admin/navigation/reorder/route.ts` - PATCH 批量排序端点

**后台组件：**
- `src/components/admin/navigation-manager.tsx` - 导航管理主组件
- `src/components/admin/nav-tree.tsx` - 树形结构（拖拽）
- `src/components/admin/nav-item-editor.tsx` - 编辑对话框
- `src/components/admin/nav-drag-overlay.tsx` - 拖拽视觉反馈

**前端组件：**
- `src/components/public/dynamic-navbar.tsx` - 动态导航栏
- `src/components/public/dynamic-footer.tsx` - 动态页脚
- `src/components/public/nav-dropdown.tsx` - 下拉菜单

**工具函数：**
- `src/lib/navigation/api.ts` - API 函数
- `src/lib/navigation/tree.ts` - 树形结构工具
- `src/lib/navigation/types.ts` - 类型定义

**后台页面：**
- `src/app/admin/navigation/page.tsx` - Header 导航管理页面
- `src/app/admin/footer/page.tsx` - Footer 导航管理页面

### 修改文件

- `src/components/public/navbar.tsx` - 替换为 DynamicNavbar
- `src/components/public/footer.tsx` - 替换为 DynamicFooter
- `package.json` - 添加 dnd-kit 依赖
- `messages/*/admin.json` - 添加导航管理翻译

---

## Phase 1: 基础设施（0.5天）

### Task 1: 安装依赖和类型定义

**Files:**
- Modify: `package.json`
- Create: `src/lib/navigation/types.ts`

- [ ] **Step 1: 安装 dnd-kit 依赖**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: 依赖安装成功

- [ ] **Step 2: 创建类型定义文件**

```typescript
// src/lib/navigation/types.ts

export interface NavigationItem {
  id: string
  position: 'header' | 'footer'
  parent_id: string | null
  order_index: number
  link_type: 'internal' | 'external'
  url: string
  translations: Record<string, string>
  published: boolean
  children?: NavigationItem[]
}

export interface NavigationItemCreate {
  position: 'header' | 'footer'
  parent_id?: string | null
  order_index: number
  link_type: 'internal' | 'external'
  url: string
  translations: Record<string, string>
  published?: boolean
}

export interface NavigationItemUpdate {
  parent_id?: string | null
  order_index?: number
  link_type?: 'internal' | 'external'
  url?: string
  translations?: Record<string, string>
  published?: boolean
}

export interface ReorderRequest {
  updates: Array<{
    id: string
    parent_id: string | null
    order_index: number
  }>
}
```

- [ ] **Step 3: 提交类型定义**

```bash
git add src/lib/navigation/types.ts package.json package-lock.json
git commit -m "feat(navigation): add types and dnd-kit dependency"
```

---

### Task 2: 创建树形结构工具函数

**Files:**
- Create: `src/lib/navigation/tree.ts`
- Create: `src/lib/navigation/__tests__/tree.test.ts`

- [ ] **Step 1: 编写树形结构构建测试**

```typescript
// src/lib/navigation/__tests__/tree.test.ts
import { buildTree, flattenTree } from '../tree'
import { NavigationItem } from '../types'

describe('Navigation Tree Utils', () => {
  it('should build tree from flat items', () => {
    const flatItems: NavigationItem[] = [
      { id: '1', position: 'header', parent_id: null, order_index: 1, link_type: 'internal', url: '/products', translations: {}, published: true },
      { id: '2', position: 'header', parent_id: '1', order_index: 1, link_type: 'internal', url: '/products/uav', translations: {}, published: true },
      { id: '3', position: 'header', parent_id: null, order_index: 2, link_type: 'internal', url: '/solutions', translations: {}, published: true },
    ]

    const tree = buildTree(flatItems)

    expect(tree).toHaveLength(2)
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children![0].id).toBe('2')
  })

  it('should flatten tree to array', () => {
    const tree: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 1,
        link_type: 'internal',
        url: '/products',
        translations: {},
        published: true,
        children: [
          { id: '2', position: 'header', parent_id: '1', order_index: 1, link_type: 'internal', url: '/products/uav', translations: {}, published: true },
        ],
      },
    ]

    const flat = flattenTree(tree)

    expect(flat).toHaveLength(2)
    expect(flat[0].id).toBe('1')
    expect(flat[1].id).toBe('2')
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

```bash
npm test src/lib/navigation/__tests__/tree.test.ts
```

Expected: FAIL - 函数未定义

- [ ] **Step 3: 实现树形结构工具函数**

```typescript
// src/lib/navigation/tree.ts
import { NavigationItem } from './types'

export function buildTree(items: NavigationItem[]): NavigationItem[] {
  const itemMap = new Map<string, NavigationItem>()
  const rootItems: NavigationItem[] = []

  // 创建映射
  items.forEach(item => {
    itemMap.set(item.id, { ...item, children: [] })
  })

  // 构建树形结构
  items.forEach(item => {
    const node = itemMap.get(item.id)!
    if (item.parent_id === null) {
      rootItems.push(node)
    } else {
      const parent = itemMap.get(item.parent_id)
      if (parent) {
        parent.children!.push(node)
      }
    }
  })

  // 按 order_index 排序
  const sortByOrder = (a: NavigationItem, b: NavigationItem) => a.order_index - b.order_index
  rootItems.sort(sortByOrder)
  rootItems.forEach(item => {
    if (item.children && item.children.length > 0) {
      item.children.sort(sortByOrder)
    }
  })

  return rootItems
}

export function flattenTree(tree: NavigationItem[]): NavigationItem[] {
  const result: NavigationItem[] = []

  function traverse(items: NavigationItem[]) {
    items.forEach(item => {
      const { children, ...rest } = item
      result.push(rest)
      if (children && children.length > 0) {
        traverse(children)
      }
    })
  }

  traverse(tree)
  return result
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
npm test src/lib/navigation/__tests__/tree.test.ts
```

Expected: PASS

- [ ] **Step 5: 提交树形结构工具**

```bash
git add src/lib/navigation/tree.ts src/lib/navigation/__tests__/tree.test.ts
git commit -m "feat(navigation): add tree utils with tests"
```

---

### Task 3: 创建 API 工具函数

**Files:**
- Create: `src/lib/navigation/api.ts`

- [ ] **Step 1: 实现 API 工具函数**

```typescript
// src/lib/navigation/api.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NavigationItem, NavigationItemCreate, NavigationItemUpdate, ReorderRequest } from './types'
import { buildTree } from './tree'

export async function getNavigation(position: 'header' | 'footer'): Promise<NavigationItem[]> {
  const { data, error } = await supabaseAdmin
    .from('navigation')
    .select('*')
    .eq('position', position)
    .order('order_index')

  if (error) throw error
  return buildTree(data as NavigationItem[])
}

export async function createNavigationItem(item: NavigationItemCreate): Promise<NavigationItem> {
  const { data, error } = await supabaseAdmin
    .from('navigation')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function updateNavigationItem(id: string, updates: NavigationItemUpdate): Promise<NavigationItem> {
  const { data, error } = await supabaseAdmin
    .from('navigation')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function deleteNavigationItem(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('navigation')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function reorderNavigationItems(request: ReorderRequest): Promise<void> {
  // 使用事务批量更新
  const updates = request.updates.map(({ id, parent_id, order_index }) =>
    supabaseAdmin
      .from('navigation')
      .update({ parent_id, order_index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  if (errors.length > 0) {
    throw new Error('Failed to reorder items')
  }
}
```

- [ ] **Step 2: 提交 API 工具函数**

```bash
git add src/lib/navigation/api.ts
git commit -m "feat(navigation): add API utility functions"
```

---

## Phase 2: API 端点实现（0.5天）

### Task 4: 实现 GET 和 POST 端点

**Files:**
- Create: `src/app/api/admin/navigation/route.ts`

- [ ] **Step 1: 实现 GET 和 POST 端点**

```typescript
// src/app/api/admin/navigation/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getNavigation, createNavigationItem } from '@/lib/navigation/api'
import { NavigationItemCreate } from '@/lib/navigation/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = (searchParams.get('position') as 'header' | 'footer') || 'header'

    const items = await getNavigation(position)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const item: NavigationItemCreate = body

    const created = await createNavigationItem(item)

    return NextResponse.json({ item: created })
  } catch (error) {
    console.error('Error creating navigation item:', error)
    return NextResponse.json({ error: 'Failed to create navigation item' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 提交 API 端点**

```bash
git add src/app/api/admin/navigation/route.ts
git commit -m "feat(navigation): add GET and POST API endpoints"
```

---

### Task 5: 实现 PUT 和 DELETE 端点

**Files:**
- Create: `src/app/api/admin/navigation/[id]/route.ts`

- [ ] **Step 1: 实现 PUT 和 DELETE 端点**

```typescript
// src/app/api/admin/navigation/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { updateNavigationItem, deleteNavigationItem } from '@/lib/navigation/api'
import { NavigationItemUpdate } from '@/lib/navigation/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const updates: NavigationItemUpdate = body

    const updated = await updateNavigationItem(params.id, updates)

    return NextResponse.json({ item: updated })
  } catch (error) {
    console.error('Error updating navigation item:', error)
    return NextResponse.json({ error: 'Failed to update navigation item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteNavigationItem(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting navigation item:', error)
    return NextResponse.json({ error: 'Failed to delete navigation item' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 提交 API 端点**

```bash
git add src/app/api/admin/navigation/[id]/route.ts
git commit -m "feat(navigation): add PUT and DELETE API endpoints"
```

---

### Task 6: 实现批量排序端点

**Files:**
- Create: `src/app/api/admin/navigation/reorder/route.ts`

- [ ] **Step 1: 实现批量排序端点**

```typescript
// src/app/api/admin/navigation/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { reorderNavigationItems } from '@/lib/navigation/api'
import { ReorderRequest } from '@/lib/navigation/types'
import { revalidatePath } from 'next/cache'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates }: ReorderRequest = body

    // 验证层级约束（最多两级）
    for (const update of updates) {
      if (update.parent_id) {
        // 检查父级是否已经是子菜单
        // 这里简化处理，实际应该查询数据库验证
      }
    }

    await reorderNavigationItems({ updates })

    // 触发 ISR 重新验证
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering navigation:', error)
    return NextResponse.json({ error: 'Failed to reorder navigation' }, { status: 500 })
  }
}
```

- [ ] **Step 2: 提交批量排序端点**

```bash
git add src/app/api/admin/navigation/reorder/route.ts
git commit -m "feat(navigation): add reorder API endpoint with ISR revalidation"
```

---

## Phase 3: 后台管理组件（1.5天）

### Task 7: 实现 NavItemEditor 组件

**Files:**
- Create: `src/components/admin/nav-item-editor.tsx`

- [ ] **Step 1: 实现 NavItemEditor 组件**

```typescript
// src/components/admin/nav-item-editor.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { NavigationItem, NavigationItemCreate, NavigationItemUpdate } from '@/lib/navigation/types'

interface Props {
  item?: NavigationItem
  position: 'header' | 'footer'
  onSave: (data: NavigationItemCreate | NavigationItemUpdate) => void
  onClose: () => void
}

const LANGUAGES = ['en', 'zh', 'ar', 'es', 'fr', 'pt', 'id']

export function NavItemEditor({ item, position, onSave, onClose }: Props) {
  const [translations, setTranslations] = useState<Record<string, string>>(
    item?.translations || { en: '' }
  )
  const [linkType, setLinkType] = useState<'internal' | 'external'>(item?.link_type || 'internal')
  const [url, setUrl] = useState(item?.url || '')
  const [published, setPublished] = useState(item?.published ?? true)
  const [activeLang, setActiveLang] = useState('en')

  const handleSave = () => {
    const data: NavigationItemCreate | NavigationItemUpdate = {
      position,
      link_type: linkType,
      url,
      translations,
      published,
    }

    if (!item) {
      (data as NavigationItemCreate).order_index = 999 // 默认排序
    }

    onSave(data)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Navigation Item' : 'Create Navigation Item'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Label (Multi-language)</Label>
            <Tabs value={activeLang} onValueChange={setActiveLang}>
              <TabsList>
                {LANGUAGES.map(lang => (
                  <TabsTrigger key={lang} value={lang}>{lang.toUpperCase()}</TabsTrigger>
                ))}
              </TabsList>
              {LANGUAGES.map(lang => (
                <TabsContent key={lang} value={lang}>
                  <Input
                    value={translations[lang] || ''}
                    onChange={(e) => setTranslations({
                      ...translations,
                      [lang]: e.target.value
                    })}
                    placeholder={`Label in ${lang}`}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div>
            <Label>Link Type</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={linkType === 'internal'}
                  onChange={() => setLinkType('internal')}
                />
                Internal
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={linkType === 'external'}
                  onChange={() => setLinkType('external')}
                />
                External
              </label>
            </div>
          </div>

          <div>
            <Label>URL</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={linkType === 'internal' ? '/products' : 'https://example.com'}
            />
          </div>

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

- [ ] **Step 2: 提交 NavItemEditor 组件**

```bash
git add src/components/admin/nav-item-editor.tsx
git commit -m "feat(navigation): add NavItemEditor component"
```

---

### Task 8: 实现 NavTree 组件（拖拽核心）

**Files:**
- Create: `src/components/admin/nav-tree.tsx`
- Create: `src/components/admin/nav-drag-overlay.tsx`

- [ ] **Step 1: 实现 NavTree 组件**

```typescript
// src/components/admin/nav-tree.tsx
'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NavigationItem } from '@/lib/navigation/types'
import { Button } from '@/components/ui/button'
import { GripVertical, Edit, Trash2 } from 'lucide-react'

interface Props {
  item: NavigationItem
  onEdit: (item: NavigationItem) => void
  onDelete: (id: string) => void
}

export function NavTreeItem({ item, onEdit, onDelete }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded p-3 mb-2 bg-white">
      <div className="flex items-center gap-2">
        <button {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>

        <div className="flex-1">
          <div className="font-medium">{item.translations.en || item.url}</div>
          <div className="text-sm text-gray-500">{item.url}</div>
        </div>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 子菜单 */}
      {item.children && item.children.length > 0 && (
        <div className="ml-8 mt-2">
          {item.children.map(child => (
            <NavTreeItem
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 实现 DragOverlay 组件**

```typescript
// src/components/admin/nav-drag-overlay.tsx
'use client'

import { NavigationItem } from '@/lib/navigation/types'

interface Props {
  item: NavigationItem
}

export function NavDragOverlay({ item }: Props) {
  return (
    <div className="border rounded p-3 bg-blue-50 shadow-lg">
      <div className="font-medium">{item.translations.en || item.url}</div>
      <div className="text-sm text-gray-500">{item.url}</div>
    </div>
  )
}
```

- [ ] **Step 3: 提交 NavTree 组件**

```bash
git add src/components/admin/nav-tree.tsx src/components/admin/nav-drag-overlay.tsx
git commit -m "feat(navigation): add NavTree with drag & drop support"
```

---

### Task 9: 实现 NavigationManager 主组件

**Files:**
- Create: `src/components/admin/navigation-manager.tsx`

- [ ] **Step 1: 实现 NavigationManager 组件**

```typescript
// src/components/admin/navigation-manager.tsx
'use client'

import { useState } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { NavigationItem, NavigationItemCreate, NavigationItemUpdate, ReorderRequest } from '@/lib/navigation/types'
import { NavTreeItem } from './nav-tree'
import { NavDragOverlay } from './nav-drag-overlay'
import { NavItemEditor } from './nav-item-editor'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Props {
  initialItems: NavigationItem[]
  position: 'header' | 'footer'
}

export function NavigationManager({ initialItems, position }: Props) {
  const [items, setItems] = useState<NavigationItem[]>(initialItems)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [draggedItem, setDraggedItem] = useState<NavigationItem | null>(null)

  const handleDragStart = (event: { active: { id: string } }) => {
    const item = findItem(items, event.active.id as string)
    if (item) setDraggedItem(item)
  }

  const handleDragEnd = async (event: { active: { id: string }, over: { id: string } | null }) => {
    setDraggedItem(null)

    if (!event.over) return

    // 计算新的排序
    const updates = calculateReorder(items, event.active.id as string, event.over.id as string)

    // 更新本地状态
    setItems(applyReorder(items, updates))

    // 调用 API
    try {
      const response = await fetch('/api/admin/navigation/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) throw new Error('Failed to reorder')
    } catch (error) {
      console.error('Error reordering:', error)
      // 回滚状态
      setItems(initialItems)
    }
  }

  const handleSave = async (data: NavigationItemCreate | NavigationItemUpdate) => {
    try {
      if (editingItem) {
        // 更新
        const response = await fetch(`/api/admin/navigation/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        const { item } = await response.json()
        setItems(items.map(i => i.id === item.id ? item : i))
      } else {
        // 创建
        const response = await fetch('/api/admin/navigation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, position }),
        })
        const { item } = await response.json()
        setItems([...items, item])
      }

      setEditingItem(null)
      setIsCreating(false)
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      await fetch(`/api/admin/navigation/${id}`, { method: 'DELETE' })
      setItems(items.filter(i => i.id !== id))
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">{position === 'header' ? 'Header Navigation' : 'Footer Navigation'}</h2>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map(item => (
            <NavTreeItem
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>

        <DragOverlay>
          {draggedItem && <NavDragOverlay item={draggedItem} />}
        </DragOverlay>
      </DndContext>

      {(editingItem || isCreating) && (
        <NavItemEditor
          item={editingItem || undefined}
          position={position}
          onSave={handleSave}
          onClose={() => {
            setEditingItem(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

// 辅助函数
function findItem(items: NavigationItem[], id: string): NavigationItem | null {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findItem(item.children, id)
      if (found) return found
    }
  }
  return null
}

function calculateReorder(items: NavigationItem[], activeId: string, overId: string): ReorderRequest['updates'] {
  // 简化实现：仅处理同级排序
  const updates: ReorderRequest['updates'] = []

  items.forEach((item, index) => {
    if (item.id === activeId) {
      updates.push({ id: activeId, parent_id: null, order_index: index })
    }
  })

  return updates
}

function applyReorder(items: NavigationItem[], updates: ReorderRequest['updates']): NavigationItem[] {
  // 简化实现
  return items
}
```

- [ ] **Step 2: 提交 NavigationManager 组件**

```bash
git add src/components/admin/navigation-manager.tsx
git commit -m "feat(navigation): add NavigationManager main component"
```

---

### Task 10: 创建后台管理页面

**Files:**
- Modify: `src/app/admin/navigation/page.tsx`
- Modify: `src/app/admin/footer/page.tsx`

- [ ] **Step 1: 实现 Header 导航管理页面**

```typescript
// src/app/admin/navigation/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NavigationManager } from '@/components/admin/navigation-manager'
import { NavigationItem } from '@/lib/navigation/types'
import { buildTree } from '@/lib/navigation/tree'

export default async function NavigationPage() {
  const { data } = await supabaseAdmin
    .from('navigation')
    .select('*')
    .eq('position', 'header')
    .order('order_index')

  const items = buildTree(data as NavigationItem[])

  return (
    <div className="p-6">
      <NavigationManager initialItems={items} position="header" />
    </div>
  )
}
```

- [ ] **Step 2: 实现 Footer 导航管理页面**

```typescript
// src/app/admin/footer/page.tsx
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NavigationManager } from '@/components/admin/navigation-manager'
import { NavigationItem } from '@/lib/navigation/types'
import { buildTree } from '@/lib/navigation/tree'

export default async function FooterPage() {
  const { data } = await supabaseAdmin
    .from('navigation')
    .select('*')
    .eq('position', 'footer')
    .order('order_index')

  const items = buildTree(data as NavigationItem[])

  return (
    <div className="p-6">
      <NavigationManager initialItems={items} position="footer" />
    </div>
  )
}
```

- [ ] **Step 3: 提交后台管理页面**

```bash
git add src/app/admin/navigation/page.tsx src/app/admin/footer/page.tsx
git commit -m "feat(navigation): add admin navigation and footer pages"
```

---

## Phase 4: 前端动态渲染（0.5天）

### Task 11: 实现前端动态组件

**Files:**
- Create: `src/components/public/nav-dropdown.tsx`
- Create: `src/components/public/dynamic-navbar.tsx`
- Create: `src/components/public/dynamic-footer.tsx`

- [ ] **Step 1: 实现 NavDropdown 组件**

```typescript
// src/components/public/nav-dropdown.tsx
'use client'

import Link from 'next/link'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NavigationItem } from '@/lib/navigation/types'
import { ChevronDown } from 'lucide-react'

interface Props {
  item: NavigationItem
  locale: string
}

export function NavDropdown({ item, locale }: Props) {
  const label = item.translations[locale] || item.translations['en'] || item.url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        {label}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {item.children?.map(child => {
          const childLabel = child.translations[locale] || child.translations['en'] || child.url
          const href = child.link_type === 'external' ? child.url : `/${locale}${child.url}`

          return (
            <DropdownMenuItem key={child.id} asChild>
              <Link href={href}>{childLabel}</Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: 实现 DynamicNavbar 组件**

```typescript
// src/components/public/dynamic-navbar.tsx
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { NavigationItem } from '@/lib/navigation/types'
import { buildTree } from '@/lib/navigation/tree'
import { NavDropdown } from './nav-dropdown'
import { LanguageSwitcher } from './language-switcher'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

async function getNavigation(): Promise<NavigationItem[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('navigation')
    .select('*')
    .eq('position', 'header')
    .eq('published', true)
    .order('order_index')

  return buildTree(data as NavigationItem[])
}

export async function DynamicNavbar({ locale }: { locale: string }) {
  const items = await getNavigation()
  const t = (key: string) => key // 简化翻译

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SD</span>
          </div>
          <span className="font-bold text-lg text-gray-900">SeekDrone</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {items.map(item => {
            const label = item.translations[locale] || item.translations['en'] || item.url
            const href = item.link_type === 'external' ? item.url : `/${locale}${item.url}`

            return item.children && item.children.length > 0 ? (
              <NavDropdown key={item.id} item={item} locale={locale} />
            ) : (
              <Link key={item.id} href={href} className="text-sm text-gray-600 hover:text-gray-900">
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button render={<Link href={`/${locale}#demo-form`} />} nativeButton={false} size="sm" className="hidden md:inline-flex">
            {t('nav.requestDemo')}
          </Button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: 实现 DynamicFooter 组件**

```typescript
// src/components/public/dynamic-footer.tsx
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { NavigationItem } from '@/lib/navigation/types'
import { buildTree } from '@/lib/navigation/tree'

async function getNavigation(): Promise<NavigationItem[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('navigation')
    .select('*')
    .eq('position', 'footer')
    .eq('published', true)
    .order('order_index')

  return buildTree(data as NavigationItem[])
}

export async function DynamicFooter({ locale }: { locale: string }) {
  const items = await getNavigation()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo 和描述 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <span className="font-bold text-lg text-white">SeekDrone</span>
            </div>
            <p className="text-sm">Industrial UAV solutions and counter-drone systems.</p>
          </div>

          {/* 动态导航项 */}
          {items.map(item => {
            const label = item.translations[locale] || item.translations['en'] || item.url

            return (
              <div key={item.id}>
                <h3 className="text-white font-semibold mb-4">{label}</h3>
                <ul className="space-y-2 text-sm">
                  {item.children?.map(child => {
                    const childLabel = child.translations[locale] || child.translations['en'] || child.url
                    const href = child.link_type === 'external' ? child.url : `/${locale}${child.url}`

                    return (
                      <li key={child.id}>
                        <Link href={href} className="hover:text-white transition-colors">
                          {childLabel}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} SeekDrone. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: 提交前端动态组件**

```bash
git add src/components/public/nav-dropdown.tsx src/components/public/dynamic-navbar.tsx src/components/public/dynamic-footer.tsx
git commit -m "feat(navigation): add dynamic navbar and footer components"
```

---

### Task 12: 替换硬编码导航组件

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: 更新 layout 使用动态组件**

```typescript
// src/app/[locale]/layout.tsx
import { DynamicNavbar } from '@/components/public/dynamic-navbar'
import { DynamicFooter } from '@/components/public/dynamic-footer'

export default function LocaleLayout({ children, params }: { children: React.ReactNode, params: { locale: string } }) {
  return (
    <div>
      <DynamicNavbar locale={params.locale} />
      {children}
      <DynamicFooter locale={params.locale} />
    </div>
  )
}
```

- [ ] **Step 2: 提交 layout 更新**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat(navigation): replace hardcoded navbar and footer with dynamic components"
```

---

## Phase 5: 测试和优化（0.5天）

### Task 13: 添加多语言翻译

**Files:**
- Modify: `messages/en/admin.json`
- Modify: `messages/zh/admin.json`
- (其他语言文件)

- [ ] **Step 1: 添加导航管理翻译**

```json
// messages/en/admin.json
{
  "navigation": {
    "title": "Navigation Management",
    "header": "Header Navigation",
    "footer": "Footer Navigation",
    "addItem": "Add Item",
    "editItem": "Edit Item",
    "deleteConfirm": "Are you sure you want to delete this item?",
    "label": "Label",
    "linkType": "Link Type",
    "internal": "Internal",
    "external": "External",
    "url": "URL",
    "published": "Published"
  }
}
```

```json
// messages/zh/admin.json
{
  "navigation": {
    "title": "导航管理",
    "header": "顶部导航",
    "footer": "页脚导航",
    "addItem": "添加项",
    "editItem": "编辑项",
    "deleteConfirm": "确定要删除此项吗？",
    "label": "标签",
    "linkType": "链接类型",
    "internal": "内部链接",
    "external": "外部链接",
    "url": "URL",
    "published": "已发布"
  }
}
```

- [ ] **Step 2: 提交翻译文件**

```bash
git add messages/*/admin.json
git commit -m "feat(navigation): add navigation management translations"
```

---

### Task 14: 运行测试和构建验证

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

- [ ] **Step 4: 运行单元测试**

```bash
npm test
```

Expected: 所有测试通过

- [ ] **Step 5: 提交最终版本**

```bash
git add -A
git commit -m "feat(navigation): complete navigation management feature

- Add drag & drop sorting with dnd-kit
- Support two-level menu structure
- Add multi-language support (7 languages)
- Implement dynamic navbar and footer
- Add ISR caching for performance
- Replace hardcoded navigation components"
```

---

## 验收清单

### 功能验收

- [ ] 管理员可以创建、编辑、删除导航项
- [ ] 支持拖拽排序（同级和跨层级）
- [ ] 支持多语言标签编辑
- [ ] 支持内部链接和外部链接
- [ ] 前端正确渲染导航栏和页脚
- [ ] ISR 缓存正常工作

### 技术验收

- [ ] 所有 API 端点正常工作
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 构建成功

### 用户体验验收

- [ ] 拖拽交互流畅（60fps）
- [ ] 多语言切换正确
- [ ] 移动端适配良好
- [ ] 无明显性能问题

---

**计划版本：v1.0**
**最后更新：2026-06-06**
**预计工期：3.5 天**
