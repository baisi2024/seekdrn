-- ============================================================================
-- Product FAQs Table
-- 存储产品的常见问题解答，支持多语言
-- ============================================================================

-- 创建产品FAQ表
CREATE TABLE product_faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid REFERENCES products(id) ON DELETE CASCADE,
  locale      text NOT NULL,
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 添加表注释
COMMENT ON TABLE product_faqs IS '产品FAQ表，存储多语言常见问题解答';
COMMENT ON COLUMN product_faqs.id IS 'FAQ唯一标识ID';
COMMENT ON COLUMN product_faqs.product_id IS '关联的产品ID';
COMMENT ON COLUMN product_faqs.locale IS '语言代码，如zh-CN, en-US';
COMMENT ON COLUMN product_faqs.question IS '问题内容';
COMMENT ON COLUMN product_faqs.answer IS '答案内容';
COMMENT ON COLUMN product_faqs.sort_order IS '排序顺序，数字越小越靠前';
COMMENT ON COLUMN product_faqs.created_at IS '创建时间';

-- 创建索引
CREATE INDEX idx_faqs_product ON product_faqs(product_id, locale);
CREATE INDEX idx_faqs_sort ON product_faqs(sort_order);

-- 启用行级安全策略
ALTER TABLE product_faqs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Public can view product FAQs" ON product_faqs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_faqs.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product FAQs" ON product_faqs
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
