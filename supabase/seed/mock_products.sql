-- seed/mock_products.sql
-- 模拟产品数据 - 20个产品，包含多语言翻译

-- 首先清空现有数据（保留分类和标签）
DELETE FROM product_tag_relations;
DELETE FROM product_relations;
DELETE FROM product_specs;
DELETE FROM products WHERE model NOT IN ('DG100', 'KX-680pro', 'KX-L300', 'KX-S30');

-- 插入20个产品（包含现有的4个 + 新增16个）
INSERT INTO products (model, slug, category, sub_category, specs, translations, images, datasheet_url, compliance_flag, featured, published, sort_order) VALUES
  -- 产品 5: SD-200 侦察无人机
  (
    'SD-200',
    'sd-200',
    'uav',
    'reconnaissance',
    '{
      "Weight": "8.5kg",
      "Dimensions": "1800×600×400mm",
      "Maximum Endurance": "120min",
      "Maximum Speed": "15m/s",
      "Max Range": "50km",
      "Max Ceiling": "5000m",
      "Payload Capacity": "5kg",
      "Sensors": "EO/IR Camera, LiDAR"
    }'::jsonb,
    '{
      "en": {
        "name": "SD-200 Reconnaissance UAV",
        "overview": "The SD-200 is a long-endurance reconnaissance UAV designed for extended surveillance missions. With 120 minutes of flight time and 50km operational range, it provides comprehensive aerial intelligence gathering capabilities.",
        "features": "Long-endurance flight, Advanced EO/IR sensors, LiDAR mapping, All-weather operation",
        "applications": "Border surveillance, Infrastructure monitoring, Environmental assessment, Search and rescue"
      },
      "zh": {
        "name": "SD-200 侦察无人机",
        "overview": "SD-200 是一款长航时侦察无人机，专为长时间监视任务设计。具有120分钟续航时间和50公里作战半径，提供全面的空中情报收集能力。",
        "features": "长航时飞行，先进光电/红外传感器，激光雷达测绘，全天候作业",
        "applications": "边境监视，基础设施监测，环境评估，搜救行动"
      },
      "ar": {
        "name": "طائرة SD-200 للاستطلاع",
        "overview": "طائرة SD-200 هي طائرة مسيرة طويلة التحمل مصممة لمهام المراقبة الممتدة.",
        "features": "رحلة طويلة التحمل، مستشعرات متقدمة، رسم خرائط LiDAR",
        "applications": "مراقبة الحدود، مراقبة البنية التحتية"
      },
      "es": {
        "name": "UAV de Reconocimiento SD-200",
        "overview": "El SD-200 es un UAV de reconocimiento de larga duración diseñado para misiones de vigilancia extendidas.",
        "features": "Vuelo de larga duración, Sensores avanzados, Mapeo LiDAR",
        "applications": "Vigilancia fronteriza, Monitoreo de infraestructura"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    true,
    true,
    5
  ),

  -- 产品 6: SD-350 多用途无人机
  (
    'SD-350',
    'sd-350',
    'uav',
    'multi-role',
    '{
      "Weight": "15kg",
      "Dimensions": "2200×800×500mm",
      "Maximum Endurance": "90min",
      "Maximum Speed": "20m/s",
      "Max Range": "35km",
      "Max Ceiling": "4500m",
      "Payload Capacity": "8kg",
      "Sensors": "Multispectral Camera, Thermal, SAR"
    }'::jsonb,
    '{
      "en": {
        "name": "SD-350 Multi-Role UAV",
        "overview": "The SD-350 is a versatile multi-role UAV platform capable of performing various missions including reconnaissance, surveying, and payload delivery. Its modular design allows rapid configuration changes.",
        "features": "Modular payload system, Multiple sensor options, All-terrain capability, Rapid deployment",
        "applications": "Aerial surveying, Precision agriculture, Emergency response, Logistics support"
      },
      "zh": {
        "name": "SD-350 多用途无人机",
        "overview": "SD-350 是一款多功能无人机平台，能够执行侦察、测绘和载荷投送等多种任务。模块化设计支持快速配置变更。",
        "features": "模块化载荷系统，多种传感器选项，全地形能力，快速部署",
        "applications": "航空测绘，精准农业，应急响应，后勤支援"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    6
  ),

  -- 产品 7: SD-500 重载无人机
  (
    'SD-500',
    'sd-500',
    'uav',
    'heavy-lift',
    '{
      "Weight": "35kg",
      "Dimensions": "3500×1200×800mm",
      "Maximum Endurance": "60min",
      "Maximum Speed": "12m/s",
      "Max Range": "25km",
      "Max Ceiling": "3000m",
      "Payload Capacity": "25kg",
      "Sensors": "Dual EO/IR, Cargo Bay"
    }'::jsonb,
    '{
      "en": {
        "name": "SD-500 Heavy-Lift UAV",
        "overview": "The SD-500 is a heavy-lift cargo UAV designed for substantial payload transport. With 25kg payload capacity, it excels in logistics and supply delivery missions.",
        "features": "Heavy payload capacity, Reinforced airframe, Precision landing, Automated cargo release",
        "applications": "Cargo transport, Medical supply delivery, Offshore logistics, Disaster relief"
      },
      "zh": {
        "name": "SD-500 重载无人机",
        "overview": "SD-500 是一款重型货运无人机，专为大批量载荷运输设计。25公斤载荷能力使其在后勤和物资投送任务中表现出色。",
        "features": "大载荷能力，加强型机身，精确着陆，自动货物释放",
        "applications": "货物运输，医疗物资投送，海上后勤，灾害救援"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    7
  ),

  -- 产品 8: PL-100 光电载荷
  (
    'PL-100',
    'pl-100',
    'payload',
    'eo-ir',
    '{
      "Weight": "2.5kg",
      "Dimensions": "250×180×150mm",
      "Resolution": "4K EO + 640×512 IR",
      "Zoom": "30x Optical",
      "Gimbal": "3-axis Stabilized",
      "Laser Range Finder": "5km"
    }'::jsonb,
    '{
      "en": {
        "name": "PL-100 EO/IR Payload",
        "overview": "The PL-100 is a high-performance electro-optical/infrared payload with 4K resolution and 30x optical zoom, ideal for detailed reconnaissance and target identification.",
        "features": "4K EO camera, Thermal imaging, 30x optical zoom, Laser range finder",
        "applications": "Target identification, Surveillance, Search and rescue, Infrastructure inspection"
      },
      "zh": {
        "name": "PL-100 光电/红外载荷",
        "overview": "PL-100 是一款高性能光电/红外载荷，具备4K分辨率和30倍光学变焦，非常适合详细侦察和目标识别。",
        "features": "4K光电相机，热成像，30倍光学变焦，激光测距仪",
        "applications": "目标识别，监视，搜救，基础设施巡检"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    true,
    true,
    8
  ),

  -- 产品 9: PL-200 多光谱载荷
  (
    'PL-200',
    'pl-200',
    'payload',
    'multispectral',
    '{
      "Weight": "3.8kg",
      "Dimensions": "300×200×180mm",
      "Spectral Bands": "5 bands (RGB + NIR + Red Edge)",
      "Resolution": "12MP per band",
      "GSD": "3cm at 100m"
    }'::jsonb,
    '{
      "en": {
        "name": "PL-200 Multispectral Payload",
        "overview": "The PL-200 multispectral payload captures data across 5 spectral bands for precision agriculture, environmental monitoring, and vegetation analysis.",
        "features": "5 spectral bands, High resolution, Precision GSD, Radiometric calibration",
        "applications": "Precision agriculture, Vegetation health, Environmental monitoring, Forestry"
      },
      "zh": {
        "name": "PL-200 多光谱载荷",
        "overview": "PL-200 多光谱载荷可捕获5个光谱波段数据，用于精准农业、环境监测和植被分析。",
        "features": "5个光谱波段，高分辨率，精确地面采样距离，辐射定标",
        "applications": "精准农业，植被健康，环境监测，林业"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    9
  ),

  -- 产品 10: PL-300 激光雷达载荷
  (
    'PL-300',
    'pl-300',
    'payload',
    'lidar',
    '{
      "Weight": "4.5kg",
      "Dimensions": "180×180×250mm",
      "Laser Type": "905nm",
      "Points per Second": "240,000",
      "Range": "150m",
      "Accuracy": "±2cm"
    }'::jsonb,
    '{
      "en": {
        "name": "PL-300 LiDAR Payload",
        "overview": "The PL-300 LiDAR payload generates high-density 3D point clouds for precise mapping, surveying, and terrain modeling applications.",
        "features": "High point density, Centimeter accuracy, Long range, Multiple return detection",
        "applications": "Topographic surveying, 3D mapping, Mining, Construction monitoring"
      },
      "zh": {
        "name": "PL-300 激光雷达载荷",
        "overview": "PL-300 激光雷达载荷生成高密度三维点云，用于精确测绘、测量和地形建模应用。",
        "features": "高点密度，厘米级精度，长距离，多次回波检测",
        "applications": "地形测绘，三维建模，采矿，建筑监测"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    10
  ),

  -- 产品 11: GC-100 便携地面站
  (
    'GC-100',
    'gc-100',
    'ground_control',
    'portable',
    '{
      "Weight": "3.2kg",
      "Display": "10.1 inch sunlight readable",
      "Battery Life": "8 hours",
      "Operating Range": "20km",
      "Video Channels": "2 HD streams",
      "Interfaces": "HDMI, USB, Ethernet"
    }'::jsonb,
    '{
      "en": {
        "name": "GC-100 Portable Ground Station",
        "overview": "The GC-100 is a lightweight portable ground control station with sunlight-readable display, ideal for field operations and rapid deployment scenarios.",
        "features": "Sunlight readable display, Long battery life, Dual video streams, Rugged design",
        "applications": "Field operations, Rapid deployment, Mobile command, Training"
      },
      "zh": {
        "name": "GC-100 便携地面站",
        "overview": "GC-100 是一款轻便型地面控制站，配备阳光下可读显示屏，非常适合外场作业和快速部署场景。",
        "features": "阳光下可读显示，长续航，双视频流，坚固设计",
        "applications": "外场作业，快速部署，移动指挥，训练"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    true,
    true,
    11
  ),

  -- 产品 12: GC-200 车载地面站
  (
    'GC-200',
    'gc-200',
    'ground_control',
    'vehicle',
    '{
      "Weight": "15kg",
      "Display": "Dual 15.6 inch monitors",
      "Power": "12/24V DC or 110/220V AC",
      "Operating Range": "50km",
      "Video Channels": "4 HD streams",
      "Data Link": "Dual redundant"
    }'::jsonb,
    '{
      "en": {
        "name": "GC-200 Vehicle Ground Station",
        "overview": "The GC-200 is a vehicle-mounted ground control station with dual monitors and redundant data links, designed for extended operations and multi-UAV management.",
        "features": "Dual monitor setup, Redundant communications, Multi-UAV support, Vehicle integration",
        "applications": "Vehicle operations, Multi-UAV missions, Extended surveillance, Command centers"
      },
      "zh": {
        "name": "GC-200 车载地面站",
        "overview": "GC-200 是一款车载地面控制站，配备双显示器和冗余数据链路，专为长时间作业和多机管理设计。",
        "features": "双显示器设置，冗余通信，多机支持，车辆集成",
        "applications": "车载作业，多机任务，长时间监视，指挥中心"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    12
  ),

  -- 产品 13: CUAS-100 便携反无人机系统
  (
    'CUAS-100',
    'cuas-100',
    'cuas',
    'portable',
    '{
      "Weight": "8kg",
      "Detection Range": "5km",
      "Neutralization Range": "2km",
      "Detection Methods": "RF + EO",
      "Response Time": "<3 seconds",
      "Battery Life": "4 hours"
    }'::jsonb,
    '{
      "en": {
        "name": "CUAS-100 Portable Counter-UAS",
        "overview": "The CUAS-100 is a man-portable counter-UAS system providing rapid detection and neutralization of unauthorized drones in the field.",
        "features": "Portable design, Rapid response, Multi-sensor detection, Soft-kill options",
        "applications": "Event security, VIP protection, Field operations, Critical infrastructure"
      },
      "zh": {
        "name": "CUAS-100 便携反无人机系统",
        "overview": "CUAS-100 是一款便携式反无人机系统，可在野外快速探测和压制未授权无人机。",
        "features": "便携设计，快速响应，多传感器探测，软杀伤选项",
        "applications": "活动安保，要员保护，外场作业，关键基础设施"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    true,
    true,
    13
  ),

  -- 产品 14: CUAS-200 固定反无人机系统
  (
    'CUAS-200',
    'cuas-200',
    'cuas',
    'fixed',
    '{
      "Detection Range": "15km",
      "Neutralization Range": "8km",
      "Detection Methods": "Radar + RF + EO/IR",
      "Response Time": "<2 seconds",
      "Coverage": "360° azimuth, 0-90° elevation",
      "Targets": "Multiple simultaneous"
    }'::jsonb,
    '{
      "en": {
        "name": "CUAS-200 Fixed Counter-UAS",
        "overview": "The CUAS-200 is a fixed-site counter-UAS system with comprehensive 360° coverage and multi-layer detection capabilities for critical infrastructure protection.",
        "features": "360° coverage, Multi-layer detection, Multi-target tracking, Automated response",
        "applications": "Airports, Military bases, Power plants, Government facilities"
      },
      "zh": {
        "name": "CUAS-200 固定反无人机系统",
        "overview": "CUAS-200 是一款固定式反无人机系统，具备全面的360°覆盖和多层探测能力，用于关键基础设施保护。",
        "features": "360°覆盖，多层探测，多目标跟踪，自动响应",
        "applications": "机场，军事基地，发电厂，政府设施"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    14
  ),

  -- 产品 15: SD-600 垂直起降无人机
  (
    'SD-600',
    'sd-600',
    'uav',
    'vtol',
    '{
      "Weight": "18kg",
      "Dimensions": "2800×1000×600mm",
      "Maximum Endurance": "150min",
      "Maximum Speed": "25m/s",
      "Max Range": "80km",
      "Max Ceiling": "6000m",
      "Payload Capacity": "6kg",
      "Operation": "VTOL + Fixed-wing"
    }'::jsonb,
    '{
      "en": {
        "name": "SD-600 VTOL UAV",
        "overview": "The SD-600 is a hybrid VTOL UAV combining vertical takeoff capability with fixed-wing efficiency, offering 150 minutes endurance and 80km range.",
        "features": "VTOL capability, Extended range, Fixed-wing efficiency, Versatile operation",
        "applications": "Long-range reconnaissance, Pipeline inspection, Border patrol, Mapping"
      },
      "zh": {
        "name": "SD-600 垂直起降无人机",
        "overview": "SD-600 是一款混合垂直起降无人机，结合垂直起飞能力与固定翼效率，提供150分钟续航和80公里航程。",
        "features": "垂直起降能力，长航程，固定翼效率，多功能作业",
        "applications": "远程侦察，管道巡检，边境巡逻，测绘"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    true,
    true,
    15
  ),

  -- 产品 16: PL-400 合成孔径雷达载荷
  (
    'PL-400',
    'pl-400',
    'payload',
    'sar',
    '{
      "Weight": "6kg",
      "Dimensions": "400×300×200mm",
      "Frequency": "X-band",
      "Resolution": "0.3m",
      "Swath Width": "2km",
      "Polarization": "Single/Dual"
    }'::jsonb,
    '{
      "en": {
        "name": "PL-400 SAR Payload",
        "overview": "The PL-400 is a synthetic aperture radar payload providing all-weather, day/night imaging capability with 0.3m resolution.",
        "features": "All-weather operation, High resolution, Wide swath, Day/night capable",
        "applications": "All-weather surveillance, Disaster monitoring, Sea ice tracking, Ground movement detection"
      },
      "zh": {
        "name": "PL-400 合成孔径雷达载荷",
        "overview": "PL-400 是一款合成孔径雷达载荷，提供全天候、昼夜成像能力，分辨率0.3米。",
        "features": "全天候作业，高分辨率，宽测绘带，昼夜可用",
        "applications": "全天候监视，灾害监测，海冰跟踪，地面运动检测"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    16
  ),

  -- 产品 17: SD-700 高空长航时无人机
  (
    'SD-700',
    'sd-700',
    'uav',
    'hae',
    '{
      "Weight": "45kg",
      "Dimensions": "5000×1500×900mm",
      "Maximum Endurance": "24 hours",
      "Maximum Speed": "30m/s",
      "Max Range": "500km",
      "Max Ceiling": "8000m",
      "Payload Capacity": "15kg",
      "Power": "Solar + Battery hybrid"
    }'::jsonb,
    '{
      "en": {
        "name": "SD-700 High Altitude Long Endurance UAV",
        "overview": "The SD-700 is a high altitude long endurance (HALE) UAV with 24-hour flight capability, designed for persistent surveillance and monitoring missions.",
        "features": "24-hour endurance, Solar power assist, High altitude operation, Long range",
        "applications": "Persistent surveillance, Border monitoring, Environmental research, Communications relay"
      },
      "zh": {
        "name": "SD-700 高空长航时无人机",
        "overview": "SD-700 是一款高空长航时无人机，具备24小时飞行能力，专为持续监视和监测任务设计。",
        "features": "24小时续航，太阳能辅助，高空作业，长航程",
        "applications": "持续监视，边境监测，环境研究，通信中继"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    17
  ),

  -- 产品 18: GC-300 指挥控制中心
  (
    'GC-300',
    'gc-300',
    'ground_control',
    'command',
    '{
      "Configuration": "Multi-operator console",
      "Displays": "6× 24 inch monitors",
      "Operators": "Up to 6 simultaneous",
      "UAV Capacity": "Up to 12 UAVs",
      "Network": "LAN/WAN/Satellite",
      "Recording": "Multi-channel HD"
    }'::jsonb,
    '{
      "en": {
        "name": "GC-300 Command & Control Center",
        "overview": "The GC-300 is a comprehensive command and control center supporting multi-operator, multi-UAV operations with advanced mission planning and real-time coordination.",
        "features": "Multi-operator support, Multi-UAV management, Advanced mission planning, Network integration",
        "applications": "Operations centers, Fleet management, Training facilities, Emergency response"
      },
      "zh": {
        "name": "GC-300 指挥控制中心",
        "overview": "GC-300 是一个综合指挥控制中心，支持多操作员、多机作业，具备先进任务规划和实时协调能力。",
        "features": "多操作员支持，多机管理，先进任务规划，网络集成",
        "applications": "作战中心，机队管理，训练设施，应急响应"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    18
  ),

  -- 产品 19: CUAS-300 移动反无人机系统
  (
    'CUAS-300',
    'cuas-300',
    'cuas',
    'mobile',
    '{
      "Platform": "Vehicle-mounted",
      "Detection Range": "20km",
      "Neutralization Range": "10km",
      "Detection Methods": "Radar + RF + EO/IR + Acoustic",
      "Response Time": "<1.5 seconds",
      "Mobility": "On-road/off-road capable"
    }'::jsonb,
    '{
      "en": {
        "name": "CUAS-300 Mobile Counter-UAS",
        "overview": "The CUAS-300 is a mobile counter-UAS system mounted on vehicles, providing on-the-move protection with extended range and multi-sensor fusion.",
        "features": "Mobile operation, Extended range, Multi-sensor fusion, On-the-move capability",
        "applications": "Convoy protection, Mobile security, Rapid deployment, Tactical operations"
      },
      "zh": {
        "name": "CUAS-300 移动反无人机系统",
        "overview": "CUAS-300 是一款车载移动反无人机系统，提供行进间保护，具备扩展距离和多传感器融合。",
        "features": "移动作业，扩展距离，多传感器融合，行进间能力",
        "applications": "车队保护，移动安保，快速部署，战术行动"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    19
  ),

  -- 产品 20: PL-500 信号情报载荷
  (
    'PL-500',
    'pl-500',
    'payload',
    'sigint',
    '{
      "Weight": "5.5kg",
      "Dimensions": "350×250×200mm",
      "Frequency Range": "20MHz - 6GHz",
      "Functions": "COMINT + ELINT",
      "Processing": "Real-time analysis",
      "Data Link": "Encrypted transmission"
    }'::jsonb,
    '{
      "en": {
        "name": "PL-500 SIGINT Payload",
        "overview": "The PL-500 is a signals intelligence payload capable of COMINT and ELINT operations, providing real-time spectrum analysis and signal interception.",
        "features": "Wide frequency range, Real-time analysis, Encrypted data links, Multi-mode operation",
        "applications": "Signal interception, Spectrum monitoring, Electronic warfare support, Intelligence gathering"
      },
      "zh": {
        "name": "PL-500 信号情报载荷",
        "overview": "PL-500 是一款信号情报载荷，能够执行通信情报和电子情报作业，提供实时频谱分析和信号截获。",
        "features": "宽频率范围，实时分析，加密数据链，多模式作业",
        "applications": "信号截获，频谱监测，电子战支援，情报收集"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    20
  ),

  -- 产品 21: SD-800 群蜂无人机
  (
    'SD-800',
    'sd-800',
    'uav',
    'swarm',
    '{
      "Weight": "2kg per unit",
      "Dimensions": "600×400×200mm",
      "Maximum Endurance": "45min",
      "Maximum Speed": "18m/s",
      "Max Range": "10km",
      "Swarm Size": "Up to 50 units",
      "Coordination": "AI-powered swarm logic"
    }'::jsonb,
    '{
      "en": {
        "name": "SD-800 Swarm UAV",
        "overview": "The SD-800 is a lightweight swarm-capable UAV designed for coordinated multi-UAV operations, with AI-powered swarm coordination for complex missions.",
        "features": "Swarm capability, AI coordination, Lightweight design, Rapid deployment",
        "applications": "Area saturation, Distributed sensing, Decoy operations, Coordinated reconnaissance"
      },
      "zh": {
        "name": "SD-800 群蜂无人机",
        "overview": "SD-800 是一款轻量级群蜂无人机，专为协调多机作业设计，具备AI驱动的蜂群协调能力。",
        "features": "蜂群能力，AI协调，轻量化设计，快速部署",
        "applications": "区域饱和，分布式感知，诱饵作业，协同侦察"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    21
  ),

  -- 产品 22: SD-900 海事无人机
  (
    'SD-900',
    'sd-900',
    'uav',
    'maritime',
    '{
      "Weight": "22kg",
      "Dimensions": "3000×1200×700mm",
      "Maximum Endurance": "180min",
      "Maximum Speed": "22m/s",
      "Max Range": "100km",
      "Max Ceiling": "4000m",
      "Payload Capacity": "10kg",
      "Landing": "Water landing capable"
    }'::jsonb,
    '{
      "en": {
        "name": "SD-900 Maritime UAV",
        "overview": "The SD-900 is a maritime-capable UAV with water landing ability, designed for extended over-water operations including surveillance and search and rescue.",
        "features": "Water landing, Extended endurance, Maritime sensors, Long range",
        "applications": "Maritime patrol, Search and rescue, Fisheries monitoring, Anti-piracy operations"
      },
      "zh": {
        "name": "SD-900 海事无人机",
        "overview": "SD-900 是一款具备水上降落能力的海事无人机，专为长时间海上作业设计，包括监视和搜救。",
        "features": "水上降落，长续航，海事传感器，长航程",
        "applications": "海事巡逻，搜救，渔业监测，反海盗行动"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    22
  ),

  -- 产品 23: PL-600 高光谱载荷
  (
    'PL-600',
    'pl-600',
    'payload',
    'hyperspectral',
    '{
      "Weight": "4.2kg",
      "Dimensions": "280×220×190mm",
      "Spectral Bands": "100+ bands (400-1000nm)",
      "Spatial Resolution": "1280×1024",
      "Spectral Resolution": "5nm",
      "Frame Rate": "30 fps"
    }'::jsonb,
    '{
      "en": {
        "name": "PL-600 Hyperspectral Payload",
        "overview": "The PL-600 is a hyperspectral imaging payload capturing 100+ spectral bands for detailed material identification and analysis.",
        "features": "100+ spectral bands, High spatial resolution, Material identification, Real-time processing",
        "applications": "Mineral exploration, Precision agriculture, Environmental monitoring, Target identification"
      },
      "zh": {
        "name": "PL-600 高光谱载荷",
        "overview": "PL-600 是一款高光谱成像载荷，可捕获100+光谱波段，用于详细物质识别和分析。",
        "features": "100+光谱波段，高空间分辨率，物质识别，实时处理",
        "applications": "矿产勘探，精准农业，环境监测，目标识别"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    23
  ),

  -- 产品 24: CUAS-400 综合反无人机系统
  (
    'CUAS-400',
    'cuas-400',
    'cuas',
    'integrated',
    '{
      "Detection Range": "30km",
      "Neutralization Range": "15km",
      "Detection Methods": "Radar + RF + EO/IR + Acoustic + ADS-B",
      "Response Time": "<1 second",
      "Countermeasures": "Jamming + Spoofing + Kinetic",
      "Integration": "ATC and C2 systems"
    }'::jsonb,
    '{
      "en": {
        "name": "CUAS-400 Integrated Counter-UAS",
        "overview": "The CUAS-400 is a comprehensive integrated counter-UAS solution combining multiple detection methods and countermeasures with air traffic control integration.",
        "features": "Multi-layer defense, Multiple countermeasures, ATC integration, Automated response",
        "applications": "Airports, National borders, Critical infrastructure, Military installations"
      },
      "zh": {
        "name": "CUAS-400 综合反无人机系统",
        "overview": "CUAS-400 是一款综合反无人机解决方案，结合多种探测方法和对抗措施，并与空中交通管制集成。",
        "features": "多层防御，多种对抗措施，空管集成，自动响应",
        "applications": "机场，国境边界，关键基础设施，军事设施"
      }
    }'::jsonb,
    '{}',
    NULL,
    NULL,
    false,
    true,
    24
  );

-- 为产品添加标签关联
INSERT INTO product_tag_relations (product_id, tag_id)
SELECT
  p.id,
  pt.id
FROM products p
CROSS JOIN product_tags pt
WHERE
  (p.model = 'SD-200' AND pt.slug IN ('long-endurance', 'reconnaissance')) OR
  (p.model = 'SD-350' AND pt.slug IN ('multi-role', 'modular')) OR
  (p.model = 'SD-500' AND pt.slug IN ('heavy-lift', 'logistics')) OR
  (p.model = 'PL-100' AND pt.slug IN ('eo-ir', 'high-resolution')) OR
  (p.model = 'PL-200' AND pt.slug IN ('multispectral', 'agriculture')) OR
  (p.model = 'PL-300' AND pt.slug IN ('lidar', 'mapping')) OR
  (p.model = 'GC-100' AND pt.slug IN ('portable', 'field-operations')) OR
  (p.model = 'GC-200' AND pt.slug IN ('vehicle-mounted', 'multi-uav')) OR
  (p.model = 'CUAS-100' AND pt.slug IN ('portable', 'counter-uas')) OR
  (p.model = 'CUAS-200' AND pt.slug IN ('fixed-site', 'counter-uas')) OR
  (p.model = 'SD-600' AND pt.slug IN ('vtol', 'long-range')) OR
  (p.model = 'PL-400' AND pt.slug IN ('sar', 'all-weather')) OR
  (p.model = 'SD-700' AND pt.slug IN ('hae', 'long-endurance')) OR
  (p.model = 'GC-300' AND pt.slug IN ('command-center', 'multi-operator')) OR
  (p.model = 'CUAS-300' AND pt.slug IN ('mobile', 'counter-uas')) OR
  (p.model = 'PL-500' AND pt.slug IN ('sigint', 'intelligence')) OR
  (p.model = 'SD-800' AND pt.slug IN ('swarm', 'ai-coordinated')) OR
  (p.model = 'SD-900' AND pt.slug IN ('maritime', 'water-landing')) OR
  (p.model = 'PL-600' AND pt.slug IN ('hyperspectral', 'material-analysis')) OR
  (p.model = 'CUAS-400' AND pt.slug IN ('integrated', 'multi-layer'));

-- 为产品添加规格
INSERT INTO product_specs (product_id, label, value, sort_order)
SELECT
  p.id,
  '{"en": "Flight Time", "zh": "飞行时间"}'::jsonb,
  '{"en": "120 minutes", "zh": "120分钟"}'::jsonb,
  1
FROM products p WHERE p.model = 'SD-200';

INSERT INTO product_specs (product_id, label, value, sort_order)
SELECT
  p.id,
  '{"en": "Operational Range", "zh": "作战半径"}'::jsonb,
  '{"en": "50 km", "zh": "50公里"}'::jsonb,
  2
FROM products p WHERE p.model = 'SD-200';

INSERT INTO product_specs (product_id, label, value, sort_order)
SELECT
  p.id,
  '{"en": "Max Speed", "zh": "最大速度"}'::jsonb,
  '{"en": "15 m/s", "zh": "15米/秒"}'::jsonb,
  3
FROM products p WHERE p.model = 'SD-200';
