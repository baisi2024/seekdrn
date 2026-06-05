-- seed/navigation.sql
-- Header navigation items

INSERT INTO navigation (position, order_index, link_type, url, translations, published) VALUES
  ('header', 1, 'internal', '/products', '{"en": "Products"}', true),
  ('header', 2, 'internal', '/solutions/public-safety', '{"en": "Solutions"}', true),
  ('header', 3, 'internal', '/case-studies', '{"en": "Case Studies"}', true),
  ('header', 4, 'internal', '/compliance', '{"en": "Support"}', true);
