-- 001_initial_schema.sql
-- SeekDrone website database schema

-- ============================================
-- products
-- ============================================
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model         text NOT NULL UNIQUE,
  slug          text NOT NULL UNIQUE,
  category      text NOT NULL CHECK (category IN ('uav', 'payload', 'cuas', 'ground_control')),
  sub_category  text,
  specs         jsonb DEFAULT '{}',
  translations  jsonb DEFAULT '{}',
  images        text[] DEFAULT '{}',
  datasheet_url text,
  compliance_flag text,
  featured      boolean NOT NULL DEFAULT false,
  published     boolean NOT NULL DEFAULT false,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- product_specs
-- ============================================
CREATE TABLE product_specs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       jsonb NOT NULL DEFAULT '{}',
  value       jsonb NOT NULL DEFAULT '{}',
  sort_order  int NOT NULL DEFAULT 0
);

-- ============================================
-- case_studies
-- ============================================
CREATE TABLE case_studies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  industry      text NOT NULL,
  country       text,
  translations  jsonb DEFAULT '{}',
  results       jsonb DEFAULT '{}',
  images        text[] DEFAULT '{}',
  video_url     text,
  client_quote  jsonb DEFAULT '{}',
  featured      boolean NOT NULL DEFAULT false,
  published     boolean NOT NULL DEFAULT false,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- solutions
-- ============================================
CREATE TABLE solutions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  icon          text,
  translations  jsonb DEFAULT '{}',
  metrics       jsonb DEFAULT '[]',
  published     boolean NOT NULL DEFAULT false,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- inquiries
-- ============================================
CREATE TABLE inquiries (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name          text NOT NULL,
  company            text,
  email              text NOT NULL,
  country            text,
  application_interest text,
  source_page        text,
  compliance_status  text NOT NULL DEFAULT 'approved' CHECK (compliance_status IN ('approved', 'review_required', 'blocked')),
  sales_person       text,
  follow_up_status   text NOT NULL DEFAULT 'pending' CHECK (follow_up_status IN ('pending', 'contacted', 'qualified', 'closed_won', 'closed_lost')),
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- navigation
-- ============================================
CREATE TABLE navigation (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position     text NOT NULL CHECK (position IN ('header', 'footer')),
  parent_id    uuid REFERENCES navigation(id) ON DELETE CASCADE,
  order_index  int NOT NULL DEFAULT 0,
  link_type    text NOT NULL CHECK (link_type IN ('internal', 'external')),
  url          text NOT NULL,
  translations jsonb DEFAULT '{}',
  published    boolean NOT NULL DEFAULT true
);

-- ============================================
-- footer_content
-- ============================================
CREATE TABLE footer_content (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section      text NOT NULL,
  translations jsonb DEFAULT '{}',
  published    boolean NOT NULL DEFAULT true
);

-- ============================================
-- email_templates
-- ============================================
CREATE TABLE email_templates (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key        text NOT NULL UNIQUE,
  description         text,
  translations        jsonb DEFAULT '{}',
  available_variables text[] DEFAULT '{}',
  is_active           boolean NOT NULL DEFAULT true,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- site_settings (singleton)
-- ============================================
CREATE TABLE site_settings (
  id                 int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name          jsonb DEFAULT '{}',
  seo_description    jsonb DEFAULT '{}',
  contact_email      text,
  contact_whatsapp   text,
  compliance_notice  text,
  hero_config        jsonb DEFAULT '{}',
  enabled_languages  text[] NOT NULL DEFAULT '{en,ar,es,fr,pt,id}',
  enable_chinese     boolean NOT NULL DEFAULT false,
  enable_chinese_by_ip boolean NOT NULL DEFAULT false,
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- media
-- ============================================
CREATE TABLE media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    text NOT NULL,
  r2_key      text NOT NULL UNIQUE,
  mime_type   text,
  size        bigint,
  alt_text    jsonb DEFAULT '{}',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(slug) WHERE featured = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_product_specs_product_id ON product_specs(product_id);
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_industry ON case_studies(industry);
CREATE INDEX idx_solutions_slug ON solutions(slug);
CREATE INDEX idx_inquiries_compliance_status ON inquiries(compliance_status);
CREATE INDEX idx_inquiries_follow_up_status ON inquiries(follow_up_status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_navigation_position ON navigation(position);
CREATE INDEX idx_media_r2_key ON media(r2_key);

-- ============================================
-- updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_solutions_updated_at
  BEFORE UPDATE ON solutions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
