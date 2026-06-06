# 产品管理Admin增强实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现产品管理Admin后台的规格组管理、下载管理和案例关联管理功能

**Architecture:** 在现有Next.js应用中添加Admin API路由和组件，使用Supabase作为数据库，Cloudflare R2作为文件存储，shadcn/ui作为UI组件库

**Tech Stack:** Next.js 15, TypeScript, Supabase, Cloudflare R2, shadcn/ui, TipTap

---

## 文件结构映射

### 新建文件

**API路由：**
- `src/app/api/admin/products/[id]/spec-groups/route.ts` - 规格组管理API
- `src/app/api/admin/products/[id]/downloads/route.ts` - 下载管理API
- `src/app/api/admin/products/[id]/case-relations/route.ts` - 案例关联管理API

**Admin组件：**
- `src/components/admin/spec-groups-editor.tsx` - 规格组编辑器
- `src/components/admin/downloads-manager.tsx` - 下载管理器
- `src/components/admin/case-relations-manager.tsx` - 案例关联管理器

**Admin页面：**
- `src/app/admin/products/[id]/specs/page.tsx` - 规格管理页面
- `src/app/admin/products/[id]/downloads/page.tsx` - 下载管理页面
- `src/app/admin/products/[id]/cases/page.tsx` - 案例关联管理页面

**测试文件：**
- `src/components/admin/__tests__/spec-groups-editor.test.tsx`
- `src/components/admin/__tests__/downloads-manager.test.tsx`
- `src/components/admin/__tests__/case-relations-manager.test.tsx`

---

## 阶段1：Admin API层

### Task 1.1: 实现规格组管理API

**Files:**
- Create: `src/app/api/admin/products/[id]/spec-groups/route.ts`

- [ ] **Step 1: 编写规格组API**

```typescript
// src/app/api/admin/products/[id]/spec-groups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('spec_groups, product_specs(*)')
    .eq('id', id)
    .maybeSingle()

  if (error || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({
    spec_groups: product.spec_groups || [],
    specs: product.product_specs || []
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { groups } = body

  const { error } = await supabaseAdmin
    .from('products')
    .update({ spec_groups: groups })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/api/admin/products/[id]/spec-groups/route.ts
git commit -m "feat(api): add spec groups management endpoint"
```

---

### Task 1.2: 实现下载管理API

**Files:**
- Create: `src/app/api/admin/products/[id]/downloads/route.ts`

- [ ] **Step 1: 编写下载管理API**

```typescript
// src/app/api/admin/products/[id]/downloads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { uploadToR2, getPublicUrl } from '@/lib/r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: downloads, error } = await supabaseAdmin
    .from('product_downloads')
    .select('*')
    .eq('product_id', id)
    .order('sort_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ downloads: downloads || [] })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const formData = await request.formData()

  try {
    const file = formData.get('file') as File
    const type = formData.get('type') as string
    const title = JSON.parse(formData.get('title') as string)
    const description = JSON.parse(formData.get('description') as string) || {}
    const language = formData.get('language') as string

    if (!file || !type || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `downloads/${new Date().toISOString().split('T')[0]}/${crypto.randomUUID()}.${file.name.split('.').pop()}`

    await uploadToR2(key, buffer, file.type)
    const publicUrl = getPublicUrl(key)

    const { error } = await supabaseAdmin.from('product_downloads').insert([{
      product_id: id,
      type,
      title,
      description,
      file_url: publicUrl,
      file_size: file.size,
      file_type: file.type,
      language,
      sort_order: 0
    }])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { downloadId, updates } = body

  const { error } = await supabaseAdmin
    .from('product_downloads')
    .update(updates)
    .eq('id', downloadId)
    .eq('product_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { downloadId } = body

  const { error } = await supabaseAdmin
    .from('product_downloads')
    .delete()
    .eq('id', downloadId)
    .eq('product_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/api/admin/products/[id]/downloads/route.ts
git commit -m "feat(api): add downloads management endpoint"
```

---

### Task 1.3: 实现案例关联管理API

**Files:**
- Create: `src/app/api/admin/products/[id]/case-relations/route.ts`

- [ ] **Step 1: 编写案例关联管理API**

```typescript
// src/app/api/admin/products/[id]/case-relations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: relations, error } = await supabaseAdmin
    .from('product_case_relations')
    .select(`
      *,
      case_studies(*)
    `)
    .eq('product_id', id)
    .order('sort_order')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: allCases } = await supabaseAdmin
    .from('case_studies')
    .select('id, translations')
    .eq('published', true)

  return NextResponse.json({
    relations: relations || [],
    availableCases: allCases || []
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { caseStudyId } = body

  const { error } = await supabaseAdmin.from('product_case_relations').insert([{
    product_id: id,
    case_study_id: caseStudyId,
    is_manual: true,
    sort_order: 0
  }])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { caseStudyId } = body

  const { error } = await supabaseAdmin
    .from('product_case_relations')
    .delete()
    .eq('product_id', id)
    .eq('case_study_id', caseStudyId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/api/admin/products/[id]/case-relations/route.ts
git commit -m "feat(api): add case relations management endpoint"
```

---

## 阶段2：Admin组件层

### Task 2.1: 实现规格组编辑器组件

**Files:**
- Create: `src/components/admin/spec-groups-editor.tsx`
- Create: `src/components/admin/__tests__/spec-groups-editor.test.tsx`

- [ ] **Step 1: 编写组件测试**

```typescript
// src/components/admin/__tests__/spec-groups-editor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SpecGroupsEditor } from '../spec-groups-editor'

const mockGroups = [
  { id: 'flight', label: { en: 'Flight' }, sort_order: 1 }
]

const mockSpecs = [
  { id: 's1', group_id: 'flight', label: { en: 'Speed' }, value: { en: '100' } }
]

describe('SpecGroupsEditor', () => {
  it('should render spec groups', () => {
    render(<SpecGroupsEditor groups={mockGroups} specs={mockSpecs} locale="en" onSave={() => {}} />)
    expect(screen.getByText('Flight')).toBeInTheDocument()
  })

  it('should render specs in groups', () => {
    render(<SpecGroupsEditor groups={mockGroups} specs={mockSpecs} locale="en" onSave={() => {}} />)
    expect(screen.getByText('Speed')).toBeInTheDocument()
  })

  it('should add new group', () => {
    render(<SpecGroupsEditor groups={[]} specs={[]} locale="en" onSave={() => {}} />)
    fireEvent.click(screen.getByText('Add Group'))
    expect(screen.getByPlaceholderText('Group ID')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/components/admin/__tests__/spec-groups-editor.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: 实现规格组编辑器组件**

```typescript
// src/components/admin/spec-groups-editor.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { getTranslation } from '@/lib/utils'

interface SpecGroup {
  id: string
  label: Record<string, string>
  sort_order: number
}

interface Spec {
  id: string
  group_id: string
  label: Record<string, string>
  value: Record<string, string>
  unit: Record<string, string>
}

interface Props {
  groups: SpecGroup[]
  specs: Spec[]
  locale: string
  onSave: (groups: SpecGroup[]) => void
}

const LOCALES = ['en', 'zh', 'ar', 'es', 'fr', 'pt', 'id']

export function SpecGroupsEditor({ groups: initialGroups, specs, locale, onSave }: Props) {
  const [groups, setGroups] = useState<SpecGroup[]>(initialGroups)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.map(g => g.id))
  )
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [newGroupId, setNewGroupId] = useState('')
  const [newGroupLabel, setNewGroupLabel] = useState('')

  const addGroup = () => {
    if (!newGroupId.trim()) return
    const newGroup: SpecGroup = {
      id: newGroupId.trim(),
      label: { [locale]: newGroupLabel.trim() || newGroupId.trim() },
      sort_order: groups.length + 1
    }
    setGroups([...groups, newGroup])
    setExpandedGroups(new Set([...expandedGroups, newGroupId]))
    setShowAddGroup(false)
    setNewGroupId('')
    setNewGroupLabel('')
  }

  const updateGroupLabel = (groupId: string, lang: string, value: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, label: { ...g.label, [lang]: value } } : g
    ))
  }

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId))
    setExpandedGroups(new Set(expandedGroups).delete(groupId))
  }

  const getGroupSpecs = (groupId: string) => specs.filter(s => s.group_id === groupId)

  const handleSave = () => {
    onSave(groups)
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <div key={group.id} className="border rounded-lg overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
            onClick={() => toggleGroup(group.id)}
          >
            <div className="flex items-center gap-3">
              <span className="font-semibold">{getTranslation(group.label, locale, 'en')}</span>
              <span className="text-sm text-gray-500">({getGroupSpecs(group.id).length} specs)</span>
            </div>
            <div className="flex items-center gap-2">
              {expandedGroups.has(group.id) ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <button
                onClick={(e) => { e.stopPropagation(); deleteGroup(group.id) }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
          {expandedGroups.has(group.id) && (
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Group Label (Multi-language)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {LOCALES.map(lang => (
                    <Input
                      key={lang}
                      placeholder={lang}
                      value={group.label[lang] || ''}
                      onChange={(e) => updateGroupLabel(group.id, lang, e.target.value)}
                    />
                  ))}
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Specifications in this group</h4>
                {getGroupSpecs(group.id).length > 0 ? (
                  <div className="space-y-2">
                    {getGroupSpecs(group.id).map(spec => (
                      <div key={spec.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{getTranslation(spec.label, locale, 'en')}</span>
                        <span className="text-gray-600">{getTranslation(spec.value, locale, 'en')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No specs in this group. Add specs in the specs tab.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {showAddGroup ? (
        <div className="border rounded-lg p-4 space-y-3">
          <div>
            <Label>Group ID</Label>
            <Input
              placeholder="e.g., flight, sensor"
              value={newGroupId}
              onChange={(e) => setNewGroupId(e.target.value)}
            />
          </div>
          <div>
            <Label>Group Label ({locale})</Label>
            <Input
              placeholder="Group name"
              value={newGroupLabel}
              onChange={(e) => setNewGroupLabel(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={addGroup} disabled={!newGroupId.trim()}>Create Group</Button>
            <Button variant="outline" onClick={() => setShowAddGroup(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowAddGroup(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Group
        </Button>
      )}

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave}>Save Groups</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/components/admin/__tests__/spec-groups-editor.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/components/admin/spec-groups-editor.tsx src/components/admin/__tests__/spec-groups-editor.test.tsx
git commit -m "feat(components): add spec groups editor"
```

---

### Task 2.2: 实现下载管理器组件

**Files:**
- Create: `src/components/admin/downloads-manager.tsx`
- Create: `src/components/admin/__tests__/downloads-manager.test.tsx`

- [ ] **Step 1: 编写组件测试**

```typescript
// src/components/admin/__tests__/downloads-manager.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { DownloadsManager } from '../downloads-manager'

const mockDownloads = [
  {
    id: 'd1',
    type: 'manual',
    title: { en: 'User Manual' },
    file_size: 5242880,
    language: 'en'
  }
]

describe('DownloadsManager', () => {
  it('should render download items', () => {
    render(<DownloadsManager downloads={mockDownloads} locale="en" productId="p1" />)
    expect(screen.getByText('User Manual')).toBeInTheDocument()
  })

  it('should display file size', () => {
    render(<DownloadsManager downloads={mockDownloads} locale="en" productId="p1" />)
    expect(screen.getByText('5 MB')).toBeInTheDocument()
  })

  it('should show upload button', () => {
    render(<DownloadsManager downloads={[]} locale="en" productId="p1" />)
    expect(screen.getByText('Upload File')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/components/admin/__tests__/downloads-manager.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: 实现下载管理器组件**

```typescript
// src/components/admin/downloads-manager.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Trash2, FileText } from 'lucide-react'
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
  productId: string
}

const LOCALES = ['en', 'zh', 'ar', 'es', 'fr', 'pt', 'id']
const FILE_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'datasheet', label: 'Datasheet' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'media', label: 'Media' }
]

export function DownloadsManager({ downloads, locale, productId }: Props) {
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState('manual')
  const [titles, setTitles] = useState<Record<string, string>>({})
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [language, setLanguage] = useState('en')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setTitles({ [locale]: file.name.replace(/\.[^/.]+$/, '') })
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', fileType)
      formData.append('title', JSON.stringify(titles))
      formData.append('description', JSON.stringify(descriptions))
      formData.append('language', language)

      const res = await fetch(`/api/admin/products/${productId}/downloads`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Upload failed')

      setShowUploadForm(false)
      setSelectedFile(null)
      setFileType('manual')
      setTitles({})
      setDescriptions({})
      setLanguage('en')
      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (downloadId: string) => {
    if (!confirm('Are you sure you want to delete this download?')) return

    try {
      const res = await fetch(`/api/admin/products/${productId}/downloads`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadId })
      })

      if (!res.ok) throw new Error('Delete failed')
      setRefreshKey(k => k + 1)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={() => setShowUploadForm(true)}>
        <Upload className="w-4 h-4 mr-2" />
        Upload File
      </Button>

      {showUploadForm && (
        <div className="border rounded-lg p-4 space-y-4">
          <div>
            <Label>File</Label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
              onChange={handleFileChange}
              className="mt-1"
            />
            {selectedFile && (
              <p className="text-sm text-gray-500 mt-2">{selectedFile.name} - {formatFileSize(selectedFile.size)}</p>
            )}
          </div>

          <div>
            <Label>File Type</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title (Multi-language)</Label>
            <div className="grid grid-cols-2 gap-2">
              {LOCALES.map(lang => (
                <Input
                  key={lang}
                  placeholder={lang}
                  value={titles[lang] || ''}
                  onChange={(e) => setTitles({ ...titles, [lang]: e.target.value })}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Description (Multi-language)</Label>
            <div className="grid grid-cols-2 gap-2">
              {LOCALES.map(lang => (
                <Input
                  key={lang}
                  placeholder={lang}
                  value={descriptions[lang] || ''}
                  onChange={(e) => setDescriptions({ ...descriptions, [lang]: e.target.value })}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button variant="outline" onClick={() => setShowUploadForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3" key={refreshKey}>
        {downloads.length > 0 ? (
          downloads.map(download => (
            <div key={download.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium">{getTranslation(download.title, locale, 'en')}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{download.type}</span>
                  <span>{download.language}</span>
                  <span>{formatFileSize(download.file_size)}</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(download.id)}
                className="p-2 hover:bg-red-100 rounded text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">No downloads yet. Upload your first file.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/components/admin/__tests__/downloads-manager.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/components/admin/downloads-manager.tsx src/components/admin/__tests__/downloads-manager.test.tsx
git commit -m "feat(components): add downloads manager"
```

---

### Task 2.3: 实现案例关联管理器组件

**Files:**
- Create: `src/components/admin/case-relations-manager.tsx`
- Create: `src/components/admin/__tests__/case-relations-manager.test.tsx`

- [ ] **Step 1: 编写组件测试**

```typescript
// src/components/admin/__tests__/case-relations-manager.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CaseRelationsManager } from '../case-relations-manager'

const mockRelations = [
  { id: 'r1', case_study_id: 'c1', case_studies: { translations: { en: { title: 'Case 1' } } } }
]

const mockAvailableCases = [
  { id: 'c2', translations: { en: { title: 'Case 2' } } }
]

describe('CaseRelationsManager', () => {
  it('should render related cases', () => {
    render(<CaseRelationsManager relations={mockRelations} availableCases={mockAvailableCases} locale="en" productId="p1" />)
    expect(screen.getByText('Case 1')).toBeInTheDocument()
  })

  it('should show available cases to add', () => {
    render(<CaseRelationsManager relations={mockRelations} availableCases={mockAvailableCases} locale="en" productId="p1" />)
    expect(screen.getByText('Case 2')).toBeInTheDocument()
  })

  it('should have add button', () => {
    render(<CaseRelationsManager relations={mockRelations} availableCases={mockAvailableCases} locale="en" productId="p1" />)
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/components/admin/__tests__/case-relations-manager.test.tsx`
Expected: FAIL - module not found

- [ ] **Step 3: 实现案例关联管理器组件**

```typescript
// src/components/admin/case-relations-manager.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { getTranslation } from '@/lib/utils'

interface CaseRelation {
  id: string
  case_study_id: string
  is_manual: boolean
  case_studies: {
    id: string
    translations: Record<string, any>
    industry: string
    country: string
  }
}

interface CaseStudy {
  id: string
  translations: Record<string, any>
}

interface Props {
  relations: CaseRelation[]
  availableCases: CaseStudy[]
  locale: string
  productId: string
}

export function CaseRelationsManager({ relations: initialRelations, availableCases: initialAvailableCases, locale, productId }: Props) {
  const [relations, setRelations] = useState<CaseRelation[]>(initialRelations)
  const [availableCases, setAvailableCases] = useState<CaseStudy[]>(initialAvailableCases)
  const [loading, setLoading] = useState(false)

  const refreshData = async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/case-relations`)
      const data = await res.json()
      setRelations(data.relations || [])
      setAvailableCases(data.availableCases || [])
    } catch (error) {
      console.error('Failed to refresh:', error)
    }
  }

  const handleAdd = async (caseStudyId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/case-relations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseStudyId })
      })

      if (!res.ok) throw new Error('Failed to add')
      await refreshData()
    } catch (error) {
      console.error('Add error:', error)
      alert('Failed to add case relation')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (caseStudyId: string) => {
    if (!confirm('Are you sure you want to remove this case relation?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/case-relations`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseStudyId })
      })

      if (!res.ok) throw new Error('Failed to remove')
      await refreshData()
    } catch (error) {
      console.error('Remove error:', error)
      alert('Failed to remove')
    } finally {
      setLoading(false)
    }
  }

  const getCaseTitle = (translations: Record<string, any>) => {
    return getTranslation(translations, locale, 'title') || 'Untitled'
  }

  const isCaseRelated = (caseId: string) => {
    return relations.some(r => r.case_study_id === caseId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Related Cases ({relations.length}/3)</h3>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {relations.length > 0 ? (
          relations.map(relation => (
            <div key={relation.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{getCaseTitle(relation.case_studies.translations)}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{relation.case_studies.industry}</Badge>
                  <Badge variant="outline">{relation.case_studies.country}</Badge>
                  {relation.is_manual && (
                    <Badge variant="secondary" className="text-xs">Manual</Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(relation.case_study_id)}
                disabled={loading}
                className="p-2 hover:bg-red-100 rounded text-red-500 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">No related cases. Add cases below.</div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Available Cases</h3>
        {availableCases.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {availableCases.map(caseStudy => {
              const related = isCaseRelated(caseStudy.id)
              return (
                <div
                  key={caseStudy.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    related ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}
                >
                  <span>{getCaseTitle(caseStudy.translations)}</span>
                  {related ? (
                    <Badge variant="secondary">Added</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAdd(caseStudy.id)}
                      disabled={loading || relations.length >= 3}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">No published case studies available.</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/components/admin/__tests__/case-relations-manager.test.tsx`
Expected: PASS

- [ ] **Step 5: 提交代码**

```bash
git add src/components/admin/case-relations-manager.tsx src/components/admin/__tests__/case-relations-manager.test.tsx
git commit -m "feat(components): add case relations manager"
```

---

## 阶段3：Admin页面集成

### Task 3.1: 创建规格管理页面

**Files:**
- Create: `src/app/admin/products/[id]/specs/page.tsx`

- [ ] **Step 1: 创建规格管理页面**

```typescript
// src/app/admin/products/[id]/specs/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { SpecGroupsEditor } from '@/components/admin/spec-groups-editor'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

export default function SpecsPage() {
  const params = useParams()
  const t = useAdminTranslations()
  const [groups, setGroups] = useState<any[]>([])
  const [specs, setSpecs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locale] = useState('en')

  useEffect(() => {
    fetchSpecs()
  }, [params.id])

  const fetchSpecs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${params.id}/spec-groups`)
      const data = await res.json()
      setGroups(data.spec_groups || [])
      setSpecs(data.specs || [])
    } catch (error) {
      console.error('Failed to fetch specs:', error)
    }
    setLoading(false)
  }

  const handleSave = async (newGroups: any[]) => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}/spec-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups: newGroups })
      })

      if (!res.ok) throw new Error('Save failed')
      alert('Groups saved successfully')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save')
    }
  }

  if (loading) return <div>{t('loading')}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('products_page.specs')}</h1>
      <SpecGroupsEditor
        groups={groups}
        specs={specs}
        locale={locale}
        onSave={handleSave}
      />
    </div>
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/admin/products/[id]/specs/page.tsx
git commit -m "feat(pages): add specs management page"
```

---

### Task 3.2: 创建下载管理页面

**Files:**
- Create: `src/app/admin/products/[id]/downloads/page.tsx`

- [ ] **Step 1: 创建下载管理页面**

```typescript
// src/app/admin/products/[id]/downloads/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DownloadsManager } from '@/components/admin/downloads-manager'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

export default function DownloadsPage() {
  const params = useParams()
  const t = useAdminTranslations()
  const [downloads, setDownloads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locale] = useState('en')

  useEffect(() => {
    fetchDownloads()
  }, [params.id])

  const fetchDownloads = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${params.id}/downloads`)
      const data = await res.json()
      setDownloads(data.downloads || [])
    } catch (error) {
      console.error('Failed to fetch downloads:', error)
    }
    setLoading(false)
  }

  if (loading) return <div>{t('loading')}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('products_page.downloads')}</h1>
      <DownloadsManager
        downloads={downloads}
        locale={locale}
        productId={params.id}
      />
    </div>
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/admin/products/[id]/downloads/page.tsx
git commit -m "feat(pages): add downloads management page"
```

---

### Task 3.3: 创建案例关联管理页面

**Files:**
- Create: `src/app/admin/products/[id]/cases/page.tsx`

- [ ] **Step 1: 创建案例关联管理页面**

```typescript
// src/app/admin/products/[id]/cases/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CaseRelationsManager } from '@/components/admin/case-relations-manager'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

export default function CasesPage() {
  const params = useParams()
  const t = useAdminTranslations()
  const [relations, setRelations] = useState<any[]>([])
  const [availableCases, setAvailableCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locale] = useState('en')

  useEffect(() => {
    fetchRelations()
  }, [params.id])

  const fetchRelations = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${params.id}/case-relations`)
      const data = await res.json()
      setRelations(data.relations || [])
      setAvailableCases(data.availableCases || [])
    } catch (error) {
      console.error('Failed to fetch relations:', error)
    }
    setLoading(false)
  }

  if (loading) return <div>{t('loading')}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('products_page.cases')}</h1>
      <CaseRelationsManager
        relations={relations}
        availableCases={availableCases}
        locale={locale}
        productId={params.id}
      />
    </div>
  )
}
```

- [ ] **Step 2: 提交代码**

```bash
git add src/app/admin/products/[id]/cases/page.tsx
git commit -m "feat(pages): add case relations management page"
```

---

## 阶段4：测试与验证

### Task 4.1: 运行完整测试套件

- [ ] **Step 1: 运行所有单元测试**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 2: 运行ESLint检查**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 3: 运行类型检查**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: 构建项目**

Run: `npm run build`
Expected: Build succeeds

---

## 验收检查清单

### 功能验收
- [ ] Admin可以创建/编辑/删除规格组
- [ ] Admin可以上传/管理下载文件
- [ ] Admin可以添加/删除案例关联
- [ ] 规格组支持多语言标签
- [ ] 下载文件支持多语言标题和描述
- [ ] 案例关联限制最多3个

### 质量验收
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 无严重bug
- [ ] 代码通过ESLint检查

---

**计划完成！**