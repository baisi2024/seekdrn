# 完整B2B产品管理系统设计文档

> 创建日期: 2026-06-06
> 状态: 待审核

## 一、概述

### 背景
当前产品管理功能过于简陋：
- 后台只有 model、slug、category 三个基础字段
- 分类是硬编码字符串，没有管理页面
- 没有标签管理
- 规格参数未集成到主编辑页面
- 缺少SEO和GEO/AI优化支持
- 缺少批量操作和数据导入功能

### 目标
构建完整的B2B独立站产品管理系统，包括：
1. 完整的产品CRUD（所有字段）
2. 分类管理（多级分类）
3. 标签管理
4. 规格参数标准化（GEO/AI优化）
5. 产品文档管理
6. 产品FAQ（GEO/AI优化）
7. SEO优化（元数据、结构化数据、Sitemap）
8. 关联管理（案例、解决方案、相关产品）
9. 批量操作和数据导入

### 范围
- 数据模型设计
- 后台管理界面
- 前台展示优化
- SEO实现
- GEO/AI优化实现
- API设计

---

## 二、数据模型设计

### 2.1 产品分类表
```sql
CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  translations jsonb NOT NULL DEFAULT '{}',  -- {locale: {name, description}}
  icon text,
  image text,
  sort_order int NOT NULL DEFAULT 0,
  seo jsonb DEFAULT '{}',  -- {meta_title, meta_description, meta_keywords}
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_categories_slug ON product_categories(slug);
```

### 2.2 产品标签表
```sql
CREATE TABLE product_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  translations jsonb NOT NULL DEFAULT '{}',  -- {locale: {name}}
  color text DEFAULT '#6366f1',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_tag_relations (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
```

### 2.3 产品主表（扩展）
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]';
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs_standardized jsonb DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- specs_standardized 示例:
-- {
--   "weight": {"value": 15, "unit": "kg"},
--   "maxEndurance": {"value": 70, "unit": "min"},
--   "maxRange": {"value": 110, "unit": "km"}
-- }
```

### 2.4 产品SEO元数据表
```sql
CREATE TABLE product_seo (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  locale text NOT NULL,
  meta_title text,
  meta_description text,
  meta_keywords text[],
  og_title text,
  og_description text,
  og_image text,
  structured_data jsonb,  -- Product Schema
  PRIMARY KEY (product_id, locale)
);
```

### 2.5 产品FAQ表（GEO/AI优化）
```sql
CREATE TABLE product_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  locale text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_faqs_product ON product_faqs(product_id, locale);
```

### 2.6 产品文档表
```sql
CREATE TABLE product_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('manual', 'datasheet', 'certificate', 'brochure', 'other')),
  translations jsonb NOT NULL DEFAULT '{}',  -- {locale: {title, description}}
  file_url text NOT NULL,
  file_size int,
  file_type text,
  language text,  -- 文档语言
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_product ON product_documents(product_id, type);
```

### 2.7 产品关联表
```sql
CREATE TABLE product_relations (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  related_id uuid NOT NULL,
  relation_type text NOT NULL CHECK (relation_type IN ('case_study', 'solution', 'related_product')),
  sort_order int NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, related_id, relation_type)
);

CREATE INDEX idx_relations_product ON product_relations(product_id);
CREATE INDEX idx_relations_related ON product_relations(related_id, relation_type);
```

---

## 三、后台管理界面设计

### 3.1 产品列表页
**功能：**
- 表格展示：缩略图、型号、分类、标签、状态、排序
- 筛选：分类、标签、状态、关键词
- 批量操作：发布/取消发布、删除、导出、批量编辑分类/标签
- 拖拽排序
- 分页

**界面布局：**
```
┌─────────────────────────────────────────────────────────────────┐
│  产品管理                              [+ 新增产品] [导入] [导出] │
├─────────────────────────────────────────────────────────────────┤
│  分类筛选: [全部 ▼]  标签筛选: [全部 ▼]  状态: [全部 ▼]          │
│  搜索: [________________] [搜索]                                │
├─────────────────────────────────────────────────────────────────┤
│  □  图片    型号      分类      标签      状态      操作        │
├─────────────────────────────────────────────────────────────────┤
│  □  [img]   PTX500    Drones    军用,物流  ✅ 发布   [编辑] [删除]│
│  ...                                                           │
├─────────────────────────────────────────────────────────────────┤
│  已选择 0 项  [批量发布] [批量取消发布] [批量删除] [批量编辑分类] │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 产品编辑页（Tab式）
**Tab结构：**
- 基本信息：型号、Slug、分类、标签、状态、排序
- 内容：多语言内容、图片、视频
- 规格：标准化规格编辑器
- 文档：产品文档上传
- SEO：SEO元数据编辑
- FAQ：产品FAQ管理
- 关联：案例、解决方案、相关产品

### 3.3 基本信息 Tab
**字段：**
- 型号（必填）
- Slug（必填，自动生成）
- 分类选择（下拉树）
- 标签选择（多选，可创建）
- 发布状态（开关）
- 推荐产品（开关）
- 合规标记（开关）
- 排序权重（数字）

### 3.4 内容 Tab
**字段：**
- 语言切换（Tab）
- 产品名称（必填）
- 产品描述（富文本）
- 核心优势（富文本）
- 核心能力（富文本）
- 应用场景（富文本）
- 产品图片（多图上传，拖拽排序）
- 产品视频（多视频上传）

### 3.5 规格 Tab
**功能：**
- 规格分组（可折叠）
- 标准化属性编辑（值 + 单位选择）
- 从JSON导入
- 导出JSON

**标准化单位：**
- 重量：kg, g, lb
- 距离：mm, cm, m, km, in, ft
- 速度：km/h, m/s, mph, kn
- 时间：min, h, s
- 功率：kW, W, hp
- 电压：V, kV

### 3.6 文档 Tab
**文档类型：**
- manual - 产品手册
- datasheet - 数据表
- certificate - 认证证书
- brochure - 宣传册
- other - 其他

**字段：**
- 文档类型选择
- 多语言标题
- 文件上传
- 文档语言

### 3.7 SEO Tab
**字段：**
- 页面标题（60字限制提示）
- 页面描述（160字限制提示）
- 关键词（标签式输入）
- Open Graph 标题
- Open Graph 描述
- Open Graph 图片
- 结构化数据预览

### 3.8 FAQ Tab（GEO/AI优化）
**功能：**
- 问答对管理
- 多语言支持
- 排序
- 自动生成FAQ（基于规格参数）

### 3.9 关联 Tab
**关联类型：**
- 案例研究关联（搜索选择）
- 解决方案关联（搜索选择）
- 相关产品（手动选择或自动推荐）

### 3.10 分类管理页
**功能：**
- 树形结构展示
- 拖拽排序
- 多级嵌套
- 分类图标/图片
- 分类SEO

### 3.11 标签管理页
**功能：**
- 标签列表
- 标签颜色选择
- 多语言名称
- 标签使用统计

---

## 四、前台展示设计

### 4.1 产品列表页
**功能：**
- 分类筛选（侧边栏）
- 标签筛选
- 排序选项
- 产品卡片（图片、型号、名称、核心规格）
- 分页/无限滚动

### 4.2 产品详情页
**布局：**
```
┌─────────────────────────────────────────┐
│  面包屑：首页 > 分类 > 产品              │
├─────────────────┬───────────────────────┤
│                 │  分类标签              │
│   产品图库      │  产品名称              │
│   （轮播）      │  型号                  │
│                 │  核心规格摘要          │
│                 │  [询价] [下载资料]    │
├─────────────────┴───────────────────────┤
│  Tab: 规格 | 描述 | 优势 | 应用 | 文档   │
├─────────────────────────────────────────┤
│  FAQ（GEO/AI优化）                       │
├─────────────────────────────────────────┤
│  相关案例                               │
├─────────────────────────────────────────┤
│  相关产品                               │
└─────────────────────────────────────────┘
```

---

## 五、SEO实现

### 5.1 元数据生成
```typescript
interface ProductSEO {
  title: string       // 60字限制
  description: string // 160字限制
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
}

function generateProductSEO(product: Product, locale: string): ProductSEO {
  const translation = product.translations[locale]
  const seo = product.seo?.[locale]
  
  return {
    title: seo?.meta_title || `${translation.name} | ${siteName}`,
    description: seo?.meta_description || truncate(translation.description, 160),
    keywords: seo?.meta_keywords || extractKeywords(translation),
    ogTitle: seo?.og_title || translation.name,
    ogDescription: seo?.og_description || truncate(translation.description, 200),
    ogImage: seo?.og_image || product.images[0],
  }
}
```

### 5.2 结构化数据
```typescript
function generateProductSchema(product: Product, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.translations[locale].name,
    "description": product.translations[locale].description,
    "image": product.images,
    "category": product.category?.translations[locale].name,
    "weight": product.specs_standardized.weight ? {
      "@type": "QuantitativeValue",
      "value": product.specs_standardized.weight.value,
      "unitCode": "KGM"
    } : undefined,
    "additionalProperty": Object.entries(product.specs_standardized).map(([key, spec]) => ({
      "@type": "PropertyValue",
      "name": formatSpecName(key),
      "value": `${spec.value} ${spec.unit}`
    })),
    "manufacturer": {
      "@type": "Organization",
      "name": siteName
    }
  }
}
```

### 5.3 Sitemap集成
```typescript
// sitemap.ts
export default async function sitemap() {
  const products = await getProducts()
  
  return products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updated_at,
    changeFrequency: 'weekly',
    priority: product.featured ? 0.9 : 0.7,
  }))
}
```

---

## 六、GEO/AI优化实现

### 6.1 标准化规格存储
```typescript
interface StandardizedSpec {
  value: number
  unit: string
  label?: Record<string, string>  // 多语言标签
}

interface ProductSpecsStandardized {
  weight?: StandardizedSpec
  maxTakeOffWeight?: StandardizedSpec
  wingspan?: StandardizedSpec
  length?: StandardizedSpec
  maxEndurance?: StandardizedSpec
  maxRange?: StandardizedSpec
  cruiseSpeed?: StandardizedSpec
  maxSpeed?: StandardizedSpec
  maxCeiling?: StandardizedSpec
  payloadCapacity?: StandardizedSpec
  // ... 更多标准化属性
}
```

### 6.2 FAQ数据结构
```typescript
interface ProductFAQ {
  id: string
  product_id: string
  locale: string
  question: string
  answer: string
  sort_order: number
}

// FAQ自动生成（基于规格）
function generateFAQsFromSpecs(product: Product, locale: string): ProductFAQ[] {
  const faqs: ProductFAQ[] = []
  
  if (product.specs_standardized.maxRange) {
    faqs.push({
      question: `What is the maximum range of ${product.translations[locale].name}?`,
      answer: `The ${product.translations[locale].name} has a maximum range of ${product.specs_standardized.maxRange.value} ${product.specs_standardized.maxRange.unit}.`,
    })
  }
  
  // ... 更多自动生成
  
  return faqs
}
```

### 6.3 AI友好的结构化数据
```typescript
// 扩展的结构化数据，包含更多AI可理解的信息
function generateAIFriendlySchema(product: Product, locale: string) {
  return {
    ...generateProductSchema(product, locale),
    // 添加FAQ
    "mainEntity": {
      "@type": "Question",
      // ...
    },
    // 添加能力标签
    "capabilities": product.translations[locale].capabilities,
    // 添加应用场景
    "applications": product.translations[locale].applications,
  }
}
```

---

## 七、API设计

### 7.1 产品API
```
GET    /api/products                    # 列表（支持筛选、分页）
GET    /api/products/:id                # 详情
POST   /api/products                    # 创建
PUT    /api/products/:id                # 更新
DELETE /api/products/:id                # 删除
POST   /api/products/batch              # 批量操作
POST   /api/products/import             # 导入
GET    /api/products/export             # 导出
```

### 7.2 分类API
```
GET    /api/categories                  # 列表
GET    /api/categories/tree             # 树形结构
POST   /api/categories                  # 创建
PUT    /api/categories/:id              # 更新
DELETE /api/categories/:id              # 删除
```

### 7.3 标签API
```
GET    /api/tags                        # 列表
POST   /api/tags                        # 创建
PUT    /api/tags/:id                    # 更新
DELETE /api/tags/:id                    # 删除
```

### 7.4 规格API
```
GET    /api/products/:id/specs          # 获取规格
PUT    /api/products/:id/specs          # 更新规格
POST   /api/products/:id/specs/import   # 导入规格
```

### 7.5 SEO API
```
GET    /api/products/:id/seo            # 获取SEO
PUT    /api/products/:id/seo            # 更新SEO
POST   /api/products/:id/seo/generate   # 自动生成
```

### 7.6 FAQ API
```
GET    /api/products/:id/faqs           # 获取FAQ
POST   /api/products/:id/faqs           # 添加FAQ
PUT    /api/products/:id/faqs/:faqId    # 更新FAQ
DELETE /api/products/:id/faqs/:faqId    # 删除FAQ
POST   /api/products/:id/faqs/generate  # 自动生成
```

### 7.7 文档API
```
GET    /api/products/:id/documents      # 获取文档
POST   /api/products/:id/documents      # 上传文档
PUT    /api/products/:id/documents/:docId  # 更新文档
DELETE /api/products/:id/documents/:docId  # 删除文档
```

### 7.8 关联API
```
GET    /api/products/:id/relations      # 获取关联
POST   /api/products/:id/relations      # 添加关联
DELETE /api/products/:id/relations/:relationId  # 删除关联
```

---

## 八、实施计划

### Phase 1: 数据模型（1天）
- [ ] 创建分类表迁移
- [ ] 创建标签表迁移
- [ ] 创建SEO表迁移
- [ ] 创建FAQ表迁移
- [ ] 创建文档表迁移
- [ ] 创建关联表迁移
- [ ] 扩展产品表字段

### Phase 2: 后台核心功能（3天）
- [ ] 类型定义
- [ ] API层实现
- [ ] 状态管理
- [ ] 产品列表页增强
- [ ] 产品编辑页重构（Tab式）
- [ ] 分类管理页
- [ ] 标签管理页

### Phase 3: SEO和GEO实现（2天）
- [ ] SEO元数据编辑组件
- [ ] 结构化数据生成
- [ ] Sitemap集成
- [ ] FAQ管理组件
- [ ] 标准化规格编辑器

### Phase 4: 前台优化（1天）
- [ ] 产品详情页优化
- [ ] SEO元数据渲染
- [ ] 结构化数据输出
- [ ] FAQ展示

### Phase 5: 测试与验证（1天）
- [ ] 单元测试
- [ ] 集成测试
- [ ] E2E测试
- [ ] SEO验证
- [ ] 结构化数据验证

---

## 九、验收标准

### 后台管理
- [ ] 可创建/编辑/删除产品（所有字段）
- [ ] 可管理多级分类
- [ ] 可管理标签
- [ ] 可编辑标准化规格
- [ ] 可上传产品文档
- [ ] 可编辑SEO元数据
- [ ] 可管理FAQ
- [ ] 可关联案例/解决方案
- [ ] 批量操作正常
- [ ] 数据导入/导出正常

### 前台展示
- [ ] 产品详情页展示完整
- [ ] SEO元数据正确
- [ ] 结构化数据正确
- [ ] FAQ展示正常
- [ ] 相关内容推荐正常

### SEO验证
- [ ] Google Rich Results Test 通过
- [ ] Schema.org 验证通过
- [ ] Sitemap 正确生成

### GEO/AI优化
- [ ] 结构化数据AI友好
- [ ] FAQ数据完整
- [ ] 标准化属性正确
