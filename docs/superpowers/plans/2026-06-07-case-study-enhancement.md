# 案例详情页增强功能实施计划

## 1. 项目概述

本计划基于设计文档 `2026-06-07-case-study-enhancement-design.md`，旨在实施案例详情页增强功能。

### 1.1 目标

| 目标 | 描述 |
|------|------|
| 自定义视频播放器 | 使用 react-player 替换简单HTML5 video标签 |
| Admin视频管理 | 支持视频上传、预览、删除 |
| Admin素材图片管理 | 支持图片上传、删除、排序 |
| Admin案例编辑页面 | 创建完整的案例编辑管理界面 |

### 1.2 实施方式

采用 **Subagent-Driven** 执行方式，每个任务派发独立的子agent执行。

---

## 2. 实施任务清单

### 阶段1：准备工作

**任务1.1：安装 react-player 依赖**
- 安装 `react-player` 包
- 版本：最新稳定版
- 依赖类型：生产依赖

**任务1.2：检查现有代码结构**
- 确认案例详情页位置
- 确认Admin页面结构
- 确认上传组件位置

### 阶段2：创建视频播放器组件

**任务2.1：创建 VideoPlayer 组件**
- 文件路径：`src/components/public/video-player.tsx`
- 功能：封装 react-player
- 特性：自定义控件、响应式设计

### 阶段3：更新案例详情页

**任务3.1：更新案例详情页**
- 文件路径：`src/app/[locale]/case-studies/[slug]/page.tsx`
- 修改：替换 `<video>` 标签为 `<VideoPlayer>` 组件
- 保持其他功能不变

### 阶段4：创建 Admin 案例编辑页面

**任务4.1：创建案例编辑页面**
- 文件路径：`src/app/admin/case-studies/[id]/page.tsx`
- 功能模块：
  - 基础信息编辑
  - 视频管理（使用MediaUpload）
  - 图片管理（使用MediaUpload）
  - 多语言内容编辑
  - 量化成果编辑
  - 客户引用编辑

**任务4.2：更新案例列表页**
- 添加编辑链接

### 阶段5：添加多语言翻译

**任务5.1：添加管理后台翻译**
- 文件：`messages/zh/admin.json`
- 文件：`messages/en/admin.json`

### 阶段6：测试与验证

**任务6.1：运行构建测试**
- 执行 `npm run build`
- 修复构建错误

**任务6.2：功能测试**
- 测试视频播放
- 测试视频上传
- 测试图片上传
- 测试内容编辑

---

## 3. 任务详情

### 任务1.1：安装 react-player 依赖

```bash
npm install react-player
```

### 任务2.1：创建 VideoPlayer 组件

**文件路径:** `src/components/public/video-player.tsx`

```typescript
'use client'

import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  url: string
  poster?: string
  controls?: boolean
  autoplay?: boolean
  loop?: boolean
}

export function VideoPlayer({ 
  url, 
  poster, 
  controls = true, 
  autoplay = false, 
  loop = false 
}: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={url}
        poster={poster}
        controls={controls}
        autoplay={autoplay}
        loop={loop}
        width="100%"
        height="100%"
        className="react-player"
        playing={autoplay}
      />
    </div>
  )
}
```

### 任务3.1：更新案例详情页

**修改:** 将简单video标签替换为VideoPlayer组件

```typescript
// 替换前
<video src={caseStudy.video_url} controls className="w-full h-full object-cover" />

// 替换后
<VideoPlayer url={caseStudy.video_url} poster={caseStudy.images[0]} />
```

### 任务4.1：创建案例编辑页面

**文件结构:**
- `src/app/admin/case-studies/[id]/page.tsx` - 主页面
- 使用现有组件：
  - `MediaUpload` - 文件上传
  - `TranslationTabs` - 多语言编辑
  - `AdminPage` - 页面框架

**功能模块:**

| 模块 | 字段 | 说明 |
|------|------|------|
| 基础信息 | slug, industry, country, published, featured, sort_order | 基础字段 |
| 视频管理 | video_url | 使用MediaUpload |
| 图片管理 | images | 使用MediaUpload |
| 内容编辑 | translations (title, background, challenge, solution) | 多语言富文本 |
| 成果编辑 | results | JSON数组 |
| 客户引用 | client_quote | 多语言文本 |

---

## 4. 依赖与资源

### 4.1 新增依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| react-player | ^2.16.0 | 视频播放器 |

### 4.2 复用组件

| 组件 | 路径 | 说明 |
|------|------|------|
| MediaUpload | src/components/admin/image-upload.tsx | 文件上传 |
| TranslationTabs | src/components/admin/translation-tabs.tsx | 多语言编辑 |
| AdminPage | src/components/admin/core.tsx | 页面框架 |
| Button | src/components/ui/button.tsx | 按钮组件 |

### 4.3 API依赖

| API | 路径 | 说明 |
|-----|------|------|
| 文件上传 | /api/upload | 已有 |
| 案例CRUD | /api/admin/case-studies | 需要创建 |

---

## 5. 时间预估

| 任务 | 预估时间 |
|------|----------|
| 任务1.1 | 0.5小时 |
| 任务1.2 | 0.5小时 |
| 任务2.1 | 2小时 |
| 任务3.1 | 1小时 |
| 任务4.1 | 4小时 |
| 任务4.2 | 1小时 |
| 任务5.1 | 1小时 |
| 任务6.1 | 2小时 |
| 任务6.2 | 2小时 |

**总计:** 约14小时（1.75个工作日）

---

## 6. 交付物

| 交付物 | 状态 |
|--------|------|
| VideoPlayer组件 | 待创建 |
| 更新后的案例详情页 | 待修改 |
| Admin案例编辑页面 | 待创建 |
| 多语言翻译 | 待添加 |
| 构建测试报告 | 待生成 |

---

## 7. 验收标准

### 7.1 功能验收

| 功能 | 验收标准 |
|------|----------|
| 视频播放 | 使用react-player组件，支持播放/暂停/进度控制 |
| 视频上传 | Admin可上传视频，预览缩略图，删除视频 |
| 图片上传 | Admin可上传多张图片，支持预览和删除 |
| 内容编辑 | 支持中英文双语编辑，富文本内容 |
| 数据保存 | 修改内容正确保存到数据库 |

### 7.2 技术验收

| 项目 | 验收标准 |
|------|----------|
| 构建 | `npm run build` 通过 |
| 类型检查 | `npm run typecheck` 通过 |
| 代码检查 | `npm run lint` 通过 |
| 架构检查 | `npm run check:arch` 通过 |

---

**版本:** 1.0  
**创建日期:** 2026-06-07  
**状态:** 待执行