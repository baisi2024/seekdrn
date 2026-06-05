-- seed/footer_content.sql
-- Footer compliance section

INSERT INTO footer_content (section, translations, published) VALUES
  (
    'compliance',
    '{
      "en": "SeekDrone products are subject to export control regulations. Counter-UAS and certain advanced UAV systems require end-user verification and may be subject to licensing requirements under applicable international trade laws. We are committed to responsible technology transfer and full regulatory compliance."
    }'::jsonb,
    true
  );
