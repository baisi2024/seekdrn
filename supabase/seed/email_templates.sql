-- seed/email_templates.sql
-- Default email templates

INSERT INTO email_templates (template_key, description, translations, available_variables, is_active) VALUES
  (
    'demo_request_thank_you',
    'Customer thank-you email after demo request submission',
    '{
      "en": {
        "subject": "Thank you for your interest in SeekDrone",
        "body": "Dear {{full_name}},\n\nThank you for your interest in SeekDrone solutions for {{application_interest}}. Our team will review your request and get back to you shortly.\n\nBest regards,\nThe SeekDrone Team"
      }
    }'::jsonb,
    '{full_name,application_interest}',
    true
  ),
  (
    'demo_request_internal',
    'Internal notification to sales team about new demo request',
    '{
      "en": {
        "subject": "New Demo Request: {{full_name}} from {{company}}",
        "body": "A new demo request has been submitted.\n\nName: {{full_name}}\nCompany: {{company}}\nEmail: {{email}}\nCountry: {{country}}\nApplication Interest: {{application_interest}}\nSource Page: {{source_page}}\nCompliance Status: {{compliance_status}}"
      }
    }'::jsonb,
    '{full_name,company,email,country,application_interest,source_page,compliance_status}',
    true
  ),
  (
    'compliance_review_internal',
    'Internal alert for compliance review on C-UAS inquiries',
    '{
      "en": {
        "subject": "⚠️ Compliance Review Required: C-UAS Inquiry from {{full_name}}",
        "body": "<div style=\"border-left:4px solid #dc2626;padding:12px 16px;background:#fef2f2;margin:16px 0;\"><strong style=\"color:#dc2626;\">COMPLIANCE REVIEW REQUIRED</strong><br>This inquiry involves Counter-UAS technology and requires compliance review before proceeding.</div><p><strong>Name:</strong> {{full_name}}<br><strong>Company:</strong> {{company}}<br><strong>Email:</strong> {{email}}<br><strong>Country:</strong> {{country}}<br><strong>Application:</strong> {{application_interest}}<br><strong>Compliance Status:</strong> {{compliance_status}}</p>"
      }
    }'::jsonb,
    '{full_name,company,email,country,application_interest,compliance_status}',
    true
  );
