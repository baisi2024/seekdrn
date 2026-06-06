-- ============================================================================
-- Product Standardized Specs Extension
-- 扩展产品表，添加标准化规格字段和排序字段
-- ============================================================================

-- 添加标准化规格字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs_standardized jsonb DEFAULT '{}';

-- 添加排序字段
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

-- 添加字段注释
COMMENT ON COLUMN products.specs_standardized IS '标准化规格数据，JSON格式，用于结构化展示产品规格';
COMMENT ON COLUMN products.sort_order IS '产品排序顺序，数字越小越靠前';

-- 根据创建时间初始化排序字段
UPDATE products
SET sort_order = EXTRACT(EPOCH FROM created_at)::int
WHERE sort_order IS NULL OR sort_order = 0;

-- 创建排序索引
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
