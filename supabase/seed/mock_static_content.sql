-- seed/mock_static_content.sql
-- 其他静态内容数据

-- ============================================
-- 产品标签
-- ============================================
DELETE FROM product_tags;

INSERT INTO product_tags (slug, translations) VALUES
  ('long-endurance', '{"en": "Long Endurance", "zh": "长航时", "ar": "تحمل طويل", "es": "Larga Duración"}'),
  ('reconnaissance', '{"en": "Reconnaissance", "zh": "侦察", "ar": "استطلاع", "es": "Reconocimiento"}'),
  ('multi-role', '{"en": "Multi-Role", "zh": "多用途", "ar": "متعدد الأدوار", "es": "Multi-Propósito"}'),
  ('modular', '{"en": "Modular", "zh": "模块化", "ar": "معياري", "es": "Modular"}'),
  ('heavy-lift', '{"en": "Heavy Lift", "zh": "重载", "ar": "رفع ثقيل", "es": "Carga Pesada"}'),
  ('logistics', '{"en": "Logistics", "zh": "物流", "ar": "لوجستيات", "es": "Logística"}'),
  ('eo-ir', '{"en": "EO/IR", "zh": "光电/红外", "ar": "EO/IR", "es": "EO/IR"}'),
  ('high-resolution', '{"en": "High Resolution", "zh": "高分辨率", "ar": "دقة عالية", "es": "Alta Resolución"}'),
  ('multispectral', '{"en": "Multispectral", "zh": "多光谱", "ar": "متعدد الأطياف", "es": "Multiespectral"}'),
  ('agriculture', '{"en": "Agriculture", "zh": "农业", "ar": "زراعة", "es": "Agricultura"}'),
  ('lidar', '{"en": "LiDAR", "zh": "激光雷达", "ar": "LiDAR", "es": "LiDAR"}'),
  ('mapping', '{"en": "Mapping", "zh": "测绘", "ar": "رسم خرائط", "es": "Mapeo"}'),
  ('portable', '{"en": "Portable", "zh": "便携", "ar": "محمول", "es": "Portátil"}'),
  ('field-operations', '{"en": "Field Operations", "zh": "外场作业", "ar": "عمليات ميدانية", "es": "Operaciones de Campo"}'),
  ('vehicle-mounted', '{"en": "Vehicle Mounted", "zh": "车载", "ar": "مركب على مركبة", "es": "Montado en Vehículo"}'),
  ('multi-uav', '{"en": "Multi-UAV", "zh": "多机", "ar": "طائرات متعددة", "es": "Multi-UAV"}'),
  ('counter-uas', '{"en": "Counter-UAS", "zh": "反无人机", "ar": "مضاد للطائرات", "es": "Contra-UAS"}'),
  ('fixed-site', '{"en": "Fixed Site", "zh": "固定式", "ar": "موقع ثابت", "es": "Sitio Fijo"}'),
  ('vtol', '{"en": "VTOL", "zh": "垂直起降", "ar": "VTOL", "es": "VTOL"}'),
  ('long-range', '{"en": "Long Range", "zh": "长航程", "ar": "مدى طويل", "es": "Largo Alcance"}'),
  ('sar', '{"en": "SAR", "zh": "合成孔径雷达", "ar": "SAR", "es": "SAR"}'),
  ('all-weather', '{"en": "All-Weather", "zh": "全天候", "ar": "جميع الأحوال الجوية", "es": "Todo Clima"}'),
  ('hae', '{"en": "HALE", "zh": "高空长航时", "ar": "HALE", "es": "HALE"}'),
  ('command-center', '{"en": "Command Center", "zh": "指挥中心", "ar": "مركز قيادة", "es": "Centro de Mando"}'),
  ('multi-operator', '{"en": "Multi-Operator", "zh": "多操作员", "ar": "مشغلين متعددين", "es": "Multi-Operador"}'),
  ('mobile', '{"en": "Mobile", "zh": "移动", "ar": "متنقل", "es": "Móvil"}'),
  ('sigint', '{"en": "SIGINT", "zh": "信号情报", "ar": "SIGINT", "es": "SIGINT"}'),
  ('intelligence', '{"en": "Intelligence", "zh": "情报", "ar": "استخبارات", "es": "Inteligencia"}'),
  ('swarm', '{"en": "Swarm", "zh": "蜂群", "ar": "سرب", "es": "Enjambre"}'),
  ('ai-coordinated', '{"en": "AI Coordinated", "zh": "AI协调", "ar": "منسق بالذكاء الاصطناعي", "es": "Coordinado por IA"}'),
  ('maritime', '{"en": "Maritime", "zh": "海事", "ar": "بحري", "es": "Marítimo"}'),
  ('water-landing', '{"en": "Water Landing", "zh": "水上降落", "ar": "هبوط مائي", "es": "Aterrizaje en Agua"}'),
  ('hyperspectral', '{"en": "Hyperspectral", "zh": "高光谱", "ar": "فرط طيفي", "es": "Hiperespectral"}'),
  ('material-analysis', '{"en": "Material Analysis", "zh": "物质分析", "ar": "تحليل المواد", "es": "Análisis de Materiales"}'),
  ('integrated', '{"en": "Integrated", "zh": "综合", "ar": "متكامل", "es": "Integrado"}'),
  ('multi-layer', '{"en": "Multi-Layer", "zh": "多层", "ar": "متعدد الطبقات", "es": "Multi-Capa"}');

-- ============================================
-- 产品FAQ (每行一种语言，匹配 product_faqs 表结构)
-- ============================================
DELETE FROM product_faqs;

-- FAQ 1: 最大飞行时间
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'en', 'What is the maximum flight time?', 'The maximum flight time varies by model. SD-200 offers 120 minutes, SD-350 offers 90 minutes, and SD-700 offers up to 24 hours.', 1
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '最大飞行时间是多少？', '最大飞行时间因型号而异。SD-200提供120分钟，SD-350提供90分钟，SD-700可提供长达24小时。', 1
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 2: 天气条件
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'en', 'What weather conditions can it operate in?', 'Our UAVs are designed for all-weather operation, capable of flying in winds up to 15m/s, temperatures from -20°C to 50°C, and light rain conditions.', 2
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '可以在什么天气条件下作业？', '我们的无人机专为全天候作业设计，可在高达15米/秒的风速、-20°C至50°C的温度和轻雨条件下飞行。', 2
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 3: 作战半径
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'en', 'What is the operational range?', 'Operational range varies by model: SD-200 has 50km range, SD-350 has 35km, SD-600 has 80km, and SD-700 can reach up to 500km.', 3
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '作战半径是多少？', '作战半径因型号而异：SD-200为50公里，SD-350为35公里，SD-600为80公里，SD-700可达500公里。', 3
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- FAQ 4: 兼容载荷
INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'en', 'What payloads are compatible?', 'Our UAVs support various payloads including EO/IR cameras, LiDAR, multispectral sensors, SAR, and custom payloads up to the specified weight limit.', 4
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

INSERT INTO product_faqs (product_id, locale, question, answer, sort_order)
SELECT p.id, 'zh', '兼容哪些载荷？', '我们的无人机支持各种载荷，包括光电/红外相机、激光雷达、多光谱传感器、合成孔径雷达和指定重量限制内的定制载荷。', 4
FROM products p WHERE p.model IN ('SD-200', 'SD-350', 'SD-600', 'SD-700');

-- ============================================
-- 产品文档 (列: product_id, type, translations, file_url, sort_order)
-- ============================================
DELETE FROM product_documents;

INSERT INTO product_documents (product_id, type, translations, file_url, sort_order)
SELECT
  p.id,
  'datasheet',
  '{"en": "Product Datasheet", "zh": "产品数据表"}'::jsonb,
  '/documents/datasheets/' || p.slug || '.pdf',
  1
FROM products p;

INSERT INTO product_documents (product_id, type, translations, file_url, sort_order)
SELECT
  p.id,
  'manual',
  '{"en": "User Manual", "zh": "用户手册"}'::jsonb,
  '/documents/manuals/' || p.slug || '-manual.pdf',
  2
FROM products p;

-- ============================================
-- 解决方案内容扩展
-- ============================================
UPDATE solutions
SET translations = translations || '{
  "zh": {
    "title": "公共安全与执法",
    "challenge": "执法部门和应急响应人员需要在动态、高压情况下获得实时空中情报，每一秒都至关重要。传统监视方法速度慢、覆盖范围有限，且使人员处于危险之中。",
    "solution": "SeekDrone平台提供快速部署的空中监视，具备实时视频流传输、用于低光作业的热成像，以及用于人群监控和嫌疑人跟踪的AI分析。我们的系统与现有指挥控制基础设施无缝集成。",
    "workflow": "<ol><li>在数分钟内部署无人机至事件现场</li><li>将实时空中画面传输至指挥中心</li><li>使用热成像定位嫌疑人或失踪人员</li><li>分析人群模式并识别威胁</li><li>在整个行动过程中提供持续覆盖</li></ol>"
  }
}'::jsonb
WHERE slug = 'public-safety';

UPDATE solutions
SET translations = translations || '{
  "zh": {
    "title": "能源与基础设施",
    "challenge": "能源基础设施跨越广阔、通常偏远的区域，人工巡检危险、耗时且昂贵。未检测到的故障可能导致灾难性故障、环境破坏和昂贵的停机。",
    "solution": "SeekDrone平台通过高分辨率成像、激光雷达测绘和热异常检测自动化基础设施巡检。我们的无人机以人工无法实现的精度和效率覆盖管道、电力线路、风力涡轮机和太阳能发电场。",
    "workflow": "<ol><li>规划自动巡检飞行路径</li><li>捕获高分辨率视觉和热数据</li><li>通过AI分析检测异常</li><li>生成详细巡检报告</li><li>标记关键问题以便立即维护</li></ol>"
  }
}'::jsonb
WHERE slug = 'energy';

UPDATE solutions
SET translations = translations || '{
  "zh": {
    "title": "测绘与制图",
    "challenge": "传统测绘方法需要大量外场时间、大型团队，并受地形可达性限制。为建筑、采矿和土地管理项目提供准确的地形数据需要更快、更安全的方法。",
    "solution": "SeekDrone测绘平台结合RTK定位、摄影测量和激光雷达，在传统方法所需时间的一小部分内生成厘米级精确的三维模型、正射影像和地形图。",
    "workflow": "<ol><li>定义测量区域和飞行参数</li><li>以RTK精度执行自动测绘任务</li><li>将航空数据处理为三维点云和正射影像</li><li>生成地形模型和体积计算</li><li>向利益相关者交付GIS就绪输出</li></ol>"
  }
}'::jsonb
WHERE slug = 'surveying';

UPDATE solutions
SET translations = translations || '{
  "zh": {
    "title": "环境监测",
    "challenge": "环境机构和保护组织难以监测大型生态系统、检测污染事件并跟踪广阔且通常无法进入的地形中的野生动物种群。地面方法不足以进行全面的环境监督。",
    "solution": "SeekDrone平台配备多光谱传感器、气体检测器和AI驱动的野生动物识别，实现连续环境监测。从森林砍伐跟踪到水质评估，我们的系统提供可操作的生态情报。",
    "workflow": "<ol><li>部署传感器用于目标环境指标</li><li>对生态系统进行系统性航空调查</li><li>收集多光谱和气体排放数据</li><li>分析数据以发现环境变化和异常</li><li>生成合规报告和趋势分析</li></ol>"
  }
}'::jsonb
WHERE slug = 'environmental';

UPDATE solutions
SET translations = translations || '{
  "zh": {
    "title": "反无人机防御",
    "challenge": "商用无人机的扩散对军事基地、机场、关键基础设施和公共活动构成日益增加的威胁。检测、分类和压制未授权无人机需要实时运行的复杂多层防御系统。",
    "solution": "SeekDrone反无人机解决方案使用雷达、射频感知、光电跟踪和可配置对抗措施提供集成的检测到压制能力。我们的系统通过自动威胁评估和分级响应协议提供360度保护。",
    "workflow": "<ol><li>通过多传感器融合检测未授权无人机</li><li>使用AI分析分类威胁类型和意图</li><li>通过光电和射频系统跟踪目标</li><li>根据交战规则启动分级响应</li><li>记录事件数据用于取证分析和报告</li></ol>"
  }
}'::jsonb
WHERE slug = 'counter-uas';

-- ============================================
-- 站点设置更新
-- ============================================
UPDATE site_settings
SET
  site_name = '{"en": "SeekDrone", "zh": "SeekDrone", "ar": "SeekDrone", "es": "SeekDrone", "fr": "SeekDrone", "pt": "SeekDrone", "id": "SeekDrone"}'::jsonb,
  seo_description = '{
    "en": "Industrial UAV platforms and counter-UAS solutions for defense, security, and critical infrastructure worldwide.",
    "zh": "为全球国防、安全和关键基础设施提供工业级无人机平台和反无人机解决方案。",
    "ar": "منصات الطائرات المسيرة الصناعية وحلول مكافحة الطائرات المسيرة للدفاع والأمن والبنية التحتية الحيوية في جميع أنحاء العالم.",
    "es": "Plataformas UAV industriales y soluciones contra-UAS para defensa, seguridad e infraestructura crítica en todo el mundo.",
    "fr": "Plateformes UAV industrielles et solutions anti-UAS pour la défense, la sécurité et les infrastructures critiques dans le monde.",
    "pt": "Plataformas UAV industriais e soluções contra-UAS para defesa, segurança e infraestrutura crítica em todo o mundo.",
    "id": "Platform UAV industri dan solusi anti-UAS untuk pertahanan, keamanan, dan infrastruktur kritis di seluruh dunia."
  }'::jsonb,
  hero_config = '{
    "en": {
      "background_type": "image",
      "background_image_url": "",
      "background_video_url": "",
      "title": "Industrial UAVs, Tested Where It Matters Most",
      "subtitle": "Battle-proven drone platforms and counter-UAS solutions for defense, security, and critical infrastructure.",
      "cta_text": "Request a Demo",
      "cta_url": "/request-demo"
    },
    "zh": {
      "background_type": "image",
      "background_image_url": "",
      "background_video_url": "",
      "title": "工业级无人机，在最关键的环境中验证",
      "subtitle": "久经考验的无人机平台和反无人机解决方案，服务于国防、安全和关键基础设施。",
      "cta_text": "请求演示",
      "cta_url": "/request-demo"
    }
  }'::jsonb,
  enabled_languages = '{en,zh,ar,es,fr,pt,id}',
  enable_chinese = true,
  enable_chinese_by_ip = true;

-- ============================================
-- 导航更新
-- ============================================
UPDATE navigation
SET translations = '{"en": "Products", "zh": "产品", "ar": "المنتجات", "es": "Productos"}'::jsonb
WHERE url = '/products';

UPDATE navigation
SET translations = '{"en": "Solutions", "zh": "解决方案", "ar": "الحلول", "es": "Soluciones"}'::jsonb
WHERE url LIKE '/solutions%';

UPDATE navigation
SET translations = '{"en": "Case Studies", "zh": "案例研究", "ar": "دراسات الحالة", "es": "Casos de Estudio"}'::jsonb
WHERE url = '/case-studies';

UPDATE navigation
SET translations = '{"en": "Support", "zh": "支持", "ar": "الدعم", "es": "Soporte"}'::jsonb
WHERE url = '/compliance';

-- ============================================
-- 页脚内容更新
-- ============================================
DELETE FROM footer_content;

INSERT INTO footer_content (section, translations, published) VALUES
  (
    'company',
    '{
      "en": {
        "title": "Company",
        "links": [
          {"label": "About Us", "url": "/about"},
          {"label": "Careers", "url": "/careers"},
          {"label": "Contact", "url": "/contact"},
          {"label": "News", "url": "/news"}
        ]
      },
      "zh": {
        "title": "公司",
        "links": [
          {"label": "关于我们", "url": "/about"},
          {"label": "招聘", "url": "/careers"},
          {"label": "联系", "url": "/contact"},
          {"label": "新闻", "url": "/news"}
        ]
      }
    }'::jsonb,
    true
  ),
  (
    'products',
    '{
      "en": {
        "title": "Products",
        "links": [
          {"label": "UAV Systems", "url": "/products?category=uav"},
          {"label": "Payloads", "url": "/products?category=payload"},
          {"label": "Ground Control", "url": "/products?category=ground_control"},
          {"label": "Counter-UAS", "url": "/products?category=cuas"}
        ]
      },
      "zh": {
        "title": "产品",
        "links": [
          {"label": "无人机系统", "url": "/products?category=uav"},
          {"label": "载荷", "url": "/products?category=payload"},
          {"label": "地面站", "url": "/products?category=ground_control"},
          {"label": "反无人机", "url": "/products?category=cuas"}
        ]
      }
    }'::jsonb,
    true
  ),
  (
    'solutions',
    '{
      "en": {
        "title": "Solutions",
        "links": [
          {"label": "Public Safety", "url": "/solutions/public-safety"},
          {"label": "Energy", "url": "/solutions/energy"},
          {"label": "Surveying", "url": "/solutions/surveying"},
          {"label": "Environmental", "url": "/solutions/environmental"}
        ]
      },
      "zh": {
        "title": "解决方案",
        "links": [
          {"label": "公共安全", "url": "/solutions/public-safety"},
          {"label": "能源", "url": "/solutions/energy"},
          {"label": "测绘", "url": "/solutions/surveying"},
          {"label": "环境", "url": "/solutions/environmental"}
        ]
      }
    }'::jsonb,
    true
  ),
  (
    'support',
    '{
      "en": {
        "title": "Support",
        "links": [
          {"label": "Documentation", "url": "/docs"},
          {"label": "Training", "url": "/training"},
          {"label": "Compliance", "url": "/compliance"},
          {"label": "FAQ", "url": "/faq"}
        ]
      },
      "zh": {
        "title": "支持",
        "links": [
          {"label": "文档", "url": "/docs"},
          {"label": "培训", "url": "/training"},
          {"label": "合规", "url": "/compliance"},
          {"label": "常见问题", "url": "/faq"}
        ]
      }
    }'::jsonb,
    true
  );

-- ============================================
-- FAQ内容 (仅 faqs 表存在时执行)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'faqs') THEN
    DELETE FROM faqs;

    INSERT INTO faqs (category, question, answer, sort_order, published) VALUES
      (
        'general',
        '{"en": "What industries do you serve?", "zh": "你们服务于哪些行业？"}'::jsonb,
        '{"en": "We serve defense, security, energy, agriculture, infrastructure, environmental monitoring, emergency response, and many other industries requiring professional UAV solutions.", "zh": "我们服务于国防、安全、能源、农业、基础设施、环境监测、应急响应以及许多其他需要专业无人机解决方案的行业。"}'::jsonb,
        1,
        true
      ),
      (
        'general',
        '{"en": "Do you provide training?", "zh": "你们提供培训吗？"}'::jsonb,
        '{"en": "Yes, we offer comprehensive training programs for all our products, including operator training, maintenance training, and mission planning courses.", "zh": "是的，我们为所有产品提供综合培训计划，包括操作员培训、维护培训和任务规划课程。"}'::jsonb,
        2,
        true
      ),
      (
        'general',
        '{"en": "What is your warranty policy?", "zh": "你们的保修政策是什么？"}'::jsonb,
        '{"en": "All our products come with a standard 2-year warranty covering manufacturing defects. Extended warranty options are available.", "zh": "我们所有产品都附带标准2年保修，涵盖制造缺陷。还提供延长保修选项。"}'::jsonb,
        3,
        true
      ),
      (
        'products',
        '{"en": "Can I customize payloads?", "zh": "我可以定制载荷吗？"}'::jsonb,
        '{"en": "Yes, our modular payload system allows for customization. We can integrate third-party sensors and develop custom solutions for specific requirements.", "zh": "是的，我们的模块化载荷系统允许定制。我们可以集成第三方传感器并为特定需求开发定制解决方案。"}'::jsonb,
        1,
        true
      ),
      (
        'products',
        '{"en": "What is the typical delivery time?", "zh": "典型交付时间是多少？"}'::jsonb,
        '{"en": "Standard products are typically delivered within 4-6 weeks. Custom configurations may require 8-12 weeks depending on complexity.", "zh": "标准产品通常在4-6周内交付。定制配置可能需要8-12周，具体取决于复杂程度。"}'::jsonb,
        2,
        true
      ),
      (
        'compliance',
        '{"en": "Are your products export controlled?", "zh": "你们的产品受出口管制吗？"}'::jsonb,
        '{"en": "Some of our products may be subject to export control regulations. We work closely with relevant authorities to ensure compliance with all applicable laws.", "zh": "我们的某些产品可能受出口管制法规约束。我们与相关机构密切合作，确保遵守所有适用法律。"}'::jsonb,
        1,
        true
      ),
      (
        'compliance',
        '{"en": "Do you comply with aviation regulations?", "zh": "你们遵守航空法规吗？"}'::jsonb,
        '{"en": "Yes, all our products are designed to comply with relevant aviation regulations in major markets. We provide documentation and support for regulatory approval processes.", "zh": "是的，我们所有产品都设计为符合主要市场的相关航空法规。我们为监管审批流程提供文档和支持。"}'::jsonb,
        2,
        true
      );
  END IF;
END
$$;
