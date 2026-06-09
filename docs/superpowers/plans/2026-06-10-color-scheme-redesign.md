# SeekDrone 配色重设计实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 SeekDrone 全站配色升级为深空工业科技风

**Architecture:** 更新 CSS 变量为核心，然后逐组件替换颜色引用，保持功能不变

**Tech Stack:** Next.js 16 + Tailwind CSS + shadcn/ui + OKLCH/HEX 颜色

---

## 文件结构

### 核心文件
- `src/app/globals.css` - 全局 CSS 变量（颜色定义）
- `src/components/ui/button.tsx` - 按钮组件样式
- `src/components/ui/card.tsx` - 卡片组件样式

### 前端页面
- `src/app/[locale]/layout.tsx` - 前端布局
- `src/app/[locale]/page.tsx` - 首页
- `src/components/public/navbar.tsx` - 导航栏
- `src/components/public/footer.tsx` - 页脚
- `src/components/public/hero.tsx` - Hero 区域
- `src/components/public/product-card.tsx` - 产品卡片
- `src/components/public/cta-section.tsx` - CTA 区域
- `src/components/public/demo-form.tsx` - 表单

### 后台页面
- `src/app/admin/layout.tsx` - 后台布局
- `src/components/admin/sidebar.tsx` - 侧边栏

---

## Task 1: 更新全局 CSS 变量

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 更新 :root 变量**

```css
:root {
  --background: #0A0E17;
  --foreground: #FFFFFF;

  --card: #1A1F2E;
  --card-foreground: #FFFFFF;

  --popover: #1A1F2E;
  --popover-foreground: #FFFFFF;

  --primary: #0066FF;
  --primary-foreground: #FFFFFF;

  --secondary: #1A1F2E;
  --secondary-foreground: #FFFFFF;

  --muted: #1A1F2E;
  --muted-foreground: rgba(255,255,255,0.5);

  --accent: #0066FF;
  --accent-foreground: #FFFFFF;

  --destructive: #FF4444;

  --border: rgba(255,255,255,0.06);
  --input: rgba(255,255,255,0.06);

  --ring: #0066FF;

  --radius: 0.5rem;

  --sidebar: #0A0E17;
  --sidebar-foreground: #FFFFFF;
  --sidebar-primary: #0066FF;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #1A1F2E;
  --sidebar-accent-foreground: #FFFFFF;
  --sidebar-border: rgba(255,255,255,0.06);
  --sidebar-ring: #0066FF;
}
```

- [ ] **Step 2: 更新 .dark 变量**

```css
.dark {
  --background: #0A0E17;
  --foreground: #FFFFFF;

  --card: #1A1F2E;
  --card-foreground: #FFFFFF;

  --popover: #1A1F2E;
  --popover-foreground: #FFFFFF;

  --primary: #0066FF;
  --primary-foreground: #FFFFFF;

  --secondary: #1A1F2E;
  --secondary-foreground: #FFFFFF;

  --muted: #1A1F2E;
  --muted-foreground: rgba(255,255,255,0.5);

  --accent: #0066FF;
  --accent-foreground: #FFFFFF;

  --destructive: #FF4444;

  --border: rgba(255,255,255,0.06);
  --input: rgba(255,255,255,0.06);

  --ring: #0066FF;

  --sidebar: #0A0E17;
  --sidebar-foreground: #FFFFFF;
  --sidebar-primary: #0066FF;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #1A1F2E;
  --sidebar-accent-foreground: #FFFFFF;
  --sidebar-border: rgba(255,255,255,0.06);
  --sidebar-ring: #0066FF;
}
```

- [ ] **Step 3: 更新注释**

```css
/*
 * SeekDrone Brand Design System
 * Deep Space Industrial Tech Style
 * Background: Deep Space Black (#0A0E17)
 * Primary: Electric Blue (#0066FF) - CTA only
 * Text: Pure White (#FFFFFF)
 * Card: Deep Gray (#1A1F2E)
 * Muted: Semi-transparent White (rgba(255,255,255,0.5))
 * Border: Ultra-light White (rgba(255,255,255,0.06))
 */
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: update color scheme to deep space industrial tech style"
```

---

## Task 2: 更新前端布局

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: 更新 main 背景色**

```tsx
<main className="min-h-screen bg-background">
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat: update frontend layout background"
```

---

## Task 3: 更新导航栏

**Files:**
- Modify: `src/components/public/navbar.tsx`

- [ ] **Step 1: 更新导航栏背景**

```tsx
<header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur">
```

- [ ] **Step 2: 更新 Logo 区域**

```tsx
<Link href={`/${locale}`} className="flex items-center gap-3">
  <div className="h-8 w-8 flex items-center justify-center border border-[#0066FF]">
    <span className="text-[#0066FF] font-bold text-sm">SD</span>
  </div>
  <span className="font-semibold text-lg tracking-wide text-white">SEEKDRONE</span>
</Link>
```

- [ ] **Step 3: 更新导航链接**

```tsx
<nav className="hidden md:flex items-center gap-8">
  {navLinks.map((link) => (
    <Link key={link.href} href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
      {link.label}
    </Link>
  ))}
</nav>
```

- [ ] **Step 4: 更新 CTA 按钮**

```tsx
<Button 
  render={<Link href={`/${locale}#demo-form`} />} 
  nativeButton={false} 
  size="sm" 
  className="hidden md:inline-flex bg-[#0066FF] text-white hover:bg-[#0052CC]"
>
  {t('nav.requestDemo')}
</Button>
```

- [ ] **Step 5: 更新移动端菜单**

```tsx
<SheetContent side="right" className="w-72 bg-[#0A0E17] border-l border-white/[0.06]">
```

- [ ] **Step 6: Commit**

```bash
git add src/components/public/navbar.tsx
git commit -m "feat: update navbar to deep space style"
```

---

## Task 4: 更新页脚

**Files:**
- Modify: `src/components/public/footer.tsx`

- [ ] **Step 1: 更新页脚背景**

```tsx
<footer className="bg-[#0A0E17] border-t border-white/[0.06] text-white/50">
```

- [ ] **Step 2: 更新 Logo**

```tsx
<div className="flex items-center gap-3 mb-4">
  <div className="h-8 w-8 flex items-center justify-center border border-[#0066FF]">
    <span className="text-[#0066FF] font-bold text-sm">SD</span>
  </div>
  <span className="font-semibold text-lg tracking-wide text-white">SeekDrone</span>
</div>
```

- [ ] **Step 3: 更新标题颜色**

```tsx
<h3 className="text-white font-semibold mb-4">{t('nav.products')}</h3>
```

- [ ] **Step 4: 更新链接颜色**

```tsx
<Link href={`/${locale}/products?cat=uav`} className="hover:text-white transition-colors">UAV Platforms</Link>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/public/footer.tsx
git commit -m "feat: update footer to deep space style"
```

---

## Task 5: 更新 Hero 组件

**Files:**
- Modify: `src/components/public/hero.tsx`

- [ ] **Step 1: 更新背景**

```tsx
<section className="relative overflow-hidden bg-[#0A0E17]">
```

- [ ] **Step 2: 添加背景网格**

```tsx
<div 
  className="absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    backgroundSize: '60px 60px',
  }}
/>
```

- [ ] **Step 3: 更新标签样式**

```tsx
<Badge variant="outline" className="text-xs font-medium border-[#0066FF]/30 text-[#0066FF] bg-[#0066FF]/8">
  {category}
</Badge>
```

- [ ] **Step 4: 更新标题颜色**

```tsx
<h1 className="max-w-3xl text-4xl font-bold leading-tight text-white lg:text-6xl">{title}</h1>
```

- [ ] **Step 5: 更新描述颜色**

```tsx
<p className="max-w-2xl text-lg leading-8 text-white/50">{subtitle}</p>
```

- [ ] **Step 6: 更新按钮**

```tsx
<Button 
  render={<Link href="#demo-form" />} 
  nativeButton={false} 
  size="lg"
  className="bg-[#0066FF] text-white hover:bg-[#0052CC]"
>
  {tc('cta.requestQuote')}
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
<Button 
  render={<Link href={`/${locale}/products`} />} 
  nativeButton={false} 
  variant="outline" 
  size="lg"
  className="border-white/20 text-white hover:bg-white/10"
>
  {tc('cta.exploreProducts')}
</Button>
```

- [ ] **Step 7: 更新证明项卡片**

```tsx
<div className="rounded-2xl border border-white/[0.06] bg-[#1A1F2E] p-4">
  <Icon className="h-5 w-5 text-[#0066FF]" />
  <p className="mt-3 text-sm font-medium text-white">{item.label}</p>
</div>
```

- [ ] **Step 8: Commit**

```bash
git add src/components/public/hero.tsx
git commit -m "feat: update hero to deep space style"
```

---

## Task 6: 更新产品卡片

**Files:**
- Modify: `src/components/public/product-card.tsx`

- [ ] **Step 1: 更新卡片背景**

```tsx
<article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#1A1F2E] transition-all duration-300 hover:-translate-y-1 hover:border-[#0066FF]/40">
```

- [ ] **Step 2: 更新图片区域背景**

```tsx
<div className="relative aspect-[4/3] overflow-hidden bg-[#0A0E17]">
```

- [ ] **Step 3: 更新 Badge**

```tsx
{product.model && <Badge className="font-mono text-xs bg-[#0066FF]">{product.model}</Badge>}
{categoryLabel && <Badge variant="secondary" className="text-xs bg-white/10 text-white/70">{categoryLabel}</Badge>}
```

- [ ] **Step 4: 更新文字颜色**

```tsx
<h3 className="mt-2 text-lg font-semibold leading-snug text-white">
```

```tsx
<p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
```

- [ ] **Step 5: 更新规格区域**

```tsx
<div className="rounded-xl border border-white/[0.06] bg-[#0A0E17] p-3">
  <dt className="truncate text-xs text-white/50">{label}</dt>
  <dd className="mt-1 truncate font-mono text-sm font-semibold text-white">
```

- [ ] **Step 6: 更新链接颜色**

```tsx
<Link href={`/${locale}/products/${product.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:text-[#0052CC]">
```

- [ ] **Step 7: Commit**

```bash
git add src/components/public/product-card.tsx
git commit -m "feat: update product card to deep space style"
```

---

## Task 7: 更新首页

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: 更新产品区域背景**

```tsx
<section className="py-16 lg:py-24 bg-[#0A0E17]">
```

- [ ] **Step 2: 更新标题颜色**

```tsx
<h2 className="text-3xl font-bold text-white">{t('products.title')}</h2>
```

- [ ] **Step 3: 更新链接颜色**

```tsx
<Link href={`/${locale}/products`} className="inline-flex items-center gap-2 text-sm font-medium text-[#0066FF] hover:text-[#0052CC]">
```

- [ ] **Step 4: 更新空状态**

```tsx
<div className="text-center py-16 text-white/50">
```

- [ ] **Step 5: 更新案例区域**

```tsx
<section className="py-16 lg:py-24 bg-[#0A0E17]">
```

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: update homepage to deep space style"
```

---

## Task 8: 更新 CTA 区域

**Files:**
- Modify: `src/components/public/cta-section.tsx`

- [ ] **Step 1: 更新背景**

```tsx
<section className="bg-[#1A1F2E] py-16 lg:py-24">
```

- [ ] **Step 2: 更新卡片**

```tsx
<div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.06] bg-[#0A0E17] p-8 lg:p-12">
```

- [ ] **Step 3: 更新文字颜色**

```tsx
<h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{title}</h2>
<p className="text-lg text-white/50 mb-8 max-w-2xl mx-auto">{subtitle}</p>
```

- [ ] **Step 4: 更新按钮**

```tsx
<Button
  render={<Link href="#demo-form" />}
  nativeButton={false}
  size="lg"
  className="bg-[#0066FF] text-white hover:bg-[#0052CC]"
>
  {buttonText}
</Button>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/public/cta-section.tsx
git commit -m "feat: update cta section to deep space style"
```

---

## Task 9: 更新 Demo 表单

**Files:**
- Modify: `src/components/public/demo-form.tsx`

- [ ] **Step 1: 更新背景**

```tsx
<section id="demo-form" className="bg-[#1A1F2E] py-16 lg:py-24">
```

- [ ] **Step 2: 更新表单卡片**

```tsx
<form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/[0.06] bg-[#0A0E17] p-6 lg:p-8">
```

- [ ] **Step 3: 更新输入框样式**

```tsx
<Input 
  id="fullName" 
  value={formData.fullName} 
  onChange={(e) => handleChange('fullName', e.target.value)}
  className="bg-[#1A1F2E] border-white/[0.06] text-white placeholder:text-white/30"
/>
```

- [ ] **Step 4: 更新标签颜色**

```tsx
<Label className="text-white/70">{t('form.fullName')}</Label>
```

- [ ] **Step 5: 更新错误文字**

```tsx
{errors.fullName && <p className="text-sm text-red-400">{errors.fullName}</p>}
```

- [ ] **Step 6: 更新提交按钮**

```tsx
<Button type="submit" size="lg" className="w-full bg-[#0066FF] text-white hover:bg-[#0052CC]" disabled={submitting}>
```

- [ ] **Step 7: Commit**

```bash
git add src/components/public/demo-form.tsx
git commit -m "feat: update demo form to deep space style"
```

---

## Task 10: 更新后台布局

**Files:**
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: 更新背景**

```tsx
<div className="min-h-screen bg-[#0A0E17]">
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/layout.tsx
git commit -m "feat: update admin layout to deep space style"
```

---

## Task 11: 更新后台侧边栏

**Files:**
- Modify: `src/components/admin/sidebar.tsx`

- [ ] **Step 1: 更新侧边栏背景**

```tsx
<aside className="fixed inset-y-0 left-0 w-64 bg-[#0A0E17] border-r border-white/[0.06] text-white hidden lg:block">
```

- [ ] **Step 2: 更新 Logo 区域**

```tsx
<div className="p-6 border-b border-white/[0.06]">
  <h1 className="text-xl font-bold tracking-wide text-white">
    {t('title')}
  </h1>
</div>
```

- [ ] **Step 3: 更新导航项**

```tsx
<Link
  key={item.href}
  href={item.href}
  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
    isActive 
      ? 'bg-[#0066FF] text-white' 
      : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
  }`}
>
```

- [ ] **Step 4: 更新登出按钮**

```tsx
<Button
  variant="ghost"
  className="w-full justify-start text-white/50 hover:text-white hover:bg-white/[0.04]"
  onClick={handleLogout}
>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/sidebar.tsx
git commit -m "feat: update admin sidebar to deep space style"
```

---

## Task 12: 更新产品列表页

**Files:**
- Modify: `src/app/[locale]/products/page.tsx`

- [ ] **Step 1: 更新背景**

```tsx
<div className="bg-[#0A0E17] py-16">
```

- [ ] **Step 2: 更新标题区域**

```tsx
<div className="mb-10 rounded-3xl border border-white/[0.06] bg-[#1A1F2E] p-8 lg:p-10">
```

- [ ] **Step 3: 更新标题颜色**

```tsx
<h1 className="mt-3 text-3xl font-bold text-white lg:text-5xl">{t('title')}</h1>
<p className="mt-4 max-w-3xl text-lg leading-7 text-white/50">
```

- [ ] **Step 4: 更新空状态**

```tsx
<div className="text-center py-16 text-white/50">
```

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/products/page.tsx
git commit -m "feat: update products page to deep space style"
```

---

## Task 13: 验证和测试

- [ ] **Step 1: 运行类型检查**

```bash
npm run typecheck
```

- [ ] **Step 2: 运行代码检查**

```bash
npm run lint
```

- [ ] **Step 3: 运行架构检查**

```bash
npm run check:arch
```

- [ ] **Step 4: 启动开发服务器查看效果**

```bash
npm run dev
```

- [ ] **Step 5: 检查以下页面**
- 首页 (http://localhost:3000/zh)
- 产品列表页 (http://localhost:3000/zh/products)
- 后台首页 (http://localhost:3000/admin)

- [ ] **Step 6: 最终 Commit**

```bash
git add .
git commit -m "feat: complete color scheme redesign to deep space industrial tech style"
```

---

## 验收标准

- [ ] 全站背景为深空黑 `#0A0E17`
- [ ] 主文字为纯白 `#FFFFFF`
- [ ] CTA 按钮为电光蓝 `#0066FF`
- [ ] 没有绿色、橙色、渐变等禁用元素
- [ ] 整体感觉专业、科技、前沿
- [ ] 与大疆有明确差异化
- [ ] 类型检查通过
- [ ] 代码检查通过
- [ ] 架构检查通过
