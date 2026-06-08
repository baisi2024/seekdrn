-- 补充 product_faqs 和 product_documents 数据
-- db query -f 对多语句文件可能只执行第一条，所以用单文件逐语句

-- FAQ 1 zh
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '最大飞行时间是多少？', '最大飞行时间因型号而异。SD-200提供120分钟，SD-350提供90分钟，SD-700可提供长达24小时。', 1
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 2 en
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'en', 'What weather conditions can it operate in?', 'Our UAVs are designed for all-weather operation, capable of flying in winds up to 15m/s, temperatures from -20°C to 50°C, and light rain conditions.', 2
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 2 zh
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '可以在什么天气条件下作业？', '我们的无人机专为全天候作业设计，可在高达15米/秒的风速、-20°C至50°C的温度和轻雨条件下飞行。', 2
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 3 en
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'en', 'What is the operational range?', 'Operational range varies by model: SD-200 has 50km range, SD-350 has 35km, SD-600 has 80km, and SD-700 can reach up to 500km.', 3
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 3 zh
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '作战半径是多少？', '作战半径因型号而异：SD-200为50公里，SD-350为35公里，SD-600为80公里，SD-700可达500公里。', 3
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 4 en
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'en', 'What payloads are compatible?', 'Our UAVs support various payloads including EO/IR cameras, LiDAR, multispectral sensors, SAR, and custom payloads up to the specified weight limit.', 4
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 4 zh
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '兼容哪些载荷？', '我们的无人机支持各种载荷，包括光电/红外相机、激光雷达、多光谱传感器、合成孔径雷达和指定重量限制内的定制载荷。', 4
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- product_documents: datasheet
INSERT INTO product_documents (product_id, type, translations, file_url, sort_order)
SELECT p.id, 'datasheet', '{"en": "Product Datasheet", "zh": "产品数据表"}'::jsonb, '/documents/datasheets/' || p.slug || '.pdf', 1
FROM products p;

-- product_documents: manual
INSERT INTO product_documents (product_id, type, translations, file_url, sort_order)
SELECT p.id, 'manual', '{"en": "User Manual", "zh": "用户手册"}'::jsonb, '/documents/manuals/' || p.slug || '-manual.pdf', 2
FROM products p;
