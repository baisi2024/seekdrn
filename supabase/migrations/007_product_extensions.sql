-- 007_product_extensions.sql
-- 扩展产品表和媒体表

-- 扩展 products 表
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES product_categories(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS translation_status jsonb DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 扩展 media 表
ALTER TABLE media ADD COLUMN IF NOT EXISTS type text DEFAULT 'image' CHECK (type IN ('image', 'video', 'document'));
ALTER TABLE media ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';
ALTER TABLE media ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 全文搜索索引
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- 搜索向量更新触发器
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.slug, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_search
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_search_vector();

-- 更新现有产品的分类
UPDATE products SET category_id = (SELECT id FROM product_categories WHERE slug = products.category LIMIT 1)
WHERE category_id IS NULL AND category IS NOT NULL;
