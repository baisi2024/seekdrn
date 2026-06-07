# SeekDrone 开发规范

## 项目架构

### 语言支持

#### 后台管理系统
- **语言**：中文 (zh) + 英文 (en)
- **翻译文件位置**：
  - `messages/zh/admin.json`
  - `messages/en/admin.json`
- **使用方式**：
  ```typescript
  import { useAdminTranslations } from '@/hooks/use-admin-translations'

  const t = useAdminTranslations()
  <h1>{t('products_page.title')}</h1>
  ```

#### 独立站前端
- **语言**：7种语言
  - 中文 (zh)
  - 英文 (en)
  - 阿拉伯语 (ar)
  - 西班牙语 (es)
  - 法语 (fr)
  - 印尼语 (id)
  - 葡萄牙语 (pt)
- **翻译文件位置**：`messages/{locale}/*.json`
- **路由结构**：`/[locale]/...`

## 核心技术规范

### 1. 客户端/服务端架构（🔴 CRITICAL）

**规则**：客户端组件不能使用服务端专属的 `supabaseAdmin`

**检测条件**：
- 文件有 `'use client'` 指令
- 导入了 `supabaseAdmin` 或使用它的函数

**解决方案**：

#### 方案 A：API Route（推荐管理后台）
```typescript
// src/app/api/admin/tags/route.ts
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data } = await supabaseAdmin.from('tags').select('*')
  return NextResponse.json(data)
}

// 客户端组件
'use client'

const res = await fetch('/api/admin/tags')
const data = await res.json()
```

#### 方案 B：客户端 Supabase（需要权限控制）
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient() // 受 RLS 保护
const { data } = await supabase.from('tags').select('*')
```

#### 方案 C：服务端组件（只读场景）
```typescript
// 移除 'use client'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function Page() {
  const { data } = await supabaseAdmin.from('tags').select('*')
  return <List data={data} />
}
```

**自动检测**：
```bash
npm run check:arch  # 自动检测架构违规
```

### 2. 环境变量配置

**规则**：使用延迟初始化模式，不在模块加载时验证

**正确示例**：
```typescript
let adminClient: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing environment variables')
  }

  adminClient = createClient(supabaseUrl, supabaseServiceKey)
  return adminClient
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdmin()
    const value = client[prop as keyof SupabaseClient]
    return typeof value === 'function' ? value.bind(client) : value
  }
})
```

**错误示例**：
```typescript
// ❌ 错误：模块加载时立即验证
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient(url, key)
```

### 3. 国际化规范

**后台管理**：
- 所有文本必须使用 `useAdminTranslations`
- 翻译键必须在 `messages/zh/admin.json` 和 `messages/en/admin.json` 中定义

**前端**：
- 使用 `next-intl` 进行国际化
- 所有页面必须在 `/[locale]/` 路由下
- 支持7种语言切换

### 4. UI 设计规范

**使用设计系统变量**：
```
bg-gray-100  → bg-muted
text-gray-500 → text-muted-foreground
border-gray-200 → border-border
```

**禁止硬编码颜色**：
```typescript
// ❌ 错误
<div className="bg-gray-100 text-gray-500">

// ✅ 正确
<div className="bg-muted text-muted-foreground">
```

## 功能开发规范

### 前后台关联原则

**新增功能时**：
1. ✅ 后台：创建管理页面（支持中英文）
2. ✅ API：创建 API Route（如果需要 admin 权限）
3. ✅ 前端：创建展示页面（支持7种语言）
4. ✅ 数据库：添加必要的表和字段
5. ✅ 翻译：添加所有语言的翻译键

**修改功能时**：
1. ✅ 同步修改前后台
2. ✅ 更新所有语言的翻译
3. ✅ 测试所有语言版本
4. ✅ 更新 API 文档（如有）

**删除功能时**：
1. ✅ 删除后台管理页面
2. ✅ 删除前端展示页面
3. ✅ 删除 API Route
4. ✅ 清理数据库（谨慎操作）
5. ✅ 删除所有语言的翻译键

### 开发流程

**开发前**：
```bash
npm run check:arch  # 检查架构违规
```

**开发中**：
1. 遵循客户端/服务端架构规则
2. 使用设计系统变量
3. 添加所有语言的翻译
4. 实现错误处理

**开发后**：
```bash
npm run typecheck  # 类型检查
npm run lint       # 代码检查
npm run check:arch # 架构检查
```

## 自动检测

项目已集成自动检测脚本：

```bash
# 架构检测
npm run check:arch

# 自动运行（已配置 hooks）
npm run dev    # 开发前自动检测
npm run build  # 构建前自动检测
```

## 常见问题

### Q: 为什么客户端组件不能用 supabaseAdmin？

A: `supabaseAdmin` 使用 `SUPABASE_SERVICE_ROLE_KEY`，拥有完全数据库权限。在客户端暴露会导致严重安全漏洞。

### Q: 如何选择方案？

A:
- 管理后台操作 → API Route
- 需要用户权限 → 客户端 Supabase
- 只读展示 → 服务端组件

### Q: 翻译键命名规范？

A: 使用语义化命名：`{page}.{feature}.{item}`
```json
{
  "products_page": {
    "title": "产品管理",
    "add": "添加产品",
    "edit": "编辑产品"
  }
}
```

## 相关文档

- [架构规则详解](/docs/ARCHITECTURE_RULES.md)
- [环境变量配置](/docs/ENV_SETUP.md)
- [数据库结构](/docs/DATABASE_SETUP.md)

## 更新日志

- 2026-06-07: 合并规则文件，简化规范
- 2026-06-07: 添加客户端/服务端架构规则
- 2026-06-07: 明确前后台关联原则
