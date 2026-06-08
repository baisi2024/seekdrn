-- 017_extend_category_check.sql
-- 扩展 products.category 的 CHECK 约束，新增 quadruped-robot 和 unmanned-vehicle

-- 删除旧约束
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- 添加新约束
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('uav', 'payload', 'cuas', 'ground_control', 'quadruped-robot', 'unmanned-vehicle'));
