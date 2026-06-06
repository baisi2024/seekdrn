# 合规页面管理功能设计文档

> 创建日期：2026-06-06
> 状态：设计中
> 预计工期：1 天

---

## 一、需求概述

### 1.1 业务需求

实现后台合规页面管理功能，支持：
- 简单的内容编辑（富文本编辑器）
- 多个独立政策页面
- 支持多语言（7种语言）
- ISR 缓存优化性能

### 1.2 政策页面列表

| 政策名称 | section 值 | 前端路由 |
|---------|-----------|---------|
| 出口合规 | `export_compliance` | `/compliance/export` |
| 隐私政策 | `privacy_policy` | `/compliance/privacy` |
| 使用条款 | `terms_of_use` | `/compliance/terms` |
| Cookie 政策 | `cookie_policy` | `/compliance/cookie` |

### 1.3 技术需求

- 使用现有 `footer_content` 表
- 复用 TipTap 富文本编辑器
- 支持多语言（7种语言）
- ISR 缓存优化性能
- 前端动态渲染

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                   后台管理界面                            │
│  /admin/compliance                                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ComplianceManager                               │   │
│  │  ├─ PolicyList (政策页面列表)                     │   │
│  │  └─ PolicyEditor (富文本编辑器)                   │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │    API Routes            │
        │  /api/admin/compliance   │
        │  - GET: 获取政策列表      │
        │  - PUT: 更新政策内容      │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │   Supabase Database      │
        │   footer_content 表      │
        │  - section (政策类型)     │
        │  - translations (多语言)  │
        │  - published (发布状态)   │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │   前端动态渲染            │
│  /[locale]/compliance/[slug]  │
        │  - ISR 缓存             │
        └──────────────────────────┘
```

### 2.2 核心组件

**后台管理组件：**
- `ComplianceManager` - 合规管理主组件
- `PolicyList` - 政策页面列表
- `PolicyEditor` - 富文本编辑器（复用 TipTap）

**前端渲染组件：**
- 复用现有的 `/[locale]/compliance/page.tsx`
- 新增 `/[locale]/compliance/[slug]/page.tsx` 支持多政策页面

### 2.3 数据流

```
管理员操作 → 编辑内容 → API 调用 → 数据库更新
→ ISR 重新验证 → 前端自动更新
```

---

## 三、组件设计

### 3.1 ComplianceManager 组件

**功能：**
- 展示政策页面列表
- 提供编辑入口
- 支持发布/取消发布

**状态管理：**
```typescript
interface ComplianceManagerState {
  policies: PolicyItem[]  // 政策列表
  editingPolicy: PolicyItem | null  // 当前编辑的政策
}

interface PolicyItem {
  id: string
  section: string  // 'export_compliance' | 'privacy_policy' | 'terms_of_use' | 'cookie_policy'
  translations: Record<string, { title?: string; content: string }>  // {en: {content: "..."}, zh: {content: "..."}}
  published: boolean
}
```

**交互流程：**
```
1. 页面加载 → 获取政策列表
2. 点击编辑 → 打开 PolicyEditor 对话框
3. 编辑内容 → 调用 API 更新数据库
4. 切换发布状态 → 调用 API 更新
```

### 3.2 PolicyEditor 组件

**编辑字段：**
1. **政策标题** - 多语言输入
2. **政策内容** - 富文本编辑器
3. **发布状态** - 开关控制

**对话框布局：**
```
┌─────────────────────────────────────┐
│  Edit Policy                  [×]  │
├─────────────────────────────────────┤
│  Policy: Export Compliance         │
│                                     │
│  Title (Multi-language)             │
│  ┌─────┬─────┬─────┬─────┐         │
│  │  EN │  ZH │  AR │ ... │         │
│  └─────┴─────┴─────┴─────┘         │
│  [Export Compliance________]       │
│                                     │
│  Content (Rich Text Editor)         │
│  ┌─────────────────────────────┐   │
│  │ B I U • List • Link • Image │   │
│  ├─────────────────────────────┤   │
│  │                             │   │
│  │  [Content here...]          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Published                          │
│  [====○====] ON                    │
│                                     │
│  [Cancel]              [Save]      │
└─────────────────────────────────────┘
```

### 3.3 富文本编辑器

**复用现有组件：**
- 使用项目已有的 TipTap 编辑器
- 工具栏功能：粗体、斜体、下划线、列表、链接、图片
- 支持 HTML 格式存储

---

## 四、API 设计

### 4.1 API 端点

**基础路径：** `/api/admin/compliance`

| 方法 | 端点 | 功能 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/admin/compliance` | 获取所有政策列表 | - | `{policies: PolicyItem[]}` |
| GET | `/api/admin/compliance/[section]` | 获取单个政策详情 | - | `{policy: PolicyItem}` |
| PUT | `/api/admin/compliance/[section]` | 更新政策内容 | `PolicyUpdate` | `{policy: PolicyItem}` |

### 4.2 请求/响应类型

```typescript
// 政策项
interface PolicyItem {
  id: string
  section: string
  translations: Record<string, { title?: string; content: string }>
  published: boolean
  created_at: string
  updated_at?: string
}

// 更新政策
interface PolicyUpdate {
  translations: Record<string, { title?: string; content: string }>
  published?: boolean
}
```

### 4.3 API 实现逻辑

**GET /api/admin/compliance：**
```typescript
1. 验证管理员权限
2. 定义政策列表（固定的 4 个政策）
3. 从 footer_content 表查询每个政策的数据
4. 合并数据，返回完整列表
```

**PUT /api/admin/compliance/[section]：**
```typescript
1. 验证管理员权限
2. 验证 section 是否有效
3. 更新或插入 footer_content 表
4. 触发 ISR 重新验证
5. 返回更新后的数据
```

### 4.4 错误处理

| 错误场景 | HTTP 状态码 | 错误消息 |
|---------|------------|---------|
| 未授权访问 | 401 | `Unauthorized` |
| 无效的 section | 400 | `Invalid policy section` |
| 政策不存在 | 404 | `Policy not found` |
| 数据库错误 | 500 | `Database error` |

---

## 五、前端动态渲染设计

### 5.1 政策页面路由

**新增路由：** `/[locale]/compliance/[slug]/page.tsx`

**slug 映射：**
```typescript
const POLICY_SLUGS = {
  'export': 'export_compliance',
  'privacy': 'privacy_policy',
  'terms': 'terms_of_use',
  'cookie': 'cookie_policy'
}
```

### 5.2 政策页面组件

**实现方式：**
```typescript
// src/app/[locale]/compliance/[slug]/page.tsx
export default async function PolicyPage({ params }: { params: { locale: string, slug: string } }) {
  const { locale, slug } = params
  const section = POLICY_SLUGS[slug]

  // 从数据库获取政策内容
  const { data: policy } = await supabaseAdmin
    .from('footer_content')
    .select('*')
    .eq('section', section)
    .eq('published', true)
    .maybeSingle()

  // 获取多语言内容
  const title = getTranslation(policy.translations, locale, 'title')
  const content = getTranslation(policy.translations, locale, 'content')

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  )
}
```

### 5.3 ISR 缓存策略

**配置：**
```typescript
// 60秒重新验证
export const revalidate = 60

// 或在 API 中手动触发
import { revalidatePath } from 'next/cache'
revalidatePath('/[locale]/compliance/[slug]', 'page')
```

### 5.4 多语言处理

**翻译文件：**
```json
// messages/en/compliance.json
{
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

### 5.5 导航链接

**在 Footer 中添加政策链接：**
```typescript
// 自动生成政策页面链接
{Object.entries(POLICY_SLUGS).map(([slug, section]) => (
  <Link key={slug} href={`/${locale}/compliance/${slug}`}>
    {t(`compliance.${slug}.title`)}
  </Link>
))}
```

---

## 六、实施计划

### 6.1 开发阶段划分

**Phase 1：API 层（0.3天）**
- 创建 API 端点（GET、PUT）
- 定义政策列表常量
- 实现 ISR 重新验证

**Phase 2：后台管理界面（0.5天）**
- 实现 ComplianceManager 组件
- 实现 PolicyEditor 组件
- 集成富文本编辑器
- 集成到 /admin/compliance 页面

**Phase 3：前端动态渲染（0.2天）**
- 创建政策页面路由
- 实现多语言支持
- 添加导航链接

**总计：约 1 天**

### 6.2 技术依赖

**复用现有依赖：**
- TipTap 富文本编辑器（已在项目中）
- shadcn/ui 组件（Dialog、Button、Switch等）
- Supabase 客户端
- next-intl 多语言

**无需新增依赖**

### 6.3 文件结构

```
src/
├── app/
│   ├── admin/
│   │   └── compliance/
│   │       └── page.tsx              # 更新为管理页面
│   ├── [locale]/
│   │   └── compliance/
│   │       ├── page.tsx              # 保留现有
│   │       └── [slug]/
│   │           └── page.tsx          # 新增政策页面
│   └── api/
│       └── admin/
│           └── compliance/
│               ├── route.ts          # GET 政策列表
│               └── [section]/
│                   └── route.ts      # GET、PUT 单个政策
├── components/
│   └── admin/
│       ├── compliance-manager.tsx    # 合规管理主组件
│       └── policy-editor.tsx         # 政策编辑器
└── lib/
    └── compliance/
        ├── constants.ts              # 政策列表常量
        └── types.ts                  # 类型定义
```

### 6.4 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 富文本编辑器兼容性 | 低 | 复用现有 TipTap |
| ISR 缓存失效 | 低 | 手动触发 revalidatePath |
| 多语言回退 | 低 | 使用现有 getTranslation 工具 |

---

## 七、验收标准

### 7.1 功能验收

- [ ] 管理员可以编辑所有政策页面
- [ ] 支持富文本编辑
- [ ] 支持多语言内容编辑
- [ ] 前端正确渲染政策页面
- [ ] ISR 缓存正常工作

### 7.2 技术验收

- [ ] 所有 API 端点正常工作
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 构建成功

### 7.3 用户体验验收

- [ ] 富文本编辑器功能完整
- [ ] 多语言切换正确
- [ ] 页面加载快速

---

**文档版本：v1.0**
**最后更新：2026-06-06**
