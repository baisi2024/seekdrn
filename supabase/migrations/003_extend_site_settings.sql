-- ============================================================================
-- Extend Site Settings
-- 扩展 site_settings 表，添加信任栏、CTA、SEO、GTM、About、优势等配置字段
-- ============================================================================

-- 信任栏配置
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS trust_bar_config jsonb;

-- CTA 区域配置
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS cta_config jsonb;

-- SEO 元数据
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS seo_metadata jsonb;

-- Google Tag Manager ID
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS gtm_id text;

-- About/关于我们 配置
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS about_config jsonb;

-- 优势/Advantages 配置
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS advantages_config jsonb;

-- 添加列注释
COMMENT ON COLUMN site_settings.trust_bar_config IS '信任栏配置，JSON 格式';
COMMENT ON COLUMN site_settings.cta_config IS 'CTA 区域配置，JSON 格式';
COMMENT ON COLUMN site_settings.seo_metadata IS 'SEO 元数据配置，JSON 格式';
COMMENT ON COLUMN site_settings.gtm_id IS 'Google Tag Manager 容器 ID';
COMMENT ON COLUMN site_settings.about_config IS 'About/关于我们页面配置，JSON 格式';
COMMENT ON COLUMN site_settings.advantages_config IS '优势/Advantages 区域配置，JSON 格式';