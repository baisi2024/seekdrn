# 子项目 1：修复断裂 + 分布式转化

> 状态：待审核
> 日期：2026-06-08
> 范围：前端 + 数据库 + API，不涉及后台管理 UI 改造

---

## 1. 目标

让现有转化路径不再断裂，用户在任意详情页产生购买意向后，能在当前上下文完成转化动作，无需跳回首页。

---

## 2. 修复清单

### 2.1 合规页 slug 不匹配（P0）

**问题**：合规总览页 `POLICY_ITEMS` 中 slug 为 `export-compliance` / `privacy-policy` / `terms-of-use` / `cookie-policy`，但 `compliance/constants.ts` 中 `POLICIES` 的 slug 为 `export` / `privacy` / `terms` / `cookie`，点击卡片将 404。

**方案**：统一 `POLICY_ITEMS` 中的链接 slug 与 `POLICY_SLUG_MAP` 的 key 一致。

**修改文件**：
- `src/app/[locale]/compliance/page.tsx`：POLICY_ITEMS 的 href 改为 `/compliance/${POLICIES[i].slug}`

**验证**：点击合规总览页 4 个卡片，均能正确跳转到对应政策详情页。

---

### 2.2 mission 参数未处理（P0）

**问题**：MissionSelector 生成 `?mission=xxx` 链接，但 products 页面 searchParams 只读 `cat/tags/q`，mission 参数被完全忽略。

**方案**：在产品列表页读取 `mission` 参数，映射到对应的标签筛选。

**映射关系**（硬编码在 i18n 或常量中）：

```text
border-security    → tags: surveillance, long-range
infrastructure     → tags: inspection, long-endurance
emergency-response → tags: rapid-deployment, search-rescue
mapping-survey     → tags: mapping, high-precision
counter-uas        → category: cuas
public-safety      → tags: surveillance, rapid-deployment
```

**修改文件**：
- `src/lib/constants/mission-mapping.ts`（新建）：mission slug → { category?, tags[] } 映射
- `src/app/[locale]/products/page.tsx`：读取 searchParams.mission，合并到筛选条件
- `src/components/public/mission-selector.tsx`：确认链接格式为 `/products?mission=xxx`

**验证**：从首页点击任一 mission，产品列表页自动筛选出对应产品，且筛选条件在 UI 上可见。

---

### 2.3 所有 CTA 跳转首页（P0）

**问题**：产品详情/方案/案例的转化按钮全部指向 `/{locale}#demo-form`（首页锚点），用户跳出当前上下文。

**方案**：改为上下文感知的转化路径。

#### 产品详情页

- 主 CTA "Request Quote" → 打开页内转化表单（InlineLeadForm），自动携带产品型号和 intent=quote
- 次 CTA "Download Datasheet" → 直接触发下载 + GTM 事件
- 次 CTA "Schedule Demo" → 打开页内转化表单，intent=demo
- ProcurementPackCTA → 打开页内转化表单，intent=datasheet
- 底部 CTA → 打开页内转化表单

#### 解决方案详情页

- CTA "Talk to our team" → 打开页内转化表单，携带 solution slug 和 intent=quote
- CTA "View products" → 保留跳转到产品列表

#### 案例详情页

- CTA "Request similar solution" → 打开页内转化表单，携带 case slug 和 intent=quote

#### 新增组件：InlineLeadForm

```text
位置：页面底部或 CTA 触发的模态框
功能：
- 3 步轻表单（同 DemoForm 的多意图逻辑）
- 自动携带来源上下文（product_model / solution_slug / case_slug）
- 自动携带 intent（quote / demo / datasheet / compliance / partnership）
- 提交到 /api/demo-request，source_page 和 intent 自动填充
- GTM 事件追踪
- 合规审查（复用现有逻辑）

两种展示模式：
1. 页内嵌入（产品详情页底部）
2. 模态框（由 CTA 按钮触发）
```

**修改文件**：
- `src/components/public/inline-lead-form.tsx`（新建）
- `src/components/public/cta-link.tsx`：支持 `openForm` 模式
- `src/app/[locale]/products/[model]/page.tsx`：CTA 改为页内表单
- `src/app/[locale]/solutions/[slug]/page.tsx`：CTA 改为页内表单
- `src/app/[locale]/case-studies/[slug]/page.tsx`：CTA 改为页内表单

**验证**：从产品详情页点击 Request Quote，表单在当前页内打开，产品型号自动填充，提交成功后 GTM 事件触发。

---

### 2.4 下载追踪未接入 GTM（P1）

**问题**：产品详情页 DownloadsSection 未调用 `trackDatasheetDownload`，GTM 事件已定义但未接入。

**方案**：在下载链接点击时调用 `trackDatasheetDownload`。

**修改文件**：
- `src/features/products/components/public/product-gallery/` 或下载相关组件
- 产品详情页的 DownloadsSection

**验证**：点击下载链接，GTM Debug 中出现 `datasheet_download` 事件。

---

### 2.5 product_documents 与 product_downloads 合并（P1）

**问题**：两张表功能高度重叠，数据分散。

**方案**：

1. 保留 `product_documents`（类型更丰富：manual/datasheet/certificate/brochure/other）
2. 将 `product_downloads` 的数据迁移到 `product_documents`
3. 前台统一从 `product_documents` 读取
4. 后台统一管理 `product_documents`
5. 添加数据库迁移：将 product_downloads 的 type 映射到 product_documents 的 type

**迁移映射**：
```text
product_downloads.type  →  product_documents.type
manual                  →  manual
datasheet               →  datasheet
certificate             →  certificate
media                   →  other
```

**修改文件**：
- `supabase/migrations/014_merge_downloads_to_documents.sql`（新建）
- `src/app/api/downloads/[id]/route.ts`：改为查询 product_documents
- 产品详情页：统一使用 product_documents 数据
- 后台产品编辑页：统一使用 documents tab

**验证**：迁移后，前台下载功能正常，后台文档管理正常。

---

## 3. 数据库变更

### 3.1 新增 solution_products 关联表

```sql
CREATE TABLE solution_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (solution_id, product_id)
);

ALTER TABLE solution_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view solution products"
  ON solution_products FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM solutions WHERE solutions.id = solution_products.solution_id AND solutions.published = true
  ));

CREATE POLICY "Admins have full access to solution products"
  ON solution_products FOR ALL
  USING (auth.jwt()->>'role' = 'admin');
```

### 3.2 新增 solution_cases 关联表

```sql
CREATE TABLE solution_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  case_study_id uuid NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  sort_order int NOT NULL DEFAULT 0,
  UNIQUE (solution_id, case_study_id)
);

ALTER TABLE solution_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view solution cases"
  ON solution_cases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM solutions WHERE solutions.id = solution_cases.solution_id AND solutions.published = true
  ));

CREATE POLICY "Admins have full access to solution cases"
  ON solution_cases FOR ALL
  USING (auth.jwt()->>'role' = 'admin');
```

### 3.3 inquiries 表增加字段

```sql
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS product_interest text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS intent text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS locale text;
```

### 3.4 faqs 表增加 category 字段

```sql
ALTER TABLE faqs ADD COLUMN IF NOT EXISTS category text;
```

### 3.5 修复 product_specs RLS

```sql
DROP POLICY IF EXISTS "Public read product_specs" ON product_specs;

CREATE POLICY "Public read product_specs for published products"
  ON product_specs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products WHERE products.id = product_specs.product_id AND products.published = true
  ));
```

### 3.6 合并 product_downloads 到 product_documents

```sql
-- 迁移数据
INSERT INTO product_documents (product_id, type, translations, file_url, file_size, file_type, language, sort_order)
SELECT
  pd.product_id,
  CASE pd.type
    WHEN 'media' THEN 'other'
    ELSE pd.type
  END,
  pd.title AS translations,
  pd.file_url,
  pd.file_size,
  pd.file_type,
  pd.language,
  pd.sort_order
FROM product_downloads pd
WHERE NOT EXISTS (
  SELECT 1 FROM product_documents pdoc
  WHERE pdoc.product_id = pd.product_id
    AND pdoc.file_url = pd.file_url
);

-- 不删除 product_downloads 表，保留兼容期，后台迁移完成后在子项目2中清理
```

---

## 4. API 变更

### 4.1 /api/demo-request 增强

现有 POST 接口增加字段支持：

```text
新增请求字段：
- phone: string (optional)
- product_interest: string (optional) - 产品型号或方案 slug
- intent: string (optional) - quote/demo/datasheet/compliance/partnership
- utm_source: string (optional)
- utm_medium: string (optional)
- utm_campaign: string (optional)
- locale: string (optional) - 用户当前语言

这些字段写入 inquiries 表对应列。
```

### 4.2 新增 /api/admin/solution-products

```text
GET  /api/admin/solution-products?solution_id=xxx  - 获取方案关联产品
POST /api/admin/solution-products                   - 添加方案产品关联
DELETE /api/admin/solution-products/[id]             - 删除关联
```

### 4.3 新增 /api/admin/solution-cases

```text
GET  /api/admin/solution-cases?solution_id=xxx  - 获取方案关联案例
POST /api/admin/solution-cases                   - 添加方案案例关联
DELETE /api/admin/solution-cases/[id]             - 删除关联
```

---

## 5. 前端页面变更

### 5.1 产品详情页

```text
变更：
1. Hero CTA 改为触发 InlineLeadForm（非跳转首页）
2. ProcurementDecisionBar CTA 改为触发 InlineLeadForm
3. ProcurementPackCTA CTA 改为触发 InlineLeadForm
4. DownloadsSection 接入 GTM trackDatasheetDownload
5. 底部增加 InlineLeadForm 页内嵌入
6. RelatedProducts 使用 product_relations 的 related_product 类型
```

### 5.2 解决方案详情页

```text
变更：
1. 查询 solution_products 和 solution_cases 关联数据
2. 新增"推荐产品"模块（RelatedProductsSection）
3. 新增"相关案例"模块（RelatedCasesSection）
4. CTA 改为触发 InlineLeadForm
5. 底部增加 InlineLeadForm 页内嵌入
```

### 5.3 案例详情页

```text
变更：
1. 查询 product_case_relations 获取关联产品
2. 新增"使用产品"模块（ProductsUsedSection）
3. CTA 改为触发 InlineLeadForm
4. 底部增加 InlineLeadForm 页内嵌入
```

### 5.4 案例列表页

```text
变更：
1. 新增行业筛选器
2. 新增国家筛选器
3. 空状态增加 CTA 引导
```

### 5.5 合规总览页

```text
变更：
1. 修复 POLICY_ITEMS slug 与 POLICY_SLUG_MAP 不匹配
```

### 5.6 产品列表页

```text
变更：
1. 读取 mission searchParam 并映射到筛选条件
2. 筛选条件 UI 显示 mission 名称
3. 空状态增加 CTA 引导
```

---

## 6. 新增组件

### 6.1 InlineLeadForm

```text
类型：客户端组件 ('use client')
位置：src/components/public/inline-lead-form.tsx

Props：
- mode: 'inline' | 'modal'
- defaultIntent?: 'quote' | 'demo' | 'datasheet' | 'compliance' | 'partnership'
- productModel?: string
- solutionSlug?: string
- caseSlug?: string
- locale: string

功能：
- 3 步轻表单（同 DemoForm 逻辑）
  Step 1: 选择意图（默认选中 defaultIntent）
  Step 2: 项目背景（公司/国家/应用场景）
  Step 3: 联系方式（姓名/邮箱/电话/留言）
- 自动携带来源上下文
- 提交到 /api/demo-request
- GTM 事件追踪
- 合规审查（复用现有逻辑）
- 成功状态展示
```

### 6.2 ProductsUsedSection

```text
类型：服务端组件
位置：src/components/public/products-used-section.tsx

Props：
- productIds: string[]

功能：
- 查询关联产品
- 展示产品卡片列表
- 每个卡片带"查看详情"和"询价"CTA
```

### 6.3 RelatedProductsSection（复用/增强现有）

```text
增强现有 related-products 组件：
- 支持从 product_relations 的 related_product 类型读取
- 支持从 solution_products 读取
- 卡片带"询价"CTA
```

### 6.4 RelatedCasesSection（复用/增强现有）

```text
增强现有 related-cases 组件：
- 支持从 solution_cases 读取
- 卡片带"查看案例"CTA
```

---

## 7. GTM 事件增强

### 7.1 新增事件

```typescript
// 下载追踪
trackDatasheetDownload({ product_model, document_type, locale })

// 页内表单
trackInlineFormOpen({ page_type, intent, product_model, solution_slug, case_slug, locale })
trackInlineFormSubmitStart({ page_type, intent, locale })
trackInlineFormSubmitSuccess({ page_type, intent, product_model, locale })
```

### 7.2 现有事件补充参数

```typescript
// CTA 点击增加 context 参数
trackCTAClick({ location, action, page_type, product_model, solution_slug, case_slug })
```

---

## 8. 多语言文案

### 8.1 需要新增的翻译键

```text
common.json:
- inline_form.title
- inline_form.step1_title
- inline_form.step2_title
- inline_form.step3_title
- inline_form.success_title
- inline_form.success_message
- inline_form.intent_quote
- inline_form.intent_demo
- inline_form.intent_datasheet
- inline_form.intent_compliance
- inline_form.intent_partnership
- inline_form.phone_label
- inline_form.message_label
- inline_form.product_interest_label
- inline_form.submit_button

products.json:
- products.used_in_case
- products.related_products_title
- products.request_quote_for_product

solutions.json:
- solutions.recommended_products
- solutions.related_cases
- solutions.talk_to_team

case-studies.json:
- case_studies.products_used
- case_studies.request_similar
- case_studies.filter_industry
- case_studies.filter_country
- case_studies.no_results_cta

compliance.json:
- 修复 slug 相关文案（如有）
```

### 8.2 覆盖语言

zh / en / ar / es / fr / id / pt（前台 7 种语言）

---

## 9. 不做的事

- 不改后台管理 UI（子项目 2）
- 不做产品对比功能（子项目 3）
- 不做 ROI 计算器（子项目 3）
- 不做社交分享（子项目 3）
- 不做分页/无限滚动（子项目 3）
- 不改导航/页脚结构（已在前次升级中处理）
- 不引入新 CMS 或推荐算法
- 不改 Supabase 项目配置或 RLS 全局策略

---

## 10. 验证清单

- [ ] 合规总览页 4 个政策卡片均能正确跳转
- [ ] 首页 MissionSelector 点击后产品列表自动筛选
- [ ] 产品详情页 Request Quote 打开页内表单，产品型号自动填充
- [ ] 产品详情页 Download Datasheet 触发 GTM 事件
- [ ] 解决方案详情页展示关联产品和案例
- [ ] 案例详情页展示关联产品
- [ ] 案例列表页行业/国家筛选正常
- [ ] InlineLeadForm 3 步提交成功，数据写入 inquiries
- [ ] InlineLeadForm 合规审查正常（黑名单国家触发 review_required）
- [ ] GTM 事件在 Debug 模式下可见
- [ ] 7 种语言文案完整
- [ ] npm run typecheck 通过
- [ ] npm run check:arch 通过
- [ ] npm run test:run 通过
