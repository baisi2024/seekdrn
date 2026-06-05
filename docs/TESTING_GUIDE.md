# SeekDrone 功能完整性检查指南

## 前置条件
- 开发服务器已启动：`npm run dev`
- 访问地址：`http://localhost:3000`

---

## 一、多语言功能检查

### 1.1 语言切换测试
**测试步骤**：
1. 访问 `http://localhost:3000/en`
2. 点击右上角的语言切换器（地球图标）
3. 依次测试各语言：
   - العربية (ar) - 阿拉伯语，应显示 RTL 布局
   - Español (es) - 西班牙语
   - Français (fr) - 法语
   - Português (pt) - 葡萄牙语
   - Bahasa Indonesia (id) - 印尼语
   - 中文 (zh) - 中文（默认隐藏，需在后台启用）

**预期结果**：
- URL 应变为对应语言代码：`/ar`, `/es`, `/fr`, `/pt`, `/id`
- 页面内容应切换为对应语言
- 阿拉伯语页面应从右向左显示（RTL）

### 1.2 RTL 布局验证（阿拉伯语）
**测试步骤**：
1. 访问 `http://localhost:3000/ar`
2. 检查页面布局

**预期结果**：
- `<html>` 标签应有 `dir="rtl"` 属性
- 导航菜单顺序应翻转
- 文字应从右向左对齐

---

## 二、公开页面功能检查

### 2.1 首页测试
**测试步骤**：
1. 访问 `http://localhost:3000/en`
2. 检查各区块是否正常显示

**检查清单**：
- [ ] Navbar 显示正常（Logo、导航链接、语言切换器、Request Demo 按钮）
- [ ] Hero 区显示正常（标题、副标题、CTA 按钮）
- [ ] TrustBar 显示正常（4个统计数据）
- [ ] Products 区显示正常（产品卡片）
- [ ] Solutions 区显示正常（5个方案链接）
- [ ] Cases 区显示正常（案例卡片）
- [ ] CTA 区显示正常
- [ ] Demo Form 显示正常
- [ ] Footer 显示正常

### 2.2 产品列表测试
**测试步骤**：
1. 访问 `http://localhost:3000/en/products`
2. 测试分类筛选

**检查清单**：
- [ ] 产品列表显示正常
- [ ] 分类标签切换正常（All, UAV, Payload, C-UAS, Ground Control）
- [ ] 产品卡片显示正常（图片、分类、标题、描述）
- [ ] 点击产品卡片跳转正常

### 2.3 产品详情测试
**测试步骤**：
1. 从产品列表点击任意产品
2. 检查详情页内容

**检查清单**：
- [ ] 产品图片显示正常
- [ ] 型号、名称、概述显示正常
- [ ] 参数表显示正常（非合规产品）
- [ ] 核心优势/能力/应用显示正常
- [ ] Request Demo 按钮正常
- [ ] Download Spec 按钮（如有数据表）正常

### 2.4 案例列表测试
**测试步骤**：
1. 访问 `http://localhost:3000/en/case-studies`

**检查清单**：
- [ ] 案例列表显示正常
- [ ] 案例卡片显示正常（视频/图片、行业、标题）

### 2.5 方案页测试
**测试步骤**：
1. 访问 `http://localhost:3000/en/solutions/public-safety`
2. 检查方案内容

**检查清单**：
- [ ] 方案标题显示正常
- [ ] Challenge/Solution/Workflow 显示正常
- [ ] Key Metrics 显示正常
- [ ] Request Demo 按钮正常

### 2.6 合规政策页测试
**测试步骤**：
1. 访问 `http://localhost:3000/en/compliance`

**检查清单**：
- [ ] 合规政策内容显示正常

---

## 三、Demo 表单功能检查

### 3.1 表单提交测试
**测试步骤**：
1. 访问 `http://localhost:3000/en#demo-form`
2. 填写表单：
   - Full Name: `Test User`
   - Company: `Test Company`
   - Email: `test@example.com`
   - Country: `United States`
   - Application Interest: `Public Safety`
3. 点击 Submit

**预期结果**：
- 表单验证通过
- 显示成功提示
- 控制台无错误

### 3.2 合规筛查测试
**测试场景**：
1. **正常国家**：Country = `United States`, Application = `Public Safety`
   - 预期：提交成功，compliance_status = `approved`

2. **C-UAS 应用**：Country = `United States`, Application = `Counter-UAS`
   - 预期：提交成功，compliance_status = `review_required`

3. **受制裁国家**：Country = `Iran`, Application = `Public Safety`
   - 预期：返回 403 错误，显示 "Service not available in your region"

---

## 四、后台管理系统检查

### 4.1 登录测试
**前置条件**：
- 已在 Supabase 创建管理员账户

**测试步骤**：
1. 访问 `http://localhost:3000/admin`
2. 应自动重定向到 `/admin/login`
3. 输入管理员邮箱和密码
4. 点击 Login

**预期结果**：
- 登录成功
- 跳转到 `/admin` 仪表盘

### 4.2 仪表盘测试
**测试步骤**：
1. 登录后访问 `http://localhost:3000/admin`

**检查清单**：
- [ ] 侧边栏显示正常
- [ ] 统计卡片显示正常（Inquiries, Products, Case Studies 数量）
- [ ] 导航链接正常

### 4.3 询盘管理测试
**测试步骤**：
1. 访问 `http://localhost:3000/admin/inquiries`

**检查清单**：
- [ ] 询盘列表显示正常
- [ ] 搜索功能正常
- [ ] 分页功能正常
- [ ] 点击行跳转正常

### 4.4 产品管理测试
**测试步骤**：
1. 访问 `http://localhost:3000/admin/products`

**检查清单**：
- [ ] 产品列表显示正常
- [ ] Add Product 按钮正常
- [ ] 点击产品跳转编辑页正常

**编辑页测试**：
1. 点击任意产品进入编辑页

**检查清单**：
- [ ] 基础信息编辑正常（Model, Slug）
- [ ] 开关切换正常（Published, Featured, Compliance Required）
- [ ] 图片上传功能正常
- [ ] 多语言 Tab 切换正常
- [ ] 保存功能正常

### 4.5 设置页测试
**测试步骤**：
1. 访问 `http://localhost:3000/admin/settings`

**检查清单**：
- [ ] 站点名称编辑正常
- [ ] 联系邮箱编辑正常
- [ ] WhatsApp 编辑正常
- [ ] 语言开关切换正常（Enable Chinese, Auto-detect Chinese by IP）
- [ ] 保存功能正常

---

## 五、API 功能检查

### 5.1 Demo 请求 API
**测试命令**：
```bash
curl -X POST http://localhost:3000/api/demo-request \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "company": "Test Company",
    "email": "test@example.com",
    "country": "United States",
    "application_interest": "Public Safety"
  }'
```

**预期结果**：
```json
{
  "success": true,
  "compliance_status": "approved"
}
```

### 5.2 站点设置 API
**测试命令**：
```bash
curl http://localhost:3000/api/site-settings
```

**预期结果**：
```json
{
  "enabled_languages": ["en", "ar", "es", "fr", "pt", "id"],
  "enable_chinese": false
}
```

### 5.3 文件上传 API
**测试命令**：
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "files=@test-image.jpg"
```

**预期结果**：
```json
{
  "urls": ["https://cdn.seekdrn.com/media/..."]
}
```

---

## 六、GTM 事件跟踪检查

### 6.1 事件触发测试
**测试步骤**：
1. 打开浏览器开发者工具 > Console
2. 访问首页并操作

**检查事件**：
- `demo_form_submit` - 提交表单时触发
- `demo_request_success` - 提交成功时触发
- `datasheet_download` - 下载规格书时触发

**验证方法**：
```javascript
// 在 Console 中查看 dataLayer
console.log(window.dataLayer)
```

---

## 七、错误页面检查

### 7.1 404 页面测试
**测试步骤**：
1. 访问 `http://localhost:3000/en/non-existent-page`

**预期结果**：
- 显示 404 页面
- 显示 "Page Not Found" 文字
- 显示 "Go Home" 按钮
- 点击按钮跳转首页

### 7.2 错误页面测试
**测试步骤**：
1. 触发一个运行时错误（如访问未定义变量）

**预期结果**：
- 显示错误页面
- 显示 "Error" 文字
- 显示错误详情

---

## 八、性能检查

### 8.1 页面加载性能
**测试工具**：Chrome DevTools > Lighthouse

**测试页面**：
- 首页：`http://localhost:3000/en`
- 产品列表：`http://localhost:3000/en/products`
- 产品详情：任意产品详情页

**目标指标**：
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 8.2 网络请求检查
**测试步骤**：
1. 打开 DevTools > Network
2. 刷新页面
3. 检查请求数量和大小

**优化建议**：
- 图片应使用 WebP 格式
- 静态资源应启用缓存
- 避免重复请求

---

## 九、兼容性检查

### 9.1 浏览器兼容性
**测试浏览器**：
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

**检查项**：
- [ ] 页面布局正常
- [ ] 交互功能正常
- [ ] 样式显示正常

### 9.2 移动端响应式
**测试步骤**：
1. 打开 DevTools > Toggle Device Toolbar
2. 测试不同设备尺寸

**检查项**：
- [ ] 移动端导航菜单正常（汉堡菜单）
- [ ] 布局自适应正常
- [ ] 触摸交互正常

---

## 十、安全性检查

### 10.1 认证保护
**测试步骤**：
1. 未登录状态访问 `/admin`
2. 应重定向到 `/admin/login`

### 10.2 RLS 策略
**测试步骤**：
1. 使用 anon key 查询数据
2. 应只返回 published=true 的数据

### 10.3 XSS 防护
**测试步骤**：
1. 在表单中输入 HTML 标签
2. 检查是否被正确转义

---

## 检查结果汇总

**通过项**：
- [ ] 多语言功能
- [ ] 公开页面
- [ ] Demo 表单
- [ ] 后台管理
- [ ] API 功能
- [ ] GTM 跟踪
- [ ] 错误页面
- [ ] 性能
- [ ] 兼容性
- [ ] 安全性

**问题记录**：
| 问题 | 严重程度 | 状态 | 备注 |
|------|---------|------|------|
|      |         |      |      |

---

## 快速检查命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run build

# 代码检查
npm run lint

# 访问测试
curl http://localhost:3000/en
curl http://localhost:3000/admin
```
