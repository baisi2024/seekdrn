-- 023_pdp_plp_enhancements.sql
-- PDP/PLP 页面增强：添加 hero 区域、场景、功能块、载荷等字段

-- ============================================================
-- products 表新增列
-- ============================================================

-- 全屏 Hero 背景图 URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'hero_image'
  ) THEN
    ALTER TABLE products ADD COLUMN hero_image text;
  END IF;
END $$;

COMMENT ON COLUMN products.hero_image IS 'PDP 全屏 Hero 背景图 URL';

-- 全屏 Hero 背景视频 URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'hero_video'
  ) THEN
    ALTER TABLE products ADD COLUMN hero_video text;
  END IF;
END $$;

COMMENT ON COLUMN products.hero_video IS 'PDP 全屏 Hero 背景视频 URL';

-- Hero 指标卡片
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'hero_metrics'
  ) THEN
    ALTER TABLE products ADD COLUMN hero_metrics jsonb DEFAULT '[]';
  END IF;
END $$;

COMMENT ON COLUMN products.hero_metrics IS 'PDP Hero 指标卡片: [{key, value, unit, label}]';

-- 应用场景
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'scenarios'
  ) THEN
    ALTER TABLE products ADD COLUMN scenarios jsonb DEFAULT '[]';
  END IF;
END $$;

COMMENT ON COLUMN products.scenarios IS 'PDP 应用场景: [{icon, title, description}]';

-- 功能块
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'feature_blocks'
  ) THEN
    ALTER TABLE products ADD COLUMN feature_blocks jsonb DEFAULT '[]';
  END IF;
END $$;

COMMENT ON COLUMN products.feature_blocks IS 'PDP 功能块: [{id, title, description, image, specs}]';

-- 兼容载荷
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'payloads'
  ) THEN
    ALTER TABLE products ADD COLUMN payloads jsonb DEFAULT '[]';
  END IF;
END $$;

COMMENT ON COLUMN products.payloads IS 'PDP 兼容载荷: [{id, name, description, image, specs}]';

-- ============================================================
-- product_categories 表新增列
-- ============================================================

-- PLP Hero 统计数据
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_categories' AND column_name = 'hero_stats'
  ) THEN
    ALTER TABLE product_categories ADD COLUMN hero_stats jsonb DEFAULT '[]';
  END IF;
END $$;

COMMENT ON COLUMN product_categories.hero_stats IS 'PLP 分类 Hero 统计数据: [{value, unit, label}]';

-- ============================================================
-- 更新搜索向量触发器函数，包含 scenarios / feature_blocks / payloads 文本
-- ============================================================

CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.model, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.slug, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(
      (
        SELECT string_agg(
          COALESCE(elem->>'title', '') || ' ' || COALESCE(elem->>'description', ''),
          ' '
        )
        FROM jsonb_array_elements(COALESCE(NEW.scenarios, '[]'::jsonb)) AS elem
      ),
      ''
    )), 'C') ||
    setweight(to_tsvector('english', COALESCE(
      (
        SELECT string_agg(
          COALESCE(elem->>'title', '') || ' ' || COALESCE(elem->>'description', ''),
          ' '
        )
        FROM jsonb_array_elements(COALESCE(NEW.feature_blocks, '[]'::jsonb)) AS elem
      ),
      ''
    )), 'C') ||
    setweight(to_tsvector('english', COALESCE(
      (
        SELECT string_agg(
          COALESCE(elem->>'name', '') || ' ' || COALESCE(elem->>'description', ''),
          ' '
        )
        FROM jsonb_array_elements(COALESCE(NEW.payloads, '[]'::jsonb)) AS elem
      ),
      ''
    )), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
