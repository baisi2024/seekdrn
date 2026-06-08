# 子项目 2：后台管理补全

> 状态：待审核 → 实施
> 日期：2026-06-08
> 范围：后台管理 UI + API + 前台消费

---

## 1. 目标

让运营团队能完整管理全站内容，消除"只能操作数据库"的管理黑洞。

---

## 2. 严重缺口（必须修复）

### 2.1 解决方案 CRUD

**现状**：后台有列表页和"新增"按钮，但无编辑页面、无 API Route。

**方案**：
- 新增 `/admin/solutions/[id]/page.tsx` 编辑页
- 新增 `/admin/solutions/new/page.tsx` 新建页
- 复用现有后台编辑页模式（参考 case-studies/[id]）
- 编辑内容：slug、icon、published、featured、sort_order、translations（title/challenge/solution/workflow）、metrics、关联产品、关联案例

### 2.2 Hero 配置编辑

**现状**：首页 Hero 依赖 `site_settings.hero_config`，后台设置页无编辑入口。

**方案**：在 `/admin/settings` 页面增加 Hero 配置编辑区域：
- 主标题（多语言）
- 副标题（多语言）
- CTA 文字（多语言）
- CTA 链接
- 背景图/视频选择

### 2.3 站点设置多语言

**现状**：Trust Bar、CTA、SEO 等配置仅支持英文输入。

**方案**：在设置页为每个多语言字段增加语言 Tab 切换，支持 7 种语言编辑。

---

## 3. 重要缺口（影响运营效率）

### 3.1 询盘管理增强

**现状**：只有列表展示，无状态流转、无详情页。

**方案**：
- 新增 `/admin/inquiries/[id]/page.tsx` 详情页
- 支持状态流转：pending → contacted → qualified → closed_won / closed_lost
- 支持添加备注
- 支持标记销售人员

### 3.2 FAQ 全站管理

**现状**：首页 FAQ 无法独立管理，只能在产品编辑页内按产品管理。

**方案**：新增 `/admin/faqs/page.tsx`，管理全站 FAQ（faqs 表），支持分类、排序、发布。

### 3.3 产品删除入口

**现状**：后台 UI 无删除产品的操作入口。

**方案**：在产品列表页增加删除按钮，确认后调用 `deleteProduct` API。

### 3.4 媒体 alt_text 编辑

**现状**：媒体库只有浏览和删除，无编辑 alt_text/tags 功能。

**方案**：在媒体库增加编辑弹窗，支持编辑 alt_text（多语言）和 tags。

### 3.5 合规 ISR 补全中文

**现状**：合规 API 的 ISR revalidatePath 遍历语言列表缺少 zh。

**方案**：在 compliance API 的语言列表中加入 'zh'。

### 3.6 案例客户评价支持 7 语言

**现状**：案例编辑页 Quote Tab 仅支持 en/zh。

**方案**：改为支持全部 7 种前台语言。

---

## 4. 前台消费增强

### 4.1 标签颜色前台消费

**现状**：后台配置的标签颜色在前台完全未体现。

**方案**：ProductCard 和产品详情页的 Badge 使用标签颜色。

### 4.2 分类图标前台消费

**现状**：分类管理支持 icon/image 字段，前台未使用。

**方案**：产品列表页的分类筛选使用分类图标。

---

## 5. 不做的事

- 不做 ROI 计算器（子项目 3）
- 不做产品对比（子项目 3）
- 不做社交分享（子项目 3）
- 不改数据库核心结构（子项目 1 已完成）
- 不引入新权限系统
