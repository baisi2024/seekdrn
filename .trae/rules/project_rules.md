# SeekDrone 项目开发规则

## 自动检查规则

本文件定义了 Trae AI 在开发过程中必须自动检查和执行的规则。

### 环境变量规则

**规则 ID**: `ENV_001`

**描述**: 所有环境变量访问必须进行验证

**检查条件**:
- 当代码中使用 `process.env` 时
- 特别是 `SUPABASE_SERVICE_ROLE_KEY` 和 `NEXT_PUBLIC_SUPABASE_URL`

**执行操作**:
1. 检查是否使用了非空断言（`!`）
2. 如果使用了，提示开发者添加验证逻辑
3. 提供正确的代码示例

**示例**:
```typescript
// 触发检查
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 建议修复
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
}
```

### 国际化规则

**规则 ID**: `I18N_001`

**描述**: 所有用户可见文本必须使用翻译

**检查条件**:
- 在 `src/app/admin/**` 或 `src/components/admin/**` 中
- 发现硬编码的中英文字符串

**执行操作**:
1. 提示开发者使用 `useAdminTranslations` hook
2. 检查翻译文件中是否存在对应键
3. 如果不存在，提示添加翻译键

**示例**:
```typescript
// 触发检查
<h1>产品管理</h1>

// 建议修复
const t = useAdminTranslations()
<h1>{t('products_page.title')}</h1>
```

### UI 设计规则

**规则 ID**: `UI_001`

**描述**: 使用设计系统变量而非硬编码颜色

**检查条件**:
- 发现硬编码颜色类（如 `bg-gray-100`, `text-gray-500`）
- 在后台管理相关文件中

**执行操作**:
1. 提示使用设计系统变量
2. 提供变量对照表

**对照表**:
```
bg-gray-100  → bg-muted 或 bg-background
bg-gray-50   → bg-muted/50
text-gray-500 → text-muted-foreground
text-gray-700 → text-foreground
border-gray-200 → border-border
```

### 错误处理规则

**规则 ID**: `ERR_001`

**描述**: 所有异步操作必须有错误处理

**检查条件**:
- 发现 `await` 表达式
- 没有 try-catch 包裹

**执行操作**:
1. 提示添加错误处理
2. 建议使用 toast 提示用户

**示例**:
```typescript
// 触发检查
const data = await fetch('/api/data')

// 建议修复
try {
  const data = await fetch('/api/data')
  if (!data.ok) throw new Error('Failed')
  toast.success('操作成功')
} catch (error) {
  toast.error('操作失败')
}
```

## 开发前检查

在开始任何新功能开发前，Trae AI 应该：

1. **读取规则文件**
   - 检查 `.trae/rules/admin-development-guidelines.md`
   - 了解当前项目的开发规范

2. **检查环境**
   - 确认 `.env` 文件存在
   - 验证必要的环境变量已设置

3. **检查依赖**
   - 确认必要的 npm 包已安装
   - 检查版本兼容性

## 开发中检查

在开发过程中，Trae AI 应该：

1. **实时检查代码**
   - 应用所有定义的规则
   - 提供即时反馈

2. **自动修复**
   - 对于可以自动修复的问题，直接修复
   - 对于需要决策的问题，询问开发者

3. **保持一致性**
   - 确保新代码与现有代码风格一致
   - 遵循项目架构

## 开发后检查

在完成开发后，Trae AI 应该：

1. **运行测试**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```

2. **检查覆盖率**
   - 确保新功能有测试
   - 检查测试覆盖率

3. **更新文档**
   - 如果添加了新的环境变量，更新 `.env.example`
   - 如果添加了新的翻译键，确保中英文都有
   - 如果改变了架构，更新相关文档

## 强制执行

以下规则必须强制执行，不可绕过：

1. **ENV_001**: 环境变量验证
2. **I18N_001**: 国际化支持
3. **ERR_001**: 错误处理

如果开发者尝试绕过这些规则，Trae AI 应该：
- 明确告知风险
- 提供正确的替代方案
- 记录在案，以便后续审查

## 更新机制

本规则文件应该：
- 随着项目发展不断更新
- 每次发现新问题时添加相应规则
- 定期审查和优化现有规则

**更新流程**:
1. 识别重复出现的问题
2. 定义新的规则
3. 测试规则有效性
4. 更新本文档
5. 通知所有开发者
