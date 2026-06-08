-- seed/mock_case_studies.sql
-- 模拟案例研究数据 - 30条案例，包含多语言翻译

-- 清空现有案例研究数据
DELETE FROM case_studies;

-- 插入30条案例研究
INSERT INTO case_studies (slug, industry, country, translations, results, images, video_url, client_quote, featured, published, sort_order) VALUES
  -- 案例 1: 边境监视
  (
    'border-surveillance-australia',
    'defense',
    'Australia',
    '{
      "en": {
        "title": "Border Surveillance Enhancement",
        "client": "Australian Border Force",
        "summary": "Deployed SD-200 and SD-600 UAV systems for 24/7 border monitoring across 2,000km coastline.",
        "challenge": "Australia needed to monitor vast coastal borders with limited personnel and challenging terrain. Traditional patrol methods were insufficient for comprehensive coverage.",
        "solution": "Implemented a network of SD-200 and SD-600 UAVs with GC-200 ground stations, providing continuous aerial surveillance with automated patrol routes and AI-powered anomaly detection.",
        "outcome": "Achieved 95% coverage of priority border areas, reduced illegal crossings by 67%, and decreased response time to incidents from hours to minutes."
      },
      "zh": {
        "title": "边境监视增强",
        "client": "澳大利亚边境部队",
        "summary": "部署SD-200和SD-600无人机系统，对2000公里海岸线进行24/7边境监视。",
        "challenge": "澳大利亚需要以有限的人员和复杂地形监控广阔的海岸边界。传统巡逻方法无法实现全面覆盖。",
        "solution": "实施了SD-200和SD-600无人机网络，配备GC-200地面站，提供连续空中监视，具有自动巡逻路线和AI驱动的异常检测。",
        "outcome": "实现优先边境区域95%覆盖，非法越境减少67%，事件响应时间从小时缩短至分钟。"
      }
    }'::jsonb,
    '[{"label": "Coverage", "value": "95%"}, {"label": "Incident Reduction", "value": "67%"}, {"label": "Response Time", "value": "< 5 min"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "SeekDrone systems have transformed our border security capabilities.", "zh": "SeekDrone系统彻底改变了我们的边境安全能力。"}'::jsonb,
    true,
    true,
    1
  ),

  -- 案例 2: 管道巡检
  (
    'pipeline-inspection-canada',
    'energy',
    'Canada',
    '{
      "en": {
        "title": "Pipeline Integrity Monitoring",
        "client": "Major Canadian Energy Company",
        "summary": "Automated inspection of 5,000km pipeline network using SD-350 UAVs with PL-300 LiDAR payloads.",
        "challenge": "Manual pipeline inspection was dangerous, time-consuming, and could not achieve required inspection frequency across remote terrain.",
        "solution": "Deployed SD-350 UAVs equipped with PL-300 LiDAR and PL-100 EO/IR payloads for automated weekly inspections, with AI-powered anomaly detection for leaks and structural issues.",
        "outcome": "Inspection costs reduced by 75%, coverage increased to 100%, and early detection prevented 3 major incidents."
      },
      "zh": {
        "title": "管道完整性监测",
        "client": "加拿大主要能源公司",
        "summary": "使用配备PL-300激光雷达载荷的SD-350无人机对5000公里管道网络进行自动巡检。",
        "challenge": "人工管道巡检危险、耗时，且无法在偏远地形实现所需的巡检频率。",
        "solution": "部署配备PL-300激光雷达和PL-100光电/红外载荷的SD-350无人机进行每周自动巡检，采用AI驱动的异常检测识别泄漏和结构问题。",
        "outcome": "巡检成本降低75%，覆盖率提高至100%，早期检测预防了3起重大事故。"
      }
    }'::jsonb,
    '[{"label": "Cost Reduction", "value": "75%"}, {"label": "Coverage", "value": "100%"}, {"label": "Incidents Prevented", "value": "3"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "The ROI was achieved within 6 months of deployment.", "zh": "部署后6个月内即实现投资回报。"}'::jsonb,
    true,
    true,
    2
  ),

  -- 案例 3: 精准农业
  (
    'precision-agriculture-brazil',
    'agriculture',
    'Brazil',
    '{
      "en": {
        "title": "Precision Agriculture Implementation",
        "client": "Large Brazilian Soybean Farm",
        "summary": "Integrated PL-200 multispectral imaging for crop health monitoring across 50,000 hectares.",
        "challenge": "Traditional crop monitoring was inconsistent and reactive, leading to suboptimal yields and wasted resources.",
        "solution": "Implemented weekly multispectral surveys using SD-350 UAVs with PL-200 payloads, generating vegetation health maps and prescription maps for targeted intervention.",
        "outcome": "Crop yield increased by 18%, water usage reduced by 22%, and pesticide application optimized by 35%."
      },
      "zh": {
        "title": "精准农业实施",
        "client": "巴西大型大豆农场",
        "summary": "整合PL-200多光谱成像，对5万公顷农田进行作物健康监测。",
        "challenge": "传统作物监测不一致且被动，导致产量欠佳和资源浪费。",
        "solution": "使用配备PL-200载荷的SD-350无人机进行每周多光谱调查，生成植被健康图和处方图以进行针对性干预。",
        "outcome": "作物产量提高18%，用水量减少22%，农药施用优化35%。"
      }
    }'::jsonb,
    '[{"label": "Yield Increase", "value": "18%"}, {"label": "Water Savings", "value": "22%"}, {"label": "Pesticide Optimization", "value": "35%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We can now see problems before they become visible to the naked eye.", "zh": "我们现在可以在问题肉眼可见之前发现它们。"}'::jsonb,
    false,
    true,
    3
  ),

  -- 案例 4: 搜救行动
  (
    'search-rescue-norway',
    'emergency',
    'Norway',
    '{
      "en": {
        "title": "Mountain Search and Rescue",
        "client": "Norwegian Search and Rescue Service",
        "summary": "Enhanced SAR capabilities with thermal imaging UAVs for mountain and fjord operations.",
        "challenge": "Mountainous terrain and fjords made traditional SAR operations slow and dangerous, especially in poor weather and darkness.",
        "solution": "Deployed SD-200 and SD-600 UAVs with PL-100 EO/IR payloads, providing rapid aerial search with thermal imaging for person detection in all conditions.",
        "outcome": "Average search time reduced from 8 hours to 2 hours, survival rate increased by 40%, and rescuer safety significantly improved."
      },
      "zh": {
        "title": "山地搜救",
        "client": "挪威搜救服务",
        "summary": "使用热成像无人机增强山区和峡湾搜救能力。",
        "challenge": "山区地形和峡湾使传统搜救行动缓慢且危险，特别是在恶劣天气和黑暗中。",
        "solution": "部署配备PL-100光电/红外载荷的SD-200和SD-600无人机，提供快速空中搜索，具备全天候热成像人员检测能力。",
        "outcome": "平均搜索时间从8小时缩短至2小时，生存率提高40%，救援人员安全显著改善。"
      }
    }'::jsonb,
    '[{"label": "Search Time", "value": "-75%"}, {"label": "Survival Rate", "value": "+40%"}, {"label": "Coverage Speed", "value": "10x"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "These UAVs have saved lives that would have been lost.", "zh": "这些无人机挽救了本会失去的生命。"}'::jsonb,
    true,
    true,
    4
  ),

  -- 案例 5: 基础设施巡检
  (
    'infrastructure-inspection-germany',
    'energy',
    'Germany',
    '{
      "en": {
        "title": "Power Grid Inspection",
        "client": "German Utility Company",
        "summary": "Automated inspection of 3,000km power transmission lines using SD-350 UAVs.",
        "challenge": "Manual tower inspections required climbers, were expensive, and could not achieve desired inspection frequency.",
        "solution": "Implemented automated inspection routes using SD-350 UAVs with PL-100 EO/IR payloads, capturing high-resolution imagery and thermal data for predictive maintenance.",
        "outcome": "Inspection speed increased 8x, costs reduced by 60%, and equipment failures decreased by 45% through early detection."
      },
      "zh": {
        "title": "电网巡检",
        "client": "德国公用事业公司",
        "summary": "使用SD-350无人机对3000公里输电线路进行自动巡检。",
        "challenge": "人工塔架巡检需要攀爬人员，成本高昂，且无法达到所需巡检频率。",
        "solution": "使用配备PL-100光电/红外载荷的SD-350无人机实施自动巡检路线，捕获高分辨率图像和热数据用于预测性维护。",
        "outcome": "巡检速度提高8倍，成本降低60%，通过早期检测设备故障减少45%。"
      }
    }'::jsonb,
    '[{"label": "Speed Increase", "value": "8x"}, {"label": "Cost Reduction", "value": "60%"}, {"label": "Failure Reduction", "value": "45%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Predictive maintenance has transformed our operations.", "zh": "预测性维护改变了我们的运营方式。"}'::jsonb,
    false,
    true,
    5
  ),

  -- 案例 6: 港口安保
  (
    'port-security-singapore',
    'security',
    'Singapore',
    '{
      "en": {
        "title": "Port Security Enhancement",
        "client": "Singapore Port Authority",
        "summary": "Integrated counter-UAS and surveillance systems for comprehensive port protection.",
        "challenge": "Major port faced increasing drone threats and needed comprehensive surveillance of large maritime facility.",
        "solution": "Deployed CUAS-200 fixed systems and SD-600 VTOL UAVs for 24/7 aerial surveillance, integrated with existing security infrastructure.",
        "outcome": "Neutralized 45 unauthorized drone incursions in first year, enhanced overall security posture, and reduced security personnel requirements by 30%."
      },
      "zh": {
        "title": "港口安保增强",
        "client": "新加坡港务局",
        "summary": "整合反无人机和监视系统，实现港口全面保护。",
        "challenge": "主要港口面临日益增加的无人机威胁，需要对大型海事设施进行全面监视。",
        "solution": "部署CUAS-200固定系统和SD-600垂直起降无人机进行24/7空中监视，与现有安保基础设施集成。",
        "outcome": "第一年压制45起未授权无人机入侵，增强整体安保态势，安保人员需求减少30%。"
      }
    }'::jsonb,
    '[{"label": "Incidents Neutralized", "value": "45"}, {"label": "Personnel Reduction", "value": "30%"}, {"label": "Coverage", "value": "24/7"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Our port is now one of the most secure in the world.", "zh": "我们的港口现在是世界上最安全的港口之一。"}'::jsonb,
    true,
    true,
    6
  ),

  -- 案例 7: 矿业测绘
  (
    'mining-survey-chile',
    'mining',
    'Chile',
    '{
      "en": {
        "title": "Open Pit Mine Surveying",
        "client": "Chilean Copper Mining Company",
        "summary": "Implemented daily volumetric surveys and slope monitoring using LiDAR-equipped UAVs.",
        "challenge": "Manual surveying was dangerous in active mining areas and could not provide daily updates for operational planning.",
        "solution": "Deployed SD-350 UAVs with PL-300 LiDAR payloads for automated daily surveys, generating accurate volumetric calculations and slope stability models.",
        "outcome": "Survey frequency increased from weekly to daily, accuracy improved to ±2cm, and slope failure prediction enabled proactive safety measures."
      },
      "zh": {
        "title": "露天矿测绘",
        "client": "智利铜矿公司",
        "summary": "使用配备激光雷达的无人机实施日常体积测量和边坡监测。",
        "challenge": "人工测量在活跃矿区危险，且无法为作业规划提供日常更新。",
        "solution": "部署配备PL-300激光雷达载荷的SD-350无人机进行自动日常测量，生成精确的体积计算和边坡稳定性模型。",
        "outcome": "测量频率从每周提高至每日，精度提高至±2厘米，边坡失稳预测实现主动安全措施。"
      }
    }'::jsonb,
    '[{"label": "Survey Frequency", "value": "Daily"}, {"label": "Accuracy", "value": "±2cm"}, {"label": "Safety Incidents", "value": "0"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Daily surveys have transformed our mine planning.", "zh": "日常测量改变了我们的矿山规划。"}'::jsonb,
    false,
    true,
    7
  ),

  -- 案例 8: 环境监测
  (
    'environmental-monitoring-indonesia',
    'environmental',
    'Indonesia',
    '{
      "en": {
        "title": "Rainforest Monitoring",
        "client": "Indonesian Ministry of Environment",
        "summary": "Large-scale rainforest monitoring for deforestation detection and biodiversity assessment.",
        "challenge": "Vast rainforest areas were impossible to monitor effectively with ground patrols, leading to undetected illegal logging.",
        "solution": "Implemented SD-700 HALE UAVs with multispectral and hyperspectral payloads for weekly wide-area surveys, with AI-powered change detection.",
        "outcome": "Detected 234 illegal logging sites in first year, reduced deforestation rate by 35%, and enabled rapid enforcement response."
      },
      "zh": {
        "title": "雨林监测",
        "client": "印度尼西亚环境部",
        "summary": "大规模雨林监测，用于森林砍伐检测和生物多样性评估。",
        "challenge": "广阔的雨林区域无法通过地面巡逻有效监测，导致非法采伐未被发现。",
        "solution": "实施配备多光谱和高光谱载荷的SD-700高空长航时无人机进行每周大范围调查，采用AI驱动的变化检测。",
        "outcome": "第一年检测到234个非法采伐点，森林砍伐率降低35%，实现快速执法响应。"
      }
    }'::jsonb,
    '[{"label": "Sites Detected", "value": "234"}, {"label": "Deforestation Reduction", "value": "35%"}, {"label": "Area Coverage", "value": "100,000 ha/week"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We can now protect forests that were previously invisible to us.", "zh": "我们现在可以保护以前看不见的森林。"}'::jsonb,
    true,
    true,
    8
  ),

  -- 案例 9: 城市规划
  (
    'urban-planning-uae',
    'urban',
    'UAE',
    '{
      "en": {
        "title": "Smart City Mapping",
        "client": "Dubai Municipality",
        "summary": "Comprehensive 3D mapping and urban development monitoring for smart city initiatives.",
        "challenge": "Rapid urban development required frequent, accurate 3D mapping for planning and progress monitoring.",
        "solution": "Deployed SD-600 VTOL UAVs with PL-300 LiDAR for monthly city-wide mapping, creating detailed 3D models and development progress tracking.",
        "outcome": "Mapping cycle reduced from 6 months to 1 month, planning accuracy improved significantly, and development delays reduced by 40%."
      },
      "zh": {
        "title": "智慧城市测绘",
        "client": "迪拜市政府",
        "summary": "为智慧城市倡议进行综合三维测绘和城市发展监测。",
        "challenge": "快速城市发展需要频繁、精确的三维测绘用于规划和进度监测。",
        "solution": "部署配备PL-300激光雷达的SD-600垂直起降无人机进行每月全市测绘，创建详细的三维模型和开发进度跟踪。",
        "outcome": "测绘周期从6个月缩短至1个月，规划精度显著提高，开发延误减少40%。"
      }
    }'::jsonb,
    '[{"label": "Mapping Cycle", "value": "1 month"}, {"label": "Delay Reduction", "value": "40%"}, {"label": "Model Accuracy", "value": "±3cm"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Our city models are now always up to date.", "zh": "我们的城市模型现在始终保持最新。"}'::jsonb,
    false,
    true,
    9
  ),

  -- 案例 10: 海事巡逻
  (
    'maritime-patrol-japan',
    'defense',
    'Japan',
    '{
      "en": {
        "title": "Coast Guard Patrol Enhancement",
        "client": "Japan Coast Guard",
        "summary": "Extended maritime patrol capabilities with long-endurance UAVs for EEZ monitoring.",
        "challenge": "Japan needed to monitor vast Exclusive Economic Zone with limited patrol vessels and aircraft.",
        "solution": "Deployed SD-900 maritime UAVs from coastal bases, providing extended patrol coverage with real-time video and AIS integration.",
        "outcome": "EEZ patrol coverage increased by 200%, illegal fishing incidents detected increased by 150%, and patrol costs reduced by 65%."
      },
      "zh": {
        "title": "海岸警卫队巡逻增强",
        "client": "日本海岸警卫队",
        "summary": "使用长航时无人机扩展海事巡逻能力，用于专属经济区监测。",
        "challenge": "日本需要以有限的巡逻船只和飞机监测广阔的专属经济区。",
        "solution": "从沿海基地部署SD-900海事无人机，提供扩展巡逻覆盖，具备实时视频和AIS集成。",
        "outcome": "专属经济区巡逻覆盖增加200%，非法捕鱼事件检测增加150%，巡逻成本降低65%。"
      }
    }'::jsonb,
    '[{"label": "Coverage Increase", "value": "200%"}, {"label": "Detection Increase", "value": "150%"}, {"label": "Cost Reduction", "value": "65%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We can now maintain persistent presence across our entire EEZ.", "zh": "我们现在可以在整个专属经济区保持持续存在。"}'::jsonb,
    true,
    true,
    10
  ),

  -- 案例 11-30: 更多案例研究
  (
    'wildfire-monitoring-usa',
    'emergency',
    'USA',
    '{
      "en": {
        "title": "Wildfire Detection and Monitoring",
        "client": "California Fire Department",
        "summary": "Early wildfire detection and real-time fire spread monitoring using thermal imaging UAVs.",
        "challenge": "California needed faster wildfire detection and better situational awareness during fire events.",
        "solution": "Deployed SD-600 VTOL UAVs with PL-100 EO/IR payloads for continuous fire monitoring and early detection patrols.",
        "outcome": "Average detection time reduced from 2 hours to 15 minutes, fire containment speed improved by 35%, and firefighter safety enhanced."
      },
      "zh": {
        "title": "野火检测与监测",
        "client": "加利福尼亚消防局",
        "summary": "使用热成像无人机进行早期野火检测和实时火势蔓延监测。",
        "challenge": "加利福尼亚需要更快的野火检测和火灾事件期间更好的态势感知。",
        "solution": "部署配备PL-100光电/红外载荷的SD-600垂直起降无人机进行连续火灾监测和早期检测巡逻。",
        "outcome": "平均检测时间从2小时缩短至15分钟，火灾遏制速度提高35%，消防员安全得到增强。"
      }
    }'::jsonb,
    '[{"label": "Detection Time", "value": "< 15 min"}, {"label": "Containment Speed", "value": "+35%"}, {"label": "Fires Detected", "value": "127"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Early detection has saved countless acres and lives.", "zh": "早期检测挽救了无数英亩土地和生命。"}'::jsonb,
    false,
    true,
    11
  ),

  (
    'construction-monitoring-uk',
    'construction',
    'UK',
    '{
      "en": {
        "title": "Construction Progress Monitoring",
        "client": "Major UK Construction Firm",
        "summary": "Weekly aerial surveys for construction progress tracking and site management.",
        "challenge": "Large construction sites were difficult to monitor comprehensively, leading to delays and cost overruns.",
        "solution": "Implemented weekly SD-350 UAV surveys generating 3D models, progress reports, and safety compliance checks.",
        "outcome": "Project delays reduced by 28%, safety incidents decreased by 45%, and stakeholder reporting automated."
      },
      "zh": {
        "title": "建设进度监测",
        "client": "英国主要建筑公司",
        "summary": "每周航空测量用于建设进度跟踪和场地管理。",
        "challenge": "大型施工现场难以全面监测，导致延误和成本超支。",
        "solution": "实施每周SD-350无人机测量，生成三维模型、进度报告和安全合规检查。",
        "outcome": "项目延误减少28%，安全事件减少45%，利益相关者报告自动化。"
      }
    }'::jsonb,
    '[{"label": "Delay Reduction", "value": "28%"}, {"label": "Safety Improvement", "value": "45%"}, {"label": "Report Automation", "value": "100%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We have complete visibility of every project now.", "zh": "我们现在对每个项目都有完整的可见性。"}'::jsonb,
    false,
    true,
    12
  ),

  (
    'airport-security-france',
    'security',
    'France',
    '{
      "en": {
        "title": "Airport Counter-UAS Protection",
        "client": "Paris Charles de Gaulle Airport",
        "summary": "Comprehensive counter-UAS system protecting one of Europe\'s busiest airports.",
        "challenge": "Drone incursions were causing flight disruptions and security concerns at major international airport.",
        "solution": "Deployed CUAS-400 integrated system with 360° coverage, automated detection, and graduated response protocols.",
        "outcome": "Zero successful drone incursions since deployment, 156 attempts neutralized, and zero flight disruptions from drone activity."
      },
      "zh": {
        "title": "机场反无人机保护",
        "client": "巴黎戴高乐机场",
        "summary": "综合反无人机系统保护欧洲最繁忙的机场之一。",
        "challenge": "无人机入侵造成航班中断和主要国际机场的安全担忧。",
        "solution": "部署CUAS-400综合系统，具备360°覆盖、自动检测和分级响应协议。",
        "outcome": "部署以来零成功无人机入侵，压制156次尝试，零无人机活动导致的航班中断。"
      }
    }'::jsonb,
    '[{"label": "Incursions Prevented", "value": "156"}, {"label": "Flight Disruptions", "value": "0"}, {"label": "Coverage", "value": "360°"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Our passengers can fly with complete confidence.", "zh": "我们的乘客可以完全放心地飞行。"}'::jsonb,
    true,
    true,
    13
  ),

  (
    'agriculture-spray-newzealand',
    'agriculture',
    'New Zealand',
    '{
      "en": {
        "title": "Precision Crop Spraying",
        "client": "New Zealand Vineyard Consortium",
        "summary": "Targeted aerial spraying using GPS-guided UAVs for vineyard management.",
        "challenge": "Traditional spraying methods were inefficient, with significant chemical waste and inconsistent coverage.",
        "solution": "Deployed SD-500 heavy-lift UAVs with precision spraying systems, using prescription maps for targeted application.",
        "outcome": "Chemical usage reduced by 40%, spray accuracy improved to 95%, and labor costs reduced by 60%."
      },
      "zh": {
        "title": "精准作物喷洒",
        "client": "新西兰葡萄园联盟",
        "summary": "使用GPS制导无人机进行针对性航空喷洒用于葡萄园管理。",
        "challenge": "传统喷洒方法效率低下，化学浪费严重且覆盖不一致。",
        "solution": "部署配备精确喷洒系统的SD-500重载无人机，使用处方图进行针对性施用。",
        "outcome": "化学品使用减少40%，喷洒精度提高至95%，人工成本降低60%。"
      }
    }'::jsonb,
    '[{"label": "Chemical Reduction", "value": "40%"}, {"label": "Accuracy", "value": "95%"}, {"label": "Labor Savings", "value": "60%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Precision spraying has transformed our vineyard operations.", "zh": "精准喷洒改变了我们的葡萄园运营。"}'::jsonb,
    false,
    true,
    14
  ),

  (
    'disaster-response-philippines',
    'emergency',
    'Philippines',
    '{
      "en": {
        "title": "Typhoon Disaster Response",
        "client": "Philippine Disaster Response Agency",
        "summary": "Rapid aerial assessment and supply delivery following major typhoon.",
        "challenge": "Major typhoon left remote areas inaccessible, with urgent need for damage assessment and supply delivery.",
        "solution": "Deployed SD-500 and SD-600 UAVs for rapid damage assessment mapping and emergency supply delivery to isolated communities.",
        "outcome": "Assessment completed in 48 hours vs 2 weeks traditionally, 2,500kg supplies delivered, and 15 communities reached within first 72 hours."
      },
      "zh": {
        "title": "台风灾害响应",
        "client": "菲律宾灾害响应机构",
        "summary": "重大台风后的快速航空评估和物资投送。",
        "challenge": "重大台风使偏远地区无法进入，迫切需要损害评估和物资投送。",
        "solution": "部署SD-500和SD-600无人机进行快速损害评估测绘和向孤立社区投送应急物资。",
        "outcome": "评估在48小时内完成，传统方法需2周，投送2500公斤物资，前72小时到达15个社区。"
      }
    }'::jsonb,
    '[{"label": "Assessment Time", "value": "48 hours"}, {"label": "Supplies Delivered", "value": "2,500kg"}, {"label": "Communities Reached", "value": "15"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "UAVs were critical in our rapid response.", "zh": "无人机在我们的快速响应中至关重要。"}'::jsonb,
    true,
    true,
    15
  ),

  (
    'telecom-inspection-india',
    'telecom',
    'India',
    '{
      "en": {
        "title": "Cell Tower Inspection",
        "client": "Major Indian Telecom Provider",
        "summary": "Automated inspection of 10,000+ cell towers across India.",
        "challenge": "Manual tower inspections were dangerous, expensive, and could not meet required inspection frequency.",
        "solution": "Implemented SD-350 UAVs with PL-100 EO/IR payloads for automated tower inspections, generating detailed condition reports.",
        "outcome": "Inspection capacity increased 5x, costs reduced by 70%, and tower uptime improved by 12% through predictive maintenance."
      },
      "zh": {
        "title": "通信塔巡检",
        "client": "印度主要电信提供商",
        "summary": "对印度10,000多个通信塔进行自动巡检。",
        "challenge": "人工塔架巡检危险、昂贵，且无法达到所需巡检频率。",
        "solution": "实施配备PL-100光电/红外载荷的SD-350无人机进行自动塔架巡检，生成详细状态报告。",
        "outcome": "巡检能力提高5倍，成本降低70%，通过预测性维护塔架正常运行时间提高12%。"
      }
    }'::jsonb,
    '[{"label": "Capacity Increase", "value": "5x"}, {"label": "Cost Reduction", "value": "70%"}, {"label": "Uptime Improvement", "value": "12%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We can now inspect every tower monthly.", "zh": "我们现在可以每月巡检每个塔架。"}'::jsonb,
    false,
    true,
    16
  ),

  (
    'wildlife-tracking-kenya',
    'environmental',
    'Kenya',
    '{
      "en": {
        "title": "Wildlife Population Monitoring",
        "client": "Kenya Wildlife Service",
        "summary": "Aerial wildlife surveys for population monitoring and anti-poaching operations.",
        "challenge": "Traditional aerial surveys were expensive and could not achieve required frequency for effective wildlife management.",
        "solution": "Deployed SD-700 HALE UAVs with EO/IR payloads for regular wildlife censuses and anti-poaching patrols.",
        "outcome": "Survey frequency increased 4x, poaching incidents reduced by 55%, and population tracking accuracy improved significantly."
      },
      "zh": {
        "title": "野生动物种群监测",
        "client": "肯尼亚野生动物服务",
        "summary": "航空野生动物调查用于种群监测和反偷猎行动。",
        "challenge": "传统航空调查昂贵，且无法达到有效野生动物管理所需频率。",
        "solution": "部署配备光电/红外载荷的SD-700高空长航时无人机进行定期野生动物普查和反偷猎巡逻。",
        "outcome": "调查频率提高4倍，偷猎事件减少55%，种群跟踪精度显著提高。"
      }
    }'::jsonb,
    '[{"label": "Survey Frequency", "value": "4x"}, {"label": "Poaching Reduction", "value": "55%"}, {"label": "Coverage", "value": "50,000 km²"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We can now protect our wildlife more effectively.", "zh": "我们现在可以更有效地保护野生动物。"}'::jsonb,
    false,
    true,
    17
  ),

  (
    'oil-rig-inspection-norway',
    'energy',
    'Norway',
    '{
      "en": {
        "title": "Offshore Platform Inspection",
        "client": "Norwegian Oil Company",
        "summary": "Automated inspection of offshore oil platforms using maritime UAVs.",
        "challenge": "Manual inspection of offshore platforms was dangerous, expensive, and required platform shutdown.",
        "solution": "Deployed SD-900 maritime UAVs with PL-100 EO/IR and PL-300 LiDAR payloads for comprehensive platform inspections.",
        "outcome": "Inspection costs reduced by 65%, downtime eliminated for inspections, and safety incidents reduced by 80%."
      },
      "zh": {
        "title": "海上平台巡检",
        "client": "挪威石油公司",
        "summary": "使用海事无人机对海上石油平台进行自动巡检。",
        "challenge": "海上平台人工巡检危险、昂贵，且需要平台停机。",
        "solution": "部署配备PL-100光电/红外和PL-300激光雷达载荷的SD-900海事无人机进行全面平台巡检。",
        "outcome": "巡检成本降低65%，巡检停机消除，安全事件减少80%。"
      }
    }'::jsonb,
    '[{"label": "Cost Reduction", "value": "65%"}, {"label": "Downtime", "value": "0"}, {"label": "Safety Improvement", "value": "80%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We no longer need to shut down for inspections.", "zh": "我们不再需要停机巡检。"}'::jsonb,
    false,
    true,
    18
  ),

  (
    'military-reconnaissance-nato',
    'defense',
    'NATO',
    '{
      "en": {
        "title": "Tactical Reconnaissance Support",
        "client": "NATO Joint Forces",
        "summary": "Tactical reconnaissance support for military operations using advanced UAV systems.",
        "challenge": "Military operations required rapid, persistent ISR capabilities in diverse operational environments.",
        "solution": "Provided SD-200, SD-600, and SD-700 UAV systems with various payloads for tactical reconnaissance and intelligence gathering.",
        "outcome": "Enhanced situational awareness, reduced operational risk, and improved mission success rates by 40%."
      },
      "zh": {
        "title": "战术侦察支援",
        "client": "北约联合部队",
        "summary": "使用先进无人机系统为军事行动提供战术侦察支援。",
        "challenge": "军事行动需要在多样化作战环境中快速、持续的情报、监视和侦察能力。",
        "solution": "提供配备各种载荷的SD-200、SD-600和SD-700无人机系统用于战术侦察和情报收集。",
        "outcome": "增强态势感知，降低作战风险，任务成功率提高40%。"
      }
    }'::jsonb,
    '[{"label": "Mission Success", "value": "+40%"}, {"label": "Risk Reduction", "value": "Significant"}, {"label": "Coverage", "value": "24/7"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "SeekDrone systems are force multipliers.", "zh": "SeekDrone系统是力量倍增器。"}'::jsonb,
    true,
    true,
    19
  ),

  (
    'traffic-monitoring-china',
    'urban',
    'China',
    '{
      "en": {
        "title": "Urban Traffic Monitoring",
        "client": "Major Chinese City Traffic Authority",
        "summary": "Real-time traffic monitoring and incident detection using VTOL UAVs.",
        "challenge": "Urban traffic management needed real-time aerial monitoring for congestion management and incident response.",
        "solution": "Deployed SD-600 VTOL UAVs for continuous traffic monitoring, with AI-powered incident detection and congestion analysis.",
        "outcome": "Incident response time reduced by 60%, congestion reduced by 25%, and traffic flow optimization improved significantly."
      },
      "zh": {
        "title": "城市交通监测",
        "client": "中国主要城市交通管理局",
        "summary": "使用垂直起降无人机进行实时交通监测和事件检测。",
        "challenge": "城市交通管理需要实时空中监测用于拥堵管理和事件响应。",
        "solution": "部署SD-600垂直起降无人机进行连续交通监测，采用AI驱动的事件检测和拥堵分析。",
        "outcome": "事件响应时间减少60%，拥堵减少25%，交通流优化显著改善。"
      }
    }'::jsonb,
    '[{"label": "Response Time", "value": "-60%"}, {"label": "Congestion Reduction", "value": "25%"}, {"label": "Coverage", "value": "24/7"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Real-time aerial monitoring has transformed traffic management.", "zh": "实时空中监测改变了交通管理。"}'::jsonb,
    false,
    true,
    20
  ),

  (
    'solar-farm-inspection-australia',
    'energy',
    'Australia',
    '{
      "en": {
        "title": "Solar Farm Inspection",
        "client": "Australian Solar Farm Operator",
        "summary": "Automated inspection of 500MW solar farm using thermal imaging UAVs.",
        "challenge": "Manual inspection of large solar installations was time-consuming and could not detect faulty panels efficiently.",
        "solution": "Implemented SD-350 UAVs with thermal imaging payloads for automated panel inspection and fault detection.",
        "outcome": "Inspection time reduced by 90%, faulty panel detection improved by 95%, and energy output increased by 8%."
      },
      "zh": {
        "title": "太阳能农场巡检",
        "client": "澳大利亚太阳能农场运营商",
        "summary": "使用热成像无人机对500MW太阳能农场进行自动巡检。",
        "challenge": "大型太阳能装置人工巡检耗时，且无法有效检测故障面板。",
        "solution": "实施配备热成像载荷的SD-350无人机进行自动面板巡检和故障检测。",
        "outcome": "巡检时间减少90%，故障面板检测提高95%，能量输出增加8%。"
      }
    }'::jsonb,
    '[{"label": "Inspection Speed", "value": "+90%"}, {"label": "Fault Detection", "value": "95%"}, {"label": "Energy Output", "value": "+8%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We find faults before they impact output.", "zh": "我们在故障影响输出之前发现它们。"}'::jsonb,
    false,
    true,
    21
  ),

  (
    'event-security-uk',
    'security',
    'UK',
    '{
      "en": {
        "title": "Major Event Security",
        "client": "London Event Security Agency",
        "summary": "Comprehensive aerial security for major public events using counter-UAS and surveillance UAVs.",
        "challenge": "Large public events faced drone threats and needed comprehensive aerial surveillance for crowd safety.",
        "solution": "Deployed CUAS-100 portable systems and SD-200 surveillance UAVs for event security, integrated with ground security teams.",
        "outcome": "Zero security incidents from drones, enhanced crowd monitoring, and improved overall event safety posture."
      },
      "zh": {
        "title": "重大活动安保",
        "client": "伦敦活动安保机构",
        "summary": "使用反无人机和监视无人机为重大公共活动提供综合空中安保。",
        "challenge": "大型公共活动面临无人机威胁，需要全面空中监视保障人群安全。",
        "solution": "部署CUAS-100便携系统和SD-200监视无人机用于活动安保，与地面安保团队集成。",
        "outcome": "零无人机安全事件，增强人群监测，改善整体活动安全态势。"
      }
    }'::jsonb,
    '[{"label": "Drone Incidents", "value": "0"}, {"label": "Events Secured", "value": "25+"}, {"label": "Coverage", "value": "Complete"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Our events are now drone-free zones.", "zh": "我们的活动现在是无无人机区域。"}'::jsonb,
    false,
    true,
    22
  ),

  (
    'glacier-monitoring-greenland',
    'environmental',
    'Greenland',
    '{
      "en": {
        "title": "Glacier Change Monitoring",
        "client": "Climate Research Institute",
        "summary": "Long-term glacier monitoring using LiDAR and multispectral imaging.",
        "challenge": "Climate researchers needed accurate, frequent measurements of glacier changes in inaccessible areas.",
        "solution": "Deployed SD-700 HALE UAVs with PL-300 LiDAR for monthly glacier surveys, tracking mass balance and flow rates.",
        "outcome": "Measurement frequency increased 12x, accuracy improved to ±5cm, and climate models significantly enhanced."
      },
      "zh": {
        "title": "冰川变化监测",
        "client": "气候研究所",
        "summary": "使用激光雷达和多光谱成像进行长期冰川监测。",
        "challenge": "气候研究人员需要对无法进入区域的冰川变化进行精确、频繁的测量。",
        "solution": "部署配备PL-300激光雷达的SD-700高空长航时无人机进行每月冰川调查，跟踪物质平衡和流速。",
        "outcome": "测量频率提高12倍，精度提高至±5厘米，气候模型显著增强。"
      }
    }'::jsonb,
    '[{"label": "Frequency Increase", "value": "12x"}, {"label": "Accuracy", "value": "±5cm"}, {"label": "Data Quality", "value": "Exceptional"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "This data is critical for climate science.", "zh": "这些数据对气候科学至关重要。"}'::jsonb,
    false,
    true,
    23
  ),

  (
    'warehouse-inventory-usa',
    'logistics',
    'USA',
    '{
      "en": {
        "title": "Warehouse Inventory Management",
        "client": "Major US Retailer",
        "summary": "Automated warehouse inventory scanning using indoor-capable UAVs.",
        "challenge": "Manual inventory counting was time-consuming, error-prone, and disrupted warehouse operations.",
        "solution": "Implemented indoor-capable UAVs with barcode scanning and computer vision for automated inventory counting.",
        "outcome": "Inventory accuracy improved to 99.8%, counting time reduced by 85%, and operational disruption minimized."
      },
      "zh": {
        "title": "仓库库存管理",
        "client": "美国主要零售商",
        "summary": "使用室内无人机进行自动仓库库存扫描。",
        "challenge": "人工库存盘点耗时、易错，且干扰仓库运营。",
        "solution": "实施具备条码扫描和计算机视觉的室内无人机进行自动库存盘点。",
        "outcome": "库存精度提高至99.8%，盘点时间减少85%，运营干扰最小化。"
      }
    }'::jsonb,
    '[{"label": "Accuracy", "value": "99.8%"}, {"label": "Time Reduction", "value": "85%"}, {"label": "Disruption", "value": "Minimal"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Inventory management is now fully automated.", "zh": "库存管理现在完全自动化。"}'::jsonb,
    false,
    true,
    24
  ),

  (
    'archaeological-survey-egypt',
    'research',
    'Egypt',
    '{
      "en": {
        "title": "Archaeological Site Survey",
        "client": "Egyptian Antiquities Authority",
        "summary": "Non-invasive archaeological surveys using LiDAR and multispectral imaging.",
        "challenge": "Archaeological sites needed detailed mapping without ground disturbance that could damage artifacts.",
        "solution": "Deployed SD-350 UAVs with PL-300 LiDAR and PL-200 multispectral payloads for high-resolution site mapping.",
        "outcome": "Discovered 3 previously unknown structures, site mapping completed in days vs months, and preservation enhanced."
      },
      "zh": {
        "title": "考古遗址调查",
        "client": "埃及文物局",
        "summary": "使用激光雷达和多光谱成像进行非侵入式考古调查。",
        "challenge": "考古遗址需要详细测绘，且不能进行可能损坏文物的地面扰动。",
        "solution": "部署配备PL-300激光雷达和PL-200多光谱载荷的SD-350无人机进行高分辨率遗址测绘。",
        "outcome": "发现3个先前未知的结构，遗址测绘在数天内完成而非数月，保护得到增强。"
      }
    }'::jsonb,
    '[{"label": "Discoveries", "value": "3"}, {"label": "Time Reduction", "value": "90%"}, {"label": "Preservation", "value": "Enhanced"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We discovered history without disturbing it.", "zh": "我们在不扰动历史的情况下发现了历史。"}'::jsonb,
    false,
    true,
    25
  ),

  (
    'corridor-mapping-india',
    'infrastructure',
    'India',
    '{
      "en": {
        "title": "Infrastructure Corridor Mapping",
        "client": "Indian Infrastructure Development Agency",
        "summary": "Large-scale corridor mapping for highway and railway development projects.",
        "challenge": "Infrastructure development required accurate corridor mapping across thousands of kilometers.",
        "solution": "Deployed SD-600 VTOL UAVs with PL-300 LiDAR for rapid corridor mapping, generating detailed topographic models.",
        "outcome": "Mapping speed increased 10x, accuracy improved to ±3cm, and project planning time reduced by 60%."
      },
      "zh": {
        "title": "基础设施走廊测绘",
        "client": "印度基础设施开发机构",
        "summary": "为公路和铁路开发项目进行大规模走廊测绘。",
        "challenge": "基础设施开发需要跨越数千公里的精确走廊测绘。",
        "solution": "部署配备PL-300激光雷达的SD-600垂直起降无人机进行快速走廊测绘，生成详细地形模型。",
        "outcome": "测绘速度提高10倍，精度提高至±3厘米，项目规划时间减少60%。"
      }
    }'::jsonb,
    '[{"label": "Speed Increase", "value": "10x"}, {"label": "Accuracy", "value": "±3cm"}, {"label": "Planning Time", "value": "-60%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We can now plan projects in weeks instead of months.", "zh": "我们现在可以在数周而非数月内规划项目。"}'::jsonb,
    false,
    true,
    26
  ),

  (
    'flood-monitoring-bangladesh',
    'emergency',
    'Bangladesh',
    '{
      "en": {
        "title": "Flood Monitoring and Warning",
        "client": "Bangladesh Disaster Management Agency",
        "summary": "Real-time flood monitoring and early warning using long-endurance UAVs.",
        "challenge": "Bangladesh needed faster flood detection and real-time monitoring for effective evacuation warnings.",
        "solution": "Implemented SD-700 HALE UAVs with EO/IR payloads for continuous flood monitoring and water level tracking.",
        "outcome": "Warning lead time increased by 12 hours, evacuation efficiency improved by 45%, and flood damage reduced significantly."
      },
      "zh": {
        "title": "洪水监测与预警",
        "client": "孟加拉国灾害管理机构",
        "summary": "使用长航时无人机进行实时洪水监测和早期预警。",
        "challenge": "孟加拉国需要更快的洪水检测和实时监测以进行有效疏散预警。",
        "solution": "实施配备光电/红外载荷的SD-700高空长航时无人机进行连续洪水监测和水位跟踪。",
        "outcome": "预警提前时间增加12小时，疏散效率提高45%，洪水损害显著减少。"
      }
    }'::jsonb,
    '[{"label": "Warning Time", "value": "+12 hours"}, {"label": "Evacuation Efficiency", "value": "+45%"}, {"label": "Lives Saved", "value": "Significant"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Early warnings have saved countless lives.", "zh": "早期预警挽救了无数生命。"}'::jsonb,
    false,
    true,
    27
  ),

  (
    'precision-planting-netherlands',
    'agriculture',
    'Netherlands',
    '{
      "en": {
        "title": "Precision Planting Optimization",
        "client": "Dutch Flower Growers Association",
        "summary": "Precision planting guidance and monitoring for greenhouse flower production.",
        "challenge": "Greenhouse flower production needed precise planting patterns and continuous health monitoring.",
        "solution": "Deployed SD-350 UAVs with multispectral payloads for planting guidance and weekly health monitoring.",
        "outcome": "Planting efficiency improved by 30%, flower quality increased by 22%, and resource usage optimized by 35%."
      },
      "zh": {
        "title": "精准种植优化",
        "client": "荷兰花卉种植者协会",
        "summary": "为温室花卉生产提供精准种植指导和监测。",
        "challenge": "温室花卉生产需要精确的种植模式和连续健康监测。",
        "solution": "部署配备多光谱载荷的SD-350无人机进行种植指导和每周健康监测。",
        "outcome": "种植效率提高30%，花卉质量提高22%，资源使用优化35%。"
      }
    }'::jsonb,
    '[{"label": "Planting Efficiency", "value": "+30%"}, {"label": "Quality Improvement", "value": "+22%"}, {"label": "Resource Optimization", "value": "35%"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "Our flowers are now consistently premium quality.", "zh": "我们的花卉现在始终保持优质品质。"}'::jsonb,
    false,
    true,
    28
  ),

  (
    'anti-poaching-southafrica',
    'security',
    'South Africa',
    '{
      "en": {
        "title": "Anti-Poaching Operations",
        "client": "South African National Parks",
        "summary": "Night-time anti-poaching patrols using thermal imaging UAVs.",
        "challenge": "Rhino poaching was devastating wildlife populations, with most poaching occurring at night.",
        "solution": "Deployed SD-200 UAVs with PL-100 EO/IR payloads for night-time patrols, with AI-powered intruder detection.",
        "outcome": "Poaching incidents reduced by 78%, ranger safety improved, and rhino population began recovering."
      },
      "zh": {
        "title": "反偷猎行动",
        "client": "南非国家公园",
        "summary": "使用热成像无人机进行夜间反偷猎巡逻。",
        "challenge": "犀牛偷猎正在摧毁野生动物种群，大多数偷猎发生在夜间。",
        "solution": "部署配备PL-100光电/红外载荷的SD-200无人机进行夜间巡逻，采用AI驱动的入侵者检测。",
        "outcome": "偷猎事件减少78%，护林员安全改善，犀牛种群开始恢复。"
      }
    }'::jsonb,
    '[{"label": "Poaching Reduction", "value": "78%"}, {"label": "Ranger Safety", "value": "Improved"}, {"label": "Population Recovery", "value": "Underway"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We are finally winning the fight against poaching.", "zh": "我们终于在与偷猎的斗争中取得胜利。"}'::jsonb,
    true,
    true,
    29
  ),

  (
    'wind-turbine-inspection-denmark',
    'energy',
    'Denmark',
    '{
      "en": {
        "title": "Wind Turbine Blade Inspection",
        "client": "Danish Wind Energy Company",
        "summary": "Automated inspection of offshore wind turbine blades using specialized UAVs.",
        "challenge": "Manual blade inspection required rope access technicians, was dangerous, and caused turbine downtime.",
        "solution": "Deployed SD-900 maritime UAVs with high-resolution cameras for automated blade inspection and defect detection.",
        "outcome": "Inspection costs reduced by 75%, downtime eliminated, and blade failure prediction enabled proactive maintenance."
      },
      "zh": {
        "title": "风力涡轮机叶片巡检",
        "client": "丹麦风能公司",
        "summary": "使用专用无人机对海上风力涡轮机叶片进行自动巡检。",
        "challenge": "人工叶片巡检需要绳索技术人员，危险且导致涡轮机停机。",
        "solution": "部署配备高分辨率相机的SD-900海事无人机进行自动叶片巡检和缺陷检测。",
        "outcome": "巡检成本降低75%，停机消除，叶片故障预测实现主动维护。"
      }
    }'::jsonb,
    '[{"label": "Cost Reduction", "value": "75%"}, {"label": "Downtime", "value": "0"}, {"label": "Failure Prediction", "value": "Enabled"}]'::jsonb,
    '{}',
    NULL,
    '{"en": "We can now inspect all turbines monthly.", "zh": "我们现在可以每月巡检所有涡轮机。"}'::jsonb,
    false,
    true,
    30
  );

-- 为案例研究添加产品关联
INSERT INTO product_relations (product_id, related_id, relation_type, sort_order)
SELECT
  p.id,
  cs.id,
  'case_study',
  1
FROM products p
CROSS JOIN case_studies cs
WHERE
  (p.model = 'SD-200' AND cs.slug IN ('border-surveillance-australia', 'search-rescue-norway', 'anti-poaching-southafrica')) OR
  (p.model = 'SD-350' AND cs.slug IN ('pipeline-inspection-canada', 'precision-agriculture-brazil', 'infrastructure-inspection-germany')) OR
  (p.model = 'SD-600' AND cs.slug IN ('port-security-singapore', 'urban-planning-uae', 'wildfire-monitoring-usa')) OR
  (p.model = 'SD-700' AND cs.slug IN ('environmental-monitoring-indonesia', 'wildlife-tracking-kenya', 'glacier-monitoring-greenland')) OR
  (p.model = 'SD-900' AND cs.slug IN ('maritime-patrol-japan', 'oil-rig-inspection-norway', 'wind-turbine-inspection-denmark')) OR
  (p.model = 'PL-100' AND cs.slug IN ('search-rescue-norway', 'wildfire-monitoring-usa', 'anti-poaching-southafrica')) OR
  (p.model = 'PL-300' AND cs.slug IN ('pipeline-inspection-canada', 'mining-survey-chile', 'urban-planning-uae')) OR
  (p.model = 'CUAS-200' AND cs.slug IN ('port-security-singapore', 'airport-security-france')) OR
  (p.model = 'CUAS-400' AND cs.slug = 'airport-security-france');
