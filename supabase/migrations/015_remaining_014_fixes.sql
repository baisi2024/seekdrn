-- 015_remaining_014_fixes.sql
-- 014 推送时 faqs 表不存在导致后续语句未执行，此处补齐

-- ============================================
-- faqs 表增加 category (仅表存在时执行)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'faqs') THEN
    ALTER TABLE faqs ADD COLUMN IF NOT EXISTS category text;
  END IF;
END
$$;

-- ============================================
-- 修复 product_specs RLS
-- ============================================
DROP POLICY IF EXISTS "Public read product_specs" ON product_specs;
CREATE POLICY "Public read product_specs for published products"
  ON product_specs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_specs.product_id
    AND products.published = true
  ));

-- ============================================
-- 合并 product_downloads 到 product_documents
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_downloads') THEN
    INSERT INTO product_documents (product_id, type, translations, file_url, file_size, file_type, language, sort_order)
    SELECT pd.product_id,
      CASE pd.type WHEN 'media' THEN 'other' ELSE pd.type END,
      pd.title, pd.file_url, pd.file_size, pd.file_type, pd.language, pd.sort_order
    FROM product_downloads pd
    WHERE NOT EXISTS (
      SELECT 1 FROM product_documents pdoc
      WHERE pdoc.product_id = pd.product_id
      AND pdoc.file_url = pd.file_url
    );
  END IF;
END
$$;
