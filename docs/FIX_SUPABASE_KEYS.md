# 🔧 修复 Supabase 环境变量

## 问题
您的 `.env.local` 文件中的 Supabase keys 看起来是占位符，不是真实的 keys。

## 解决步骤

### 1. 获取真实的 Supabase Keys

访问 Supabase Dashboard：
```
https://supabase.com/dashboard/project/jbavapzrbjdsaprwswid/settings/api
```

### 2. 复制以下信息

在 **Project API keys** 部分，您会找到：

- **`anon` public** key - 用于客户端
- **`service_role`** key - 用于服务端（管理员权限）

⚠️ **重要：** `service_role` key 具有**完全访问权限**，请妥善保管，不要泄露！

### 3. 更新 `.env.local` 文件

将真实的 keys 替换到 `.env.local` 文件中：

```env
NEXT_PUBLIC_SUPABASE_URL=https://jbavapzrbjdsaprwswid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<您的 anon key>
SUPABASE_SERVICE_ROLE_KEY=<您的 service_role key>
```

### 4. 重启开发服务器

保存 `.env.local` 后，重启开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 验证

真实的 Supabase keys 特征：
- 以 `eyJ` 开头（JWT 格式）
- 长度通常在 100-300 个字符
- 包含点号 `.` 分隔符

## 示例格式

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYXZhcHpyYmpkc2FwcnZzd2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTAwMDAwMH0.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiYXZhcHpyYmpkc2FwcnZzd2lkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDE1MDAwMDAwfQ.xxxxx
```

---

## 快速链接

直接访问 API 设置页面：
https://supabase.com/dashboard/project/jbavapzrbjdsaprwswid/settings/api
