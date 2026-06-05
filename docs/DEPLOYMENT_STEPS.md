# SeekDrone 独立站部署完整步骤

## 前置条件
- 已配置 `.env.local` 环境变量
- 已安装 Node.js 18+ 和 npm

---

## 步骤 1：Supabase 设置

### 1.1 创建 Supabase 项目
1. 访问 https://supabase.com/dashboard
2. 点击 "New Project"
3. 填写：
   - Name: `seekdrone`
   - Database Password: 生成强密码并保存
   - Region: 选择离目标市场最近的区域（如 Singapore）
4. 等待项目创建完成（约 2 分钟）

### 1.2 获取环境变量
在项目设置 > API 页面获取：
```
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon key
SUPABASE_SERVICE_ROLE_KEY=你的service_role key
```

### 1.3 运行数据库迁移
**方法 A：使用 Supabase CLI（推荐）**
```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接项目
supabase link --project-ref 你的项目ID

# 推送迁移
supabase db push
```

**方法 B：使用 Supabase Dashboard SQL Editor**
1. 打开 SQL Editor
2. 复制 `supabase/migrations/001_initial_schema.sql` 内容
3. 执行
4. 复制 `supabase/migrations/002_rls_policies.sql` 内容
5. 执行

### 1.4 导入种子数据
在 SQL Editor 中依次执行：
- `supabase/seed/site_settings.sql`
- `supabase/seed/navigation.sql`
- `supabase/seed/email_templates.sql`
- `supabase/seed/solutions.sql`
- `supabase/seed/footer_content.sql`
- `supabase/seed/products.sql`

### 1.5 创建管理员账户
1. 进入 Authentication > Users
2. 点击 "Add user"
3. 填写：
   - Email: `admin@seekdrn.com`
   - Password: 设置强密码
   - Auto Confirm User: 勾选
4. 创建后，在 SQL Editor 中赋予管理员角色：
```sql
-- 如果需要自定义角色，可以创建
-- 目前 RLS 使用 auth.jwt() ->> 'role' = 'admin'
-- 可以通过创建 user_roles 表来管理
```

---

## 步骤 2：Cloudflare R2 设置

### 2.1 创建 R2 存储桶
1. 登录 Cloudflare Dashboard
2. 进入 R2 Object Storage
3. 点击 "Create bucket"
4. 名称：`seekdrn-media`
5. 位置：Automatic

### 2.2 获取 R2 凭证
1. 进入 R2 > Manage R2 API Tokens
2. 创建 API Token：
   - Permissions: Object Read & Write
   - Specify bucket(s): `seekdrn-media`
3. 保存：
```
R2_ACCESS_KEY_ID=你的Access Key ID
R2_SECRET_ACCESS_KEY=你的Secret Access Key
R2_BUCKET=seekdrn-media
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

### 2.3 配置公共访问
1. 进入存储桶设置
2. Settings > Public Access
3. 选择 "Public Access via R2.dev subdomain" 或自定义域名
4. 如果使用自定义域名：
   - 添加域名：`cdn.seekdrn.com`
   - 配置 DNS CNAME 记录
5. 设置：
```
R2_PUBLIC_URL=https://cdn.seekdrn.com
# 或使用 R2.dev 域名
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## 步骤 3：Resend 邮件服务设置

### 3.1 创建 Resend 账户
1. 访问 https://resend.com
2. 注册并登录
3. 进入 API Keys 页面
4. 创建 API Key：
   - Name: `seekdrone-production`
   - Permission: Sending access
5. 保存：
```
RESEND_API_KEY=re_xxx
```

### 3.2 验证发件域名
1. 进入 Domains 页面
2. 添加域名：`seekdrn.com`
3. 添加 DNS 记录验证
4. 等待验证完成

---

## 步骤 4：Google Tag Manager 设置

### 4.1 创建 GTM 容器
1. 访问 https://tagmanager.google.com
2. 创建账户和容器
3. 容器类型：Web
4. 保存容器 ID：
```
NEXT_PUBLIC_GTM_ID=GTM-XXXXXX
```

### 4.2 配置数据层事件
在 GTM 中配置以下触发器：
- `cta_click` - 自定义事件
- `demo_form_submit` - 自定义事件
- `demo_request_success` - 自定义事件
- `datasheet_download` - 自定义事件

---

## 步骤 5：本地验证

### 5.1 完整环境变量检查
确保 `.env.local` 包含所有必需变量：
```bash
# 检查环境变量
cat .env.local
```

### 5.2 本地测试
```bash
# 安装依赖
npm install

# 开发模式测试
npm run dev

# 访问测试
# - 首页: http://localhost:3000/en
# - 产品: http://localhost:3000/en/products
# - 后台: http://localhost:3000/admin
```

### 5.3 构建测试
```bash
# 类型检查
npm run build

# 如果有错误，修复后再继续
```

---

## 步骤 6：Vercel 部署

### 6.1 创建 Vercel 项目
1. 访问 https://vercel.com
2. 点击 "Add New Project"
3. 导入 Git 仓库（先推送代码到 GitHub/GitLab）
4. 配置：
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 6.2 配置环境变量
在 Vercel 项目设置 > Environment Variables 中添加所有变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_GTM_ID`

### 6.3 绑定自定义域名
1. 进入项目设置 > Domains
2. 添加域名：`seekdrn.com`
3. 添加 DNS 记录：
   - A 记录指向 Vercel IP
   - CNAME www 指向 cname.vercel-dns.com

### 6.4 部署
```bash
# 推送代码触发自动部署
git push origin main

# 或使用 Vercel CLI
npx vercel --prod
```

---

## 步骤 7：部署后验证

### 7.1 功能检查清单
- [ ] 首页加载正常
- [ ] 语言切换工作（en/ar/es/fr/pt/id）
- [ ] 产品列表显示
- [ ] 产品详情页正常
- [ ] Demo 表单提交成功
- [ ] 后台登录正常
- [ ] 后台数据显示正常

### 7.2 性能检查
使用 PageSpeed Insights 检查：
- https://pagespeed.web.dev/

目标：
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 7.3 监控设置
- Vercel Analytics: 项目设置中启用
- Supabase 日志: Dashboard > Logs
- GTM 调试: 使用 Tag Assistant

---

## 步骤 8：内容填充

### 8.1 上传产品图片
1. 登录后台 `/admin`
2. 进入产品管理
3. 为每个产品上传图片（建议 4:3 比例，WebP 格式）

### 8.2 翻译内容
1. 在后台编辑产品/案例时
2. 切换语言 Tab
3. 填写各语言版本

### 8.3 添加案例
1. 进入案例管理
2. 创建新案例
3. 上传视频/图片
4. 填写量化成果

---

## 常见问题

### Q: 数据库迁移失败
A: 检查 SQL 语法，确保没有重复创建已存在的表。可以逐个执行迁移文件。

### Q: R2 上传失败
A: 检查 CORS 配置，在 R2 存储桶设置中添加允许的源。

### Q: 邮件发送失败
A: 确认域名已验证，检查 Resend Dashboard 中的发送日志。

### Q: 后台登录失败
A: 确认用户已在 Supabase Authentication 中创建并确认。

---

## 维护命令

```bash
# 查看部署日志
vercel logs

# 回滚部署
vercel rollback

# 更新环境变量
vercel env add

# 本地开发
npm run dev

# 数据库备份
supabase db dump -f backup.sql
```
