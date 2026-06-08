-- 016_product_category_extensions.sql
-- 新增产品分类：四足机器人、无人车辆，补充所有语言翻译

-- 插入新分类（UPSERT 避免重复）
INSERT INTO product_categories (slug, translations, sort_order) VALUES
  ('quadruped-robot', '{
    "en": {"name": "Quadruped Robot"},
    "zh": {"name": "四足机器人"},
    "ar": {"name": "روبوت رباعي الأرجل"},
    "es": {"name": "Robot Cuadrúpedo"},
    "fr": {"name": "Robot Quadrupède"},
    "pt": {"name": "Robô Quadrúpede"},
    "id": {"name": "Robot Berkaki Empat"},
    "th": {"name": "หุ่นยนต์สี่ขา"},
    "vi": {"name": "Robot Bốn Chân"},
    "fa": {"name": "ربات چهارپا"},
    "ru": {"name": "Четвероногий робот"}
  }', 5),
  ('unmanned-vehicle', '{
    "en": {"name": "Unmanned Vehicle"},
    "zh": {"name": "无人车辆"},
    "ar": {"name": "مركبة غير مأهولة"},
    "es": {"name": "Vehículo No Tripulado"},
    "fr": {"name": "Véhicule Non Habité"},
    "pt": {"name": "Veículo Não Tripulado"},
    "id": {"name": "Kendaraan Tanpa Awak"},
    "th": {"name": "ยานพาหนะไร้คนขับ"},
    "vi": {"name": "Phương tiện Không người lái"},
    "fa": {"name": "خودرو بدون سرنشین"},
    "ru": {"name": "Беспилотный транспорт"}
  }', 6)
ON CONFLICT (slug) DO UPDATE SET translations = EXCLUDED.translations, sort_order = EXCLUDED.sort_order;

-- 补充已有分类的11语言翻译
UPDATE product_categories SET translations = '{
  "en": {"name": "UAV"},
  "zh": {"name": "无人机"},
  "ar": {"name": "طائرة بدون طيار"},
  "es": {"name": "VANT"},
  "fr": {"name": "UAV"},
  "pt": {"name": "VANT"},
  "id": {"name": "UAV"},
  "th": {"name": "อากาศยานไร้คนขับ"},
  "vi": {"name": "UAV"},
  "fa": {"name": "پهپاد"},
  "ru": {"name": "БПЛА"}
}' WHERE slug = 'uav';

UPDATE product_categories SET translations = '{
  "en": {"name": "Payload"},
  "zh": {"name": "载荷"},
  "ar": {"name": "الحمولة"},
  "es": {"name": "Carga Útil"},
  "fr": {"name": "Charge Utile"},
  "pt": {"name": "Carga Útil"},
  "id": {"name": "Muatan"},
  "th": {"name": "น้ำหนักบรรทุก"},
  "vi": {"name": "Khối lượng hữu ích"},
  "fa": {"name": "بار مفید"},
  "ru": {"name": "Полезная нагрузка"}
}' WHERE slug = 'payload';

UPDATE product_categories SET translations = '{
  "en": {"name": "C-UAS"},
  "zh": {"name": "反无人机"},
  "ar": {"name": "مضاد للطائرات بدون طيار"},
  "es": {"name": "Contra-Drones"},
  "fr": {"name": "Anti-Drones"},
  "pt": {"name": "Anti-Drones"},
  "id": {"name": "Anti-Drone"},
  "th": {"name": "ต้านโดรน"},
  "vi": {"name": "Chống Drone"},
  "fa": {"name": "ضد پهپاد"},
  "ru": {"name": "ПротивоБПЛА"}
}' WHERE slug = 'cuas';

UPDATE product_categories SET translations = '{
  "en": {"name": "Ground Control"},
  "zh": {"name": "地面站"},
  "ar": {"name": "محطة التحكم الأرضية"},
  "es": {"name": "Estación de Control Terrestre"},
  "fr": {"name": "Station de Contrôle au Sol"},
  "pt": {"name": "Estação de Controle Terrestre"},
  "id": {"name": "Stasiun Kontrol Darat"},
  "th": {"name": "สถานีควบคุมภาคพื้นดิน"},
  "vi": {"name": "Trạm Điều khiển Mặt đất"},
  "fa": {"name": "ایستگاه کنترل زمینی"},
  "ru": {"name": "Наземная станция управления"}
}' WHERE slug = 'ground_control';
