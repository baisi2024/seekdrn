# 产品详情页增强设计规格

> 创建日期：2026-06-06
> 状态：待审核
> 子项目：产品详情页增强（P1）
> 实施方案：核心功能优先

---

## 1. 项目概述

### 1.1 目标

增强产品详情页功能，提升用户体验和转化率：
- **详细规格表**：分组展示产品技术规格，支持折叠展开
- **下载中心**：提供产品手册等文件的下载
- **相关案例展示**：展示与产品相关的成功案例，增强用户信任

### 1.2 范围

**包含功能：**
- 规格表分组展示与折叠交互
- 下载中心文件管理
- 相关案例智能匹配与手动配置
- Admin后台管理界面

**不包含功能：**
- 产品对比功能（延后至P2阶段）

### 1.3 成功标准

- 用户可以在产品详情页查看分组规格表
- 用户可以下载产品手册等文件
- 用户可以看到相关的成功案例
- Admin可以管理规格组、下载文件、案例关联
- 页面性能保持良好（LCP < 2.5s）

---

## 2. 整体架构

### 2.1 架构概览

```
产品详情页架构
├── 数据层
│   ├── 扩展现有数据库表（products, product_specs）
│   ├── 新增关联表（product_downloads, product_case_relations）
│   └── 文件存储（Cloudflare R2）
├── API层
│   ├── 产品详情API（扩展现有）
│   ├── 规格表API（新增）
│   ├── 下载中心API（新增）
│   └── 相关案例API（新增）
├── 组件层
│   ├── SpecsSection（规格表组件）
│   ├── DownloadsSection（下载中心组件）
│   └── RelatedCasesSection（相关案例组件）
└── 页面层
    └── 产品详情页（扩展现有）
```

### 2.2 技术选型

- **数据库**：扩展现有Supabase表结构
- **文件存储**：使用现有Cloudflare R2
- **UI组件**：使用现有shadcn/ui组件库
- **富文本**：使用现有TipTap编辑器
- **多语言**：使用现有next-intl

### 2.3 设计原则

1. **向后兼容**：扩展现有表结构，不破坏现有功能
2. **渐进增强**：新功能作为可选模块，不影响基础展示
3. **性能优先**：使用服务端渲染，减少客户端负担
4. **可维护性**：组件独立，职责单一，易于测试

---

## 3. 数据模型设计

### 3.1 扩展 products 表

```sql
-- 添加规格组字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS spec_groups jsonb DEFAULT '[]';
```

**spec_groups 结构：**
```json
[
  {
    "id": "flight",
    "label": {
      "en": "Flight Performance",
      "zh": "飞行性能",
      "ar": "أداء الطيران"
    },
    "sort_order": 1
  },
  {
    "id": "sensor",
    "label": {
      "en": "Sensors",
      "zh": "传感器"
    },
    "sort_order": 2
  }
]
```

### 3.2 扩展 product_specs 表

```sql
-- 添加分组关联和单位字段
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS group_id text;
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS unit jsonb DEFAULT '{}';
```

**unit 结构：**
```json
{
  "en": "km/h",
  "zh": "公里/小时",
  "ar": "كم/س"
}
```

### 3.3 新增 product_downloads 表

```sql
CREATE TABLE product_downloads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('manual', 'datasheet', 'certificate', 'media')),
  title       jsonb NOT NULL DEFAULT '{}',
  description jsonb DEFAULT '{}',
  file_url    text NOT NULL,
  file_size   int,
  file_type   text,
  language    text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_downloads_product ON product_downloads(product_id, type);
```

### 3.4 新增 product_case_relations 表

```sql
CREATE TABLE product_case_relations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  case_study_id uuid NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  is_manual    boolean NOT NULL DEFAULT false,
  relevance_score float DEFAULT 0,
  sort_order   int NOT NULL DEFAULT 0,
  UNIQUE(product_id, case_study_id)
);

CREATE INDEX idx_product_case_relations ON product_case_relations(product_id, is_manual);
```

### 3.5 数据关系图

```
products (1) ──── (N) product_specs
    │                    │
    │                    └─ group_id → spec_groups
    │
    ├── (N) product_downloads
    │
    └── (N) product_case_relations ──── (1) case_studies
```

---

## 4. 组件设计

### 4.1 SpecsSection 组件（规格表）

**组件结构：**
```tsx
<SpecsSection>
  <SpecsHeader>
    <Title>Technical Specifications</Title>
    <ExpandAllButton />
  </SpecsHeader>
  <SpecsGroups>
    {groups.map(group => (
      <SpecGroup key={group.id} collapsible defaultOpen>
        <GroupHeader>
          <Icon />
          <Title>{group.label}</Title>
          <ChevronIcon />
        </GroupHeader>
        <GroupContent>
          <SpecsTable>
            {specs.map(spec => (
              <SpecRow>
                <SpecLabel>{spec.label}</SpecLabel>
                <SpecValue>
                  {spec.value}
                  {spec.unit && <Unit>{spec.unit}</Unit>}
                </SpecValue>
              </SpecRow>
            ))}
          </SpecsTable>
        </GroupContent>
      </SpecGroup>
    ))}
  </SpecsGroups>
</SpecsSection>
```

**特性：**
- 分组展示，每组可折叠展开
- 支持单位显示
- 响应式布局（移动端优化）
- 支持高亮重要参数

**文件位置：**
- 组件：`src/components/public/specs-section.tsx`
- 样式：使用Tailwind CSS + shadcn/ui

### 4.2 DownloadsSection 组件（下载中心）

**组件结构：**
```tsx
<DownloadsSection>
  <DownloadsHeader>
    <Title>Downloads</Title>
    <FilterTabs>
      <Tab value="all">All</Tab>
      <Tab value="manual">Manuals</Tab>
      <Tab value="datasheet">Datasheets</Tab>
    </FilterTabs>
  </DownloadsHeader>
  <DownloadsGrid>
    {downloads.map(item => (
      <DownloadCard key={item.id}>
        <FileIcon type={item.file_type} />
        <Content>
          <Title>{item.title}</Title>
          <Description>{item.description}</Description>
          <Meta>
            <Language>{item.language}</Language>
            <FileSize>{formatBytes(item.file_size)}</FileSize>
          </Meta>
        </Content>
        <DownloadButton url={item.file_url} />
      </DownloadCard>
    ))}
  </DownloadsGrid>
</DownloadsSection>
```

**特性：**
- 按类型筛选（全部/手册/数据表）
- 显示文件大小和语言
- 卡片式布局
- 点击直接下载

**文件位置：**
- 组件：`src/components/public/downloads-section.tsx`

### 4.3 RelatedCasesSection 组件（相关案例）

**组件结构：**
```tsx
<RelatedCasesSection>
  <SectionHeader>
    <Title>Related Case Studies</Title>
    <ViewAllLink href="/case-studies" />
  </SectionHeader>
  <CasesGrid>
    {cases.map(case => (
      <CaseCard key={case.id}>
        <VideoThumbnail url={case.video_url}>
          <PlayButton />
        </VideoThumbnail>
        <Content>
          <Tags>
            <IndustryTag>{case.industry}</IndustryTag>
            <CountryTag>{case.country}</CountryTag>
          </Tags>
          <Title>{case.title}</Title>
          <Description>{case.summary}</Description>
          <ResultsPreview results={case.results} />
        </Content>
      </CaseCard>
    ))}
  </CasesGrid>
</RelatedCasesSection>
```

**特性：**
- 混合模式：手动配置优先，自动匹配补充
- 显示案例缩略信息
- 视频预览功能
- 最多显示3个案例

**文件位置：**
- 组件：`src/components/public/related-cases-section.tsx`

---

## 5. API设计

### 5.1 产品详情API（扩展）

**端点：** `GET /api/products/[slug]`

**响应结构：**
```typescript
{
  // 现有字段
  id: string
  model: string
  slug: string
  category: string
  translations: Record<string, any>
  images: string[]
  datasheet_url: string
  compliance_flag: string
  published: boolean

  // 新增字段
  spec_groups: [{
    id: string
    label: Record<string, string>
    specs: [{
      id: string
      label: Record<string, string>
      value: Record<string, string>
      unit: Record<string, string>
      sort_order: number
    }]
    sort_order: number
  }]

  downloads: [{
    id: string
    type: 'manual' | 'datasheet' | 'certificate' | 'media'
    title: Record<string, string>
    description: Record<string, string>
    file_url: string
    file_size: number
    file_type: string
    language: string
    sort_order: number
  }]

  related_cases: [{
    id: string
    slug: string
    industry: string
    country: string
    title: Record<string, string>
    summary: Record<string, string>
    video_url: string
    results: Record<string, any>
    images: string[]
  }]
}
```

### 5.2 下载API

**端点：** `GET /api/downloads/[id]`

**功能：** 返回文件流，记录下载统计（可选）

**端点：** `POST /api/downloads/stats`

**请求体：**
```typescript
{
  download_id: string
  user_country: string
  timestamp: string
}
```

### 5.3 相关案例匹配API（内部）

**函数：** `matchRelatedCases(productId: string): Promise<CaseStudy[]>`

**匹配逻辑：**
1. 获取产品信息
2. 检查手动配置的案例
3. 如果手动案例数量 < 3，自动匹配补充：
   - 按行业匹配
   - 按地区匹配
   - 按相似产品匹配
4. 计算相关性分数
5. 返回前3个最相关的案例

### 5.4 Admin API

**规格组管理：**
- `POST /api/admin/products/[id]/spec-groups` - 创建规格组
- `PUT /api/admin/products/[id]/spec-groups/[groupId]` - 更新规格组
- `DELETE /api/admin/products/[id]/spec-groups/[groupId]` - 删除规格组

**下载管理：**
- `POST /api/admin/products/[id]/downloads` - 上传文件到R2，创建下载记录
- `PUT /api/admin/products/[id]/downloads/[downloadId]` - 更新下载信息
- `DELETE /api/admin/products/[id]/downloads/[downloadId]` - 删除文件和记录

**案例关联管理：**
- `POST /api/admin/products/[id]/case-relations` - 添加案例关联（手动配置）
- `DELETE /api/admin/products/[id]/case-relations/[caseId]` - 删除案例关联
- `POST /api/admin/products/[id]/case-relations/auto-match` - 触发自动匹配

---

## 6. 数据流设计

### 6.1 产品详情页数据流

```
用户访问 /products/[slug]
         ↓
服务端渲染（SSR）
         ↓
并行获取数据：
  ├─ 产品基本信息
  ├─ 规格表（分组）
  ├─ 下载列表
  └─ 相关案例
         ↓
数据聚合 & 多语言处理
         ↓
渲染页面
```

### 6.2 相关案例匹配数据流

```
获取产品信息
         ↓
检查手动配置的案例
         ↓
手动案例数量 < 3 ?
  ├─ Yes → 自动匹配补充
  │         ├─ 按行业匹配
  │         ├─ 按地区匹配
  │         └─ 按相似产品匹配
  └─ No  → 仅使用手动配置
         ↓
返回案例列表（最多3个）
```

### 6.3 文件下载数据流

```
用户点击下载
         ↓
检查文件权限（如有）
         ↓
生成临时下载URL（R2签名URL）
         ↓
重定向到文件URL
         ↓
（可选）记录下载统计
```

---

## 7. 错误处理

### 7.1 数据获取错误

```typescript
// 产品不存在
if (!product) {
  notFound() // 返回404页面
}

// 规格表为空
if (!specs || specs.length === 0) {
  // 不显示规格表区域，不报错
}

// 下载列表为空
if (!downloads || downloads.length === 0) {
  // 不显示下载区域，不报错
}

// 相关案例为空
if (!cases || cases.length === 0) {
  // 不显示案例区域，不报错
}
```

### 7.2 文件下载错误

```typescript
try {
  const file = await getFile(downloadId)
  if (!file) {
    return { error: 'File not found' }
  }
  // 返回文件
} catch (error) {
  if (error.code === 'STORAGE_ERROR') {
    return { error: 'File storage error, please contact support' }
  }
  throw error
}
```

### 7.3 Admin操作错误

```typescript
// 文件上传
try {
  const url = await uploadToR2(file)
  // 创建记录
} catch (error) {
  if (error.code === 'FILE_TOO_LARGE') {
    return { error: 'File size exceeds limit (50MB)' }
  }
  if (error.code === 'INVALID_FILE_TYPE') {
    return { error: 'Invalid file type. Allowed: PDF, DOC, XLS' }
  }
  throw error
}
```

### 7.4 多语言错误处理

```typescript
// 翻译缺失fallback
function getTranslation(translations, locale, field) {
  return translations?.[locale]?.[field]
    || translations?.['en']?.[field]  // fallback to English
    || ''  // empty string as last resort
}
```

---

## 8. 性能优化

### 8.1 数据库查询优化

```sql
-- 使用JOIN减少查询次数
SELECT
  p.*,
  array_agg(ps.*) as specs,
  array_agg(pd.*) as downloads,
  array_agg(cs.*) as cases
FROM products p
LEFT JOIN product_specs ps ON p.id = ps.product_id
LEFT JOIN product_downloads pd ON p.id = pd.product_id
LEFT JOIN product_case_relations pcr ON p.id = pcr.product_id
LEFT JOIN case_studies cs ON pcr.case_study_id = cs.id
WHERE p.slug = $slug
GROUP BY p.id
```

### 8.2 缓存策略

```typescript
// 产品详情页使用ISR
export const revalidate = 60 // 60秒重新验证

// Admin操作后清除缓存
revalidatePath(`/products/${slug}`)
```

### 8.3 图片优化

```typescript
// 使用Next.js Image组件
<Image
  src={product.images[0]}
  alt={name}
  width={800}
  height={600}
  priority // 首屏图片优先加载
/>
```

---

## 9. 测试策略

### 9.1 单元测试

**组件测试：**
- 规格组折叠/展开交互
- 单位显示正确性
- 下载按钮功能
- 案例卡片渲染

**工具函数测试：**
- 相关案例匹配逻辑
- 文件大小格式化
- 多语言翻译fallback

### 9.2 集成测试

**API测试：**
- 产品详情API返回完整数据
- 404错误处理
- 文件上传和下载
- 案例关联管理

**数据库操作测试：**
- 规格组CRUD操作
- 下载记录创建
- 案例关联管理

### 9.3 E2E测试

**用户流程：**
- 查看规格表并折叠展开
- 下载文件
- 查看相关案例
- 导航到案例详情页

### 9.4 性能测试

**Core Web Vitals：**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

**负载测试：**
- 100并发请求 < 5秒

### 9.5 测试覆盖率目标

| 类型 | 目标覆盖率 |
|------|-----------|
| 单元测试 | ≥ 80% |
| 集成测试 | ≥ 70% |
| E2E测试 | 关键流程100% |
| 性能测试 | 每次部署 |

---

## 10. 实施计划

### 10.1 阶段划分

**阶段1：数据层（1-2天）**
- 创建数据库迁移文件
- 扩展现有表结构
- 创建新表和索引
- 编写seed数据

**阶段2：API层（2-3天）**
- 扩展产品详情API
- 实现下载API
- 实现相关案例匹配逻辑
- 实现Admin API

**阶段3：组件层（3-4天）**
- 实现SpecsSection组件
- 实现DownloadsSection组件
- 实现RelatedCasesSection组件
- 编写单元测试

**阶段4：页面集成（1-2天）**
- 更新产品详情页
- 集成新组件
- 实现Admin管理界面
- 编写E2E测试

**阶段5：测试与优化（1-2天）**
- 性能测试
- 修复bug
- 优化查询
- 文档更新

### 10.2 依赖关系

```
阶段1（数据层）
    ↓
阶段2（API层）
    ↓
阶段3（组件层）
    ↓
阶段4（页面集成）
    ↓
阶段5（测试与优化）
```

---

## 11. 风险与缓解

### 11.1 技术风险

**风险1：数据库迁移影响现有功能**
- 缓解：在测试环境充分测试，使用事务确保原子性

**风险2：文件上传性能问题**
- 缓解：限制文件大小（50MB），使用CDN加速

**风险3：相关案例匹配算法不准确**
- 缓解：优先使用手动配置，自动匹配作为补充

### 11.2 业务风险

**风险1：用户不使用新功能**
- 缓解：通过数据分析监控使用情况，收集用户反馈

**风险2：Admin操作复杂**
- 缓解：设计简洁的UI，提供操作引导

---

## 12. 验收标准

### 12.1 功能验收

- [ ] 用户可以在产品详情页查看分组规格表
- [ ] 用户可以折叠/展开规格组
- [ ] 用户可以下载产品手册等文件
- [ ] 用户可以看到相关的成功案例（最多3个）
- [ ] Admin可以创建/编辑/删除规格组
- [ ] Admin可以上传/管理下载文件
- [ ] Admin可以手动配置案例关联
- [ ] Admin可以触发自动匹配案例

### 12.2 性能验收

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] 页面首次加载时间 < 3s

### 12.3 质量验收

- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 集成测试覆盖率 ≥ 70%
- [ ] E2E测试覆盖关键流程
- [ ] 无严重bug
- [ ] 代码通过ESLint检查

### 12.4 多语言验收

- [ ] 所有新增文本支持6种语言
- [ ] 阿拉伯语支持RTL布局
- [ ] 翻译缺失时正确fallback到英语

---

## 13. 后续规划

### 13.1 P2阶段功能

- 产品对比功能
- 产品收藏功能
- 高级搜索功能

### 13.2 优化方向

- 下载统计和分析
- 案例匹配算法优化
- 规格表可视化（图表）
- 移动端体验优化

---

**请审核此设计规格，确认后进入实施计划。**
