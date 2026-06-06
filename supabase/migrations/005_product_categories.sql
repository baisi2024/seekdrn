-- 005_product_categories.sql
-- 产品分类表

CREATE TABLE product_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  parent_id   uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  translations jsonb NOT NULL DEFAULT '{}',
  icon        text,
  image       text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX idx_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_categories_slug ON product_categories(slug);
CREATE INDEX idx_categories_sort ON product_categories(sort_order);

-- RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories"
  ON product_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins have full access to categories"
  ON product_categories FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- 触发器：自动更新 updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON product_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 初始数据
INSERT INTO product_categories (slug, translations, sort_order) VALUES
  ('uav', '{"en": {"name": "UAV"}, "zh": {"name": "无人机"}}', 1),
  ('payload', '{"en": {"name": "Payload"}, "zh": {"name": "载荷"}}', 2),
  ('cuas', '{"en": {"name": "C-UAS"}, "zh": {"name": "反无人机"}}', 3),
  ('ground_control', '{"en": {"name": "Ground Control"}, "zh": {"name": "地面站"}}', 4);
