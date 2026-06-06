-- 003_email_logs.sql
-- Email sending history logs

-- ============================================
-- email_logs
-- ============================================
CREATE TABLE email_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key    text NOT NULL,
  recipient_email text NOT NULL,
  language        text NOT NULL,
  subject         text NOT NULL,
  body_html       text NOT NULL,
  variables       jsonb DEFAULT '{}',
  status          text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message   text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_template_key ON email_logs(template_key);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);

-- ============================================
-- updated_at trigger
-- ============================================
CREATE TRIGGER set_email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
