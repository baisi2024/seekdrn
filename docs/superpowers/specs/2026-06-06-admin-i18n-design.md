# 后台管理多语言支持设计文档

**日期**: 2026-06-06
**状态**: 设计完成，待实现
**作者**: AI Assistant

## 1. 概述

### 1.1 背景

SeekDrone 后台管理系统需要支持中英文双语界面，以方便不同语言背景的管理员使用。

### 1.2 当前状态

**已实现**：
- ✅ 业务数据多语言支持（产品、案例研究、解决方案等）
- ✅ TranslationTabs 组件用于编辑多语言数据
- ✅ 数据库表有 `translations` 字段存储多语言内容
- ✅ 翻译文件已存在（`messages/en/admin.json`, `messages/zh/admin.json`）

**未实现**：
- ❌ 界面元素翻译（导航、按钮、标题等硬编码英文）
- ❌ 语言切换器
- ❌ 语言偏好持久化

### 1.3 目标

为后台管理系统添加完整的中英文界面支持，包括：
1. 所有界面元素可翻译
2. 用户可自由切换语言
3. 语言偏好持久化到浏览器

## 2. 需求分析

### 2.1 功能需求

**FR-1**: 用户可以在后台管理界面中切换中英文
**FR-2**: 语言偏好保存到 localStorage，下次访问自动恢复
**FR-3**: 所有界面元素（导航、标题、按钮、表格列等）显示对应语言
**FR-4**: 业务数据的多语言编辑功能保持不变

### 2.2 非功能需求

**NFR-1**: 语言切换即时生效，无需刷新页面
**NFR-2**: 不影响现有路由结构（/admin/*）
**NFR-3**: 不影响认证和权限逻辑
**NFR-4**: 性能影响最小化

### 2.3 约束

**C-1**: 仅支持中英文（en, zh），不涉及其他语言
**C-2**: 不修改数据库结构
**C-3**: 不修改业务数据的多语言实现方式

## 3. 架构设计

### 3.1 整体架构

```
┌─────────────────────────────────────────┐
│         AdminLayout                     │
│  ┌───────────────────────────────────┐  │
│  │   AdminLanguageProvider           │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Sidebar                    │  │  │
│  │  │  - LanguageSwitcher         │  │  │
│  │  │  - NavItems (translated)    │  │  │
│  │  └─────────────────────────────┘  │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Page Content               │  │  │
│  │  │  - useAdminTranslations()   │  │  │
│  │  │  - All UI text translated   │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 3.2 核心组件

#### 3.2.1 AdminLanguageProvider

**职责**: 管理后台语言状态，提供语言上下文

**状态**:
- `language`: 当前语言（'en' | 'zh'）
- `setLanguage`: 设置语言函数

**行为**:
- 初始化时从 localStorage 读取语言偏好
- 语言变更时保存到 localStorage
- 提供上下文供子组件使用

#### 3.2.2 AdminLanguageSwitcher

**职责**: 提供语言切换 UI

**UI**: 两个按钮（EN / 中文），当前语言高亮

**行为**: 点击按钮调用 `setLanguage` 更新语言

#### 3.2.3 useAdminTranslations Hook

**职责**: 根据当前语言提供翻译函数

**输入**: 翻译键（如 'dashboard'）

**输出**: 对应语言的翻译文本

**实现**: 根据 `useAdminLanguage()` 返回的语言选择翻译文件

### 3.3 数据流

```
用户点击语言切换按钮
    ↓
AdminLanguageSwitcher 调用 setLanguage
    ↓
AdminLanguageProvider 更新 language 状态
    ↓
保存语言到 localStorage
    ↓
所有使用 useAdminTranslations 的组件重新渲染
    ↓
界面显示对应语言的文本
```

## 4. 组件设计

### 4.1 新增组件

#### AdminLanguageProvider

```typescript
// src/components/admin/language-provider.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface AdminLanguageContextType {
  language: 'en' | 'zh'
  setLanguage: (lang: 'en' | 'zh') => void
}

const AdminLanguageContext = createContext<AdminLanguageContextType>({
  language: 'en',
  setLanguage: () => {}
})

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'zh'>('en')

  // 从 localStorage 恢复语言偏好
  useEffect(() => {
    const saved = localStorage.getItem('admin-language')
    if (saved === 'en' || saved === 'zh') {
      setLanguageState(saved)
    }
  }, [])

  // 设置语言并保存
  const setLanguage = (lang: 'en' | 'zh') => {
    setLanguageState(lang)
    localStorage.setItem('admin-language', lang)
  }

  return (
    <AdminLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </AdminLanguageContext.Provider>
  )
}

export const useAdminLanguage = () => useContext(AdminLanguageContext)
```

#### AdminLanguageSwitcher

```typescript
// src/components/admin/language-switcher.tsx
'use client'

import { useAdminLanguage } from './language-provider'
import { Button } from '@/components/ui/button'

export function AdminLanguageSwitcher() {
  const { language, setLanguage } = useAdminLanguage()

  return (
    <div className="flex gap-2 p-4 border-t border-gray-800">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="flex-1"
      >
        English
      </Button>
      <Button
        variant={language === 'zh' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('zh')}
        className="flex-1"
      >
        中文
      </Button>
    </div>
  )
}
```

#### useAdminTranslations Hook

```typescript
// src/hooks/use-admin-translations.ts
'use client'

import { useAdminLanguage } from '@/components/admin/language-provider'
import adminTranslationsEn from '@/messages/en/admin.json'
import adminTranslationsZh from '@/messages/zh/admin.json'

const translations = {
  en: adminTranslationsEn,
  zh: adminTranslationsZh
}

export function useAdminTranslations() {
  const { language } = useAdminLanguage()

  return (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }
}
```

### 4.2 修改组件

#### Sidebar

**修改点**:
1. 使用 `useAdminTranslations` 获取翻译函数
2. 导航项标签使用翻译
3. 添加 `AdminLanguageSwitcher` 组件
4. Logout 按钮使用翻译

#### 所有后台页面

**修改点**:
1. 添加 `'use client'` 指令（如果需要）
2. 使用 `useAdminTranslations` 获取翻译函数
3. 所有硬编码文本替换为翻译函数调用

**涉及页面**:
- `/admin/page.tsx` - Dashboard
- `/admin/products/page.tsx` - 产品列表
- `/admin/products/[id]/page.tsx` - 产品编辑
- `/admin/case-studies/page.tsx` - 案例研究列表
- `/admin/solutions/page.tsx` - 解决方案列表
- `/admin/inquiries/page.tsx` - 咨询列表
- `/admin/navigation/page.tsx` - 导航管理
- `/admin/footer/page.tsx` - 页脚管理
- `/admin/compliance/page.tsx` - 合规管理
- `/admin/email-templates/page.tsx` - 邮件模板
- `/admin/settings/page.tsx` - 设置
- `/admin/media/page.tsx` - 媒体库

#### AdminLayout

**修改点**: 添加 `AdminLanguageProvider` 包裹

## 5. 翻译文件

### 5.1 现有翻译文件

**英文** (`messages/en/admin.json`):
```json
{
  "title": "SeekDrone Admin",
  "dashboard": "Dashboard",
  "inquiries": "Inquiries",
  "products": "Products",
  "caseStudies": "Case Studies",
  "solutions": "Solutions",
  "navigation": "Navigation",
  "footer": "Footer",
  "compliance": "Compliance",
  "emailTemplates": "Email Templates",
  "settings": "Settings",
  "media": "Media Library",
  "login": "Login",
  "logout": "Logout",
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "create": "Create",
  "published": "Published",
  "draft": "Draft"
}
```

**中文** (`messages/zh/admin.json`):
```json
{
  "title": "SeekDrone 管理后台",
  "dashboard": "仪表盘",
  "inquiries": "咨询",
  "products": "产品",
  "caseStudies": "案例研究",
  "solutions": "解决方案",
  "navigation": "导航",
  "footer": "页脚",
  "compliance": "合规",
  "emailTemplates": "邮件模板",
  "settings": "设置",
  "media": "媒体库",
  "login": "登录",
  "logout": "退出",
  "save": "保存",
  "cancel": "取消",
  "delete": "删除",
  "edit": "编辑",
  "create": "创建",
  "published": "已发布",
  "draft": "草稿"
}
```

### 5.2 需要扩展的翻译键

需要为每个页面添加更详细的翻译键，例如：

```json
{
  "products": {
    "title": "Products",
    "add": "Add Product",
    "edit": "Edit Product",
    "model": "Model",
    "category": "Category",
    "status": "Status",
    "compliance": "Compliance",
    "featured": "Featured",
    "searchPlaceholder": "Search products...",
    "basicInfo": "Basic Info",
    "images": "Images",
    "translations": "Translations",
    "saving": "Saving...",
    "loading": "Loading..."
  }
}
```

## 6. 实现计划

### 6.1 文件结构

```
src/
├── components/admin/
│   ├── language-provider.tsx      (新增)
│   ├── language-switcher.tsx      (新增)
│   └── sidebar.tsx                (修改)
├── hooks/
│   └── use-admin-translations.ts  (新增)
└── app/admin/
    ├── layout.tsx                 (修改)
    ├── page.tsx                   (修改)
    ├── products/
    │   ├── page.tsx               (修改)
    │   └── [id]/page.tsx          (修改)
    ├── case-studies/
    │   └── page.tsx               (修改)
    ├── solutions/
    │   └── page.tsx               (修改)
    ├── inquiries/
    │   └── page.tsx               (修改)
    ├── navigation/
    │   └── page.tsx               (修改)
    ├── footer/
    │   └── page.tsx               (修改)
    ├── compliance/
    │   └── page.tsx               (修改)
    ├── email-templates/
    │   └── page.tsx               (修改)
    ├── settings/
    │   └── page.tsx               (修改)
    └── media/
        └── page.tsx               (修改)
```

### 6.2 实现步骤

**阶段 1: 基础设施（优先级：高）**
1. 创建 `AdminLanguageProvider` 组件
2. 创建 `AdminLanguageSwitcher` 组件
3. 创建 `useAdminTranslations` hook
4. 修改 `admin/layout.tsx` 添加 Provider

**阶段 2: 核心组件（优先级：高）**
5. 修改 `Sidebar` 使用翻译和语言切换器
6. 扩展翻译文件添加详细翻译键

**阶段 3: 页面翻译（优先级：中）**
7. 修改 Dashboard 页面
8. 修改产品相关页面
9. 修改案例研究页面
10. 修改解决方案页面
11. 修改其他管理页面

**阶段 4: 测试和优化（优先级：中）**
12. 测试语言切换功能
13. 测试语言偏好持久化
14. 检查所有页面翻译完整性
15. 性能优化（如有需要）

## 7. 测试计划

### 7.1 功能测试

**测试用例 1**: 语言切换
- 操作：点击语言切换按钮
- 预期：界面立即切换为对应语言，所有文本正确显示

**测试用例 2**: 语言偏好持久化
- 操作：切换语言后刷新页面
- 预期：语言保持为切换后的语言

**测试用例 3**: 导航翻译
- 操作：切换语言后查看侧边栏导航
- 预期：所有导航项显示对应语言

**测试用例 4**: 页面内容翻译
- 操作：切换语言后访问各管理页面
- 预期：页面标题、按钮、表格列等显示对应语言

### 7.2 边界测试

**测试用例 5**: localStorage 不可用
- 操作：禁用 localStorage
- 预期：语言切换功能正常，但不持久化

**测试用例 6**: 无效语言值
- 操作：localStorage 中设置无效语言值
- 预期：回退到默认语言（英文）

## 8. 风险和缓解

### 8.1 风险

**R-1**: 翻译键缺失导致显示键名而非翻译
- **缓解**: 实现翻译函数时返回键名作为 fallback
- **缓解**: 实现后全面检查翻译完整性

**R-2**: 性能影响
- **缓解**: 翻译文件已预加载，无额外网络请求
- **缓解**: 语言切换仅触发局部重渲染

**R-3**: 与业务数据多语言混淆
- **缓解**: 明确区分界面翻译和数据翻译
- **缓解**: 文档说明两者独立运作

### 8.2 技术债务

**TD-1**: 翻译文件需要手动扩展
- **影响**: 新增页面时需要手动添加翻译键
- **优先级**: 低

**TD-2**: 仅支持中英文
- **影响**: 未来需要支持更多语言时需要修改代码
- **优先级**: 低（当前需求仅中英文）

## 9. 验收标准

**AC-1**: 用户可以在后台任意页面切换中英文
**AC-2**: 语言切换后所有界面元素显示对应语言
**AC-3**: 刷新页面后语言偏好保持
**AC-4**: 业务数据的多语言编辑功能不受影响
**AC-5**: 不影响现有路由结构和认证逻辑
**AC-6**: 性能无明显下降

## 10. 附录

### 10.1 相关文件

- 翻译文件: `messages/en/admin.json`, `messages/zh/admin.json`
- 后台布局: `src/app/admin/layout.tsx`
- 侧边栏: `src/components/admin/sidebar.tsx`
- 翻译标签组件: `src/components/admin/translation-tabs.tsx`

### 10.2 参考资料

- next-intl 文档: https://next-intl-docs.vercel.app/
- React Context 文档: https://react.dev/reference/react/createContext
- localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
