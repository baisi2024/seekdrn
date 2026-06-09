# GTM + 埋点功能配置指南

本文档说明如何配置和使用 SeekDrone 网站的 GTM（Google Tag Manager）埋点功能。

## 环境变量配置

### 必需配置

在 `.env.local` 文件中添加以下环境变量：

```env
# Google Tag Manager 容器 ID
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
```

**获取 GTM ID 的步骤：**

1. 访问 [Google Tag Manager](https://tagmanager.google.com/)
2. 创建新账户或使用现有账户
3. 创建新容器（选择"Web"类型）
4. 复制容器 ID（格式：GTM-XXXXXX）
5. 将 ID 添加到 `.env.local` 文件

### 可选配置（Google Analytics API）

如需在后台分析面板展示历史数据，需配置 Google Analytics API：

```env
# Google Analytics Data API 配置
GOOGLE_ANALYTICS_PROPERTY_ID=your_property_id
GOOGLE_ANALYTICS_CLIENT_EMAIL=your_service_account_email
GOOGLE_ANALYTICS_PRIVATE_KEY=your_private_key
```

**配置步骤：**

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 "Google Analytics Data API"
4. 创建服务账号：
   - 导航到 "IAM & Admin" > "Service Accounts"
   - 点击 "Create Service Account"
   - 授予 "Viewer" 权限
   - 创建 JSON 密钥文件
5. 在 Google Analytics 中添加服务账号：
   - 导航到 Google Analytics
   - 选择管理 > 账号访问权限管理
   - 添加服务账号邮箱，授予"查看和分析"权限
6. 从 JSON 密钥文件中提取以下信息：
   - `client_email` → `GOOGLE_ANALYTICS_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_ANALYTICS_PRIVATE_KEY`
7. 获取 Google Analytics Property ID：
   - 在 Google Analytics 中，导航到管理 > 数据流
   - 选择网站数据流
   - 复制"衡量 ID"（格式：G-XXXXXX）

## GTM 配置步骤

### 1. 创建 GTM 容器

1. 登录 [Google Tag Manager](https://tagmanager.google.com/)
2. 点击"新建容器"
3. 输入容器名称（如：SeekDrone Website）
4. 选择目标平台：Web
5. 点击"创建"

### 2. 配置 Google Analytics 4

**创建 GA4 配置代码：**

1. 点击"代码" > "新建"
2. 选择代码类型："Google Analytics: GA4 配置"
3. 输入衡量 ID（从 Google Analytics 获取）
4. 命名代码（如：GA4 Config）
5. 保存

**创建 GA4 事件代码：**

1. 点击"代码" > "新建"
2. 选择代码类型："Google Analytics: GA4 事件"
3. 配置代码：
   - 配置代码：选择之前创建的 GA4 配置代码
   - 事件名称：`{{Event}}`（使用 GTM 变量）
   - 事件参数：根据需要添加参数
4. 命名代码（如：GA4 Event）
5. 保存

### 3. 创建触发器

**为自定义事件创建触发器：**

1. 点击"触发器" > "新建"
2. 选择触发器类型："自定义事件"
3. 配置触发器：
   - 事件名称：使用正则表达式匹配所有事件（`.*`）
   - 或为特定事件创建单独触发器
4. 命名触发器（如：Custom Events）
5. 保存

**将触发器关联到代码：**

1. 编辑 GA4 事件代码
2. 在"触发条件"部分，添加刚创建的触发器
3. 保存

### 4. 发布容器

1. 点击"提交"
2. 输入版本名称和描述
3. 点击"发布"
4. 记录容器 ID（GTM-XXXXXX）

### 5. 验证配置

使用 [Google Tag Assistant](https://tagassistant.google.com/) 验证：

1. 打开 Tag Assistant
2. 输入网站 URL
3. 浏览网站，触发各种事件
4. 检查 GTM 和 GA4 代码是否正常触发

## 常见事件列表

### 页面浏览事件

| 事件名称 | 描述 | 参数 |
|---------|------|------|
| `product_detail_view` | 产品详情页查看 | `product_model`, `product_name`, `category`, `locale` |
| `solution_detail_view` | 解决方案详情页查看 | `solution_slug`, `solution_name`, `locale` |
| `case_detail_view` | 案例详情页查看 | `case_slug`, `case_name`, `locale` |

### 用户交互事件

| 事件名称 | 描述 | 参数 |
|---------|------|------|
| `cta_click` | CTA 按钮点击 | `button_location`, `button_text`, `page_type`, `locale` |
| `datasheet_download` | 数据表下载 | `product_model`, `document_type`, `document_name`, `locale` |
| `social_share` | 社交分享 | `platform`, `page_type`, `content_id`, `locale` |

### 表单转化漏斗事件

| 事件名称 | 描述 | 参数 |
|---------|------|------|
| `inline_form_open` | 表单打开 | `page_type`, `intent`, `product_model`, `locale` |
| `inline_form_start` | 开始填写表单 | `page_type`, `intent`, `locale` |
| `inline_form_submit_start` | 表单提交开始 | `page_type`, `intent`, `product_model`, `locale` |
| `inline_form_submit_success` | 表单提交成功 | `page_type`, `intent`, `product_model`, `inquiry_id`, `locale` |
| `inline_form_submit_error` | 表单提交失败 | `page_type`, `intent`, `error_type`, `locale` |

### 筛选和搜索事件

| 事件名称 | 描述 | 参数 |
|---------|------|------|
| `filter_apply` | 筛选器应用 | `filter_type`, `value`, `page_type`, `locale` |
| `search_submit` | 搜索提交 | `query`, `results_count`, `locale` |
| `language_switch` | 语言切换 | `from_locale`, `to_locale`, `current_path` |

### Demo 表单事件

| 事件名称 | 描述 | 参数 |
|---------|------|------|
| `demo_form_submit` | Demo 表单提交 | `country`, `application` |
| `demo_request_success` | Demo 请求成功 | `compliance_status` |

## 数据查看方式

### 1. Google Analytics 实时数据

访问 [Google Analytics](https://analytics.google.com/)：

1. 选择账号和媒体资源
2. 导航到"报告" > "实时"
3. 查看实时用户活动和事件

**查看特定事件：**

1. 导航到"探索" > "事件探索"
2. 选择维度：事件名称
3. 选择指标：事件计数
4. 筛选特定事件名称

### 2. Google Tag Manager 调试

使用 GTM 预览模式：

1. 在 GTM 中点击"预览"
2. 输入网站 URL
3. 在新窗口中浏览网站
4. 在 Tag Assistant 窗口中查看触发的事件

### 3. 后台分析面板

访问 `/admin/analytics` 查看实时业务指标：

- **概览卡片**：表单提交数、产品浏览量、下载数、转化率
- **转化漏斗**：表单打开 → 填写 → 提交 → 成功
- **热门内容**：最受欢迎的产品、下载、语言分布
- **趋势图表**：过去 7/14/30 天的事件趋势
- **筛选统计**：筛选器使用情况、搜索关键词

### 4. Supabase 数据库

直接查询 `analytics_events` 表：

```sql
-- 查看最近的事件
SELECT *
FROM analytics_events
ORDER BY created_at DESC
LIMIT 100;

-- 统计特定事件
SELECT
  event_name,
  COUNT(*) as count
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY count DESC;

-- 查看表单转化漏斗
SELECT
  event_name,
  COUNT(*) as count
FROM analytics_events
WHERE event_name IN (
  'inline_form_open',
  'inline_form_start',
  'inline_form_submit_start',
  'inline_form_submit_success'
)
AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY event_name;
```

## 故障排查指南

### 问题 1：埋点不生效

**症状：** 控制台没有看到 dataLayer 推送，或 GTM 中没有事件

**排查步骤：**

1. **检查 GTM ID 配置**
   ```bash
   # 检查环境变量是否设置
   echo $NEXT_PUBLIC_GTM_ID
   # 或在浏览器控制台运行
   console.log(process.env.NEXT_PUBLIC_GTM_ID)
   ```

2. **检查 GTM 脚本是否加载**
   - 打开浏览器开发者工具
   - 查看 Network 标签，搜索 `gtm.js`
   - 确认脚本加载成功（状态码 200）

3. **检查 GTM 容器是否发布**
   - 登录 GTM
   - 查看容器状态，确认已发布
   - 检查工作区是否有未发布的更改

4. **使用 Tag Assistant 调试**
   - 打开 [Tag Assistant](https://tagassistant.google.com/)
   - 输入网站 URL
   - 查看是否有错误或警告

5. **检查 dataLayer**
   - 在浏览器控制台运行：
     ```javascript
     console.log(window.dataLayer)
     ```
   - 确认 dataLayer 数组存在且有数据

### 问题 2：后台数据不显示

**症状：** `/admin/analytics` 页面显示空数据或错误

**排查步骤：**

1. **检查数据库表是否存在**
   ```bash
   npx supabase db inspect analytics_events
   ```

2. **检查 API 响应**
   - 打开浏览器开发者工具
   - 查看 Network 标签
   - 搜索 `/api/admin/analytics/`
   - 检查 API 响应状态和内容

3. **检查数据库是否有数据**
   ```sql
   SELECT COUNT(*) FROM analytics_events;
   ```

4. **检查 API 错误日志**
   - 查看服务器控制台输出
   - 检查是否有错误信息

5. **验证权限**
   - 确认已登录管理员账号
   - 检查是否有访问 `/admin/analytics` 的权限

### 问题 3：事件参数缺失

**症状：** 事件触发但参数不完整

**排查步骤：**

1. **检查埋点代码**
   - 查看相关组件的埋点代码
   - 确认所有必需参数都已传递

2. **检查 dataLayer 推送**
   - 在控制台查看 dataLayer：
     ```javascript
     window.dataLayer.forEach(item => console.log(item))
     ```
   - 确认事件参数完整

3. **检查 GTM 变量**
   - 在 GTM 中检查变量配置
   - 确认变量映射正确

### 问题 4：转化率计算错误

**症状：** 转化率显示异常值

**排查步骤：**

1. **检查事件计数**
   - 确认分子和分母的事件计数正确
   - 检查是否有重复事件

2. **检查时间范围**
   - 确认所有事件在同一时间范围内
   - 检查时区设置

3. **手动验证**
   ```sql
   SELECT
     (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'inline_form_submit_success') as submissions,
     (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'product_detail_view') as views;
   ```

### 问题 5：性能问题

**症状：** 页面加载缓慢或卡顿

**排查步骤：**

1. **检查埋点频率**
   - 避免在短时间内触发大量事件
   - 使用防抖/节流优化高频事件

2. **检查 API 响应时间**
   - 查看 Network 标签中的 API 响应时间
   - 优化慢查询

3. **检查数据库索引**
   ```sql
   -- 查看索引
   \d analytics_events

   -- 如果缺少索引，创建索引
   CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
   CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
   ```

4. **启用缓存**
   - 后台 API 使用缓存（5分钟刷新）
   - 减少重复查询

## 最佳实践

### 1. 事件命名规范

- 使用小写字母和下划线：`event_name`
- 使用语义化命名：`product_detail_view`、`form_submit_success`
- 保持命名一致性

### 2. 参数规范

- 所有事件都应包含 `locale` 参数
- 使用标准化的参数名：`product_model`、`page_type`
- 避免传递敏感信息（如用户邮箱、电话）

### 3. 测试流程

1. 开发环境测试
   - 使用 GTM 预览模式
   - 检查控制台输出
   - 验证 dataLayer

2. 生产环境验证
   - 使用 Tag Assistant
   - 检查 Google Analytics 实时数据
   - 验证后台分析面板

### 4. 监控和维护

- 定期检查埋点数据是否正常
- 监控关键转化指标
- 根据业务需求调整追踪事件
- 定期清理过期数据（保留最近 90 天）

## 相关文档

- [架构规则详解](/docs/ARCHITECTURE_RULES.md)
- [环境变量配置](/docs/ENV_SETUP.md)
- [数据库结构](/docs/DATABASE_SETUP.md)
- [GTM + 埋点设计文档](/docs/superpowers/specs/2026-06-09-gtm-analytics-design.md)

## 更新日志

- 2026-06-10: 创建文档，包含完整的配置和排查指南
