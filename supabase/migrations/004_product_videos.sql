-- 004_product_videos.sql
-- 添加产品视频支持

ALTER TABLE products ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';