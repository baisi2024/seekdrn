-- ============================================================================
-- Site Content Table
-- 独立站通用内容管理表，按 section + key 组织多语言内容
-- ============================================================================

CREATE TABLE site_content (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section     varchar(100) NOT NULL,
  key         varchar(100) NOT NULL,
  translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url   text,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT uq_site_content_section_key UNIQUE (section, key)
);

COMMENT ON TABLE site_content IS '站点通用内容表，按 section + key 组织多语言内容';
COMMENT ON COLUMN site_content.id IS '内容唯一标识ID';
COMMENT ON COLUMN site_content.section IS '内容分区，如 hero、about、features 等';
COMMENT ON COLUMN site_content.key IS '内容键名，在同一个 section 内唯一';
COMMENT ON COLUMN site_content.translations IS '多语言内容，格式: {"en": "English text", "zh": "中文文本"}';
COMMENT ON COLUMN site_content.image_url IS '关联图片URL';
COMMENT ON COLUMN site_content.sort_order IS '排序顺序，数字越小越靠前';
COMMENT ON COLUMN site_content.published IS '是否发布';
COMMENT ON COLUMN site_content.created_at IS '创建时间';

-- 索引
CREATE INDEX idx_site_content_section ON site_content(section);
CREATE INDEX idx_site_content_section_key ON site_content(section, key);
CREATE INDEX idx_site_content_sort ON site_content(sort_order);
CREATE INDEX idx_site_content_published ON site_content(published);

-- 启用行级安全策略
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布的内容
CREATE POLICY "Public read published site_content"
  ON site_content FOR SELECT
  USING (published = true);

-- 管理员完全控制
CREATE POLICY "Admin all site_content"
  ON site_content FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');