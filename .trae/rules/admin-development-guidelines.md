# SeekDrone 后台管理开发规范

## 概述

本文档定义了 SeekDrone 项目后台管理功能的开发规范，确保所有新增功能和页面都符合质量标准。

## 强制要求

### 1. 环境变量配置

**问题背景**：Supabase admin client 需要正确的环境变量才能运行。

**强制要求**：
- 所有使用 Supabase admin client 的代码必须验证环境变量
- 禁止使用非空断言（`!`）直接访问环境变量
- 必须提供清晰的错误提示

**正确示例**：
```typescript
// ✅ 正确：验证环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required. Please check your .env file.')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Please check your .env file.')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

**错误示例**：
```typescript
// ❌ 错误：使用非空断言
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 2. 国际化支持

**问题背景**：所有后台管理页面必须支持中英文双语。

**强制要求**：
- 所有用户可见的文本必须使用翻译函数
- 必须在 `messages/en/admin.json` 和 `messages/zh/admin.json` 中添加翻译键
- 使用 `useAdminTranslations` hook 获取翻译函数

**实现步骤**：

1. 在翻译文件中添加键：
```json
// messages/en/admin.json
{
  "new_feature": {
    "title": "New Feature",
    "description": "Description of the feature",
    "button": "Add New"
  }
}

// messages/zh/admin.json
{
  "new_feature": {
    "title": "新功能",
    "description": "功能描述",
    "button": "添加新项"
  }
}
```

2. 在组件中使用翻译：
```typescript
'use client'

import { useAdminTranslations } from '@/hooks/use-admin-translations'

export function NewFeatureComponent() {
  const t = useAdminTranslations()
  
  return (
    <div>
      <h1>{t('new_feature.title')}</h1>
      <p>{t('new_feature.description')}</p>
      <button>{t('new_feature.button')}</button>
    </div>
  )
}
```

**禁止行为**：
```typescript
// ❌ 错误：硬编码文本
return (
  <div>
    <h1>New Feature</h1>
    <p>Description of the feature</p>
  </div>
)
```

### 3. UI/UX 设计标准

**问题背景**：后台管理界面需要专业、现代、易用的设计。

**强制要求**：

#### 3.1 布局规范
- 使用 Tailwind CSS 的设计系统变量（`bg-background`, `text-foreground` 等）
- 避免硬编码颜色值（如 `bg-gray-100`）
- 使用渐变和阴影增加视觉层次
- 确保响应式设计（移动端、平板、桌面）

#### 3.2 交互设计
- 所有可交互元素必须有悬停状态
- 添加平滑过渡动画（`transition-all duration-200`）
- 提供清晰的视觉反馈（加载状态、成功/错误提示）
- 使用骨架屏替代简单的加载文字

#### 3.3 组件设计
- 使用 shadcn/ui 组件库
- 遵循组件组合模式
- 保持一致的间距系统（使用 `space-y-4`, `gap-4` 等）
- 添加适当的圆角和阴影

**设计示例**：

```typescript
// ✅ 正确：使用设计系统
<div className="bg-gradient-to-br from-slate-50 via-white to-blue-50">
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {/* 内容 */}
    </CardContent>
  </Card>
</div>

// ❌ 错误：硬编码样式
<div className="bg-gray-100">
  <div className="border p-4">
    <h1 className="text-gray-900">{title}</h1>
  </div>
</div>
```

### 4. 错误处理

**强制要求**：
- 所有 API 调用必须有错误处理
- 使用 try-catch 捕获异常
- 提供用户友好的错误提示（使用 toast）
- 记录错误日志

**示例**：
```typescript
const handleSubmit = async () => {
  try {
    setLoading(true)
    const response = await fetch('/api/admin/feature', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error('Failed to save')
    }
    
    toast.success('保存成功')
  } catch (error) {
    console.error('Error:', error)
    toast.error('保存失败，请重试')
  } finally {
    setLoading(false)
  }
}
```

### 5. 性能优化

**强制要求**：
- 使用 Next.js 的 Image 组件优化图片
- 实现数据分页，避免一次加载过多数据
- 使用 React Query 或 SWR 进行数据缓存
- 避免不必要的重渲染

## 开发流程

### 新增功能检查清单

在开发任何新的后台管理功能时，必须完成以下检查：

- [ ] **环境变量**
  - [ ] 检查是否需要新的环境变量
  - [ ] 在 `.env.example` 中添加示例
  - [ ] 在代码中验证环境变量存在

- [ ] **国际化**
  - [ ] 在 `messages/en/admin.json` 添加英文翻译
  - [ ] 在 `messages/zh/admin.json` 添加中文翻译
  - [ ] 使用 `useAdminTranslations` hook
  - [ ] 测试中英文切换功能

- [ ] **UI/UX**
  - [ ] 使用设计系统变量
  - [ ] 添加悬停和过渡效果
  - [ ] 实现响应式布局
  - [ ] 添加加载状态
  - [ ] 添加空状态设计
  - [ ] 添加错误状态处理

- [ ] **功能**
  - [ ] 实现完整的 CRUD 操作
  - [ ] 添加表单验证
  - [ ] 添加错误处理
  - [ ] 添加成功提示

- [ ] **测试**
  - [ ] 测试所有用户交互
  - [ ] 测试错误场景
  - [ ] 测试响应式布局
  - [ ] 测试国际化切换

## 常见问题解决方案

### 问题 1：Supabase Key 缺失

**症状**：运行时错误 "supabaseKey is required"

**解决方案**：
1. 检查 `.env` 文件是否存在
2. 确认 `SUPABASE_SERVICE_ROLE_KEY` 已设置
3. 重启开发服务器

### 问题 2：翻译不显示

**症状**：页面显示翻译键而不是翻译文本

**解决方案**：
1. 检查翻译文件中是否存在该键
2. 确认使用了 `useAdminTranslations` hook
3. 检查语言设置是否正确

### 问题 3：样式不一致

**症状**：不同页面样式差异大

**解决方案**：
1. 使用设计系统变量而非硬编码颜色
2. 遵循统一的间距系统
3. 使用 shadcn/ui 组件库

## 代码审查标准

在提交代码前，必须确保：

1. **无 TypeScript 错误**
   ```bash
   npm run typecheck
   ```

2. **无 ESLint 错误**
   ```bash
   npm run lint
   ```

3. **遵循本规范**
   - 环境变量验证完整
   - 国际化实现正确
   - UI 设计符合标准
   - 错误处理完善

## 参考资料

- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com)
- [Next.js 国际化](https://next-intl-docs.vercel.app)
- [Supabase 文档](https://supabase.com/docs)

## 更新日志

- 2026-06-07: 初始版本，定义三大核心要求
