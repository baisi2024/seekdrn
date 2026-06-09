-- 020_add_tag_color.sql
-- 为 product_tags 表添加 color 列

ALTER TABLE product_tags ADD COLUMN IF NOT EXISTS color text;
