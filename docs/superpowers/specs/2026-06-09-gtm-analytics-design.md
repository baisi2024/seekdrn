# GTM + 埋点功能设计

## 日期
2026-06-09

## 概述
实现完整的 GTM 埋点系统和后台分析面板，采用混合方案：
- **营销追踪**：使用 GTM 追踪所有用户行为（页面浏览、点击、筛选等）
- **业务数据**：关键转化事件（表单提交、下载）同时存储到 Supabase
- **后台展示**：创建分析面板展示关键业务指标（实时）+ 用户行为趋势（GA API）

## 架构设计

### 数据流
```
用户交互 → GTM 埋点 → Google Analytics（营销数据）
                ↓
           关键事件 → Supabase（业务数据）
                ↓
           后台管理面板 → 展示实时业务指标 + 历史趋势
```

### 核心组件
1. **埋点工具库**（已存在，需完善）：`src/lib/gtm.ts`
2. **事件追踪 Hook**：封装埋点逻辑，便于组件使用
3. **Supabase 事件表**：存储关键业务事件
4. **后台分析面板**：展示转化漏斗、热门产品、用户行为等

## 埋点事件设计

### 1. 页面浏览追踪
- `product_detail_view` - 产品详情页查看
  - 参数：product_model, product_name, category, locale
- `solution_detail_view` - 解决方案详情页查看
  - 参数：solution_slug, solution_name, locale
- `case_detail_view` - 案例详情页查看
  - 参数：case_slug, case_name, locale

### 2. 用户交互事件
- `cta_click` - CTA 按钮点击
  - 参数：button_location, button_text, page_type, locale
- `datasheet_download` - 数据表下载
  - 参数：product_model, document_type, document_name, locale
- `social_share` - 社交分享
  - 参数：platform, page_type, content_id, locale
- `product_compare` - 产品对比
  - 参数：product_models, locale

### 3. 筛选和搜索行为
- `filter_apply` - 筛选器应用
  - 参数：filter_type, filter_value, page_type, locale
- `search_submit` - 搜索提交
  - 参数：query, results_count, locale
- `language_switch` - 语言切换
  - 参数：from_locale, to_locale, current_path

### 4. 表单转化漏斗
- `inline_form_open` - 表单打开
  - 参数：page_type, intent, product_model, locale
- `inline_form_start` - 表单开始填写
  - 参数：page_type, intent, locale
- `inline_form_submit_start` - 表单提交开始
  - 参数：page_type, intent, product_model, locale
- `inline_form_submit_success` - 表单提交成功
  - 参数：page_type, intent, product_model, inquiry_id, locale
- `inline_form_submit_error` - 表单提交失败
  - 参数：page_type, intent, error_type, locale

## 数据库设计

### 新增表：analytics_events
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50), -- 'conversion', 'engagement', 'navigation'
  page_type VARCHAR(50),
  locale VARCHAR(10),
  metadata JSONB, -- 灵活存储事件参数
  session_id VARCHAR(100), -- 会话追踪
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
```

### RLS 策略
- 仅允许服务端写入（使用 supabaseAdmin）
- 后台管理员可读取所有数据

## 后台管理面板设计

### 页面路径
`/admin/analytics`

### 展示内容

#### 1. 概览卡片
今日/本周/本月关键指标：
- 表单提交总数
- 产品详情页浏览量
- 数据表下载数
- 转化率（表单提交 / 页面浏览）

#### 2. 转化漏斗图
表单转化漏斗：
- 表单打开 → 开始填写 → 提交 → 成功
- 显示每个步骤的数量和转化率

#### 3. 热门内容排行
- 最受欢迎的产品（按浏览量 TOP 10）
- 最常下载的数据表（TOP 10）
- 最活跃的语言版本（分布图）

#### 4. 时间趋势图
- 过去 7/30 天的用户行为趋势
- 可切换不同事件类型查看

#### 5. 筛选器使用分析
- 最常用的筛选条件（TOP 10）
- 搜索关键词统计（TOP 20）

## 实现细节

### 埋点集成点

#### 页面浏览追踪
- 产品详情页：`src/app/[locale]/products/[slug]/page.tsx`
- 解决方案页：`src/app/[locale]/solutions/[slug]/page.tsx`
- 案例页：`src/app/[locale]/case-studies/[slug]/page.tsx`

#### 用户交互追踪
- 表单组件：`src/components/public/inline-lead-form.tsx`
- 筛选组件：`src/components/public/product-filter.tsx`
- 下载按钮：`src/components/public/datasheet-download-button.tsx`
- 语言切换：`src/components/public/language-switcher.tsx`
- CTA 按钮：`src/components/public/lead-form-cta-button.tsx`
- 分享按钮：`src/components/public/share-buttons.tsx`

### API 端点

#### 客户端埋点 API
- `POST /api/analytics/events` - 记录事件到 Supabase
  - 仅用于关键转化事件
  - 自动附加 session_id 和时间戳

#### 后台管理 API
- `GET /api/admin/analytics/overview` - 获取概览数据
  - 参数：period (today/week/month)
- `GET /api/admin/analytics/funnel` - 获取转化漏斗数据
  - 参数：period, intent (可选)
- `GET /api/admin/analytics/popular` - 获取热门内容
  - 参数：type (products/downloads/locales), limit
- `GET /api/admin/analytics/trends` - 获取趋势数据
  - 参数：event_name, days (7/30)
- `GET /api/admin/analytics/filters` - 获取筛选器使用统计
  - 参数：period

### 新增文件

#### 工具库
- `src/lib/analytics/events.ts` - 事件记录工具
- `src/lib/analytics/session.ts` - 会话管理
- `src/hooks/use-analytics.ts` - 埋点 Hook

#### API
- `src/app/api/analytics/events/route.ts`
- `src/app/api/admin/analytics/overview/route.ts`
- `src/app/api/admin/analytics/funnel/route.ts`
- `src/app/api/admin/analytics/popular/route.ts`
- `src/app/api/admin/analytics/trends/route.ts`
- `src/app/api/admin/analytics/filters/route.ts`

#### 后台页面
- `src/app/admin/analytics/page.tsx`
- `src/app/admin/analytics/analytics-client.tsx`
- `src/components/admin/analytics/overview-cards.tsx`
- `src/components/admin/analytics/conversion-funnel.tsx`
- `src/components/admin/analytics/popular-content.tsx`
- `src/components/admin/analytics/trend-chart.tsx`
- `src/components/admin/analytics/filter-stats.tsx`

#### 数据库迁移
- `supabase/migrations/022_analytics_events.sql`

## 环境变量

### 必需（已配置）
```env
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
```

### 可选（用于 Google Analytics API）
```env
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id
GOOGLE_ANALYTICS_CLIENT_EMAIL=your_service_account_email
GOOGLE_ANALYTICS_PRIVATE_KEY=your_private_key
```

## 实施步骤

### 阶段 1：数据库和基础设施
1. 创建 analytics_events 表
2. 创建事件记录 API
3. 实现会话管理

### 阶段 2：埋点集成
1. 完善页面浏览追踪
2. 添加用户交互追踪
3. 实现表单转化漏斗追踪
4. 添加筛选和搜索追踪

### 阶段 3：后台分析面板
1. 创建概览页面
2. 实现转化漏斗图
3. 添加热门内容排行
4. 实现趋势图表
5. 添加筛选器统计

### 阶段 4：测试和优化
1. 验证所有埋点事件
2. 测试后台数据展示
3. 优化性能（索引、缓存）
4. 添加翻译

## 技术考虑

### 性能优化
- 使用索引优化查询性能
- 后台数据使用缓存（5分钟刷新）
- 图表使用客户端渲染（避免 SSR 阻塞）

### 数据隐私
- 不收集用户个人身份信息
- session_id 仅用于会话追踪，不关联用户
- 符合 GDPR 要求（已有合规页面）

### 错误处理
- 埋点失败不影响主流程
- 记录错误日志便于调试
- API 失败时显示友好提示

## 成功标准

1. **埋点覆盖率**：所有关键交互点都有埋点
2. **数据准确性**：事件参数完整准确
3. **后台可用性**：分析面板数据实时更新
4. **性能影响**：埋点不影响页面加载速度
5. **可维护性**：代码结构清晰，易于扩展

## 后续扩展

1. 集成 Google Analytics API 获取历史数据
2. 添加自定义事件配置
3. 实现实时告警（异常流量、转化下降）
4. 导出数据报表功能
5. A/B 测试支持
