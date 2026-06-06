-- ============================================================================
-- Product Documents Table
-- 存储产品的相关文档，如说明书、数据表、证书等
-- ============================================================================

-- 创建产品文档表
CREATE TABLE product_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid REFERENCES products(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('manual', 'datasheet', 'certificate', 'brochure', 'other')),
  translations jsonb NOT NULL DEFAULT '{}',
  file_url     text NOT NULL,
  file_size    int,
  file_type    text,
  language     text,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 添加表注释
COMMENT ON TABLE product_documents IS '产品文档表，存储说明书、数据表、证书等相关文档';
COMMENT ON COLUMN product_documents.id IS '文档唯一标识ID';
COMMENT ON COLUMN product_documents.product_id IS '关联的产品ID';
COMMENT ON COLUMN product_documents.type IS '文档类型：manual-说明书, datasheet-数据表, certificate-证书, brochure-宣传册, other-其他';
COMMENT ON COLUMN product_documents.translations IS '多语言翻译数据，JSON格式';
COMMENT ON COLUMN product_documents.file_url IS '文档文件URL';
COMMENT ON COLUMN product_documents.file_size IS '文件大小(字节)';
COMMENT ON COLUMN product_documents.file_type IS '文件MIME类型';
COMMENT ON COLUMN product_documents.language IS '文档语言代码';
COMMENT ON COLUMN product_documents.sort_order IS '排序顺序，数字越小越靠前';
COMMENT ON COLUMN product_documents.created_at IS '创建时间';

-- 创建索引
CREATE INDEX idx_documents_product ON product_documents(product_id);
CREATE INDEX idx_documents_type ON product_documents(type);

-- 启用行级安全策略
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Public can view product documents" ON product_documents
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_documents.product_id
    AND products.published = true
  ));

CREATE POLICY "Admins have full access to product documents" ON product_documents
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');
