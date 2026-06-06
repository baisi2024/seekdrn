# 邮件模板功能完善设计文档

**日期**: 2026-06-06
**状态**: 设计完成，待审核
**方案**: 一次性完整实现

## 1. 概述

完善 SeekDrone 网站的邮件模板管理功能，实现完整的 CRUD 管理界面、邮件预览、测试发送、历史记录和变量验证功能。

### 1.1 当前状态

**已实现**:
- 数据库表 `email_templates` (支持多语言、变量替换)
- 邮件发送功能 `sendTemplateEmail` (使用 Resend API)
- 3 个种子模板 (demo_request_thank_you, demo_request_internal, compliance_review_internal)

**未实现**:
- 管理页面只是占位页面
- 缺少 CRUD API 路由
- 无邮件预览功能
- 无变量验证功能
- 无邮件发送历史记录

### 1.2 目标功能

1. **邮件模板 CRUD 管理界面**: 创建、编辑、删除邮件模板，支持多语言内容编辑
2. **邮件预览功能**: 在管理界面中实时预览邮件内容，支持变量替换后的效果展示
3. **测试发送功能**: 发送测试邮件到指定邮箱地址进行真实测试
4. **邮件发送历史记录**: 记录完整的邮件内容、变量值、发送结果等，便于审计和调试
5. **变量验证功能**: 验证模板中使用的变量是否在 available_variables 列表中

## 2. 数据模型设计

### 2.1 新增表: email_logs (邮件发送历史)

```sql
CREATE TABLE email_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key    text NOT NULL,
  recipient_email text NOT NULL,
  language        text NOT NULL,
  subject         text NOT NULL,
  body_html       text NOT NULL,
  variables       jsonb DEFAULT '{}',
  status          text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message   text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 索引优化
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_template_key ON email_logs(template_key);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
```

**字段说明**:
- `template_key`: 关联的模板标识
- `recipient_email`: 收件人邮箱
- `language`: 发送语言
- `subject` / `body_html`: 实际发送的邮件内容（完整记录）
- `variables`: 使用的变量值（JSON 格式）
- `status`: 发送状态 (pending, sent, failed)
- `error_message`: 失败时的错误信息
- `sent_at`: 实际发送时间

### 2.2 现有表: email_templates (无需修改)

保持现有的表结构不变。

## 3. API 设计

### 3.1 邮件模板 CRUD API

```
GET    /api/admin/email-templates          - 获取所有模板列表
GET    /api/admin/email-templates/[key]    - 获取单个模板详情
POST   /api/admin/email-templates          - 创建新模板
PUT    /api/admin/email-templates/[key]    - 更新模板
DELETE /api/admin/email-templates/[key]    - 删除模板
```

### 3.2 邮件预览和测试 API

```
POST   /api/admin/email-templates/[key]/preview     - 预览邮件（返回渲染后的 HTML）
POST   /api/admin/email-templates/[key]/test-send   - 发送测试邮件
```

### 3.3 邮件历史记录 API

```
GET    /api/admin/email-logs              - 获取邮件发送历史（分页、筛选）
GET    /api/admin/email-logs/[id]         - 获取单条邮件详情
```

### 3.4 请求/响应示例

**创建模板**:
```typescript
// POST /api/admin/email-templates
{
  template_key: "welcome_email",
  description: "欢迎邮件",
  translations: {
    en: { subject: "Welcome!", body_html: "<p>Hello {{name}}</p>" },
    zh: { subject: "欢迎！", body_html: "<p>你好 {{name}}</p>" }
  },
  available_variables: ["name", "email"]
}
```

**预览邮件**:
```typescript
// POST /api/admin/email-templates/welcome_email/preview
{
  language: "en",
  variables: { name: "John", email: "john@example.com" }
}

// 返回
{
  subject: "Welcome!",
  body_html: "<p>Hello John</p>"
}
```

**获取邮件历史**:
```typescript
// GET /api/admin/email-logs?page=1&status=sent&template_key=demo_request_thank_you
{
  data: [
    {
      id: "uuid",
      template_key: "demo_request_thank_you",
      recipient_email: "user@example.com",
      language: "en",
      subject: "Thank you for your interest",
      status: "sent",
      sent_at: "2026-06-06T10:00:00Z",
      created_at: "2026-06-06T10:00:00Z"
    }
  ],
  total: 100,
  page: 1,
  pageSize: 20
}
```

## 4. 管理界面设计

### 4.1 文件结构

```
src/app/admin/email-templates/
  ├── page.tsx                    # 模板列表页
  ├── [key]/
  │   └── page.tsx               # 模板编辑页
  └── components/
      ├── template-form.tsx      # 模板表单
      ├── preview-panel.tsx      # 预览面板
      └── variable-validator.tsx # 变量验证组件

src/app/admin/email-logs/
  ├── page.tsx                    # 历史记录列表页
  └── [id]/
      └── page.tsx               # 邮件详情页
```

### 4.2 邮件模板列表页面 (`/admin/email-templates`)

**功能**:
- 显示所有模板的表格
- 列：模板标识、描述、状态、更新时间
- 操作按钮：新建模板、编辑、删除、预览
- 支持搜索和筛选（按状态）

### 4.3 邮件模板编辑页面 (`/admin/email-templates/[key]`)

**功能**:
- 基本信息编辑：模板标识、描述、可用变量
- 多语言内容编辑（使用现有的 TranslationTabs 组件）
  - 每个语言包含：主题、HTML 内容
  - 使用富文本编辑器编辑 HTML 内容
- 变量验证：检查内容中使用的变量是否在 available_variables 中
- 预览功能：实时预览邮件效果
- 测试发送：发送测试邮件到指定邮箱

### 4.4 邮件历史记录页面 (`/admin/email-logs`)

**功能**:
- 显示邮件发送历史的表格
- 列：收件人、模板、语言、状态、发送时间
- 支持筛选：按状态、按模板、按时间范围
- 点击查看详情：显示完整的邮件内容和变量值

## 5. 核心功能实现

### 5.1 变量验证功能

```typescript
// 提取模板中使用的变量
function extractVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g
  const variables = new Set<string>()
  let match
  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1])
  }
  return Array.from(variables)
}

// 验证变量是否在允许列表中
function validateVariables(
  content: string,
  availableVariables: string[]
): { valid: boolean; missing: string[]; unused: string[] } {
  const used = extractVariables(content)
  const missing = used.filter(v => !availableVariables.includes(v))
  const unused = availableVariables.filter(v => !used.includes(v))
  return {
    valid: missing.length === 0,
    missing,
    unused
  }
}
```

### 5.2 邮件预览功能

**实现要点**:
- 实时渲染：用户输入变量值后，立即渲染出邮件内容
- 变量替换：将 `{{variable}}` 替换为实际值
- HTML 预览：在 iframe 或沙箱环境中安全渲染 HTML
- 防抖处理：减少频繁渲染

### 5.3 测试发送功能

```typescript
async function sendTestEmail(
  templateKey: string,
  testEmail: string,
  language: string,
  variables: Record<string, string>
) {
  // 1. 获取模板
  const template = await getTemplate(templateKey)

  // 2. 渲染邮件内容
  const { subject, body_html } = renderTemplate(template, language, variables)

  // 3. 发送邮件
  const result = await resend.emails.send({
    from: 'SeekDrone <noreply@seekdrn.com>',
    to: testEmail,
    subject,
    html: body_html
  })

  // 4. 记录到 email_logs
  await logEmail(templateKey, testEmail, language, subject, body_html, variables, result)

  // 5. 返回发送结果
  return result
}
```

### 5.4 邮件发送记录

修改现有的 `sendTemplateEmail` 函数，在发送邮件后自动记录到 `email_logs` 表：

```typescript
export async function sendTemplateEmail(
  templateKey: string,
  to: string,
  language: string,
  variables: Record<string, string>
) {
  // ... 现有逻辑

  // 记录发送历史
  const logEntry = {
    template_key: templateKey,
    recipient_email: to,
    language,
    subject,
    body_html: html,
    variables,
    status: 'sent',
    sent_at: new Date().toISOString()
  }

  try {
    await resendClient.emails.send({ ... })
    await supabaseAdmin.from('email_logs').insert({ ...logEntry, status: 'sent' })
  } catch (error) {
    await supabaseAdmin.from('email_logs').insert({
      ...logEntry,
      status: 'failed',
      error_message: error.message
    })
    throw error
  }
}
```

## 6. 错误处理和安全性

### 6.1 错误处理

```typescript
// API 错误处理
try {
  await sendEmail(...)
} catch (error) {
  // 记录失败状态
  await supabaseAdmin.from('email_logs').insert({
    ...
    status: 'failed',
    error_message: error.message
  })

  // 返回友好的错误信息
  return NextResponse.json(
    { error: 'Failed to send email' },
    { status: 500 }
  )
}
```

### 6.2 输入验证

- **模板标识验证**: 只允许字母、数字、下划线
- **邮箱地址验证**: 使用正则表达式验证格式
- **变量名验证**: 只允许字母、数字、下划线
- **HTML 内容安全**: 使用 DOMPurify 清理 XSS 风险

### 6.3 权限控制

- 所有 API 路由都需要管理员权限验证
- 使用现有的 RLS 策略保护数据访问
- 测试邮件发送限制：每小时最多 10 封（防止滥用）

### 6.4 性能优化

- 邮件历史记录分页查询（每页 20 条）
- 预览功能使用防抖（debounce）减少渲染次数
- 模板列表使用缓存（SWR）
- 数据库索引优化（见 2.1 节）

## 7. 测试策略

### 7.1 单元测试

```typescript
// 变量提取和验证测试
describe('extractVariables', () => {
  it('should extract variables from template', () => {
    const content = 'Hello {{name}}, your email is {{email}}'
    expect(extractVariables(content)).toEqual(['name', 'email'])
  })
})

describe('validateVariables', () => {
  it('should detect missing variables', () => {
    const result = validateVariables(
      'Hello {{name}}',
      ['email']  // name 不在列表中
    )
    expect(result.valid).toBe(false)
    expect(result.missing).toEqual(['name'])
  })
})
```

### 7.2 集成测试

- API 路由测试：测试 CRUD 操作
- 邮件发送测试：使用 Mock Resend API
- 数据库操作测试：测试插入、查询、更新

### 7.3 E2E 测试

- 模板创建流程：从列表页到编辑页，创建新模板
- 邮件预览流程：输入变量值，查看预览效果
- 测试发送流程：发送测试邮件并验证记录

### 7.4 测试覆盖率目标

- 核心业务逻辑：> 90%
- API 路由：> 80%
- 组件：> 70%

## 8. 实施计划

### 8.1 阶段 1: 数据库迁移

1. 创建 `email_logs` 表
2. 添加索引
3. 设置 RLS 策略
4. 运行迁移脚本

### 8.2 阶段 2: API 实现

1. 实现邮件模板 CRUD API
2. 实现预览和测试发送 API
3. 实现邮件历史记录 API
4. 修改 `sendTemplateEmail` 函数添加日志记录

### 8.3 阶段 3: 管理界面实现

1. 实现模板列表页面
2. 实现模板编辑页面
3. 实现预览面板组件
4. 实现变量验证组件
5. 实现邮件历史记录页面

### 8.4 阶段 4: 测试和优化

1. 编写单元测试
2. 编写集成测试
3. 编写 E2E 测试
4. 性能优化
5. 安全审查

## 9. 风险和注意事项

### 9.1 风险

1. **邮件发送失败**: Resend API 可能不可用，需要错误处理和重试机制
2. **HTML 注入**: 用户输入的 HTML 可能包含恶意代码，需要使用 DOMPurify 清理
3. **性能问题**: 邮件历史记录表可能快速增长，需要定期归档或清理
4. **测试邮件滥用**: 需要限制测试邮件发送频率

### 9.2 缓解措施

1. 实现完善的错误处理和日志记录
2. 使用 DOMPurify 清理所有用户输入的 HTML
3. 实现邮件历史记录归档策略（保留最近 90 天）
4. 实现测试邮件发送频率限制（每小时最多 10 封）

## 10. 成功标准

1. ✅ 管理员可以通过界面创建、编辑、删除邮件模板
2. ✅ 管理员可以预览邮件内容（支持变量替换）
3. ✅ 管理员可以发送测试邮件到指定邮箱
4. ✅ 所有邮件发送都会记录到历史记录表
5. ✅ 管理员可以查看邮件发送历史和详情
6. ✅ 系统会验证模板中使用的变量是否合法
7. ✅ 所有 API 都有完善的错误处理
8. ✅ 测试覆盖率达标（核心逻辑 > 90%）
