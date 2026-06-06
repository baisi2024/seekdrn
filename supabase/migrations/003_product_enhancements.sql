-- 003_product_enhancements.sql
-- 产品详情页增强功能数据库迁移

-- ============================================
-- 扩展 products 表
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS spec_groups jsonb DEFAULT '[]';

-- ============================================
-- 扩展 product_specs 表
-- ============================================
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS group_id text;
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS unit jsonb DEFAULT '{}';

-- ============================================
-- 新增 product_downloads 表
-- ============================================
CREATE TABLE product_downloads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('manual', 'datasheet', 'certificate', 'media')),
  title       jsonb NOT NULL DEFAULT '{}',
  description jsonb DEFAULT '{}',
  file_url    text NOT NULL,
  file_size   int,
  file_type   text,
  language    text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_product_downloads_product ON product_downloads(product_id, type);

-- ============================================
-- 新增 product_case_relations 表
-- ============================================
CREATE TABLE product_case_relations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  case_study_id uuid NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
  is_manual    boolean NOT NULL DEFAULT false,
  relevance_score float DEFAULT 0,
  sort_order   int NOT NULL DEFAULT 0,
  UNIQUE(product_id, case_study_id)
);

-- 索引
CREATE INDEX idx_product_case_relations ON product_case_relations(product_id, is_manual);

-- ============================================
-- RLS 策略
-- ============================================
ALTER TABLE product_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_case_relations ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public can view published product downloads"
  ON product_downloads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_downloads.product_id
    AND products.published = true
  ));

CREATE POLICY "Public can view published product case relations"
  ON product_case_relations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_case_relations.product_id
    AND products.published = true
  ));

-- Admin 完全访问策略
CREATE POLICY "Admins have full access to product downloads"
  ON product_downloads FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins have full access to product case relations"
  ON product_case_relations FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
