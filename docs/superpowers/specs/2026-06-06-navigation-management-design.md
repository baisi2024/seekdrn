# 导航管理功能设计文档

> 创建日期：2026-06-06
> 状态：设计中
> 预计工期：3.5 天

---

## 一、需求概述

### 1.1 业务需求

实现后台导航管理功能，支持：
- 管理员频繁管理复杂菜单结构
- 两级菜单（顶部导航 + 下拉菜单）
- 拖拽排序（Drag & Drop）
- Header 和 Footer 分开管理（两个独立页面）

### 1.2 技术需求

- 使用 dnd-kit 实现拖拽排序
- 支持多语言（7种语言）
- ISR 缓存优化性能
- 前端动态渲染替换硬编码

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                   后台管理界面                            │
│  /admin/navigation (Header)  │  /admin/footer (Footer)  │
│                              │                          │
│  ┌──────────────────────┐   │   ┌──────────────────┐   │
│  │  NavigationManager   │   │   │  FooterManager   │   │
│  │  ├─ NavTree          │   │   │  ├─ FooterTree   │   │
│  │  ├─ NavItemEditor    │   │   │  ├─ FooterEditor │   │
│  │  └─ DragOverlay      │   │   │  └─ DragOverlay  │   │
│  └──────────────────────┘   │   └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
            │                              │
            └──────────┬───────────────────┘
                       ▼
        ┌──────────────────────────┐
        │    API Routes            │
        │  /api/admin/navigation   │
        │  - GET: 获取导航树        │
        │  - POST: 创建导航项       │
        │  - PUT: 更新导航项        │
        │  - DELETE: 删除导航项     │
        │  - PATCH: 批量更新排序    │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │   Supabase Database      │
        │   navigation 表          │
        │  - position (header/footer)│
        │  - parent_id (多级支持)   │
        │  - order_index (排序)     │
        │  - translations (多语言)  │
        └──────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │   前端动态渲染            │
        │  - Navbar 组件           │
        │  - Footer 组件           │
        │  - ISR 缓存 (revalidate: 60)│
        └──────────────────────────┘
```

### 2.2 核心组件

**后台管理组件：**
- `NavigationManager` - 导航管理主组件
- `NavTree` - 树形导航结构展示（支持拖拽）
- `NavItemEditor` - 导航项编辑器（多语言、链接类型）
- `DragOverlay` - 拖拽时的视觉反馈

**前端渲染组件：**
- `DynamicNavbar` - 动态导航栏（从数据库读取）
- `DynamicFooter` - 动态页脚（从数据库读取）
- `NavDropdown` - 下拉菜单组件

### 2.3 数据流

```
管理员操作 → 拖拽排序/编辑 → API 调用 → 数据库更新
→ ISR 重新验证 → 前端自动更新
```

---

## 三、组件设计

### 3.1 NavigationManager 组件

**功能：**
- 展示导航树结构（支持两级）
- 提供拖拽排序功能
- 支持添加/编辑/删除导航项
- 实时预览效果

**状态管理：**
```typescript
interface NavigationManagerState {
  items: NavigationItem[]  // 导航树数据
  editingId: string | null // 当前编辑的导航项ID
  draggedId: string | null // 当前拖拽的导航项ID
  expandedIds: string[]    // 展开的父级菜单ID
}

interface NavigationItem {
  id: string
  position: 'header' | 'footer'
  parent_id: string | null
  order_index: number
  link_type: 'internal' | 'external'
  url: string
  translations: Record<string, string>  // {en: "Products", zh: "产品"}
  published: boolean
  children?: NavigationItem[]  // 子菜单
}
```

**交互流程：**
```
1. 页面加载 → 获取导航树数据
2. 拖拽导航项 → 更新 order_index 和 parent_id
3. 点击编辑 → 打开 NavItemEditor 对话框
4. 保存编辑 → 调用 API 更新数据库
5. 删除导航项 → 确认后删除（级联删除子菜单）
```

### 3.2 NavTree 组件（拖拽核心）

**使用 dnd-kit 实现：**
```typescript
import { DndContext, DragOverlay, useSortable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// 支持的拖拽操作：
// - 同级排序（拖动改变 order_index）
// - 跨层级移动（拖动到另一个父级下）
// - 从子菜单拖到顶级（parent_id: null）
```

**视觉反馈：**
- 拖拽时显示半透明预览
- 目标位置显示插入线
- 无效位置显示禁止图标（如：拖到第三级）

### 3.3 NavItemEditor 组件

**编辑字段：**
1. **多语言标签** - Tab 切换语言，输入导航文本
2. **链接类型** - 单选 internal/external
3. **URL** - 文本输入（internal 时提供路径自动补全）
4. **发布状态** - 开关控制是否在前端显示

**对话框布局：**
```
┌─────────────────────────────────────┐
│  Edit Navigation Item         [×]  │
├─────────────────────────────────────┤
│  Label (Multi-language)             │
│  ┌─────┬─────┬─────┬─────┐         │
│  │  EN │  ZH │  AR │ ... │         │
│  └─────┴─────┴─────┴─────┘         │
│  [Products________________]        │
│                                     │
│  Link Type                          │
│  ○ Internal  ● External            │
│                                     │
│  URL                                │
│  [https://example.com_______]      │
│                                     │
│  Published                          │
│  [====○====] ON                    │
│                                     │
│  [Cancel]              [Save]      │
└─────────────────────────────────────┘
```

---

## 四、API 设计

### 4.1 API 端点

**基础路径：** `/api/admin/navigation`

| 方法 | 端点 | 功能 | 请求体 | 响应 |
|------|------|------|--------|------|
| GET | `/api/admin/navigation` | 获取导航树 | `?position=header\|footer` | `{items: NavigationItem[]}` |
| POST | `/api/admin/navigation` | 创建导航项 | `NavigationItemCreate` | `{item: NavigationItem}` |
| PUT | `/api/admin/navigation/[id]` | 更新导航项 | `NavigationItemUpdate` | `{item: NavigationItem}` |
| DELETE | `/api/admin/navigation/[id]` | 删除导航项 | - | `{success: true}` |
| PATCH | `/api/admin/navigation/reorder` | 批量更新排序 | `{updates: {id, parent_id, order_index}[]}` | `{success: true}` |

### 4.2 请求/响应类型

```typescript
// 创建导航项
interface NavigationItemCreate {
  position: 'header' | 'footer'
  parent_id?: string | null
  order_index: number
  link_type: 'internal' | 'external'
  url: string
  translations: Record<string, string>
  published?: boolean
}

// 更新导航项
interface NavigationItemUpdate {
  parent_id?: string | null
  order_index?: number
  link_type?: 'internal' | 'external'
  url?: string
  translations?: Record<string, string>
  published?: boolean
}

// 批量更新排序（拖拽后调用）
interface ReorderRequest {
  updates: Array<{
    id: string
    parent_id: string | null
    order_index: number
  }>
}
```

### 4.3 API 实现逻辑

**GET /api/admin/navigation：**
```typescript
1. 验证管理员权限
2. 从数据库查询所有导航项（指定 position）
3. 构建树形结构（parent_id 关联）
4. 按 order_index 排序
5. 返回树形数据
```

**PATCH /api/admin/navigation/reorder：**
```typescript
1. 验证管理员权限
2. 验证所有 ID 存在
3. 验证层级约束（最多两级）
4. 批量更新数据库（事务）
5. 触发 ISR 重新验证
6. 返回成功
```

**DELETE /api/admin/navigation/[id]：**
```typescript
1. 验证管理员权限
2. 检查是否有子菜单
3. 如果有子菜单，提示确认级联删除
4. 删除导航项（数据库 CASCADE 自动删除子菜单）
5. 触发 ISR 重新验证
6. 返回成功
```

### 4.4 错误处理

| 错误场景 | HTTP 状态码 | 错误消息 |
|---------|------------|---------|
| 未授权访问 | 401 | `Unauthorized` |
| 导航项不存在 | 404 | `Navigation item not found` |
| 层级超过限制 | 400 | `Maximum 2 levels allowed` |
| 无效的 parent_id | 400 | `Invalid parent_id` |
| 数据库错误 | 500 | `Database error` |

---

## 五、前端动态渲染设计

### 5.1 DynamicNavbar 组件

**目标：** 替换现有的硬编码导航栏，从数据库动态读取

**实现方式：**
```typescript
// src/components/public/dynamic-navbar.tsx
async function getNavigation(position: 'header'): Promise<NavigationItem[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('navigation')
    .select('*')
    .eq('position', 'header')
    .eq('published', true)
    .order('order_index')

  return buildTree(data) // 构建树形结构
}

export async function DynamicNavbar() {
  const locale = useLocale()
  const items = await getNavigation('header')

  return (
    <header>
      {items.map(item => (
        item.children?.length > 0
          ? <NavDropdown item={item} locale={locale} />
          : <NavLink item={item} locale={locale} />
      ))}
    </header>
  )
}
```

### 5.2 NavDropdown 组件（下拉菜单）

**支持两级菜单：**
```typescript
function NavDropdown({ item, locale }: Props) {
  const label = item.translations[locale] || item.translations['en']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{label}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {item.children?.map(child => (
          <DropdownMenuItem key={child.id}>
            <Link href={getUrl(child, locale)}>
              {child.translations[locale] || child.translations['en']}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 5.3 ISR 缓存策略

**目标：** 平衡性能和实时性

```typescript
// src/app/[locale]/layout.tsx
export const revalidate = 60 // 60秒重新验证

// 或者在 API 中手动触发
import { revalidatePath } from 'next/cache'

// 导航更新后
revalidatePath('/', 'layout') // 重新验证所有页面
```

### 5.4 多语言处理

**URL 处理逻辑：**
```typescript
function getUrl(item: NavigationItem, locale: string): string {
  if (item.link_type === 'external') {
    return item.url // 外部链接直接返回
  }

  // 内部链接添加语言前缀
  return `/${locale}${item.url}`
}
```

**标签回退逻辑：**
```typescript
function getLabel(item: NavigationItem, locale: string): string {
  // 优先使用当前语言，回退到英语
  return item.translations[locale] || item.translations['en'] || item.url
}
```

### 5.5 移动端适配

**复用现有 Sheet 组件：**
```typescript
// 移动端菜单
<Sheet>
  <SheetTrigger>
    <Menu />
  </SheetTrigger>
  <SheetContent>
    {items.map(item => (
      <div>
        <Link href={getUrl(item, locale)}>{getLabel(item, locale)}</Link>
        {item.children?.map(child => (
          <Link href={getUrl(child, locale)} className="pl-4">
            {getLabel(child, locale)}
          </Link>
        ))}
      </div>
    ))}
  </SheetContent>
</Sheet>
```

### 5.6 性能优化

**优化策略：**
1. **服务端渲染（SSR）** - 导航数据在服务端获取，减少客户端负担
2. **ISR 缓存** - 60秒重新验证，减少数据库查询
3. **代码分割** - DropdownMenu 组件懒加载
4. **图片优化** - Logo 使用 Next.js Image 组件

---

## 六、测试策略

### 6.1 单元测试

**测试范围：**
1. **API 函数测试**
   - 导航树构建逻辑
   - 排序更新逻辑
   - 层级验证逻辑

2. **组件测试**
   - NavTree 渲染
   - 拖拽交互
   - NavItemEditor 表单验证

**测试框架：** Jest + React Testing Library

**示例测试：**
```typescript
// __tests__/api/navigation.test.ts
describe('Navigation API', () => {
  it('should build navigation tree correctly', () => {
    const flatItems = [
      { id: '1', parent_id: null, order_index: 1 },
      { id: '2', parent_id: '1', order_index: 1 },
      { id: '3', parent_id: null, order_index: 2 },
    ]

    const tree = buildTree(flatItems)

    expect(tree).toHaveLength(2)
    expect(tree[0].children).toHaveLength(1)
  })

  it('should reject items with more than 2 levels', () => {
    const update = {
      id: '3',
      parent_id: '2', // '2' 已经是子菜单
    }

    expect(() => validateLevel(update)).toThrow('Maximum 2 levels allowed')
  })
})
```

### 6.2 集成测试

**测试场景：**
1. **完整流程测试**
   - 创建导航项 → 拖拽排序 → 更新 → 删除
   - 验证前端是否正确渲染

2. **多语言测试**
   - 切换语言，验证导航标签正确显示
   - 缺失翻译时回退到英语

3. **权限测试**
   - 未授权用户无法访问 API
   - 管理员可以正常操作

### 6.3 E2E 测试

**关键流程：**
```typescript
// e2e/navigation.spec.ts
test('admin can manage navigation', async ({ page }) => {
  // 登录后台
  await page.goto('/admin/login')
  await page.fill('input[name="email"]', 'admin@example.com')
  await page.click('button[type="submit"]')

  // 进入导航管理
  await page.goto('/admin/navigation')

  // 拖拽排序
  await page.dragAndDrop('[data-id="item-1"]', '[data-id="item-2"]')

  // 验证排序生效
  await expect(page.locator('[data-id="item-2"]')).toBeVisible()

  // 前端验证
  await page.goto('/')
  await expect(page.locator('nav')).toContainText('Updated Label')
})
```

### 6.4 性能测试

**测试指标：**
- API 响应时间 < 200ms
- 前端渲染时间 < 100ms
- 拖拽交互延迟 < 16ms (60fps)

---

## 七、实施计划

### 7.1 开发阶段划分

**Phase 1：基础设施（0.5天）**
- 安装 dnd-kit 依赖
- 创建 API 路由结构
- 编写类型定义

**Phase 2：后台管理界面（1.5天）**
- 实现 NavigationManager 组件
- 实现 NavTree 拖拽功能
- 实现 NavItemEditor 对话框
- 集成到 /admin/navigation 页面

**Phase 3：前端动态渲染（0.5天）**
- 实现 DynamicNavbar 组件
- 实现 NavDropdown 下拉菜单
- 替换现有硬编码导航栏
- 配置 ISR 缓存

**Phase 4：Footer 管理（0.5天）**
- 复用 NavigationManager 组件
- 创建 /admin/footer 页面
- 实现 DynamicFooter 组件

**Phase 5：测试和优化（0.5天）**
- 编写单元测试
- 编写集成测试
- 性能优化
- 文档完善

**总计：约 3.5 天**

### 7.2 技术依赖

**新增依赖：**
```json
{
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0",
  "@dnd-kit/utilities": "^3.2.0"
}
```

**现有依赖复用：**
- shadcn/ui 组件（Dialog、DropdownMenu、Button等）
- Supabase 客户端
- next-intl 多语言

### 7.3 文件结构

```
src/
├── app/
│   ├── admin/
│   │   ├── navigation/
│   │   │   └── page.tsx              # Header 导航管理
│   │   └── footer/
│   │       └── page.tsx              # Footer 导航管理
│   └── api/
│       └── admin/
│           └── navigation/
│               ├── route.ts          # GET、POST
│               ├── [id]/
│               │   └── route.ts      # PUT、DELETE
│               └── reorder/
│                   └── route.ts      # PATCH 批量排序
├── components/
│   ├── admin/
│   │   ├── navigation-manager.tsx    # 导航管理主组件
│   │   ├── nav-tree.tsx              # 树形结构（拖拽）
│   │   ├── nav-item-editor.tsx       # 编辑对话框
│   │   └── nav-drag-overlay.tsx      # 拖拽视觉反馈
│   └── public/
│       ├── dynamic-navbar.tsx        # 动态导航栏
│       ├── dynamic-footer.tsx        # 动态页脚
│       └── nav-dropdown.tsx          # 下拉菜单
└── lib/
    └── navigation/
        ├── api.ts                    # API 函数
        ├── tree.ts                   # 树形结构工具
        └── types.ts                  # 类型定义
```

### 7.4 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| dnd-kit 学习曲线 | 中 | 先实现简单拖拽，逐步增强 |
| 多级菜单拖拽复杂 | 高 | 限制为两级，简化逻辑 |
| ISR 缓存失效 | 低 | 手动触发 revalidatePath |
| 前端性能下降 | 中 | 使用 SSR + ISR 缓存 |

---

## 八、验收标准

### 8.1 功能验收

- [ ] 管理员可以创建、编辑、删除导航项
- [ ] 支持拖拽排序（同级和跨层级）
- [ ] 支持多语言标签编辑
- [ ] 支持内部链接和外部链接
- [ ] 前端正确渲染导航栏和页脚
- [ ] ISR 缓存正常工作

### 8.2 技术验收

- [ ] 所有 API 端点正常工作
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] E2E 测试通过
- [ ] 性能指标达标

### 8.3 用户体验验收

- [ ] 拖拽交互流畅（60fps）
- [ ] 多语言切换正确
- [ ] 移动端适配良好
- [ ] 无明显性能问题

---

**文档版本：v1.0**
**最后更新：2026-06-06**
