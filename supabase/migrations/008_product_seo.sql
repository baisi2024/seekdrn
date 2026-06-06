-- ============================================================================
-- Product SEO Metadata Table
-- 存储产品的SEO元数据，支持多语言SEO优化
-- ============================================================================

-- 创建产品SEO元数据表
CREATE TABLE product_seo (
  product_id       uuid REFERENCES products(id) ON DELETE CASCADE,
  locale           text NOT NULL,
  meta_title       text,
  meta_description text,
  meta_keywords    text[],
  og_title         text,
  og_description   text,
  og_image         text,
  structured_data  jsonb,
  PRIMARY KEY (product_id, locale)
);

-- 添加表注释
COMMENT ON TABLE product_seo IS '产品SEO元数据表，存储多语言SEO信息';
COMMENT ON COLUMN product_seo.product_id IS '关联的产品ID';
COMMENT ON COLUMN product_seo.locale IS '语言代码，如zh-CN, en-US';
COMMENT ON COLUMN product_seo.meta_title IS '页面标题(meta title)';
COMMENT ON COLUMN product_seo.meta_description IS '页面描述(meta description)';
COMMENT ON COLUMN product_seo.meta_keywords IS '关键词数组';
COMMENT ON COLUMN product_seo.og_title IS 'Open Graph标题';
COMMENT ON COLUMN product_seo.og_description IS 'Open Graph描述';
COMMENT ON COLUMN product_seo.og_image IS 'Open Graph图片URL';
COMMENT ON COLUMN product_seo.structured_data IS '结构化数据(JSON-LD格式)';

-- 创建索引
CREATE INDEX idx_product_seo_product ON product_seo(product_id);

-- 启用行级安全策略
ALTER TABLE product_seo ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Public can view product SEO" ON product_seo
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_seo.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product SEO" ON product_seo
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
