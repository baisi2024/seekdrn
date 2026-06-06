-- 006_product_tags.sql
-- 产品标签表

CREATE TABLE product_tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  translations jsonb NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE product_tag_relations (
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  tag_id     uuid REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- 索引
CREATE INDEX idx_tag_relations_product ON product_tag_relations(product_id);
CREATE INDEX idx_tag_relations_tag ON product_tag_relations(tag_id);

-- RLS
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tag_relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view tags"
  ON product_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to tags"
  ON product_tags FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Public can view tag relations"
  ON product_tag_relations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_tag_relations.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to tag relations"
  ON product_tag_relations FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
