# SeekDrone 海外独立站完整设计规格

> 日期：2026-06-06
> 状态：待审核
> 基于：独立站架构.md v3.0 + design-spec.md

---

## 设计决策摘要

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 设计风格 | 蓝色专业风（DJI Enterprise 风格） | 浅色背景可读性高，蓝色=信任/专业 |
| 后台风格 | shadcn/ui 默认主题 | 不做额外定制，节省开发时间 |
| 内容管理 | 全量 Supabase + 种子数据 | 所有内容可编辑，初始数据通过 xlsx→SQL 自动导入 |
| 飞书集成 | 邮件先行，飞书后续 | 询盘通知用邮件代替，降低初期复杂度 |
| 产品数据 | xlsx 导入种子脚本 | 30 个产品有完整英文数据，脚本自动生成 SQL |

---

## 1. 项目结构与路由

```
seekdrn/
├── src/
│   ├── app/
│   │   ├── [locale]/                    # 公开页面 (next-intl)
│   │   │   ├── page.tsx                 # 首页
│   │   │   ├── products/
│   │   │   │   ├── page.tsx             # 产品列表
│   │   │   │   └── [model]/page.tsx     # 产品详情
│   │   │   ├── solutions/
│   │   │   │   └── [slug]/page.tsx      # 方案详情
│   │   │   ├── case-studies/
│   │   │   │   ├── page.tsx             # 案例列表
│   │   │   │   └── [id]/page.tsx        # 案例详情
│   │   │   ├── compliance/page.tsx      # 合规政策
│   │   │   └── layout.tsx               # 公开页布局（Nav+Footer）
│   │   ├── admin/                       # 后台管理（Supabase Auth 保护）
│   │   │   ├── layout.tsx               # 后台布局（侧边栏）
│   │   │   ├── page.tsx                 # 仪表盘
│   │   │   ├── login/page.tsx           # 登录页
│   │   │   ├── inquiries/page.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx             # 产品列表
│   │   │   │   └── [id]/page.tsx        # 产品编辑
│   │   │   ├── case-studies/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── solutions/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── navigation/page.tsx
│   │   │   ├── footer/page.tsx
│   │   │   ├── compliance/page.tsx
│   │   │   ├── email-templates/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── media/page.tsx
│   │   ├── api/
│   │   │   ├── demo-request/route.ts
│   │   │   ├── upload/route.ts
│   │   │   └── admin/
│   │   │       └── send-test-email/route.ts
│   │   └── layout.tsx                   # 根布局
│   ├── components/
│   │   ├── ui/                          # shadcn/ui 组件
│   │   ├── public/                      # 公开页组件
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── product-card.tsx
│   │   │   ├── case-card.tsx
│   │   │   ├── trust-bar.tsx
│   │   │   ├── demo-form.tsx
│   │   │   ├── language-switcher.tsx
│   │   │   └── rich-text-renderer.tsx
│   │   └── admin/                       # 后台组件
│   │       ├── sidebar.tsx
│   │       ├── data-table.tsx
│   │       ├── rich-editor.tsx          # TipTap
│   │       ├── image-upload.tsx
│   │       ├── translation-tabs.tsx     # 多语言Tab
│   │       ├── variable-toolbar.tsx     # 邮件变量插入
│   │       ├── specs-editor.tsx         # 产品参数表格
│   │       └── metrics-editor.tsx       # 指标卡片
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts               # 浏览器端 (anon key)
│   │   │   ├── server.ts               # 服务端 (anon key + cookies)
│   │   │   └── admin.ts                # Service Role (仅服务端)
│   │   ├── r2.ts                        # R2 上传/删除/URL
│   │   ├── email.ts                     # Resend + 模板
│   │   ├── compliance.ts               # 合规筛查
│   │   └── utils.ts
│   ├── i18n/
│   │   ├── request.ts                   # next-intl 配置
│   │   └── routing.ts                   # 路由配置
│   └── middleware.ts
├── messages/                            # next-intl 翻译文件
│   ├── en/
│   │   ├── common.json
│   │   ├── home.json
│   │   ├── products.json
│   │   ├── solutions.json
│   │   ├── case-studies.json
│   │   ├── compliance.json
│   │   ├── footer.json
│   │   └── admin.json
│   ├── ar/  (同结构，RTL)
│   ├── es/
│   ├── fr/
│   ├── pt/
│   ├── id/
│   └── zh/
├── supabase/
│   ├── migrations/                      # 数据库迁移
│   └── seed/                            # 种子数据脚本
│       ├── import_products.py           # xlsx → SQL
│       ├── products.sql
│       ├── site_settings.sql
│       ├── navigation.sql
│       ├── footer_content.sql
│       ├── email_templates.sql
│       └── solutions.sql
├── public/
│   └── fonts/
└── docs/
```

**关键设计决策：**

- 公开页面用 `SSG + ISR (revalidate: 60)`，后台页面用 CSR
- 产品详情用 `model` 而非 `id` 作为 URL 参数（SEO 友好）
- 后台路由不经过 `[locale]`，使用独立的 `admin.json` 翻译文件
- Supabase 客户端三种模式：浏览器端（anon key）、服务端（anon key + cookies）、管理员（service role key）

---

## 2. 数据库设计

### 2.1 核心表

```sql
-- 产品
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('uav','payload','cuas','ground_control')),
  sub_category text,
  specs jsonb DEFAULT '{}',
  translations jsonb DEFAULT '{}',
  images text[],
  datasheet_url text,
  compliance_flag boolean DEFAULT false,
  featured boolean DEFAULT false,
  published boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 产品参数（从 xlsx 参数拆为独立行）
CREATE TABLE product_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label jsonb NOT NULL DEFAULT '{}',
  value jsonb NOT NULL DEFAULT '{}',
  sort_order int DEFAULT 0
);

-- 案例
CREATE TABLE case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  industry text NOT NULL,
  country text,
  translations jsonb DEFAULT '{}',
  results jsonb,
  images text[],
  video_url text,
  client_quote jsonb DEFAULT '{}',
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 解决方案
CREATE TABLE solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  icon text,
  translations jsonb DEFAULT '{}',
  metrics jsonb,
  published boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 询盘
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  application_interest text NOT NULL,
  source_page text,
  compliance_status text DEFAULT 'pending'
    CHECK (compliance_status IN ('pending','approved','review_required','blocked')),
  sales_person text,
  follow_up_status text DEFAULT 'pending'
    CHECK (follow_up_status IN ('pending','contacted','demo_scheduled','won','lost')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 导航栏
CREATE TABLE navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position text NOT NULL CHECK (position IN ('header','footer')),
  parent_id uuid REFERENCES navigation(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  link_type text NOT NULL CHECK (link_type IN ('internal','external','none')),
  url text,
  translations jsonb NOT NULL DEFAULT '{}',
  published boolean DEFAULT true
);

-- Footer 内容区块
CREATE TABLE footer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  translations jsonb NOT NULL DEFAULT '{}',
  published boolean DEFAULT true
);

-- 邮件模板
CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  description text,
  translations jsonb NOT NULL DEFAULT '{}',
  available_variables text[],
  is_active boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- 站点设置（单行记录）
CREATE TABLE site_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name jsonb,
  seo_description jsonb,
  contact_email text,
  contact_whatsapp text,
  compliance_notice text,
  hero_config jsonb,
  enabled_languages text[] DEFAULT ARRAY['en','ar','es','fr','pt','id'],
  enable_chinese boolean DEFAULT false,
  enable_chinese_by_ip boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- 媒体文件
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text,
  r2_key text UNIQUE,
  mime_type text,
  size int,
  alt_text jsonb DEFAULT '{}',
  uploaded_at timestamptz DEFAULT now()
);
```

### 2.2 与架构文档的差异

1. `products` 表增加 `slug` 字段（URL 友好），`model` 保留为产品型号
2. `case_studies` 表增加 `slug` 字段
3. 新增 `product_specs` 表——将参数从 JSONB 拆为独立行，便于后台表格化编辑
4. `site_settings` 改为 `CHECK (id = 1)` 约束，确保只有一条记录
5. 所有表增加 `updated_at` 字段，支持 ISR 增量刷新
6. 增加 `featured`、`sort_order` 字段，支持首页推荐和排序

### 2.3 translations 字段统一格式

所有表的多语言字段结构一致：

```json
{
  "en": { "name": "SeekEagle X7", "desc": "Industrial multi-rotor..." },
  "ar": { "name": "...", "desc": "..." },
  "es": { "name": "...", "desc": "..." }
}
```

缺失翻译时回退到英语。

---

## 3. API 与后端逻辑

### 3.1 API 路由清单

| 路由 | 方法 | 认证 | 用途 |
|------|------|------|------|
| `/api/demo-request` | POST | 无 | 提交询盘 |
| `/api/upload` | POST | Admin | 上传文件至 R2 |
| `/api/admin/send-test-email` | POST | Admin | 测试发送邮件 |

其余后台 CRUD 操作直接通过 Supabase 客户端完成（利用 RLS 保护），不走自定义 API。

### 3.2 Demo 请求流程

```
用户提交表单
    │
    ▼
Zod 校验 (full_name, company, email, country, application_interest)
    │
    ▼
compliance.screen(country, application_interest)
    │
    ├── blocked → 返回 403，不存储数据
    │
    ├── review_required → 写入 inquiries (compliance_status: 'review_required')
    │                     → 发送内部通知邮件给合规团队 (compliance@seekdrn.com)
    │                     → 发送感谢邮件给客户
    │
    └── approved → 写入 inquiries (compliance_status: 'approved')
                  → 发送内部通知邮件给销售团队 (sales@seekdrn.com)
                  → 发送感谢邮件给客户
```

### 3.3 合规筛查逻辑

```typescript
// lib/compliance.ts
const BLOCKED_COUNTRIES = ['North Korea', 'Iran', 'Syria', 'Cuba', 'Russia']

export function screen(country: string, application: string): ComplianceStatus {
  if (BLOCKED_COUNTRIES.includes(country)) return 'blocked'
  if (application === 'C-UAS' || application === 'Counter-Drone Defense') return 'review_required'
  return 'approved'
}
```

### 3.4 邮件服务

```typescript
// lib/email.ts
sendTemplateEmail(templateKey, to, language, variables)
  1. 从 email_templates 表获取 is_active=true 的模板
  2. 提取 translations[language]，回退到 translations['en']
  3. 正则替换 {{variable}} → 实际值
  4. Resend API 发送
```

初始邮件模板（种子数据）：
- `demo_request_thank_you` — 询盘感谢信
- `demo_request_internal` — 内部销售通知
- `compliance_review_internal` — 合规审查通知

邮件变量参考：`{{full_name}}`, `{{company}}`, `{{email}}`, `{{country}}`, `{{application_interest}}`, `{{source_page}}`, `{{current_year}}`

### 3.5 R2 文件上传

```typescript
// lib/r2.ts
uploadToR2(key, body, contentType) → PutObjectCommand
deleteFromR2(key) → DeleteObjectCommand
getPublicUrl(key) → `https://cdn.seekdrn.com/${key}`
```

上传路径规范：
- 产品图片：`products/{model}/{index}.webp`
- 案例素材：`cases/{slug}/{index}.webp`
- Hero 背景：`hero/background.mp4` / `hero/poster.jpg`
- 数据表 PDF：`datasheets/{model}.pdf`
- 通用媒体：`media/{yyyy-mm}/{uuid}.{ext}`

### 3.6 后台数据操作模式

后台管理界面直接使用 Supabase JS 客户端操作数据，不经过自定义 API：

- 列表/详情/编辑/删除：使用 Server Actions 调用 Supabase
- 图片上传：Server Action → R2 upload → 写入 media 表 → 返回 URL
- 富文本中的图片：TipTap 自定义扩展 → 调用同一个上传 Server Action

---

## 4. 前端公开页面设计

### 4.1 首页 (`/[locale]/page.tsx`)

从上到下：

1. **Navbar** — sticky，白色 95% + backdrop-blur，Logo | Products Solutions Cases Support | Language Switcher | [Request Demo]
2. **Hero 区** — 两列网格，左列产品实拍图 4:3 + 播放按钮 + NEW 徽章，右列分类标签(mono) + 标题 H1(4xl-5xl) + 描述 + 性能指标×3(进度条) + CTA 双按钮。后台可配置背景视频/图片、多语言标题/副标题
3. **信任条** — 深色 bg-gray-900，4列网格，IBM Plex Mono 蓝色数字：50,000+ Flight Hours | 120 Countries | 500+ Enterprise Clients | 24/7 Support
4. **产品中心** — 按类别分组（UAV/Payload/C-UAS/GCS），每类 3 个 featured 产品，卡片：图片+分类+标题+描述+3项规格+Learn More，hover translateY(-4px)+shadow
5. **行业方案** — 5 个卡片（公共安全/能源/测绘/环保/反制），硬朗线框风格
6. **精选案例** — 3列，视频 16:9 + 行业/地区标签 + 标题 + 量化成果卡片
7. **CTA 区** — 蓝色渐变背景，"Ready to See Our Solutions in Action?" + [Request a Demo]
8. **Demo 表单** — 4字段(Full Name/Company/Email/Country) + Application Interest(select) + Submit
9. **Footer** — 后台可编辑，4列布局，合规声明

### 4.2 产品详情页 (`/[locale]/products/[model]`)

1. 产品 Hero — 左：图片轮播(主图+缩略图)，右：型号标签+名称+概述+[Request Demo]+[Download Spec]
2. 参数表 — product_specs 表渲染，两列表格 Label|Value，IBM Plex Mono
3. 核心优势 — translations.advantages
4. 核心能力 — translations.capabilities
5. 应用场景 — translations.applications
6. 关联案例 — 同行业案例
7. CTA + Footer

**特殊规则：** compliance_flag=true 的产品（反制设备）不公开详细参数，仅显示能力概述，CTA 改为 "Inquire for Assessment"

### 4.3 案例详情页 (`/[locale]/case-studies/[slug]`)

1. 案例 Hero — 视频/图片 + 行业/地区标签
2. 客户背景 — translations.background
3. 挑战 — translations.challenge
4. 解决方案 — translations.solution
5. 量化成果 — results JSONB → 指标卡片网格
6. 客户评价 — client_quote
7. 现场素材 — images 图片画廊
8. 关联产品
9. CTA + Footer

### 4.4 方案页 (`/[locale]/solutions/[slug]`)

1. 方案 Hero — 图标 + 标题
2. Challenge — translations.challenge
3. Solution — translations.solution
4. Workflow — translations.workflow，步骤卡片
5. Key Metrics — metrics JSONB → 指标卡片
6. 关联案例 — 同行业案例
7. CTA: Request a Demo（自动带入行业标签）+ Footer

### 4.5 合规政策页 (`/[locale]/compliance`)

1. 合规政策内容 — footer_content 或专用表，多语言富文本
2. Footer

### 4.6 共享组件

| 组件 | 说明 |
|------|------|
| `Navbar` | sticky，白色半透明，语言切换器，移动端汉堡菜单 |
| `Footer` | 后台可编辑，4列布局 |
| `Hero` | 首页专用，后台配置视频/图片+多语言文案 |
| `ProductCard` | 图片+分类+标题+描述+3项规格，hover 上浮 |
| `CaseCard` | 视频+标签+标题+量化成果 |
| `TrustBar` | 深色背景，4个指标，Mono 字体 |
| `DemoForm` | 4字段+行业选择，Zod 校验，提交动画 |
| `LanguageSwitcher` | 下拉菜单，显示 enabled_languages，中文条件显示 |
| `RichTextRenderer` | DOMPurify 清洗 + dangerouslySetInnerHTML |

---

## 5. 后台管理系统

### 5.1 认证

- Supabase Auth 邮箱/密码登录
- `middleware.ts` 保护 `/admin/*` 路径，未认证重定向至 `/admin/login`
- 登录页独立于后台布局，shadcn/ui 默认主题
- Session 通过 Supabase cookies 管理（SSR 兼容）

### 5.2 布局

左侧固定侧边栏 + 顶部栏（SeekDrone Admin | 用户名 | 退出）+ 主内容区

侧边栏菜单：仪表盘、询盘、产品、案例、方案、导航、Footer、合规、邮件模板、设置、媒体库

### 5.3 各模块功能

**仪表盘 (`/admin`)**
- 今日新增询盘数、待处理数、合规待审数
- 最近 5 条询盘列表

**询盘管理 (`/admin/inquiries`)**
- 数据表格：姓名、公司、国家、行业、合规状态、跟进状态、时间
- 筛选：按合规状态、跟进状态、日期范围
- 详情页：完整信息 + 更新跟进状态 + 添加备注
- compliance_status=review_required 的记录高亮

**产品管理 (`/admin/products`)**
- 列表：型号、分类、发布状态、合规标记
- 编辑页：基础信息(model/slug/category/sub_category) + 多语言Tab(name/overview/advantages/capabilities/applications) + 参数表(可增删行，每行 label/value 多语言) + 图片上传(拖拽，排序) + 数据表PDF上传 + 合规标记/推荐/发布开关

**案例管理 (`/admin/case-studies`)**
- 列表：标题、行业、国家、发布状态
- 编辑页：基础信息(slug/industry/country) + 多语言Tab(background/challenge/solution/results_desc 富文本) + 量化成果(可增删指标卡片) + 客户评价(多语言) + 图片/视频上传 + 推荐/发布开关

**方案编辑 (`/admin/solutions`)**
- 列表：slug、标题、发布状态
- 编辑页：基础信息(slug/icon) + 多语言Tab(title/challenge/solution/workflow 富文本) + 关键指标(可增删) + 发布开关

**导航管理 (`/admin/navigation`)**
- 树形结构展示，拖拽排序
- 每个节点：位置(header/footer)、父级、链接类型、URL、多语言标签、发布开关

**Footer 管理 (`/admin/footer`)**
- 按 section 分区编辑，多语言富文本

**合规页面 (`/admin/compliance`)**
- 多语言富文本编辑合规政策内容

**邮件模板 (`/admin/email-templates`)**
- 列表：模板标识、描述、激活状态、更新时间
- 编辑页：多语言Tab(每语言：主题+正文HTML) + TipTap 富文本+源码视图 + 变量工具栏(点击插入{{variable}}) + 预览(示例数据渲染) + 测试发送(输入邮箱，调用API)

**站点设置 (`/admin/settings`)**
- 站点名称(多语言) + SEO描述(多语言) + 联系邮箱/WhatsApp
- Hero 区装修：背景类型选择(视频/图片) + 素材上传(直传R2，即时预览) + 多语言标题/副标题/CTA文案
- 前台语言开关：多选框(en/ar/es/fr/pt/id)
- 中文开关：enable_chinese + enable_chinese_by_ip

**媒体库 (`/admin/media`)**
- 网格视图，按类型筛选(图片/视频/PDF)，删除(同时删R2+数据库)，点击复制公共URL

### 5.4 共享后台组件

| 组件 | 说明 |
|------|------|
| `Sidebar` | 固定侧边栏导航 |
| `DataTable` | 通用数据表格，排序/筛选/分页 |
| `TranslationTabs` | 多语言 Tab 切换 |
| `RichEditor` | TipTap 富文本编辑器，支持图片上传至 R2 |
| `ImageUpload` | 拖拽上传，预览，排序，R2 直传 |
| `VariableToolbar` | 邮件模板变量插入工具栏 |
| `SpecsEditor` | 产品参数表格编辑器（可增删行） |
| `MetricsEditor` | 指标卡片编辑器（可增删） |

---

## 6. 多语言与中间件

### 6.1 next-intl 配置

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ['en', 'ar', 'es', 'fr', 'pt', 'id', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
})
```

### 6.2 翻译文件

翻译文件只存放 UI 固定文案（按钮文字、表单标签、错误提示、页面标题模板等）。产品/案例/方案的具体内容由数据库 translations 字段提供。

### 6.3 RTL 支持（阿拉伯语）

- `<html dir="rtl" lang="ar">` — 通过 layout.tsx 动态设置
- Tailwind `rtl:` 前缀处理布局镜像
- 组件级注意：Navbar 菜单顺序翻转、DemoForm 标签对齐翻转、箭头图标方向翻转、进度条方向翻转

### 6.4 中间件逻辑

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. /admin 路径：只做认证检查，不经过 intl
  if (pathname.startsWith('/admin')) {
    return handleAdminAuth(request)
  }

  // 2. 中文条件显示
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const country = request.headers.get('cf-ipcountry') || ''
  const settings = await getSiteSettings() // 缓存 TTL 5min

  if (!(settings.enable_chinese || (settings.enable_chinese_by_ip && country === 'CN'))) {
    // 中文未启用，/zh 路由重定向到 /en
    if (pathname.startsWith('/zh')) {
      return NextResponse.redirect(new URL('/en' + pathname.slice(3), request.url))
    }
  }

  // 3. next-intl 路由处理
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

### 6.5 语言切换器行为

1. 显示 `site_settings.enabled_languages` 中的语言
2. 中文仅在 `enable_chinese=true` 时显示
3. 用户选择后写入 `NEXT_LOCALE` cookie，覆盖自动检测
4. 阿拉伯语选项显示 "العربية"（本地名称）

### 6.6 数据库多语言回退策略

```typescript
// lib/i18n-utils.ts
export function getTranslation(
  translations: Record<string, any>,
  locale: string,
  field: string
): string {
  return translations[locale]?.[field]
    || translations['en']?.[field]
    || ''
}
```

---

## 7. RLS 策略

```sql
-- 公开表：匿名可读（仅已发布）
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON products FOR SELECT USING (published = true);

ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON product_specs FOR SELECT USING (true);

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON case_studies FOR SELECT USING (published = true);

ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON solutions FOR SELECT USING (published = true);

ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON navigation FOR SELECT USING (published = true);

ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON footer_content FOR SELECT USING (published = true);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON site_settings FOR SELECT USING (true);

-- 询盘：匿名可插入，仅管理员可读/更新
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anonymous insert" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read" ON inquiries FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin update" ON inquiries FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- 管理表：仅认证管理员可读写
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all" ON email_templates FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin all" ON media FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

后台读取未发布内容时使用 service_role key 绕过 RLS。

---

## 8. GTM 与数据跟踪

```typescript
// app/layout.tsx
import { GoogleTagManager } from '@next/third-parties/google'
<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
```

自定义事件：

| 事件名 | 触发时机 | 数据 |
|--------|---------|------|
| `cta_click` | CTA 按钮点击 | `{button_location, button_text}` |
| `demo_form_submit` | 表单校验通过 | `{country, application}` |
| `demo_request_success` | API 返回 200 | `{compliance_status}` |
| `datasheet_download` | 下载规格书 | `{product_model}` |

---

## 9. 种子数据策略

**产品数据：** xlsx → Python 脚本 → SQL INSERT

```python
# supabase/seed/import_products.py
# 读取 products_en.xlsx
# 解析每个产品的 model, category, specs, translations.en
# 生成 INSERT INTO products / product_specs 语句
# 输出到 supabase/seed/products.sql
```

其他种子数据：
- `site_settings.sql` — 默认站点配置
- `navigation.sql` — 默认导航菜单
- `footer_content.sql` — 默认 Footer 内容
- `email_templates.sql` — 3 个默认邮件模板
- `solutions.sql` — 5 个行业方案

翻译处理：xlsx 中只有英文内容，其他语言翻译后续通过后台编辑器逐步补充，缺失时回退英语。

---

## 10. 部署架构

```
用户浏览器 (全球)
      │
      ▼
Cloudflare (DNS / CDN / DDoS)
   │
   ├─ cdn.seekdrn.com → R2 公共访问
   │
   └─ seekdrn.com → Vercel
          │
          ▼
   Next.js 15 (App Router)
   ├─ 公开页面: SSG + ISR (revalidate: 60)
   ├─ 后台页面: CSR + Server Actions
   └─ API Routes
          │
          ├── Supabase (数据库 + Auth)
          └── Resend (事务邮件)
```

### 环境变量

| 变量 | 用途 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 管理员 Key（仅服务端） |
| `R2_ENDPOINT` | Cloudflare R2 端点 |
| `R2_ACCESS_KEY_ID` | R2 访问 Key |
| `R2_SECRET_ACCESS_KEY` | R2 密钥 |
| `R2_BUCKET` | R2 存储桶名称 |
| `R2_PUBLIC_URL` | R2 公共访问 URL |
| `RESEND_API_KEY` | Resend API Key |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager ID |

### 性能目标

| 指标 | 目标 | 策略 |
|------|------|------|
| LCP | < 2.5s | 图片 WebP + srcset，字体 preconnect |
| FID | < 100ms | 代码分割，动态导入 |
| CLS | < 0.1 | 图片尺寸预留，字体 swap |
| TTI | < 3.8s | ISR 缓存，最小化客户端 JS |

---

## 11. 视觉规格

### 配色系统

```css
--primary: #2563eb;
--primary-hover: #1d4ed8;
--bg-white: #ffffff;
--bg-gray-50: #f8fafc;
--bg-gray-100: #f1f5f9;
--bg-gray-900: #0f172a;
--text-primary: #111827;
--text-secondary: #4b5563;
--text-muted: #6b7280;
--border: #e5e7eb;
```

### 字体系统

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
font-family: 'IBM Plex Mono', 'Consolas', monospace; /* 数据/参数 */
```

### 响应式断点

- sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
- 导航：移动端汉堡菜单
- Hero：移动端单列
- 产品网格：移动端单列，平板双列，桌面三列
- 表单：移动端单列，桌面双列
