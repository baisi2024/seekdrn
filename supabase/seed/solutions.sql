-- seed/solutions.sql
-- Industry solutions

INSERT INTO solutions (slug, icon, translations, metrics, published, sort_order) VALUES
  (
    'public-safety',
    'Shield',
    '{
      "en": {
        "title": "Public Safety & Law Enforcement",
        "challenge": "Law enforcement and emergency responders need real-time aerial intelligence in dynamic, high-pressure situations where every second counts. Traditional surveillance methods are slow, limited in coverage, and put personnel at risk.",
        "solution": "SeekDrone platforms provide rapid-deployment aerial surveillance with real-time video streaming, thermal imaging for low-light operations, and AI-powered analytics for crowd monitoring and suspect tracking. Our systems integrate seamlessly with existing command-and-control infrastructure.",
        "workflow": "<ol><li>Deploy drone to incident scene within minutes</li><li>Stream real-time aerial footage to command center</li><li>Use thermal imaging to locate suspects or missing persons</li><li>Analyze crowd patterns and identify threats</li><li>Provide continuous coverage throughout operation</li></ol>"
      }
    }'::jsonb,
    '[{"label": "Response Time", "value": "< 5 min"}, {"label": "Operational Range", "value": "15 km"}, {"label": "Flight Endurance", "value": "90 min"}, {"label": "Agencies Served", "value": "50+"}]'::jsonb,
    true,
    1
  ),
  (
    'energy',
    'Zap',
    '{
      "en": {
        "title": "Energy & Infrastructure",
        "challenge": "Energy infrastructure spans vast, often remote areas where manual inspection is dangerous, time-consuming, and expensive. Undetected faults can lead to catastrophic failures, environmental damage, and costly downtime.",
        "solution": "SeekDrone platforms automate infrastructure inspection with high-resolution imaging, LiDAR mapping, and thermal anomaly detection. Our drones cover pipelines, power lines, wind turbines, and solar farms with precision and efficiency impossible to achieve manually.",
        "workflow": "<ol><li>Plan automated inspection flight path</li><li>Capture high-resolution visual and thermal data</li><li>Detect anomalies with AI-powered analysis</li><li>Generate detailed inspection reports</li><li>Flag critical issues for immediate maintenance</li></ol>"
      }
    }'::jsonb,
    '[{"label": "Inspection Speed", "value": "10x faster"}, {"label": "Cost Reduction", "value": "60%"}, {"label": "Detection Accuracy", "value": "99.2%"}, {"label": "Zero Downtime", "value": "Inspections"}]'::jsonb,
    true,
    2
  ),
  (
    'surveying',
    'Map',
    '{
      "en": {
        "title": "Surveying & Mapping",
        "challenge": "Traditional surveying methods require extensive field time, large crews, and are limited by terrain accessibility. Delivering accurate topographic data for construction, mining, and land management projects demands a faster, safer approach.",
        "solution": "SeekDrone surveying platforms combine RTK positioning, photogrammetry, and LiDAR to produce centimeter-accurate 3D models, orthomosaics, and topographic maps in a fraction of the time required by conventional methods.",
        "workflow": "<ol><li>Define survey area and flight parameters</li><li>Execute automated mapping mission with RTK precision</li><li>Process aerial data into 3D point clouds and orthomosaics</li><li>Generate topographic models and volume calculations</li><li>Deliver GIS-ready outputs to stakeholders</li></ol>"
      }
    }'::jsonb,
    '[{"label": "Accuracy", "value": "±2 cm"}, {"label": "Area Coverage", "value": "200 ha/flight"}, {"label": "Time Savings", "value": "80%"}, {"label": "Data Products", "value": "3D/Ortho/DSM"}]'::jsonb,
    true,
    3
  ),
  (
    'environmental',
    'Leaf',
    '{
      "en": {
        "title": "Environmental Monitoring",
        "challenge": "Environmental agencies and conservation organizations struggle to monitor large ecosystems, detect pollution events, and track wildlife populations across vast and often inaccessible terrain. Ground-based methods are insufficient for comprehensive environmental oversight.",
        "solution": "SeekDrone platforms equipped with multispectral sensors, gas detectors, and AI-powered wildlife recognition enable continuous environmental monitoring. From deforestation tracking to water quality assessment, our systems deliver actionable ecological intelligence.",
        "workflow": "<ol><li>Deploy sensors for target environmental indicators</li><li>Conduct systematic aerial surveys of ecosystem</li><li>Collect multispectral and gas emission data</li><li>Analyze data for environmental changes and anomalies</li><li>Generate compliance reports and trend analyses</li></ol>"
      }
    }'::jsonb,
    '[{"label": "Coverage Area", "value": "500+ ha/day"}, {"label": "Sensor Types", "value": "6+ modalities"}, {"label": "Change Detection", "value": "Real-time"}, {"label": "Report Generation", "value": "Automated"}]'::jsonb,
    true,
    4
  ),
  (
    'counter-uas',
    'Radar',
    '{
      "en": {
        "title": "Counter-UAS Defense",
        "challenge": "The proliferation of commercial drones poses escalating threats to military bases, airports, critical infrastructure, and public events. Detecting, classifying, and neutralizing unauthorized UAVs requires sophisticated multi-layered defense systems operating in real time.",
        "solution": "SeekDrone Counter-UAS solutions provide integrated detection-to-neutralization capabilities using radar, RF sensing, electro-optical tracking, and configurable countermeasures. Our systems deliver 360-degree protection with automated threat assessment and graduated response protocols.",
        "workflow": "<ol><li>Detect unauthorized UAV via multi-sensor fusion</li><li>Classify threat type and intent using AI analysis</li><li>Track target with electro-optical and RF systems</li><li>Initiate graduated response per rules of engagement</li><li>Log incident data for forensic analysis and reporting</li></ol>"
      }
    }'::jsonb,
    '[{"label": "Detection Range", "value": "20 km"}, {"label": "Response Time", "value": "< 3 sec"}, {"label": "Threat Types", "value": "All commercial UAVs"}, {"label": "System Uptime", "value": "99.9%"}]'::jsonb,
    true,
    5
  );
