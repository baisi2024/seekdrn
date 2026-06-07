-- ============================================================================
-- FAQs Table
-- 独立站 FAQ 数据表，支持多语言 JSONB 存储
-- ============================================================================

CREATE TABLE faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE faqs IS 'FAQ表，使用 JSONB 存储多语言问答内容';
COMMENT ON COLUMN faqs.id IS 'FAQ唯一标识ID';
COMMENT ON COLUMN faqs.translations IS '多语言内容，格式: {"en": {"question": "...", "answer": "..."}, "zh": {...}}';
COMMENT ON COLUMN faqs.sort_order IS '排序顺序，数字越小越靠前';
COMMENT ON COLUMN faqs.published IS '是否发布，仅发布的FAQ在前端显示';
COMMENT ON COLUMN faqs.created_at IS '创建时间';

-- 索引
CREATE INDEX idx_faqs_sort ON faqs(sort_order);
CREATE INDEX idx_faqs_published ON faqs(published);

-- 启用行级安全策略
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布的 FAQ
CREATE POLICY "Public read published faqs"
  ON faqs FOR SELECT
  USING (published = true);

-- 管理员完全控制
CREATE POLICY "Admin all faqs"
  ON faqs FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');