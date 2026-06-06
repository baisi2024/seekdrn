-- ============================================================================
-- Product Relations Table
-- 存储产品与其他内容的关联关系，如案例研究、解决方案、相关产品
-- ============================================================================

-- 创建产品关联表
CREATE TABLE product_relations (
  product_id     uuid REFERENCES products(id) ON DELETE CASCADE,
  related_id     uuid NOT NULL,
  relation_type  text NOT NULL CHECK (relation_type IN ('case_study', 'solution', 'related_product')),
  sort_order     int NOT NULL DEFAULT 0,
  PRIMARY KEY (product_id, related_id, relation_type)
);

-- 添加表注释
COMMENT ON TABLE product_relations IS '产品关联表，存储产品与案例、解决方案、相关产品的关联关系';
COMMENT ON COLUMN product_relations.product_id IS '产品ID';
COMMENT ON COLUMN product_relations.related_id IS '关联内容的ID(案例/解决方案/产品)';
COMMENT ON COLUMN product_relations.relation_type IS '关联类型：case_study-案例研究, solution-解决方案, related_product-相关产品';
COMMENT ON COLUMN product_relations.sort_order IS '排序顺序，数字越小越靠前';

-- 创建索引
CREATE INDEX idx_relations_product ON product_relations(product_id);
CREATE INDEX idx_relations_related ON product_relations(related_id, relation_type);

-- 启用行级安全策略
ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Public can view product relations" ON product_relations
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_relations.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product relations" ON product_relations
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
