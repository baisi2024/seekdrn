-- 014_subproject1_enhancements.sql
-- 子项目1增强功能数据库迁移

-- ============================================
-- 1.1 solution_products 关联表
-- ============================================
CREATE TABLE IF NOT EXISTS solution_products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order  int NOT NULL DEFAULT 0,
  UNIQUE (solution_id, product_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_solution_products_solution ON solution_products(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_products_product ON solution_products(product_id);

-- RLS
ALTER TABLE solution_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view solution products" ON solution_products;
CREATE POLICY "Public can view solution products"
  ON solution_products FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM solutions
    WHERE solutions.id = solution_products.solution_id
    AND solutions.published = true
  ));

DROP POLICY IF EXISTS "Admins have full access to solution products" ON solution_products;
CREATE POLICY "Admins have full access to solution products"
  ON solution_products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 1.2 solution_cases 关联表
-- ============================================
CREATE TABLE IF NOT EXISTS solution_cases (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id   uuid NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  case_study_id uuid NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  sort_order    int NOT NULL DEFAULT 0,
  UNIQUE (solution_id, case_study_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_solution_cases_solution ON solution_cases(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_cases_case_study ON solution_cases(case_study_id);

-- RLS
ALTER TABLE solution_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view solution cases" ON solution_cases;
CREATE POLICY "Public can view solution cases"
  ON solution_cases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM solutions
    WHERE solutions.id = solution_cases.solution_id
    AND solutions.published = true
  ));

DROP POLICY IF EXISTS "Admins have full access to solution cases" ON solution_cases;
CREATE POLICY "Admins have full access to solution cases"
  ON solution_cases FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 1.3 inquiries 表增加字段
-- ============================================
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS product_interest text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS intent text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_source text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_medium text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS locale text;

-- ============================================
-- 1.4 faqs 表增加 category (仅表存在时执行)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'faqs') THEN
    ALTER TABLE faqs ADD COLUMN IF NOT EXISTS category text;
  END IF;
END
$$;

-- ============================================
-- 1.5 修复 product_specs RLS
-- ============================================
DROP POLICY IF EXISTS "Public read product_specs" ON product_specs;
CREATE POLICY "Public read product_specs for published products"
  ON product_specs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_specs.product_id
    AND products.published = true
  ));

-- ============================================
-- 1.6 合并 product_downloads 到 product_documents
-- ============================================
INSERT INTO product_documents (product_id, type, translations, file_url, file_size, file_type, language, sort_order)
SELECT pd.product_id,
  CASE pd.type WHEN 'media' THEN 'other' ELSE pd.type END,
  pd.title, pd.file_url, pd.file_size, pd.file_type, pd.language, pd.sort_order
FROM product_downloads pd
WHERE NOT EXISTS (
  SELECT 1 FROM product_documents pdoc
  WHERE pdoc.product_id = pd.product_id
  AND pdoc.file_url = pd.file_url
);
