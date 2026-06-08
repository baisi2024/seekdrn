-- 018_footer_navigation.sql
-- 插入页脚导航数据

-- 先清理已有的 footer 导航（如果有的话）
DELETE FROM navigation WHERE position = 'footer';

-- 使用 CTE 插入顶层列和子链接
WITH products_col AS (
  INSERT INTO navigation (position, parent_id, order_index, link_type, url, translations, published)
  VALUES ('footer', NULL, 1, 'internal', '#', '{
    "en": "Products",
    "zh": "产品",
    "ar": "المنتجات",
    "es": "Productos",
    "fr": "Produits",
    "pt": "Produtos",
    "id": "Produk",
    "th": "ผลิตภัณฑ์",
    "vi": "Sản phẩm",
    "fa": "محصولات",
    "ru": "Продукция"
  }'::jsonb, true)
  RETURNING id
),
solutions_col AS (
  INSERT INTO navigation (position, parent_id, order_index, link_type, url, translations, published)
  VALUES ('footer', NULL, 2, 'internal', '#', '{
    "en": "Solutions",
    "zh": "解决方案",
    "ar": "الحلول",
    "es": "Soluciones",
    "fr": "Solutions",
    "pt": "Soluções",
    "id": "Solusi",
    "th": "โซลูชัน",
    "vi": "Giải pháp",
    "fa": "راه‌حل‌ها",
    "ru": "Решения"
  }'::jsonb, true)
  RETURNING id
),
support_col AS (
  INSERT INTO navigation (position, parent_id, order_index, link_type, url, translations, published)
  VALUES ('footer', NULL, 3, 'internal', '#', '{
    "en": "Support",
    "zh": "支持",
    "ar": "الدعم",
    "es": "Soporte",
    "fr": "Support",
    "pt": "Suporte",
    "id": "Dukungan",
    "th": "การสนับสนุน",
    "vi": "Hỗ trợ",
    "fa": "پشتیبانی",
    "ru": "Поддержка"
  }'::jsonb, true)
  RETURNING id
)
INSERT INTO navigation (position, parent_id, order_index, link_type, url, translations, published)
-- Products 子链接
SELECT 'footer', products_col.id, 1, 'internal', '/products?cat=uav', '{
  "en": "UAV Platforms", "zh": "无人机平台", "ar": "منصات الطائرات بدون طيار", "es": "Plataformas UAV", "fr": "Plateformes UAV", "pt": "Plataformas UAV", "id": "Platform UAV", "th": "แพลตฟอร์ม UAV", "vi": "Nền tảng UAV", "fa": "پلتفرم پهپاد", "ru": "Платформы БПЛА"
}'::jsonb, true FROM products_col
UNION ALL
SELECT 'footer', products_col.id, 2, 'internal', '/products?cat=payload', '{
  "en": "Payloads", "zh": "载荷", "ar": "الحمولات", "es": "Cargas Útiles", "fr": "Charges Utiles", "pt": "Cargas Úteis", "id": "Muatan", "th": "น้ำหนักบรรทุก", "vi": "Khối lượng hữu ích", "fa": "بار مفید", "ru": "Полезные нагрузки"
}'::jsonb, true FROM products_col
UNION ALL
SELECT 'footer', products_col.id, 3, 'internal', '/products?cat=cuas', '{
  "en": "Counter-UAS", "zh": "反无人机", "ar": "مضاد للطائرات بدون طيار", "es": "Contra-Drones", "fr": "Anti-Drones", "pt": "Anti-Drones", "id": "Anti-Drone", "th": "ต้านโดรน", "vi": "Chống Drone", "fa": "ضد پهپاد", "ru": "ПротивоБПЛА"
}'::jsonb, true FROM products_col
UNION ALL
SELECT 'footer', products_col.id, 4, 'internal', '/products?cat=ground_control', '{
  "en": "Ground Control", "zh": "地面站", "ar": "محطة التحكم الأرضية", "es": "Control Terrestre", "fr": "Contrôle au Sol", "pt": "Controle Terrestre", "id": "Kontrol Darat", "th": "สถานีควบคุมภาคพื้นดิน", "vi": "Điều khiển mặt đất", "fa": "ایستگاه کنترل زمینی", "ru": "Наземное управление"
}'::jsonb, true FROM products_col
-- Solutions 子链接
UNION ALL
SELECT 'footer', solutions_col.id, 1, 'internal', '/solutions/border-security', '{
  "en": "Border Security", "zh": "边境安全", "ar": "أمن الحدود", "es": "Seguridad Fronteriza", "fr": "Sécurité Frontalière", "pt": "Segurança de Fronteiras", "id": "Keamanan Perbatasan", "th": "ความมั่นคงชายแดน", "vi": "An ninh biên giới", "fa": "امنیت مرزی", "ru": "Охрана границ"
}'::jsonb, true FROM solutions_col
UNION ALL
SELECT 'footer', solutions_col.id, 2, 'internal', '/solutions/infrastructure-inspection', '{
  "en": "Infrastructure Inspection", "zh": "基础设施巡检", "ar": "فحص البنية التحتية", "es": "Inspección de Infraestructura", "fr": "Inspection d''Infrastructure", "pt": "Inspeção de Infraestrutura", "id": "Inspeksi Infrastruktur", "th": "ตรวจสอบโครงสร้างพื้นฐาน", "vi": "Kiểm tra cơ sở hạ tầng", "fa": "بازرسی زیرساخت", "ru": "Инспекция инфраструктуры"
}'::jsonb, true FROM solutions_col
UNION ALL
SELECT 'footer', solutions_col.id, 3, 'internal', '/solutions/public-safety', '{
  "en": "Public Safety", "zh": "公共安全", "ar": "السلامة العامة", "es": "Seguridad Pública", "fr": "Sécurité Publique", "pt": "Segurança Pública", "id": "Keselamatan Publik", "th": "ความปลอดภัยสาธารณะ", "vi": "An toàn công cộng", "fa": "امنیت عمومی", "ru": "Общественная безопасность"
}'::jsonb, true FROM solutions_col
-- Support 子链接
UNION ALL
SELECT 'footer', support_col.id, 1, 'internal', '/case-studies', '{
  "en": "Case Studies", "zh": "案例研究", "ar": "دراسات الحالة", "es": "Casos de Éxito", "fr": "Études de Cas", "pt": "Estudos de Caso", "id": "Studi Kasus", "th": "กรณีศึกษา", "vi": "Nghiên cứu tình huống", "fa": "مطالعات موردی", "ru": "Примеры внедрения"
}'::jsonb, true FROM support_col
UNION ALL
SELECT 'footer', support_col.id, 2, 'internal', '/compliance', '{
  "en": "Compliance", "zh": "合规", "ar": "الامتثال", "es": "Cumplimiento", "fr": "Conformité", "pt": "Conformidade", "id": "Kepatuhan", "th": "การปฏิบัติตามกฎระเบียบ", "vi": "Tuân thủ", "fa": "انطباق", "ru": "Соответствие"
}'::jsonb, true FROM support_col;
