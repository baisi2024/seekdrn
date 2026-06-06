# 产品管理模块重构设计文档

> 创建日期: 2026-06-06
> 状态: 待审核

## 一、概述

### 背景
现有产品管理功能存在以下问题：
- 后台：富文本编辑器工具栏不完善、图片上传体验差、缺少媒体库、缺少分类管理
- 前台：产品详情展示单一、筛选功能有限、缺少产品对比和推荐

### 目标
重构产品管理模块，实现：
1. 完善的后台管理系统（媒体库、富文本、分类、多语言）
2. 丰富的前台展示功能（多媒体展示、筛选搜索、对比、推荐）
3. 清晰的模块化架构

### 范围
- 数据模型优化
- 后台管理功能完善
- 前台展示功能增强
- API 层重构

---

## 二、架构设计

### 模块结构
```
src/features/products/
├── api/                    # API 层
│   ├── products.ts         # 产品 CRUD
│   ├── categories.ts       # 分类管理
│   ├── media.ts            # 媒体管理
│   └── translations.ts     # 翻译管理
├── components/
│   ├── admin/              # 后台组件
│   │   ├── product-form/
│   │   ├── media-library/
│   │   ├── category-manager/
│   │   └── rich-editor/
│   └── public/             # 前台组件
│       ├── product-card/
│       ├── product-gallery/
│       ├── product-filter/
│       └── product-compare/
├── hooks/                  # 自定义 Hooks
├── stores/                 # Zustand 状态管理
├── types/                  # TypeScript 类型
└── utils/                  # 工具函数
```

### 技术栈
- **框架**: Next.js 15 + React 19
- **数据库**: Supabase PostgreSQL
- **存储**: Cloudflare R2
- **编辑器**: Tiptap React
- **状态管理**: Zustand
- **UI 组件**: shadcn/ui
- **翻译 API**: DeepL

---

## 三、数据模型

### 新增表

#### product_categories（产品分类）
```sql
CREATE TABLE product_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  parent_id   uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  translations jsonb NOT NULL DEFAULT '{}',  -- {locale: {name, description}}
  icon        text,
  image       text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_categories_slug ON product_categories(slug);
```

#### product_tags（产品标签）
```sql
CREATE TABLE product_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  translations jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

#### product_tag_relations（产品-标签关联）
```sql
CREATE TABLE product_tag_relations (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id     uuid REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
```

### 扩展现有表

#### products 表扩展
```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS translation_status jsonb DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX idx_products_category ON products(category_id);
```

#### media 表扩展
```sql
ALTER TABLE media ADD COLUMN IF NOT EXISTS type text DEFAULT 'image' CHECK (type IN ('image', 'video', 'document'));
ALTER TABLE media ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE media ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- metadata 示例: {width, height, duration, thumbnail, color}
```

---

## 四、核心组件设计

### 4.1 媒体库 (MediaLibrary)

#### 类型定义
```typescript
interface MediaItem {
  id: string
  filename: string
  r2_key: string
  type: 'image' | 'video' | 'document'
  mime_type: string
  size: number
  width?: number
  height?: number
  duration?: number
  alt_text: Record<string, string>
  tags: string[]
  metadata: {
    thumbnail?: string
    color?: string
  }
  created_at: string
}

interface MediaFilter {
  search: string
  type: 'all' | 'image' | 'video' | 'document'
  tags: string[]
  dateRange: [Date?, Date?]
  sortBy: 'created_at' | 'filename' | 'size'
  sortOrder: 'asc' | 'desc'
}
```

#### 组件接口
```typescript
interface MediaLibraryProps {
  mode: 'select' | 'manage'
  accept?: 'image' | 'video' | 'all'
  multiple?: boolean
  maxSelect?: number
  onSelect?: (items: MediaItem[]) => void
}
```

#### 功能列表
- 网格/列表视图切换
- 拖拽上传（支持多文件）
- 文件预览（图片、视频、文档）
- 搜索筛选（关键词、类型、标签、日期）
- 批量操作（选择、删除、移动）
- Alt 文本编辑（多语言）
- 标签管理

#### 子组件
```
media-library/
├── index.tsx           # 主组件
├── media-grid.tsx      # 网格视图
├── media-list.tsx      # 列表视图
├── media-uploader.tsx  # 上传组件
├── media-preview.tsx   # 预览对话框
├── media-editor.tsx    # 编辑对话框
└── media-filter.tsx    # 筛选组件
```

---

### 4.2 富文本编辑器 (RichEditor)

#### 工具栏配置
```typescript
const TOOLBAR_GROUPS = {
  history: ['undo', 'redo'],
  text: ['bold', 'italic', 'underline', 'strike', 'code'],
  heading: ['h1', 'h2', 'h3', 'paragraph'],
  list: ['bulletList', 'orderedList', 'taskList'],
  block: ['blockquote', 'codeBlock', 'table'],
  insert: ['image', 'video', 'link', 'horizontalRule'],
  format: ['highlight', 'textColor', 'textAlign'],
}

interface ToolbarConfig {
  groups: (keyof typeof TOOLBAR_GROUPS)[]
  mediaLibrary?: boolean
  maxWidth?: number
}
```

#### 组件接口
```typescript
interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  toolbar?: ToolbarConfig
  maxLength?: number
}
```

#### Tiptap 扩展
- StarterKit（基础功能）
- Underline（下划线）
- TextAlign（对齐）
- Highlight（高亮）
- TextStyle + Color（文字颜色）
- Image（图片插入，支持媒体库）
- Youtube（YouTube 视频）
- Table + TableRow + TableCell + TableHeader（表格）
- CodeBlockLowlight（代码块，语法高亮）
- Link（链接）

---

### 4.3 多语言管理 (TranslationManager)

#### 翻译状态
```typescript
type TranslationStatus = 'translated' | 'pending' | 'syncing' | 'missing'

interface TranslationState {
  locale: string
  fields: Record<string, {
    status: TranslationStatus
    lastModified: string
    syncedFrom?: string
  }>
}
```

#### 组件接口
```typescript
interface TranslationManagerProps {
  translations: Record<string, Record<string, string>>
  fields: TranslationField[]
  onChange: (locale: string, field: string, value: string) => void
  onAutoTranslate?: (source: string, target: string) => Promise<void>
  sourceLocale?: string
}

interface TranslationField {
  name: string
  type: 'text' | 'richtext' | 'textarea'
  label: Record<string, string>
  required?: boolean
}
```

#### 功能列表
- 翻译状态指示（颜色标记）
- 自动翻译集成（DeepL API）
- 批量翻译
- 翻译记忆库
- 源语言同步

---

### 4.4 分类管理 (CategoryManager)

#### 类型定义
```typescript
interface ProductCategory {
  id: string
  slug: string
  parent_id: string | null
  translations: Record<string, { name: string; description?: string }>
  icon: string | null
  image: string | null
  sort_order: number
  children?: ProductCategory[]
  product_count: number
}
```

#### 组件接口
```typescript
interface CategoryManagerProps {
  categories: ProductCategory[]
  onReorder: (categories: ProductCategory[]) => void
  onEdit: (category: ProductCategory) => void
  onDelete: (id: string) => void
  onCreate: (parent?: string) => void
}
```

#### 功能列表
- 树形结构展示
- 拖拽排序
- 多语言名称编辑
- 图标/图片上传
- 产品数量显示
- 批量移动产品

---

## 五、前台组件设计

### 5.1 产品详情多媒体展示 (ProductGallery)

#### 组件接口
```typescript
interface ProductGalleryProps {
  images: string[]
  videos?: string[]
  model3d?: string
}
```

#### 功能
- 图片轮播（支持缩放、拖拽）
- 视频播放器（HTML5 video）
- 缩略图导航
- 全屏查看
- 360度视图（可选）

---

### 5.2 产品筛选与搜索 (ProductFilter)

#### 筛选状态
```typescript
interface FilterState {
  search: string
  category: string | null
  tags: string[]
  specs: Record<string, string | [number, number]>
  sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
  page: number
  pageSize: number
}
```

#### 组件接口
```typescript
interface ProductFilterProps {
  categories?: ProductCategory[]
  tags?: ProductTag[]
  specs?: SpecFilter[]
  onFilter: (filters: FilterState) => void
}
```

#### 功能
- 关键词搜索（实时搜索）
- 分类筛选（单选）
- 标签筛选（多选）
- 规格筛选（范围、选项）
- 排序选项
- 分页

---

### 5.3 相关产品推荐 (RelatedProducts)

#### 组件接口
```typescript
interface RelatedProductsProps {
  productId: string
  limit?: number
  strategy?: 'category' | 'tags' | 'specs' | 'auto'
}
```

#### 推荐策略
- **category**: 同分类产品
- **tags**: 相同标签产品
- **specs**: 相似规格产品
- **auto**: 综合评分

---

### 5.4 产品对比 (ProductCompare)

#### 类型定义
```typescript
interface CompareResult {
  products: Product[]
  specs: {
    name: string
    unit?: string
    values: (string | number | null)[]
    highlight: boolean
  }[]
}
```

#### 组件接口
```typescript
interface ProductCompareProps {
  productIds: string[]
  onClose?: () => void
  onExport?: (result: CompareResult) => void
}
```

#### 功能
- 选择产品加入对比（最多4个）
- 规格对比表格
- 差异高亮
- 移除产品
- 导出对比结果（PDF/图片）

---

## 六、API 设计

### 路由结构
```
/api/
├── products/
│   ├── route.ts              # GET 列表, POST 创建
│   ├── [id]/route.ts         # GET 详情, PUT 更新, DELETE 删除
│   ├── compare/route.ts      # POST 对比
│   └── [id]/related/route.ts # GET 相关产品
├── categories/
│   ├── route.ts              # GET 列表, POST 创建
│   ├── tree/route.ts         # GET 树形结构
│   └── [id]/route.ts         # GET, PUT, DELETE
├── media/
│   ├── route.ts              # GET 列表, POST 上传
│   └── [id]/route.ts         # GET, PUT, DELETE
└── translations/
    └── translate/route.ts    # POST 自动翻译
```

### API 接口

#### Products API
```typescript
// GET /api/products
interface ListProductsParams {
  category?: string
  tags?: string[]
  search?: string
  sort?: string
  page?: number
  pageSize?: number
}
interface ListProductsResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

// POST /api/products
interface CreateProductBody {
  model: string
  slug: string
  category_id?: string
  translations: Record<string, Record<string, string>>
  images: string[]
  videos: string[]
  tags: string[]
  published: boolean
  featured: boolean
}

// POST /api/products/compare
interface CompareProductsBody {
  productIds: string[]
}
```

#### Media API
```typescript
// POST /api/media
interface UploadMediaBody {
  files: File[]
  tags?: string[]
}

// GET /api/media
interface ListMediaParams {
  type?: 'image' | 'video' | 'document'
  search?: string
  tags?: string[]
  page?: number
  pageSize?: number
}
```

#### Translations API
```typescript
// POST /api/translations/translate
interface TranslateBody {
  text: string
  source_lang: string
  target_lang: string
}
interface TranslateResponse {
  translated_text: string
}
```

---

## 七、状态管理

### ProductStore
```typescript
interface ProductStore {
  products: Product[]
  filters: FilterState
  compareList: string[]
  loading: boolean

  // Actions
  fetchProducts: (filters?: Partial<FilterState>) => Promise<void>
  setFilters: (filters: Partial<FilterState>) => void
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearCompare: () => void
}
```

### MediaStore
```typescript
interface MediaStore {
  items: MediaItem[]
  selected: string[]
  viewMode: 'grid' | 'list'
  filter: MediaFilter
  loading: boolean

  // Actions
  fetchMedia: (filter?: Partial<MediaFilter>) => Promise<void>
  setSelected: (ids: string[]) => void
  setViewMode: (mode: 'grid' | 'list') => void
  uploadFiles: (files: File[]) => Promise<void>
  deleteItems: (ids: string[]) => Promise<void>
}
```

---

## 八、实施计划

### Phase 1: 数据模型（1天）
- [ ] 创建分类表迁移
- [ ] 创建标签表迁移
- [ ] 扩展产品表字段
- [ ] 扩展媒体表字段
- [ ] 更新 RLS 策略

### Phase 2: 后台核心功能（3天）
- [ ] 媒体库组件
  - [ ] 网格/列表视图
  - [ ] 上传功能
  - [ ] 预览/编辑
  - [ ] 筛选搜索
- [ ] 富文本编辑器增强
  - [ ] 完整工具栏
  - [ ] 媒体库集成
  - [ ] 表格/代码块
- [ ] 分类管理页面
- [ ] 多语言状态指示

### Phase 3: 前台展示（2天）
- [ ] 产品详情多媒体展示
- [ ] 产品筛选搜索
- [ ] 相关产品推荐
- [ ] 产品对比功能

### Phase 4: 测试与优化（1天）
- [ ] 单元测试
- [ ] 集成测试
- [ ] E2E 测试
- [ ] 性能优化

---

## 九、测试策略

### 单元测试
- 组件渲染测试
- 用户交互测试
- 状态管理测试

### 集成测试
- API 端点测试
- 数据库操作测试
- 文件上传测试

### E2E 测试
- 产品管理流程
- 媒体上传流程
- 产品对比流程

---

## 十、性能优化

- **图片懒加载**: Next.js Image 组件
- **虚拟列表**: react-virtual 处理大列表
- **缓存策略**: SWR 缓存 API 响应
- **预加载**: 产品详情预加载相关数据
- **CDN 加速**: R2 文件 CDN 分发
- **搜索优化**: PostgreSQL 全文搜索

---

## 十一、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 数据迁移失败 | 高 | 先备份，分步迁移，回滚脚本 |
| 大文件上传超时 | 中 | 分片上传，进度显示 |
| 翻译 API 限制 | 低 | 缓存结果，批量请求 |
| 前端性能下降 | 中 | 虚拟列表，懒加载 |

---

## 十二、验收标准

### 后台管理
- [ ] 可上传/管理图片、视频、文档
- [ ] 富文本编辑器功能完整
- [ ] 可创建/编辑/删除分类
- [ ] 多语言状态清晰可见
- [ ] 自动翻译功能正常

### 前台展示
- [ ] 产品详情图片轮播正常
- [ ] 视频播放正常
- [ ] 筛选搜索返回正确结果
- [ ] 相关产品推荐合理
- [ ] 产品对比功能正常

### 性能
- [ ] 页面加载 < 3s
- [ ] 图片加载有进度显示
- [ ] 大列表滚动流畅
