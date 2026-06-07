# SeekDrone 独立站前端完善 — 设计文档

**日期**: 2026-06-08  
**状态**: 已确认

---

## 1. 概述

完善 SeekDrone 独立站前端，实现前后端数据完全联通、SEO/GEO/GTM 基础设施、首页设计重构、UI 品质升级。

## 2. 数据架构

### 2.1 新建表

**faqs 表**
```sql
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translations JSONB NOT NULL DEFAULT '{}',  -- { "en": { "question": "...", "answer": "..." }, "zh": {...} }
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**site_content 表**
```sql
CREATE TABLE site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section VARCHAR NOT NULL,          -- 'about', 'advantages', 'hero', 'trust_bar', 'cta'
  key VARCHAR NOT NULL,              -- 区块内唯一键
  translations JSONB DEFAULT '{}',   -- 多语言内容
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section, key)
);
```

### 2.2 扩展 site_settings 表

新增字段：
- `trust_bar_config` JSONB — `{ "stats": [{ "label": {...}, "value": "50,000+" }] }`
- `cta_config` JSONB — `{ "title": {...}, "subtitle": {...}, "button_text": {...} }`
- `seo_metadata` JSONB — `{ "default_title": {...}, "default_description": {...}, "og_image": "..." }`
- `gtm_id` TEXT — Google Tag Manager container ID
- `about_config` JSONB — 首页 About 区块配置
- `advantages_config` JSONB — 首页 Advantages 区块配置

### 2.3 数据流

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Supabase   │────▶│ supabaseAdmin │────▶│ Server     │
│  Database   │     │ (server-only) │     │ Components │
└─────────────┘     └──────────────┘     └────────────┘
                                               │
                                               ▼
                                        ┌────────────┐
                                        │  Client    │
                                        │  (RSC      │
                                        │  payload)  │
                                        └────────────┘
```

所有数据通过 `supabaseAdmin` 在服务端组件中读取，客户端组件通过 props 接收数据。无客户端 Supabase 数据请求。

## 3. 首页模块设计

### 3.1 模块顺序

```
Hero → TrustBar → Products → Solutions → Cases → CTA → DemoForm → FAQ
```

### 3.2 各模块数据源

| 模块 | 数据源 | 说明 |
|------|--------|------|
| Hero | `site_settings.hero_config` | 标题、副标题、图片、分类、指标 |
| TrustBar | `site_settings.trust_bar_config` | 统计数字（飞行小时、国家数、客户数等） |
| Products | `products` 表 (featured=true) | 按分类分组展示，带分类筛选 |
| Solutions | `solutions` 表 (published=true) | 动态图标+标签，替代当前硬编码 solutionSlugs |
| Cases | `case_studies` 表 (featured=true) | 精选案例卡片 |
| CTA | `site_settings.cta_config` | 标题、副标题、按钮文案 |
| DemoForm | 现有组件 | 优化表单验证和 GTM 事件 |
| FAQ | `faqs` 表 (published=true) | 手风琴式 FAQ 组件 |

### 3.3 组件结构

```
src/app/[locale]/page.tsx          — 服务端组件，聚合所有数据
src/components/public/
  ├── hero.tsx                     — 重构：纯展示，数据从 props
  ├── trust-bar.tsx                — 重构：数据从 props
  ├── product-card.tsx             — 保持现有
  ├── case-card.tsx                — 保持现有
  ├── demo-form.tsx                — 优化 GTM 集成
  ├── solutions-grid.tsx           — 新建：解决方案网格
  ├── faq-section.tsx              — 新建：FAQ 手风琴
  └── cta-section.tsx              — 新建：CTA 区块
```

## 4. SEO/GEO/GTM 设计

### 4.1 Metadata

在 `src/app/[locale]/layout.tsx` 中：
- 从 `site_settings.seo_metadata` 读取默认 title/description
- 各页面通过 `generateMetadata()` 覆盖
- 自动生成 `alternate` hreflang 链接
- 自动生成 `canonical` URL

### 4.2 结构化数据 (JSON-LD)

| 页面类型 | Schema 类型 |
|----------|-------------|
| 首页 | `Organization` |
| 产品页 | `Product` |
| 案例页 | `Article` / `CaseStudy` |
| 解决方案 | `Service` |

### 4.3 Sitemap

```typescript
// src/app/sitemap.ts
// 动态生成，包含所有页面 × 所有语言
// 格式：<url><loc>...</loc><xhtml:link rel="alternate" hreflang="en" href="..."/></url>
```

### 4.4 GTM 集成

在根 `layout.tsx` 中注入 GTM script：
```tsx
// 从 site_settings.gtm_id 读取
// head: GTM script (dataLayer init + script)
// body: GTM noscript fallback
```

### 4.5 GEO 支持

- 中间件已支持基于 IP 的中文自动检测
- Sitemap 中通过 hreflang 标注语言-地区对应关系
- 各页面自动生成正确的 hreflang 标签

## 5. UI 设计系统

### 5.1 设计方向

使用 `design-taste-frontend` 技能，基于 SeekDrone 品牌调性（工业无人机/国防安全/关键基础设施）生成独特设计系统：

- **品牌基因**：精密、可靠、军事级、实战验证
- **配色**：从品牌色推导独特配色方案（拒绝 Tailwind 默认蓝/灰）
- **字体**：工业感字体（标题）+ 高可读性字体（正文）
- **间距**：宽松但精确的间距系统
- **动效**：微量微交互，拒绝过度动画
- **组件**：卡片、按钮、徽章等统一设计语言

### 5.2 设计变量

所有颜色使用 CSS 变量：
- 删除硬编码 `bg-gray-900`、`text-blue-600` 等
- 统一使用 `bg-background`、`text-foreground`、`text-primary` 等

## 6. 翻译扩展

需为 11 种语言新增翻译键：
- `home.advantages.*` — 核心优势
- `home.about.*` — 关于我们
- `home.faq.*` — FAQ 相关
- `common.seo.*` — SEO 相关

## 7. 实施顺序

1. **数据库**：新建 faqs、site_content 表，扩展 site_settings
2. **UI 基础**：运行 design-taste-frontend 技能，生成设计系统
3. **数据层**：更新 site_settings API，创建 faqs/site_content API
4. **首页**：重构 page.tsx + 所有模块组件
5. **SEO**：layout metadata、JSON-LD、sitemap、robots
6. **GTM**：layout 注入
7. **翻译**：补充所有语言翻译键
8. **验证**：typecheck、lint、多语言测试