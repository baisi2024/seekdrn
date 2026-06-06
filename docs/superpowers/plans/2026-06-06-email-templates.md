# 邮件模板功能完善实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的邮件模板管理功能，包括 CRUD 界面、预览、测试发送、历史记录和变量验证。

**Architecture:** 采用 Next.js App Router 架构，使用 Supabase 作为数据库，Resend 作为邮件发送服务。前端使用 React 组件和 shadcn/ui，后端使用 API Routes。数据流：管理界面 → API Routes → Supabase/Resend → 日志记录。

**Tech Stack:** Next.js 14, React, TypeScript, Supabase, Resend API, shadcn/ui, Tailwind CSS, Jest/Vitest

---

## 文件结构映射

### 新建文件

**数据库迁移:**
- `supabase/migrations/003_email_logs.sql` - 创建 email_logs 表和索引

**API 路由:**
- `src/app/api/admin/email-templates/route.ts` - 模板 CRUD API
- `src/app/api/admin/email-templates/[key]/route.ts` - 单个模板操作
- `src/app/api/admin/email-templates/[key]/preview/route.ts` - 预览 API
- `src/app/api/admin/email-templates/[key]/test-send/route.ts` - 测试发送 API
- `src/app/api/admin/email-logs/route.ts` - 历史记录 API
- `src/app/api/admin/email-logs/[id]/route.ts` - 单条记录详情 API

**管理界面:**
- `src/app/admin/email-templates/page.tsx` - 模板列表页
- `src/app/admin/email-templates/[key]/page.tsx` - 模板编辑页
- `src/app/admin/email-logs/page.tsx` - 历史记录列表页
- `src/app/admin/email-logs/[id]/page.tsx` - 邮件详情页

**组件:**
- `src/components/admin/email-templates-table.tsx` - 模板列表表格
- `src/components/admin/template-form.tsx` - 模板编辑表单
- `src/components/admin/preview-panel.tsx` - 预览面板
- `src/components/admin/variable-validator.tsx` - 变量验证组件
- `src/components/admin/email-logs-table.tsx` - 历史记录表格

**工具函数:**
- `src/lib/email-helpers.ts` - 邮件相关工具函数（变量提取、验证等）

**测试:**
- `src/lib/__tests__/email-helpers.test.ts` - 工具函数单元测试
- `src/app/api/admin/email-templates/__tests__/route.test.ts` - API 集成测试

### 修改文件

- `src/lib/email.ts` - 添加邮件发送日志记录功能
- `supabase/migrations/002_rls_policies.sql` - 添加 email_logs 的 RLS 策略

---

## 任务分解

### Task 1: 数据库迁移 - 创建 email_logs 表

**Files:**
- Create: `supabase/migrations/003_email_logs.sql`

- [ ] **Step 1: 创建迁移文件**

创建 `supabase/migrations/003_email_logs.sql`:

```sql
-- 003_email_logs.sql
-- Email sending history logs

-- ============================================
-- email_logs
-- ============================================
CREATE TABLE email_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key    text NOT NULL,
  recipient_email text NOT NULL,
  language        text NOT NULL,
  subject         text NOT NULL,
  body_html       text NOT NULL,
  variables       jsonb DEFAULT '{}',
  status          text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message   text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_template_key ON email_logs(template_key);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);

-- ============================================
-- updated_at trigger
-- ============================================
CREATE TRIGGER set_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

- [ ] **Step 2: 运行迁移脚本**

Run: `npm run db:migrate`
Expected: Migration successful

- [ ] **Step 3: 验证表创建**

Run: `npm run db:verify`
Expected: email_logs table exists with correct schema

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_email_logs.sql
git commit -m "feat: add email_logs table for tracking email sending history"
```

---

### Task 2: 添加 RLS 策略

**Files:**
- Modify: `supabase/migrations/002_rls_policies.sql`

- [ ] **Step 1: 添加 email_logs 的 RLS 策略**

在 `supabase/migrations/002_rls_policies.sql` 文件末尾添加:

```sql
-- ============================================
-- email_logs RLS policies
-- ============================================
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email logs"
  ON email_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

- [ ] **Step 2: 运行迁移脚本**

Run: `npm run db:migrate`
Expected: RLS policies applied successfully

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_rls_policies.sql
git commit -m "feat: add RLS policies for email_logs table"
```

---

### Task 3: 创建邮件工具函数

**Files:**
- Create: `src/lib/email-helpers.ts`
- Create: `src/lib/__tests__/email-helpers.test.ts`

- [ ] **Step 1: 编写变量提取函数测试**

创建 `src/lib/__tests__/email-helpers.test.ts`:

```typescript
import { extractVariables, validateVariables } from '../email-helpers'

describe('extractVariables', () => {
  it('should extract variables from template', () => {
    const content = 'Hello {{name}}, your email is {{email}}'
    expect(extractVariables(content)).toEqual(['name', 'email'])
  })

  it('should return empty array when no variables', () => {
    const content = 'Hello world'
    expect(extractVariables(content)).toEqual([])
  })

  it('should handle duplicate variables', () => {
    const content = 'Hello {{name}}, welcome {{name}}'
    expect(extractVariables(content)).toEqual(['name'])
  })
})

describe('validateVariables', () => {
  it('should return valid when all variables are available', () => {
    const result = validateVariables(
      'Hello {{name}}',
      ['name', 'email']
    )
    expect(result.valid).toBe(true)
    expect(result.missing).toEqual([])
  })

  it('should detect missing variables', () => {
    const result = validateVariables(
      'Hello {{name}}',
      ['email']
    )
    expect(result.valid).toBe(false)
    expect(result.missing).toEqual(['name'])
  })

  it('should detect unused variables', () => {
    const result = validateVariables(
      'Hello {{name}}',
      ['name', 'email', 'company']
    )
    expect(result.unused).toEqual(['email', 'company'])
  })
})
```

- [ ] **Step 2: 运行测试验证失败**

Run: `npm test src/lib/__tests__/email-helpers.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: 实现工具函数**

创建 `src/lib/email-helpers.ts`:

```typescript
/**
 * 从模板内容中提取变量名
 * @param content 模板内容
 * @returns 变量名数组
 */
export function extractVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g
  const variables = new Set<string>()
  let match
  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1])
  }
  return Array.from(variables)
}

/**
 * 验证模板中使用的变量是否在允许列表中
 * @param content 模板内容
 * @param availableVariables 允许的变量列表
 * @returns 验证结果
 */
export function validateVariables(
  content: string,
  availableVariables: string[]
): { valid: boolean; missing: string[]; unused: string[] } {
  const used = extractVariables(content)
  const missing = used.filter(v => !availableVariables.includes(v))
  const unused = availableVariables.filter(v => !used.includes(v))
  return {
    valid: missing.length === 0,
    missing,
    unused
  }
}

/**
 * 替换模板中的变量
 * @param content 模板内容
 * @param variables 变量值
 * @returns 替换后的内容
 */
export function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}
```

- [ ] **Step 4: 运行测试验证通过**

Run: `npm test src/lib/__tests__/email-helpers.test.ts`
Expected: PASS - all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/email-helpers.ts src/lib/__tests__/email-helpers.test.ts
git commit -m "feat: add email helper functions for variable extraction and validation"
```

---

### Task 4: 修改邮件发送函数添加日志记录

**Files:**
- Modify: `src/lib/email.ts`

- [ ] **Step 1: 修改 sendTemplateEmail 函数**

修改 `src/lib/email.ts` 中的 `sendTemplateEmail` 函数:

```typescript
import { Resend } from 'resend'
import { supabaseAdmin } from './supabase/admin'
import { replaceVariables } from './email-helpers'

let resend: Resend | null = null

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not set. Email sending will be skipped.')
      return null
    }
    resend = new Resend(apiKey)
  }
  return resend
}

export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  language: string,
  variables: Record<string, string>
) {
  const resendClient = getResend()
  if (!resendClient) {
    console.log('Email sending skipped: RESEND_API_KEY not configured')
    return
  }

  // 获取模板
  const { data: template } = await supabaseAdmin
    .from('email_templates')
    .select('translations, is_active')
    .eq('template_key', templateKey)
    .eq('is_active', true)
    .maybeSingle()

  let subject = 'Thank you from SeekDrone'
  let html = '<p>Thank you for your request.</p>'

  if (template) {
    const t = template.translations[language] || template.translations['en']
    if (t) {
      subject = t.subject
      html = t.body_html
    }
  }

  // 替换变量
  subject = replaceVariables(subject, variables)
  html = replaceVariables(html, variables)

  // 准备日志记录
  const logEntry = {
    template_key: templateKey,
    recipient_email: to,
    language,
    subject,
    body_html: html,
    variables,
    status: 'pending' as const,
  }

  try {
    // 发送邮件
    const result = await resendClient.emails.send({
      from: 'SeekDrone <noreply@seekdrn.com>',
      to,
      subject,
      html,
    })

    // 记录成功
    await supabaseAdmin.from('email_logs').insert({
      ...logEntry,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return result
  } catch (error: any) {
    // 记录失败
    await supabaseAdmin.from('email_logs').insert({
      ...logEntry,
      status: 'failed',
      error_message: error.message || 'Unknown error',
    })

    throw error
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email.ts
git commit -m "feat: add email sending history logging to sendTemplateEmail"
```

---

### Task 5: 创建邮件模板 CRUD API

**Files:**
- Create: `src/app/api/admin/email-templates/route.ts`
- Create: `src/app/api/admin/email-templates/[key]/route.ts`

- [ ] **Step 1: 创建模板列表 API**

创建 `src/app/api/admin/email-templates/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - 获取所有模板列表
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - 创建新模板
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template_key, description, translations, available_variables } = body

    // 验证必填字段
    if (!template_key || !translations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 验证 template_key 格式
    if (!/^[a-z0-9_]+$/.test(template_key)) {
      return NextResponse.json(
        { error: 'template_key must only contain lowercase letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .insert({
        template_key,
        description,
        translations,
        available_variables: available_variables || [],
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 创建单个模板操作 API**

创建 `src/app/api/admin/email-templates/[key]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET - 获取单个模板详情
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('template_key', params.key)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PUT - 更新模板
export async function PUT(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json()
    const { description, translations, available_variables, is_active } = body

    const { data, error } = await supabaseAdmin
      .from('email_templates')
      .update({
        description,
        translations,
        available_variables,
        is_active,
      })
      .eq('template_key', params.key)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - 删除模板
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('email_templates')
      .delete()
      .eq('template_key', params.key)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/email-templates/route.ts src/app/api/admin/email-templates/[key]/route.ts
git commit -m "feat: add email templates CRUD API routes"
```

---

### Task 6: 创建预览和测试发送 API

**Files:**
- Create: `src/app/api/admin/email-templates/[key]/preview/route.ts`
- Create: `src/app/api/admin/email-templates/[key]/test-send/route.ts`

- [ ] **Step 1: 创建预览 API**

创建 `src/app/api/admin/email-templates/[key]/preview/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { replaceVariables } from '@/lib/email-helpers'

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json()
    const { language, variables } = body

    // 获取模板
    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .select('translations')
      .eq('template_key', params.key)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // 获取指定语言的内容
    const t = template.translations[language] || template.translations['en']
    if (!t) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      )
    }

    // 替换变量
    const subject = replaceVariables(t.subject, variables || {})
    const body_html = replaceVariables(t.body_html, variables || {})

    return NextResponse.json({
      subject,
      body_html,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to preview template' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 创建测试发送 API**

创建 `src/app/api/admin/email-templates/[key]/test-send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { replaceVariables } from '@/lib/email-helpers'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const body = await request.json()
    const { test_email, language, variables } = body

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(test_email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // 获取模板
    const { data: template, error } = await supabaseAdmin
      .from('email_templates')
      .select('translations')
      .eq('template_key', params.key)
      .single()

    if (error || !template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // 获取指定语言的内容
    const t = template.translations[language] || template.translations['en']
    if (!t) {
      return NextResponse.json(
        { error: 'Translation not found' },
        { status: 404 }
      )
    }

    // 替换变量
    const subject = replaceVariables(t.subject, variables || {})
    const body_html = replaceVariables(t.body_html, variables || {})

    // 发送测试邮件
    const result = await resend.emails.send({
      from: 'SeekDrone <noreply@seekdrn.com>',
      to: test_email,
      subject: `[TEST] ${subject}`,
      html: body_html,
    })

    // 记录到日志
    await supabaseAdmin.from('email_logs').insert({
      template_key: params.key,
      recipient_email: test_email,
      language,
      subject: `[TEST] ${subject}`,
      body_html,
      variables: variables || {},
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message_id: result.data?.id,
    })
  } catch (error: any) {
    // 记录失败日志
    await supabaseAdmin.from('email_logs').insert({
      template_key: params.key,
      recipient_email: request.json().then(b => b.test_email),
      language: request.json().then(b => b.language),
      subject: '',
      body_html: '',
      variables: {},
      status: 'failed',
      error_message: error.message || 'Unknown error',
    })

    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/email-templates/[key]/preview/route.ts src/app/api/admin/email-templates/[key]/test-send/route.ts
git commit -m "feat: add email template preview and test-send API routes"
```

---

### Task 7: 创建邮件历史记录 API

**Files:**
- Create: `src/app/api/admin/email-logs/route.ts`
- Create: `src/app/api/admin/email-logs/[id]/route.ts`

- [ ] **Step 1: 创建历史记录列表 API**

创建 `src/app/api/admin/email-logs/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const status = searchParams.get('status')
    const template_key = searchParams.get('template_key')

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) {
      query = query.eq('status', status)
    }

    if (template_key) {
      query = query.eq('template_key', template_key)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      total: count,
      page,
      pageSize,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email logs' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 创建单条记录详情 API**

创建 `src/app/api/admin/email-logs/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('email_logs')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Email log not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch email log' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/email-logs/route.ts src/app/api/admin/email-logs/[id]/route.ts
git commit -m "feat: add email logs API routes"
```

---

### Task 8: 创建模板列表页面

**Files:**
- Create: `src/components/admin/email-templates-table.tsx`
- Modify: `src/app/admin/email-templates/page.tsx`

- [ ] **Step 1: 创建模板列表表格组件**

创建 `src/components/admin/email-templates-table.tsx`:

```typescript
'use client'

import { DataTable } from './data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface EmailTemplate {
  id: string
  template_key: string
  description: string | null
  is_active: boolean
  updated_at: string
}

const columns: ColumnDef<EmailTemplate>[] = [
  {
    accessorKey: 'template_key',
    header: 'Template Key',
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active')
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updated_at'))
      return date.toLocaleDateString()
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const template = row.original
      return (
        <div className="flex gap-2">
          <Link href={`/admin/email-templates/${template.template_key}`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
        </div>
      )
    },
  },
]

interface EmailTemplatesTableProps {
  data: EmailTemplate[]
}

export function EmailTemplatesTable({ data }: EmailTemplatesTableProps) {
  return <DataTable columns={columns} data={data} />
}
```

- [ ] **Step 2: 更新模板列表页面**

修改 `src/app/admin/email-templates/page.tsx`:

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EmailTemplatesTable } from '@/components/admin/email-templates-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function EmailTemplatesPage() {
  const { data: templates } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Link href="/admin/email-templates/new">
          <Button>New Template</Button>
        </Link>
      </div>
      <EmailTemplatesTable data={templates || []} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/email-templates-table.tsx src/app/admin/email-templates/page.tsx
git commit -m "feat: add email templates list page"
```

---

### Task 9: 创建模板编辑页面

**Files:**
- Create: `src/components/admin/template-form.tsx`
- Create: `src/components/admin/preview-panel.tsx`
- Create: `src/components/admin/variable-validator.tsx`
- Create: `src/app/admin/email-templates/[key]/page.tsx`

- [ ] **Step 1: 创建变量验证组件**

创建 `src/components/admin/variable-validator.tsx`:

```typescript
'use client'

import { validateVariables } from '@/lib/email-helpers'
import { Badge } from '@/components/ui/badge'

interface VariableValidatorProps {
  content: string
  availableVariables: string[]
}

export function VariableValidator({ content, availableVariables }: VariableValidatorProps) {
  const result = validateVariables(content, availableVariables)

  if (result.valid && result.unused.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <Badge variant="default" className="bg-green-500">
          Valid
        </Badge>
        <p className="mt-2 text-sm text-green-700">
          All variables are properly defined.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      {!result.valid && (
        <div className="mb-2">
          <Badge variant="destructive">Missing Variables</Badge>
          <p className="mt-1 text-sm text-red-700">
            {result.missing.join(', ')}
          </p>
        </div>
      )}
      {result.unused.length > 0 && (
        <div>
          <Badge variant="secondary">Unused Variables</Badge>
          <p className="mt-1 text-sm text-yellow-700">
            {result.unused.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 创建预览面板组件**

创建 `src/components/admin/preview-panel.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PreviewPanelProps {
  templateKey: string
  availableVariables: string[]
}

export function PreviewPanel({ templateKey, availableVariables }: PreviewPanelProps) {
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<{ subject: string; body_html: string } | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [language, setLanguage] = useState('en')

  const handlePreview = async () => {
    const response = await fetch(`/api/admin/email-templates/${templateKey}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, variables }),
    })
    const data = await response.json()
    setPreview(data)
  }

  const handleTestSend = async () => {
    await fetch(`/api/admin/email-templates/${templateKey}/test-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_email: testEmail, language, variables }),
    })
    alert('Test email sent!')
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Language</Label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full border rounded p-2"
        >
          <option value="en">English</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {availableVariables.map((varName) => (
        <div key={varName}>
          <Label>{varName}</Label>
          <Input
            value={variables[varName] || ''}
            onChange={(e) =>
              setVariables({ ...variables, [varName]: e.target.value })
            }
            placeholder={`Enter ${varName}`}
          />
        </div>
      ))}

      <Button onClick={handlePreview}>Preview</Button>

      {preview && (
        <div className="border p-4 rounded">
          <h3 className="font-bold">{preview.subject}</h3>
          <div
            className="mt-2"
            dangerouslySetInnerHTML={{ __html: preview.body_html }}
          />
        </div>
      )}

      <div className="border-t pt-4">
        <Label>Test Email Address</Label>
        <Input
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="test@example.com"
        />
        <Button onClick={handleTestSend} className="mt-2">
          Send Test Email
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 创建模板表单组件**

创建 `src/components/admin/template-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { VariableValidator } from './variable-validator'

interface TemplateFormProps {
  template?: any
  onSave: (data: any) => void
}

export function TemplateForm({ template, onSave }: TemplateFormProps) {
  const [templateKey, setTemplateKey] = useState(template?.template_key || '')
  const [description, setDescription] = useState(template?.description || '')
  const [availableVariables, setAvailableVariables] = useState<string[]>(
    template?.available_variables || []
  )
  const [translations, setTranslations] = useState(
    template?.translations || { en: { subject: '', body_html: '' } }
  )
  const [isActive, setIsActive] = useState(template?.is_active ?? true)

  const handleSave = () => {
    onSave({
      template_key: templateKey,
      description,
      available_variables: availableVariables,
      translations,
      is_active: isActive,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Template Key</Label>
        <Input
          value={templateKey}
          onChange={(e) => setTemplateKey(e.target.value)}
          placeholder="welcome_email"
          disabled={!!template}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description of this email template"
        />
      </div>

      <div>
        <Label>Available Variables (comma-separated)</Label>
        <Input
          value={availableVariables.join(', ')}
          onChange={(e) =>
            setAvailableVariables(
              e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
            )
          }
          placeholder="name, email, company"
        />
      </div>

      <div>
        <Label>Active</Label>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* English Translation */}
      <div className="border p-4 rounded">
        <h3 className="font-bold mb-4">English</h3>
        <div className="space-y-4">
          <div>
            <Label>Subject</Label>
            <Input
              value={translations.en?.subject || ''}
              onChange={(e) =>
                setTranslations({
                  ...translations,
                  en: { ...translations.en, subject: e.target.value },
                })
              }
            />
          </div>
          <div>
            <Label>Body HTML</Label>
            <Textarea
              value={translations.en?.body_html || ''}
              onChange={(e) =>
                setTranslations({
                  ...translations,
                  en: { ...translations.en, body_html: e.target.value },
                })
              }
              rows={10}
            />
            <VariableValidator
              content={`${translations.en?.subject || ''} ${translations.en?.body_html || ''}`}
              availableVariables={availableVariables}
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave}>Save Template</Button>
    </div>
  )
}
```

- [ ] **Step 4: 创建模板编辑页面**

创建 `src/app/admin/email-templates/[key]/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TemplateForm } from '@/components/admin/template-form'
import { PreviewPanel } from '@/components/admin/preview-panel'

export default function EmailTemplateEditPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.key === 'new') {
      setLoading(false)
      return
    }

    fetch(`/api/admin/email-templates/${params.key}`)
      .then((res) => res.json())
      .then((data) => {
        setTemplate(data.data)
        setLoading(false)
      })
  }, [params.key])

  const handleSave = async (data: any) => {
    const url =
      params.key === 'new'
        ? '/api/admin/email-templates'
        : `/api/admin/email-templates/${params.key}`

    const method = params.key === 'new' ? 'POST' : 'PUT'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      router.push('/admin/email-templates')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">
          {params.key === 'new' ? 'New Template' : 'Edit Template'}
        </h1>
        <TemplateForm template={template} onSave={handleSave} />
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">Preview & Test</h2>
        {template && (
          <PreviewPanel
            templateKey={template.template_key}
            availableVariables={template.available_variables}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/variable-validator.tsx src/components/admin/preview-panel.tsx src/components/admin/template-form.tsx src/app/admin/email-templates/[key]/page.tsx
git commit -m "feat: add email template edit page with preview and validation"
```

---

### Task 10: 创建邮件历史记录页面

**Files:**
- Create: `src/components/admin/email-logs-table.tsx`
- Create: `src/app/admin/email-logs/page.tsx`
- Create: `src/app/admin/email-logs/[id]/page.tsx`

- [ ] **Step 1: 创建历史记录表格组件**

创建 `src/components/admin/email-logs-table.tsx`:

```typescript
'use client'

import { DataTable } from './data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export interface EmailLog {
  id: string
  template_key: string
  recipient_email: string
  language: string
  status: string
  sent_at: string | null
  created_at: string
}

const columns: ColumnDef<EmailLog>[] = [
  {
    accessorKey: 'recipient_email',
    header: 'Recipient',
  },
  {
    accessorKey: 'template_key',
    header: 'Template',
  },
  {
    accessorKey: 'language',
    header: 'Language',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status')
      const variant =
        status === 'sent'
          ? 'default'
          : status === 'failed'
          ? 'destructive'
          : 'secondary'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'sent_at',
    header: 'Sent At',
    cell: ({ row }) => {
      const sentAt = row.getValue('sent_at')
      if (!sentAt) return '-'
      return new Date(sentAt as string).toLocaleString()
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const log = row.original
      return (
        <Link href={`/admin/email-logs/${log.id}`}>
          <Button size="sm" variant="outline">
            View
          </Button>
        </Link>
      )
    },
  },
]

interface EmailLogsTableProps {
  data: EmailLog[]
}

export function EmailLogsTable({ data }: EmailLogsTableProps) {
  return <DataTable columns={columns} data={data} />
}
```

- [ ] **Step 2: 创建历史记录列表页面**

创建 `src/app/admin/email-logs/page.tsx`:

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'
import { EmailLogsTable } from '@/components/admin/email-logs-table'

export default async function EmailLogsPage() {
  const { data: logs } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Email Logs</h1>
      <EmailLogsTable data={logs || []} />
    </div>
  )
}
```

- [ ] **Step 3: 创建邮件详情页面**

创建 `src/app/admin/email-logs/[id]/page.tsx`:

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export default async function EmailLogDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: log } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!log) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Email Log Detail</h1>

      <div className="space-y-4">
        <div>
          <strong>Template:</strong> {log.template_key}
        </div>
        <div>
          <strong>Recipient:</strong> {log.recipient_email}
        </div>
        <div>
          <strong>Language:</strong> {log.language}
        </div>
        <div>
          <strong>Status:</strong> {log.status}
        </div>
        <div>
          <strong>Sent At:</strong>{' '}
          {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
        </div>
        {log.error_message && (
          <div>
            <strong>Error:</strong> {log.error_message}
          </div>
        )}

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Subject</h2>
          <p>{log.subject}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Body</h2>
          <div
            className="border p-4 rounded"
            dangerouslySetInnerHTML={{ __html: log.body_html }}
          />
        </div>

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Variables</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(log.variables, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/email-logs-table.tsx src/app/admin/email-logs/page.tsx src/app/admin/email-logs/[id]/page.tsx
git commit -m "feat: add email logs pages for viewing email sending history"
```

---

## 自检清单

### 1. Spec 覆盖度检查

✅ **数据模型设计**: Task 1 创建 email_logs 表
✅ **RLS 策略**: Task 2 添加 RLS 策略
✅ **变量验证功能**: Task 3 实现变量提取和验证函数
✅ **邮件发送记录**: Task 4 修改 sendTemplateEmail 函数
✅ **CRUD API**: Task 5 实现模板 CRUD API
✅ **预览功能**: Task 6 实现预览 API
✅ **测试发送功能**: Task 6 实现测试发送 API
✅ **历史记录 API**: Task 7 实现历史记录 API
✅ **管理界面**: Task 8-10 实现所有管理页面

### 2. 占位符检查

✅ 无 TBD、TODO 或其他占位符
✅ 所有步骤包含完整代码
✅ 所有文件路径明确

### 3. 类型一致性检查

✅ `extractVariables` 函数签名一致
✅ `validateVariables` 函数签名一致
✅ `replaceVariables` 函数签名一致
✅ API 路由参数一致
✅ 组件 props 类型一致

---

## 执行选项

计划已完成并保存到 `docs/superpowers/plans/2026-06-06-email-templates.md`。

**两种执行方式:**

1. **Subagent-Driven (推荐)** - 每个任务派发一个新的子 agent，任务间进行审查，快速迭代
2. **Inline Execution** - 在当前会话中执行，批量执行 + 检查点审查

**你选择哪种方式？**
