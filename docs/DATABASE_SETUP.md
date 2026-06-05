# SeekDrone 数据库设置指南

## 快速设置（推荐）

### 方法 1：使用 Supabase SQL Editor（最简单）

1. **打开 SQL Editor**
   ```
   https://supabase.com/dashboard/project/jbavapzrbjdsaprwswid/sql
   ```

2. **执行迁移文件**（按顺序复制粘贴执行）
   - 复制 `supabase/migrations/001_initial_schema.sql` 的内容并执行
   - 复制 `supabase/migrations/002_rls_policies.sql` 的内容并执行

3. **导入种子数据**（按顺序复制粘贴执行）
   - `supabase/seed/site_settings.sql`
   - `supabase/seed/navigation.sql`
   - `supabase/seed/email_templates.sql`
   - `supabase/seed/solutions.sql`
   - `supabase/seed/footer_content.sql`
   - `supabase/seed/products.sql`

4. **创建管理员账户**
   - 进入 Authentication > Users
   - 点击 "Add user"
   - Email: `admin@seekdrone.com`
   - Password: 设置强密码
   - ✅ 勾选 "Auto Confirm User"

---

### 方法 2：使用 Supabase CLI

```bash
# 1. 登录 Supabase
npx supabase login

# 2. 链接项目
npx supabase link --project-ref jbavapzrbjdsaprwswid

# 3. 推送迁移
npx supabase db push

# 4. 执行种子数据（需要手动在 SQL Editor 执行）
```

---

## 验证设置

执行以下命令验证数据库是否设置成功：

```bash
npx tsx scripts/verify-db.ts
```

---

## 数据库结构

### 表（Tables）
- `products` - 产品信息
- `product_specs` - 产品规格
- `case_studies` - 案例研究
- `solutions` - 解决方案
- `inquiries` - 客户咨询
- `navigation` - 导航菜单
- `footer_content` - 页脚内容
- `email_templates` - 邮件模板
- `site_settings` - 站点设置
- `media` - 媒体文件

### RLS 策略
- 公开读取已发布内容
- 管理员完全访问权限
- 匿名用户可提交咨询

---

## 下一步

设置完成后：
1. 访问 http://localhost:3000 查看网站
2. 访问 http://localhost:3000/admin/login 登录管理后台
3. 使用创建的管理员账户登录
