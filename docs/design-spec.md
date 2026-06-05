# SeekDrone 独立站设计规格

> 创建日期：2024-06-05
> 状态：待审核
> 子项目：P1 基础架构

---

## 1. 设计决策摘要

### 1.1 目标
- **产品**：工业无人机 + 反制系统 B2B 询盘站
- **市场**：中东、非洲、南美、东南亚（非认证市场）
- **转化**：单一目标 - Request Demo
- **时间线**：质量优先，时间灵活

### 1.2 技术选型
- **框架**：Next.js 15 (App Router) + TypeScript
- **多语言**：next-intl（6 语言：en/ar/es/fr/pt/id + zh 条件显示）
- **数据库**：Supabase (PostgreSQL + Auth + RLS)
- **存储**：Cloudflare R2
- **样式**：Tailwind CSS + shadcn/ui
- **邮件**：Resend（替代飞书，邮件直发）

### 1.3 设计风格
- **参考**：DJI Enterprise、Airbus Defence、华为企业站
- **配色**：蓝色 `#2563eb`（专业、可信赖）
- **背景**：浅色（技术文档可读性）
- **科技感**：微妙网格背景 + 数据可视化 + Mono 字体
- **信息架构**：产品为核心 → 信任数据 → 案例 → CTA

---

## 2. 视觉规格

### 2.1 配色系统

```css
/* 主色 */
--primary: #2563eb;        /* 蓝色 - CTA、链接、强调 */
--primary-hover: #1d4ed8;

/* 背景 */
--bg-white: #ffffff;
--bg-gray-50: #f8fafc;
--bg-gray-100: #f1f5f9;
--bg-gray-900: #0f172a;    /* 深色区块 */

/* 文字 */
--text-primary: #111827;
--text-secondary: #4b5563;
--text-muted: #6b7280;

/* 边框 */
--border: #e5e7eb;
--border-light: #f1f5f9;
```

### 2.2 字体系统

```css
/* 主字体 */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* 等宽字体（数据） */
font-family: 'IBM Plex Mono', 'Consolas', monospace;
```

### 2.3 间距系统

```css
/* Tailwind 默认间距 */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-4: 1rem;     /* 16px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
```

### 2.4 圆角

```css
--radius-sm: 0.375rem;   /* 6px - 按钮、输入框 */
--radius-md: 0.5rem;     /* 8px - 卡片 */
--radius-lg: 0.75rem;    /* 12px - 大卡片 */
--radius-xl: 1rem;       /* 16px - Hero 图片 */
--radius-2xl: 1.5rem;    /* 24px - 产品卡片 */
```

---

## 3. 组件规格

### 3.1 导航栏

```
高度：64px (h-16)
背景：白色 95% + backdrop-blur
边框：底部 1px gray-100
内容：
  - Logo（左）：图标 32px + 文字 "SeekDrone"
  - 导航（中）：Products | Solutions | Case Studies | Support | Where to Buy
  - 操作（右）：语言选择器 + Request Demo 按钮
```

### 3.2 Hero 区

```
布局：两列网格（lg:grid-cols-2）
左列：
  - 产品图片 4:3 比例
  - 播放按钮覆盖
  - NEW 徽章
右列：
  - 分类标签（蓝色圆角）
  - 产品名称（H1，4xl-5xl）
  - 描述（text-lg）
  - 性能指标卡片（带进度条）
  - CTA 按钮 × 2
```

### 3.3 信任条

```
背景：gray-900
布局：4 列网格
内容：
  - 50,000+ Flight Hours
  - 120 Countries
  - 500+ Enterprise Clients
  - 24/7 Support
字体：IBM Plex Mono，蓝色
```

### 3.4 产品卡片

```
布局：3 列网格
卡片结构：
  - 图片区 4:3 + 标签
  - 分类标签（mono）
  - 标题（H3）
  - 描述
  - 规格表（3 行）
  - Learn More 链接
悬停：translateY(-4px) + shadow
```

### 3.5 案例卡片

```
布局：3 列网格
卡片结构：
  - 视频区 16:9 + 播放按钮
  - 行业/地区标签
  - 标题
  - 描述
  - 量化成果卡片（蓝色渐变背景）
```

### 3.6 Demo 表单

```
布局：2 列网格（姓名/公司/邮箱/国家）
字段：
  - Full Name * (text)
  - Company * (text)
  - Email * (email)
  - Country * (select)
提交按钮：全宽，蓝色
```

---

## 4. 页面结构

### 4.1 首页

```
1. 导航栏（sticky）
2. Hero 区（产品展示）
3. 信任条（数据）
4. 产品列表（3 个分类）
5. 行业解决方案（4 个）
6. 案例库（3 个精选）
7. CTA 区（Demo 表单）
8. Footer
```

### 4.2 产品详情页（P2）

```
1. 导航栏
2. 产品 Hero（大图 + 参数）
3. 详细规格表
4. 相关案例
5. 相关产品
6. CTA
7. Footer
```

### 4.3 案例详情页（P2）

```
1. 导航栏
2. 案例 Hero（视频）
3. 挑战
4. 解决方案
5. 量化成果
6. 现场素材
7. 相关产品
8. CTA
9. Footer
```

---

## 5. 多语言规格

### 5.1 支持语言

| 代码 | 语言 | 区域 | RTL |
|------|------|------|-----|
| en | English | Global | No |
| ar | العربية | Middle East | **Yes** |
| es | Español | South America | No |
| fr | Français | Africa | No |
| pt | Português | Brazil/Angola | No |
| id | Bahasa Indonesia | Indonesia | No |
| zh | 中文 | China（条件显示） | No |

### 5.2 消息文件结构

```
messages/
├── en/
│   ├── common.json      # 按钮、表单、错误
│   ├── nav.json         # 导航菜单
│   ├── home.json        # 首页
│   ├── products.json    # 产品页
│   ├── solutions.json   # 方案页
│   ├── cases.json       # 案例页
│   └── compliance.json  # 合规页
├── ar/  (同结构，RTL)
├── es/
├── fr/
├── pt/
├── id/
└── zh/
```

### 5.3 RTL 支持

- �阿拉伯语（ar）需要 RTL 布局
- 使用 Tailwind 的 `rtl:` 前缀
- 组件需要镜像翻转

---

## 6. 响应式断点

```css
/* Tailwind 默认断点 */
sm: 640px   /* 手机横屏 */
md: 768px   /* 平板竖屏 */
lg: 1024px  /* 平板横屏 / 小笔记本 */
xl: 1280px  /* 桌面 */
2xl: 1536px /* 大桌面 */
```

### 6.1 关键响应式规则

- **导航**：移动端隐藏链接，显示汉堡菜单
- **Hero**：移动端单列，图片在下
- **产品网格**：移动端单列，平板双列，桌面三列
- **表单**：移动端单列，桌面双列

---

## 7. 性能目标

| 指标 | 目标 |
|------|------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.8s |

### 7.1 优化策略

- 图片：WebP 格式，响应式 srcset
- 字体：preconnect + font-display: swap
- 代码：代码分割，动态导入
- 缓存：ISR revalidate: 60s

---

## 8. 可访问性

- 所有图片需要 alt 文本
- 表单字段需要 label 关联
- 按钮需要明确的 aria-label
- 颜色对比度 ≥ 4.5:1
- 键盘导航支持

---

## 9. 下一步

- [ ] 用户审核此 Spec
- [ ] 进入 P1 实施计划
- [ ] 数据库表结构设计
- [ ] API 接口设计

---

**请审核此设计规格，确认后进入实施计划。**
