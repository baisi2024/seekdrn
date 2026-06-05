-- seed/site_settings.sql
-- Default site settings

INSERT INTO site_settings (id, site_name, seo_description, contact_email, contact_whatsapp, compliance_notice, hero_config, enabled_languages, enable_chinese, enable_chinese_by_ip)
VALUES (
  1,
  '{"en": "SeekDrone"}'::jsonb,
  '{"en": "Industrial UAV platforms and counter-UAS solutions for defense, security, and critical infrastructure worldwide."}'::jsonb,
  'info@seekdrone.com',
  NULL,
  NULL,
  '{
    "en": {
      "background_type": "image",
      "background_image_url": "",
      "background_video_url": "",
      "title": "Industrial UAVs, Tested Where It Matters Most",
      "subtitle": "Battle-proven drone platforms and counter-UAS solutions for defense, security, and critical infrastructure.",
      "cta_text": "Request a Demo",
      "cta_url": "/request-demo"
    }
  }'::jsonb,
  '{en,ar,es,fr,pt,id}',
  false,
  false
);
