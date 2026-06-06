-- 002_rls_policies.sql
-- Enable Row Level Security and define access policies

-- ============================================
-- Enable RLS on all tables
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper: admin check
-- auth.jwt() ->> 'role' = 'admin'
-- ============================================

-- ============================================
-- products
-- ============================================
CREATE POLICY "Public read published products"
  ON products FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all products"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- product_specs
-- ============================================
CREATE POLICY "Public read product_specs"
  ON product_specs FOR SELECT
  USING (true);

CREATE POLICY "Admin all product_specs"
  ON product_specs FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- case_studies
-- ============================================
CREATE POLICY "Public read published case_studies"
  ON case_studies FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all case_studies"
  ON case_studies FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- solutions
-- ============================================
CREATE POLICY "Public read published solutions"
  ON solutions FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all solutions"
  ON solutions FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- inquiries
-- ============================================
CREATE POLICY "Anonymous insert inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read inquiries"
  ON inquiries FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin update inquiries"
  ON inquiries FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- navigation
-- ============================================
CREATE POLICY "Public read published navigation"
  ON navigation FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all navigation"
  ON navigation FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- footer_content
-- ============================================
CREATE POLICY "Public read published footer_content"
  ON footer_content FOR SELECT
  USING (published = true);

CREATE POLICY "Admin all footer_content"
  ON footer_content FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- email_templates
-- ============================================
CREATE POLICY "Admin all email_templates"
  ON email_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- site_settings
-- ============================================
CREATE POLICY "Public read site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin all site_settings"
  ON site_settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- media
-- ============================================
CREATE POLICY "Admin all media"
  ON media FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- email_logs RLS policies
-- ============================================
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email logs"
  ON email_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
