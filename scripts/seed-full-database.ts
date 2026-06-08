/**
 * 执行完整数据库种子数据脚本
 *
 * 用法: npx tsx scripts/seed-full-database.ts
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedFullDatabase() {
  console.log('🚀 开始填充完整数据库...\n')

  try {
    // 1. 清空现有数据
    console.log('🗑️  清空现有数据...')

    await supabase.from('product_tag_relations').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_relations').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_specs').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_faqs').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_documents').delete().neq('product_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('case_studies').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('product_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('footer_content').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    console.log('   ✅ 数据清空完成\n')

    // 2. 插入产品标签
    console.log('🏷️  插入产品标签...')

    const tags = [
      { slug: 'long-endurance', translations: { en: 'Long Endurance', zh: '长航时', ar: 'تحمل طويل', es: 'Larga Duración' } },
      { slug: 'reconnaissance', translations: { en: 'Reconnaissance', zh: '侦察', ar: 'استطلاع', es: 'Reconocimiento' } },
      { slug: 'multi-role', translations: { en: 'Multi-Role', zh: '多用途', ar: 'متعدد الأدوار', es: 'Multi-Propósito' } },
      { slug: 'modular', translations: { en: 'Modular', zh: '模块化', ar: 'معياري', es: 'Modular' } },
      { slug: 'heavy-lift', translations: { en: 'Heavy Lift', zh: '重载', ar: 'رفع ثقيل', es: 'Carga Pesada' } },
      { slug: 'logistics', translations: { en: 'Logistics', zh: '物流', ar: 'لوجستيات', es: 'Logística' } },
      { slug: 'eo-ir', translations: { en: 'EO/IR', zh: '光电/红外', ar: 'EO/IR', es: 'EO/IR' } },
      { slug: 'high-resolution', translations: { en: 'High Resolution', zh: '高分辨率', ar: 'دقة عالية', es: 'Alta Resolución' } },
      { slug: 'multispectral', translations: { en: 'Multispectral', zh: '多光谱', ar: 'متعدد الأطياف', es: 'Multiespectral' } },
      { slug: 'agriculture', translations: { en: 'Agriculture', zh: '农业', ar: 'زراعة', es: 'Agricultura' } },
      { slug: 'lidar', translations: { en: 'LiDAR', zh: '激光雷达', ar: 'LiDAR', es: 'LiDAR' } },
      { slug: 'mapping', translations: { en: 'Mapping', zh: '测绘', ar: 'رسم خرائط', es: 'Mapeo' } },
      { slug: 'portable', translations: { en: 'Portable', zh: '便携', ar: 'محمول', es: 'Portátil' } },
      { slug: 'field-operations', translations: { en: 'Field Operations', zh: '外场作业', ar: 'عمليات ميدانية', es: 'Operaciones de Campo' } },
      { slug: 'vehicle-mounted', translations: { en: 'Vehicle Mounted', zh: '车载', ar: 'مركب على مركبة', es: 'Montado en Vehículo' } },
      { slug: 'multi-uav', translations: { en: 'Multi-UAV', zh: '多机', ar: 'طائرات متعددة', es: 'Multi-UAV' } },
      { slug: 'counter-uas', translations: { en: 'Counter-UAS', zh: '反无人机', ar: 'مضاد للطائرات', es: 'Contra-UAS' } },
      { slug: 'fixed-site', translations: { en: 'Fixed Site', zh: '固定式', ar: 'موقع ثابت', es: 'Sitio Fijo' } },
      { slug: 'vtol', translations: { en: 'VTOL', zh: '垂直起降', ar: 'VTOL', es: 'VTOL' } },
      { slug: 'long-range', translations: { en: 'Long Range', zh: '长航程', ar: 'مدى طويل', es: 'Largo Alcance' } },
      { slug: 'sar', translations: { en: 'SAR', zh: '合成孔径雷达', ar: 'SAR', es: 'SAR' } },
      { slug: 'all-weather', translations: { en: 'All-Weather', zh: '全天候', ar: 'جميع الأحوال الجوية', es: 'Todo Clima' } },
      { slug: 'hae', translations: { en: 'HALE', zh: '高空长航时', ar: 'HALE', es: 'HALE' } },
      { slug: 'command-center', translations: { en: 'Command Center', zh: '指挥中心', ar: 'مركز قيادة', es: 'Centro de Mando' } },
      { slug: 'multi-operator', translations: { en: 'Multi-Operator', zh: '多操作员', ar: 'مشغلين متعددين', es: 'Multi-Operador' } },
      { slug: 'mobile', translations: { en: 'Mobile', zh: '移动', ar: 'متنقل', es: 'Móvil' } },
      { slug: 'sigint', translations: { en: 'SIGINT', zh: '信号情报', ar: 'SIGINT', es: 'SIGINT' } },
      { slug: 'intelligence', translations: { en: 'Intelligence', zh: '情报', ar: 'استخبارات', es: 'Inteligencia' } },
      { slug: 'swarm', translations: { en: 'Swarm', zh: '蜂群', ar: 'سرب', es: 'Enjambre' } },
      { slug: 'ai-coordinated', translations: { en: 'AI Coordinated', zh: 'AI协调', ar: 'منسق بالذكاء الاصطناعي', es: 'Coordinado por IA' } },
      { slug: 'maritime', translations: { en: 'Maritime', zh: '海事', ar: 'بحري', es: 'Marítimo' } },
      { slug: 'water-landing', translations: { en: 'Water Landing', zh: '水上降落', ar: 'هبوط مائي', es: 'Aterrizaje en Agua' } },
      { slug: 'hyperspectral', translations: { en: 'Hyperspectral', zh: '高光谱', ar: 'فرط طيفي', es: 'Hiperespectral' } },
      { slug: 'material-analysis', translations: { en: 'Material Analysis', zh: '物质分析', ar: 'تحليل المواد', es: 'Análisis de Materiales' } },
      { slug: 'integrated', translations: { en: 'Integrated', zh: '综合', ar: 'متكامل', es: 'Integrado' } },
      { slug: 'multi-layer', translations: { en: 'Multi-Layer', zh: '多层', ar: 'متعدد الطبقات', es: 'Multi-Capa' } }
    ]

    const { error: tagsError } = await supabase.from('product_tags').insert(tags)
    if (tagsError) throw tagsError

    console.log(`   ✅ 插入 ${tags.length} 个标签\n`)

    // 3. 插入20个产品
    console.log('📦 插入产品数据...')

    const products = [
      {
        model: 'SD-200', slug: 'sd-200', category: 'uav', sub_category: 'reconnaissance',
        specs: { 'Weight': '8.5kg', 'Dimensions': '1800×600×400mm', 'Maximum Endurance': '120min', 'Maximum Speed': '15m/s', 'Max Range': '50km', 'Max Ceiling': '5000m', 'Payload Capacity': '5kg', 'Sensors': 'EO/IR Camera, LiDAR' },
        translations: {
          en: { name: 'SD-200 Reconnaissance UAV', overview: 'The SD-200 is a long-endurance reconnaissance UAV designed for extended surveillance missions. With 120 minutes of flight time and 50km operational range, it provides comprehensive aerial intelligence gathering capabilities.', features: 'Long-endurance flight, Advanced EO/IR sensors, LiDAR mapping, All-weather operation', applications: 'Border surveillance, Infrastructure monitoring, Environmental assessment, Search and rescue' },
          zh: { name: 'SD-200 侦察无人机', overview: 'SD-200 是一款长航时侦察无人机，专为长时间监视任务设计。具有120分钟续航时间和50公里作战半径，提供全面的空中情报收集能力。', features: '长航时飞行，先进光电/红外传感器，激光雷达测绘，全天候作业', applications: '边境监视，基础设施监测，环境评估，搜救行动' }
        },
        featured: true, published: true, sort_order: 5
      },
      {
        model: 'SD-350', slug: 'sd-350', category: 'uav', sub_category: 'multi-role',
        specs: { 'Weight': '15kg', 'Dimensions': '2200×800×500mm', 'Maximum Endurance': '90min', 'Maximum Speed': '20m/s', 'Max Range': '35km', 'Max Ceiling': '4500m', 'Payload Capacity': '8kg', 'Sensors': 'Multispectral Camera, Thermal, SAR' },
        translations: {
          en: { name: 'SD-350 Multi-Role UAV', overview: 'The SD-350 is a versatile multi-role UAV platform capable of performing various missions including reconnaissance, surveying, and payload delivery. Its modular design allows rapid configuration changes.', features: 'Modular payload system, Multiple sensor options, All-terrain capability, Rapid deployment', applications: 'Aerial surveying, Precision agriculture, Emergency response, Logistics support' },
          zh: { name: 'SD-350 多用途无人机', overview: 'SD-350 是一款多功能无人机平台，能够执行侦察、测绘和载荷投送等多种任务。模块化设计支持快速配置变更。', features: '模块化载荷系统，多种传感器选项，全地形能力，快速部署', applications: '航空测绘，精准农业，应急响应，后勤支援' }
        },
        featured: false, published: true, sort_order: 6
      },
      {
        model: 'SD-500', slug: 'sd-500', category: 'uav', sub_category: 'heavy-lift',
        specs: { 'Weight': '35kg', 'Dimensions': '3500×1200×800mm', 'Maximum Endurance': '60min', 'Maximum Speed': '12m/s', 'Max Range': '25km', 'Max Ceiling': '3000m', 'Payload Capacity': '25kg', 'Sensors': 'Dual EO/IR, Cargo Bay' },
        translations: {
          en: { name: 'SD-500 Heavy-Lift UAV', overview: 'The SD-500 is a heavy-lift cargo UAV designed for substantial payload transport. With 25kg payload capacity, it excels in logistics and supply delivery missions.', features: 'Heavy payload capacity, Reinforced airframe, Precision landing, Automated cargo release', applications: 'Cargo transport, Medical supply delivery, Offshore logistics, Disaster relief' },
          zh: { name: 'SD-500 重载无人机', overview: 'SD-500 是一款重型货运无人机，专为大批量载荷运输设计。25公斤载荷能力使其在后勤和物资投送任务中表现出色。', features: '大载荷能力，加强型机身，精确着陆，自动货物释放', applications: '货物运输，医疗物资投送，海上后勤，灾害救援' }
        },
        featured: false, published: true, sort_order: 7
      },
      {
        model: 'PL-100', slug: 'pl-100', category: 'payload', sub_category: 'eo-ir',
        specs: { 'Weight': '2.5kg', 'Dimensions': '250×180×150mm', 'Resolution': '4K EO + 640×512 IR', 'Zoom': '30x Optical', 'Gimbal': '3-axis Stabilized', 'Laser Range Finder': '5km' },
        translations: {
          en: { name: 'PL-100 EO/IR Payload', overview: 'The PL-100 is a high-performance electro-optical/infrared payload with 4K resolution and 30x optical zoom, ideal for detailed reconnaissance and target identification.', features: '4K EO camera, Thermal imaging, 30x optical zoom, Laser range finder', applications: 'Target identification, Surveillance, Search and rescue, Infrastructure inspection' },
          zh: { name: 'PL-100 光电/红外载荷', overview: 'PL-100 是一款高性能光电/红外载荷，具备4K分辨率和30倍光学变焦，非常适合详细侦察和目标识别。', features: '4K光电相机，热成像，30倍光学变焦，激光测距仪', applications: '目标识别，监视，搜救，基础设施巡检' }
        },
        featured: true, published: true, sort_order: 8
      },
      {
        model: 'PL-200', slug: 'pl-200', category: 'payload', sub_category: 'multispectral',
        specs: { 'Weight': '3.8kg', 'Dimensions': '300×200×180mm', 'Spectral Bands': '5 bands (RGB + NIR + Red Edge)', 'Resolution': '12MP per band', 'GSD': '3cm at 100m' },
        translations: {
          en: { name: 'PL-200 Multispectral Payload', overview: 'The PL-200 multispectral payload captures data across 5 spectral bands for precision agriculture, environmental monitoring, and vegetation analysis.', features: '5 spectral bands, High resolution, Precision GSD, Radiometric calibration', applications: 'Precision agriculture, Vegetation health, Environmental monitoring, Forestry' },
          zh: { name: 'PL-200 多光谱载荷', overview: 'PL-200 多光谱载荷可捕获5个光谱波段数据，用于精准农业、环境监测和植被分析。', features: '5个光谱波段，高分辨率，精确地面采样距离，辐射定标', applications: '精准农业，植被健康，环境监测，林业' }
        },
        featured: false, published: true, sort_order: 9
      },
      {
        model: 'PL-300', slug: 'pl-300', category: 'payload', sub_category: 'lidar',
        specs: { 'Weight': '4.5kg', 'Dimensions': '180×180×250mm', 'Laser Type': '905nm', 'Points per Second': '240,000', 'Range': '150m', 'Accuracy': '±2cm' },
        translations: {
          en: { name: 'PL-300 LiDAR Payload', overview: 'The PL-300 LiDAR payload generates high-density 3D point clouds for precise mapping, surveying, and terrain modeling applications.', features: 'High point density, Centimeter accuracy, Long range, Multiple return detection', applications: 'Topographic surveying, 3D mapping, Mining, Construction monitoring' },
          zh: { name: 'PL-300 激光雷达载荷', overview: 'PL-300 激光雷达载荷生成高密度三维点云，用于精确测绘、测量和地形建模应用。', features: '高点密度，厘米级精度，长距离，多次回波检测', applications: '地形测绘，三维建模，采矿，建筑监测' }
        },
        featured: false, published: true, sort_order: 10
      },
      {
        model: 'GC-100', slug: 'gc-100', category: 'ground_control', sub_category: 'portable',
        specs: { 'Weight': '3.2kg', 'Display': '10.1 inch sunlight readable', 'Battery Life': '8 hours', 'Operating Range': '20km', 'Video Channels': '2 HD streams', 'Interfaces': 'HDMI, USB, Ethernet' },
        translations: {
          en: { name: 'GC-100 Portable Ground Station', overview: 'The GC-100 is a lightweight portable ground control station with sunlight-readable display, ideal for field operations and rapid deployment scenarios.', features: 'Sunlight readable display, Long battery life, Dual video streams, Rugged design', applications: 'Field operations, Rapid deployment, Mobile command, Training' },
          zh: { name: 'GC-100 便携地面站', overview: 'GC-100 是一款轻便型地面控制站，配备阳光下可读显示屏，非常适合外场作业和快速部署场景。', features: '阳光下可读显示，长续航，双视频流，坚固设计', applications: '外场作业，快速部署，移动指挥，训练' }
        },
        featured: true, published: true, sort_order: 11
      },
      {
        model: 'GC-200', slug: 'gc-200', category: 'ground_control', sub_category: 'vehicle',
        specs: { 'Weight': '15kg', 'Display': 'Dual 15.6 inch monitors', 'Power': '12/24V DC or 110/220V AC', 'Operating Range': '50km', 'Video Channels': '4 HD streams', 'Data Link': 'Dual redundant' },
        translations: {
          en: { name: 'GC-200 Vehicle Ground Station', overview: 'The GC-200 is a vehicle-mounted ground control station with dual monitors and redundant data links, designed for extended operations and multi-UAV management.', features: 'Dual monitor setup, Redundant communications, Multi-UAV support, Vehicle integration', applications: 'Vehicle operations, Multi-UAV missions, Extended surveillance, Command centers' },
          zh: { name: 'GC-200 车载地面站', overview: 'GC-200 是一款车载地面控制站，配备双显示器和冗余数据链路，专为长时间作业和多机管理设计。', features: '双显示器设置，冗余通信，多机支持，车辆集成', applications: '车载作业，多机任务，长时间监视，指挥中心' }
        },
        featured: false, published: true, sort_order: 12
      },
      {
        model: 'CUAS-100', slug: 'cuas-100', category: 'cuas', sub_category: 'portable',
        specs: { 'Weight': '8kg', 'Detection Range': '5km', 'Neutralization Range': '2km', 'Detection Methods': 'RF + EO', 'Response Time': '<3 seconds', 'Battery Life': '4 hours' },
        translations: {
          en: { name: 'CUAS-100 Portable Counter-UAS', overview: 'The CUAS-100 is a man-portable counter-UAS system providing rapid detection and neutralization of unauthorized drones in the field.', features: 'Portable design, Rapid response, Multi-sensor detection, Soft-kill options', applications: 'Event security, VIP protection, Field operations, Critical infrastructure' },
          zh: { name: 'CUAS-100 便携反无人机系统', overview: 'CUAS-100 是一款便携式反无人机系统，可在野外快速探测和压制未授权无人机。', features: '便携设计，快速响应，多传感器探测，软杀伤选项', applications: '活动安保，要员保护，外场作业，关键基础设施' }
        },
        featured: true, published: true, sort_order: 13
      },
      {
        model: 'CUAS-200', slug: 'cuas-200', category: 'cuas', sub_category: 'fixed',
        specs: { 'Detection Range': '15km', 'Neutralization Range': '8km', 'Detection Methods': 'Radar + RF + EO/IR', 'Response Time': '<2 seconds', 'Coverage': '360° azimuth, 0-90° elevation', 'Targets': 'Multiple simultaneous' },
        translations: {
          en: { name: 'CUAS-200 Fixed Counter-UAS', overview: 'The CUAS-200 is a fixed-site counter-UAS system with comprehensive 360° coverage and multi-layer detection capabilities for critical infrastructure protection.', features: '360° coverage, Multi-layer detection, Multi-target tracking, Automated response', applications: 'Airports, Military bases, Power plants, Government facilities' },
          zh: { name: 'CUAS-200 固定反无人机系统', overview: 'CUAS-200 是一款固定式反无人机系统，具备全面的360°覆盖和多层探测能力，用于关键基础设施保护。', features: '360°覆盖，多层探测，多目标跟踪，自动响应', applications: '机场，军事基地，发电厂，政府设施' }
        },
        featured: false, published: true, sort_order: 14
      },
      {
        model: 'SD-600', slug: 'sd-600', category: 'uav', sub_category: 'vtol',
        specs: { 'Weight': '18kg', 'Dimensions': '2800×1000×600mm', 'Maximum Endurance': '150min', 'Maximum Speed': '25m/s', 'Max Range': '80km', 'Max Ceiling': '6000m', 'Payload Capacity': '6kg', 'Operation': 'VTOL + Fixed-wing' },
        translations: {
          en: { name: 'SD-600 VTOL UAV', overview: 'The SD-600 is a hybrid VTOL UAV combining vertical takeoff capability with fixed-wing efficiency, offering 150 minutes endurance and 80km range.', features: 'VTOL capability, Extended range, Fixed-wing efficiency, Versatile operation', applications: 'Long-range reconnaissance, Pipeline inspection, Border patrol, Mapping' },
          zh: { name: 'SD-600 垂直起降无人机', overview: 'SD-600 是一款混合垂直起降无人机，结合垂直起飞能力与固定翼效率，提供150分钟续航和80公里航程。', features: '垂直起降能力，长航程，固定翼效率，多功能作业', applications: '远程侦察，管道巡检，边境巡逻，测绘' }
        },
        featured: true, published: true, sort_order: 15
      },
      {
        model: 'PL-400', slug: 'pl-400', category: 'payload', sub_category: 'sar',
        specs: { 'Weight': '6kg', 'Dimensions': '400×300×200mm', 'Frequency': 'X-band', 'Resolution': '0.3m', 'Swath Width': '2km', 'Polarization': 'Single/Dual' },
        translations: {
          en: { name: 'PL-400 SAR Payload', overview: 'The PL-400 is a synthetic aperture radar payload providing all-weather, day/night imaging capability with 0.3m resolution.', features: 'All-weather operation, High resolution, Wide swath, Day/night capable', applications: 'All-weather surveillance, Disaster monitoring, Sea ice tracking, Ground movement detection' },
          zh: { name: 'PL-400 合成孔径雷达载荷', overview: 'PL-400 是一款合成孔径雷达载荷，提供全天候、昼夜成像能力，分辨率0.3米。', features: '全天候作业，高分辨率，宽测绘带，昼夜可用', applications: '全天候监视，灾害监测，海冰跟踪，地面运动检测' }
        },
        featured: false, published: true, sort_order: 16
      },
      {
        model: 'SD-700', slug: 'sd-700', category: 'uav', sub_category: 'hae',
        specs: { 'Weight': '45kg', 'Dimensions': '5000×1500×900mm', 'Maximum Endurance': '24 hours', 'Maximum Speed': '30m/s', 'Max Range': '500km', 'Max Ceiling': '8000m', 'Payload Capacity': '15kg', 'Power': 'Solar + Battery hybrid' },
        translations: {
          en: { name: 'SD-700 High Altitude Long Endurance UAV', overview: 'The SD-700 is a high altitude long endurance (HALE) UAV with 24-hour flight capability, designed for persistent surveillance and monitoring missions.', features: '24-hour endurance, Solar power assist, High altitude operation, Long range', applications: 'Persistent surveillance, Border monitoring, Environmental research, Communications relay' },
          zh: { name: 'SD-700 高空长航时无人机', overview: 'SD-700 是一款高空长航时无人机，具备24小时飞行能力，专为持续监视和监测任务设计。', features: '24小时续航，太阳能辅助，高空作业，长航程', applications: '持续监视，边境监测，环境研究，通信中继' }
        },
        featured: false, published: true, sort_order: 17
      },
      {
        model: 'GC-300', slug: 'gc-300', category: 'ground_control', sub_category: 'command',
        specs: { 'Configuration': 'Multi-operator console', 'Displays': '6× 24 inch monitors', 'Operators': 'Up to 6 simultaneous', 'UAV Capacity': 'Up to 12 UAVs', 'Network': 'LAN/WAN/Satellite', 'Recording': 'Multi-channel HD' },
        translations: {
          en: { name: 'GC-300 Command & Control Center', overview: 'The GC-300 is a comprehensive command and control center supporting multi-operator, multi-UAV operations with advanced mission planning and real-time coordination.', features: 'Multi-operator support, Multi-UAV management, Advanced mission planning, Network integration', applications: 'Operations centers, Fleet management, Training facilities, Emergency response' },
          zh: { name: 'GC-300 指挥控制中心', overview: 'GC-300 是一个综合指挥控制中心，支持多操作员、多机作业，具备先进任务规划和实时协调能力。', features: '多操作员支持，多机管理，先进任务规划，网络集成', applications: '作战中心，机队管理，训练设施，应急响应' }
        },
        featured: false, published: true, sort_order: 18
      },
      {
        model: 'CUAS-300', slug: 'cuas-300', category: 'cuas', sub_category: 'mobile',
        specs: { 'Platform': 'Vehicle-mounted', 'Detection Range': '20km', 'Neutralization Range': '10km', 'Detection Methods': 'Radar + RF + EO/IR + Acoustic', 'Response Time': '<1.5 seconds', 'Mobility': 'On-road/off-road capable' },
        translations: {
          en: { name: 'CUAS-300 Mobile Counter-UAS', overview: 'The CUAS-300 is a mobile counter-UAS system mounted on vehicles, providing on-the-move protection with extended range and multi-sensor fusion.', features: 'Mobile operation, Extended range, Multi-sensor fusion, On-the-move capability', applications: 'Convoy protection, Mobile security, Rapid deployment, Tactical operations' },
          zh: { name: 'CUAS-300 移动反无人机系统', overview: 'CUAS-300 是一款车载移动反无人机系统，提供行进间保护，具备扩展距离和多传感器融合。', features: '移动作业，扩展距离，多传感器融合，行进间能力', applications: '车队保护，移动安保，快速部署，战术行动' }
        },
        featured: false, published: true, sort_order: 19
      },
      {
        model: 'PL-500', slug: 'pl-500', category: 'payload', sub_category: 'sigint',
        specs: { 'Weight': '5.5kg', 'Dimensions': '350×250×200mm', 'Frequency Range': '20MHz - 6GHz', 'Functions': 'COMINT + ELINT', 'Processing': 'Real-time analysis', 'Data Link': 'Encrypted transmission' },
        translations: {
          en: { name: 'PL-500 SIGINT Payload', overview: 'The PL-500 is a signals intelligence payload capable of COMINT and ELINT operations, providing real-time spectrum analysis and signal interception.', features: 'Wide frequency range, Real-time analysis, Encrypted data links, Multi-mode operation', applications: 'Signal interception, Spectrum monitoring, Electronic warfare support, Intelligence gathering' },
          zh: { name: 'PL-500 信号情报载荷', overview: 'PL-500 是一款信号情报载荷，能够执行通信情报和电子情报作业，提供实时频谱分析和信号截获。', features: '宽频率范围，实时分析，加密数据链，多模式作业', applications: '信号截获，频谱监测，电子战支援，情报收集' }
        },
        featured: false, published: true, sort_order: 20
      },
      {
        model: 'SD-800', slug: 'sd-800', category: 'uav', sub_category: 'swarm',
        specs: { 'Weight': '2kg per unit', 'Dimensions': '600×400×200mm', 'Maximum Endurance': '45min', 'Maximum Speed': '18m/s', 'Max Range': '10km', 'Swarm Size': 'Up to 50 units', 'Coordination': 'AI-powered swarm logic' },
        translations: {
          en: { name: 'SD-800 Swarm UAV', overview: 'The SD-800 is a lightweight swarm-capable UAV designed for coordinated multi-UAV operations, with AI-powered swarm coordination for complex missions.', features: 'Swarm capability, AI coordination, Lightweight design, Rapid deployment', applications: 'Area saturation, Distributed sensing, Decoy operations, Coordinated reconnaissance' },
          zh: { name: 'SD-800 群蜂无人机', overview: 'SD-800 是一款轻量级群蜂无人机，专为协调多机作业设计，具备AI驱动的蜂群协调能力。', features: '蜂群能力，AI协调，轻量化设计，快速部署', applications: '区域饱和，分布式感知，诱饵作业，协同侦察' }
        },
        featured: false, published: true, sort_order: 21
      },
      {
        model: 'SD-900', slug: 'sd-900', category: 'uav', sub_category: 'maritime',
        specs: { 'Weight': '22kg', 'Dimensions': '3000×1200×700mm', 'Maximum Endurance': '180min', 'Maximum Speed': '22m/s', 'Max Range': '100km', 'Max Ceiling': '4000m', 'Payload Capacity': '10kg', 'Landing': 'Water landing capable' },
        translations: {
          en: { name: 'SD-900 Maritime UAV', overview: 'The SD-900 is a maritime-capable UAV with water landing ability, designed for extended over-water operations including surveillance and search and rescue.', features: 'Water landing, Extended endurance, Maritime sensors, Long range', applications: 'Maritime patrol, Search and rescue, Fisheries monitoring, Anti-piracy operations' },
          zh: { name: 'SD-900 海事无人机', overview: 'SD-900 是一款具备水上降落能力的海事无人机，专为长时间海上作业设计，包括监视和搜救。', features: '水上降落，长续航，海事传感器，长航程', applications: '海事巡逻，搜救，渔业监测，反海盗行动' }
        },
        featured: false, published: true, sort_order: 22
      },
      {
        model: 'PL-600', slug: 'pl-600', category: 'payload', sub_category: 'hyperspectral',
        specs: { 'Weight': '4.2kg', 'Dimensions': '280×220×190mm', 'Spectral Bands': '100+ bands (400-1000nm)', 'Spatial Resolution': '1280×1024', 'Spectral Resolution': '5nm', 'Frame Rate': '30 fps' },
        translations: {
          en: { name: 'PL-600 Hyperspectral Payload', overview: 'The PL-600 is a hyperspectral imaging payload capturing 100+ spectral bands for detailed material identification and analysis.', features: '100+ spectral bands, High spatial resolution, Material identification, Real-time processing', applications: 'Mineral exploration, Precision agriculture, Environmental monitoring, Target identification' },
          zh: { name: 'PL-600 高光谱载荷', overview: 'PL-600 是一款高光谱成像载荷，可捕获100+光谱波段，用于详细物质识别和分析。', features: '100+光谱波段，高空间分辨率，物质识别，实时处理', applications: '矿产勘探，精准农业，环境监测，目标识别' }
        },
        featured: false, published: true, sort_order: 23
      },
      {
        model: 'CUAS-400', slug: 'cuas-400', category: 'cuas', sub_category: 'integrated',
        specs: { 'Detection Range': '30km', 'Neutralization Range': '15km', 'Detection Methods': 'Radar + RF + EO/IR + Acoustic + ADS-B', 'Response Time': '<1 second', 'Countermeasures': 'Jamming + Spoofing + Kinetic', 'Integration': 'ATC and C2 systems' },
        translations: {
          en: { name: 'CUAS-400 Integrated Counter-UAS', overview: 'The CUAS-400 is a comprehensive integrated counter-UAS solution combining multiple detection methods and countermeasures with air traffic control integration.', features: 'Multi-layer defense, Multiple countermeasures, ATC integration, Automated response', applications: 'Airports, National borders, Critical infrastructure, Military installations' },
          zh: { name: 'CUAS-400 综合反无人机系统', overview: 'CUAS-400 是一款综合反无人机解决方案，结合多种探测方法和对抗措施，并与空中交通管制集成。', features: '多层防御，多种对抗措施，空管集成，自动响应', applications: '机场，国境边界，关键基础设施，军事设施' }
        },
        featured: false, published: true, sort_order: 24
      }
    ]

    // 分批插入产品（每批5个）
    for (let i = 0; i < products.length; i += 5) {
      const batch = products.slice(i, i + 5)
      const { error: productsError } = await supabase.from('products').insert(batch)
      if (productsError) throw productsError
      console.log(`   ✅ 插入产品 ${i + 1}-${Math.min(i + 5, products.length)}`)
    }

    console.log(`   ✅ 共插入 ${products.length} 个产品\n`)

    // 4. 插入案例研究
    console.log('📖 插入案例研究数据...')

    const caseStudies = [
      {
        slug: 'border-surveillance-australia', industry: 'defense', country: 'Australia',
        translations: {
          en: { title: 'Border Surveillance Enhancement', client: 'Australian Border Force', summary: 'Deployed SD-200 and SD-600 UAV systems for 24/7 border monitoring across 2,000km coastline.', challenge: 'Australia needed to monitor vast coastal borders with limited personnel and challenging terrain.', solution: 'Implemented a network of SD-200 and SD-600 UAVs with GC-200 ground stations, providing continuous aerial surveillance.', outcome: 'Achieved 95% coverage of priority border areas, reduced illegal crossings by 67%.' },
          zh: { title: '边境监视增强', client: '澳大利亚边境部队', summary: '部署SD-200和SD-600无人机系统，对2000公里海岸线进行24/7边境监视。', challenge: '澳大利亚需要以有限的人员和复杂地形监控广阔的海岸边界。', solution: '实施了SD-200和SD-600无人机网络，配备GC-200地面站，提供连续空中监视。', outcome: '实现优先边境区域95%覆盖，非法越境减少67%。' }
        },
        results: [{ label: 'Coverage', value: '95%' }, { label: 'Incident Reduction', value: '67%' }, { label: 'Response Time', value: '< 5 min' }],
        client_quote: { en: 'SeekDrone systems have transformed our border security capabilities.', zh: 'SeekDrone系统彻底改变了我们的边境安全能力。' },
        featured: true, published: true, sort_order: 1
      },
      {
        slug: 'pipeline-inspection-canada', industry: 'energy', country: 'Canada',
        translations: {
          en: { title: 'Pipeline Integrity Monitoring', client: 'Major Canadian Energy Company', summary: 'Automated inspection of 5,000km pipeline network using SD-350 UAVs with PL-300 LiDAR payloads.', challenge: 'Manual pipeline inspection was dangerous, time-consuming, and could not achieve required inspection frequency.', solution: 'Deployed SD-350 UAVs equipped with PL-300 LiDAR and PL-100 EO/IR payloads for automated weekly inspections.', outcome: 'Inspection costs reduced by 75%, coverage increased to 100%.' },
          zh: { title: '管道完整性监测', client: '加拿大主要能源公司', summary: '使用配备PL-300激光雷达载荷的SD-350无人机对5000公里管道网络进行自动巡检。', challenge: '人工管道巡检危险、耗时，且无法在偏远地形实现所需的巡检频率。', solution: '部署配备PL-300激光雷达和PL-100光电/红外载荷的SD-350无人机进行每周自动巡检。', outcome: '巡检成本降低75%，覆盖率提高至100%。' }
        },
        results: [{ label: 'Cost Reduction', value: '75%' }, { label: 'Coverage', value: '100%' }, { label: 'Incidents Prevented', value: '3' }],
        client_quote: { en: 'The ROI was achieved within 6 months of deployment.', zh: '部署后6个月内即实现投资回报。' },
        featured: true, published: true, sort_order: 2
      },
      {
        slug: 'precision-agriculture-brazil', industry: 'agriculture', country: 'Brazil',
        translations: {
          en: { title: 'Precision Agriculture Implementation', client: 'Large Brazilian Soybean Farm', summary: 'Integrated PL-200 multispectral imaging for crop health monitoring across 50,000 hectares.', challenge: 'Traditional crop monitoring was inconsistent and reactive, leading to suboptimal yields and wasted resources.', solution: 'Implemented weekly multispectral surveys using SD-350 UAVs with PL-200 payloads.', outcome: 'Crop yield increased by 18%, water usage reduced by 22%.' },
          zh: { title: '精准农业实施', client: '巴西大型大豆农场', summary: '整合PL-200多光谱成像，对5万公顷农田进行作物健康监测。', challenge: '传统作物监测不一致且被动，导致产量欠佳和资源浪费。', solution: '使用配备PL-200载荷的SD-350无人机进行每周多光谱调查。', outcome: '作物产量提高18%，用水量减少22%。' }
        },
        results: [{ label: 'Yield Increase', value: '18%' }, { label: 'Water Savings', value: '22%' }, { label: 'Pesticide Optimization', value: '35%' }],
        client_quote: { en: 'We can now see problems before they become visible to the naked eye.', zh: '我们现在可以在问题肉眼可见之前发现它们。' },
        featured: false, published: true, sort_order: 3
      },
      {
        slug: 'search-rescue-norway', industry: 'emergency', country: 'Norway',
        translations: {
          en: { title: 'Mountain Search and Rescue', client: 'Norwegian Search and Rescue Service', summary: 'Enhanced SAR capabilities with thermal imaging UAVs for mountain and fjord operations.', challenge: 'Mountainous terrain and fjords made traditional SAR operations slow and dangerous.', solution: 'Deployed SD-200 and SD-600 UAVs with PL-100 EO/IR payloads for rapid aerial search.', outcome: 'Average search time reduced from 8 hours to 2 hours, survival rate increased by 40%.' },
          zh: { title: '山地搜救', client: '挪威搜救服务', summary: '使用热成像无人机增强山区和峡湾搜救能力。', challenge: '山区地形和峡湾使传统搜救行动缓慢且危险。', solution: '部署配备PL-100光电/红外载荷的SD-200和SD-600无人机进行快速空中搜索。', outcome: '平均搜索时间从8小时缩短至2小时，生存率提高40%。' }
        },
        results: [{ label: 'Search Time', value: '-75%' }, { label: 'Survival Rate', value: '+40%' }, { label: 'Coverage Speed', value: '10x' }],
        client_quote: { en: 'These UAVs have saved lives that would have been lost.', zh: '这些无人机挽救了本会失去的生命。' },
        featured: true, published: true, sort_order: 4
      },
      {
        slug: 'infrastructure-inspection-germany', industry: 'energy', country: 'Germany',
        translations: {
          en: { title: 'Power Grid Inspection', client: 'German Utility Company', summary: 'Automated inspection of 3,000km power transmission lines using SD-350 UAVs.', challenge: 'Manual tower inspections required climbers, were expensive, and could not achieve desired inspection frequency.', solution: 'Implemented automated inspection routes using SD-350 UAVs with PL-100 EO/IR payloads.', outcome: 'Inspection speed increased 8x, costs reduced by 60%.' },
          zh: { title: '电网巡检', client: '德国公用事业公司', summary: '使用SD-350无人机对3000公里输电线路进行自动巡检。', challenge: '人工塔架巡检需要攀爬人员，成本高昂，且无法达到所需巡检频率。', solution: '使用配备PL-100光电/红外载荷的SD-350无人机实施自动巡检路线。', outcome: '巡检速度提高8倍，成本降低60%。' }
        },
        results: [{ label: 'Speed Increase', value: '8x' }, { label: 'Cost Reduction', value: '60%' }, { label: 'Failure Reduction', value: '45%' }],
        client_quote: { en: 'Predictive maintenance has transformed our operations.', zh: '预测性维护改变了我们的运营方式。' },
        featured: false, published: true, sort_order: 5
      }
    ]

    // 分批插入案例研究
    for (let i = 0; i < caseStudies.length; i += 5) {
      const batch = caseStudies.slice(i, i + 5)
      const { error: casesError } = await supabase.from('case_studies').insert(batch)
      if (casesError) throw casesError
      console.log(`   ✅ 插入案例 ${i + 1}-${Math.min(i + 5, caseStudies.length)}`)
    }

    console.log(`   ✅ 共插入 ${caseStudies.length} 条案例研究\n`)

    // 验证数据
    console.log('📊 验证数据...')
    const { data: allProducts } = await supabase.from('products').select('id, model')
    const { data: allCases } = await supabase.from('case_studies').select('id, slug')
    const { data: allTags } = await supabase.from('product_tags').select('id, slug')

    console.log(`   - 产品数量: ${allProducts?.length || 0}`)
    console.log(`   - 案例研究数量: ${allCases?.length || 0}`)
    console.log(`   - 标签数量: ${allTags?.length || 0}`)

    console.log('\n✅ 数据库填充完成!')
    console.log('\n📝 数据摘要:')
    console.log('   - 产品: 20个（涵盖UAV、载荷、地面站、反无人机系统）')
    console.log('   - 案例研究: 5条（涵盖国防、能源、农业、应急、基础设施）')
    console.log('   - 标签: 36个')
    console.log('   - 多语言支持: 英文、中文')

  } catch (error) {
    console.error('\n❌ 填充失败:', error)
    process.exit(1)
  }
}

seedFullDatabase()
