const fs = require('fs');

// 读取英文数据
const enData = JSON.parse(fs.readFileSync('products_en.json', 'utf8'));

// 创建泰语翻译
const thData = enData.map(product => {
  // 基础翻译映射
  const translateField = (text) => {
    if (!text) return text;
    
    // 专业术语翻译
    return text
      .replace(/Write a Review/g, 'เขียนรีวิว')
      .replace(/Product Overview/g, 'ภาพรวมผลิตภัณฑ์')
      .replace(/Core Advantages/g, 'ข้อดีหลัก')
      .replace(/Core Security Capabilities/g, 'ความสามารถความมั่นคงหลัก')
      .replace(/Core Logistics Capabilities/g, 'ความสามารถโลจิสติกส์หลัก')
      .replace(/Authorized Application Scenarios/g, 'สถานการณ์การใช้งานที่ได้รับอนุญาต')
      .replace(/UAV/g, 'อากาศยานไร้คนขับ')
      .replace(/payload/g, 'น้ำหนักบรรทุก')
      .replace(/endurance/g, 'ระยะเวลาบิน')
      .replace(/range/g, 'ระยะทาง')
      .replace(/ceiling/g, 'ระดับสูงสุด')
      .replace(/wind resistance/g, 'ความทนทานต่อลม')
      .replace(/reconnaissance/g, 'การลาดตระเวน')
      .replace(/situational awareness/g, 'การรับรู้สถานการณ์')
      .replace(/logistics/g, 'โลจิสติกส์')
      .replace(/ground station/g, 'สถานีภาคพื้นดิน')
      .replace(/data link/g, 'ลิงก์ข้อมูล')
      .replace(/VTOL/g, 'การบินขึ้นลงแนวตั้ง')
      .replace(/legitimate defense/g, 'การป้องกันที่ชอบด้วยกฎหมาย')
      .replace(/border security/g, 'ความมั่นคงชายแดน')
      .replace(/humanitarian relief/g, 'การช่วยเหลือด้านมนุษยธรรม');
  };

  // 翻译specs对象的键
  const translateSpecsKeys = (specs) => {
    const keyMap = {
      'Weight': 'น้ำหนัก',
      'Dimensions': 'ขนาด',
      'Maximum Take-Off Weight': 'น้ำหนักบินขึ้นสูงสุด',
      'Take-Off Method': 'วิธีบินขึ้น',
      'Recovery Method': 'วิธีร่มชู',
      'Maximum Endurance': 'ระยะเวลาบินสูงสุด',
      'Maximum Range': 'ระยะทางสูงสุด',
      'Maximum Control Distance': 'ระยะควบคุมสูงสุด',
      'Cruise Speed': 'ความเร็วเดินทาง',
      'Maximum Speed': 'ความเร็วสูงสุด',
      'Cruise Altitude': 'ระดับบินปกติ',
      'Maximum Ceiling': 'ระดับสูงสุด',
      'Wind Resistance': 'ระดับความทนทานต่อลม',
      'Communication System': 'ระบบสื่อสาร',
      'Control Method': 'วิธีควบคุม',
      'Payload Capacity': 'ความจุน้ำหนักบรรทุก',
      'Payload Mounting Points': 'จุดติดตั้งน้ำหนักบรรทุก',
      'Propulsion System': 'ระบบขับเคลื่อน',
      'Other Features': 'คุณสมบัติอื่นๆ',
      'Net Weight': 'น้ำหนักสุทธิ',
      'Dimensions (L×W×H)': 'ขนาด (ยาว×กว้าง×สูง)',
      'Maximum Payload': 'น้ำหนักบรรทุกสูงสุด',
      'Reconnaissance Equipment': 'อุปกรณ์การลาดตระเวน',
      'Self-protection Function': 'ฟังก์ชันป้องกันตัวเอง',
      'Take-Off Requirements': 'ข้อกำหนดการบินขึ้น',
      'Multi-UAV Coordination': 'การประสานงานหลายอากาศยาน',
      'Return Function': 'ฟังก์ชันกลับฐาน',
      'Payload Hardpoints': 'จุดติดตั้งน้ำหนักบรรทุก',
      'Swarm Coordination Capability': 'ความสามารถประสานงานแบบฝูง',
      'Maximum Coverage': 'ระยะครอบคลุมสูงสุด',
      'Cruising Speed': 'ความเร็วเดินทาง',
      'Cruising Altitude': 'ระดับบินปกติ',
      'Payload Type': 'ประเภทน้ำหนักบรรทุก',
      'Security Function': 'ฟังก์ชันความปลอดภัย',
      'Key Feature': 'คุณสมบัติหลัก',
      'Key Features': 'คุณสมบัติหลัก',
      'Electromagnetic Equipment': 'อุปกรณ์แม่เหล็กไฟฟ้า',
      'Navigation System': 'ระบบนำทาง',
      'Anti-jamming Capability': 'ความสามารถต้านการรบกวน',
      'Self-security Function': 'ฟังก์ชันความปลอดภัยตัวเอง',
      'Deployment Design': 'การออกแบบการปรับใช้',
      'Deployment Type': 'ประเภทการปรับใช้',
      'Safety Function': 'ฟังก์ชันความปลอดภัย',
      'Single Hardpoint Payload': 'น้ำหนักบรรทุกจุดเดียว',
      'Payload Capacity per Hardpoint': 'ความจุน้ำหนักบรรทุกต่อจุด',
      'Navigation & Communication': 'นำทางและสื่อสาร',
      'Single-Mission Deployment Design': 'การออกแบบปรับใช้ภารกิจเดียว',
      'Maximum Image Transmission Range': 'ระยะส่งภาพสูงสุด',
      'Movement Speed': 'ความเร็วการเคลื่อนที่',
      'Power Type': 'ประเภทพลังงาน',
      'Suspension System': 'ระบบสuspension',
      'Frame Dimensions': 'ขนาดกรอบ',
      'Maximum Load Capacity': 'ความจุโหลดสูงสุด',
      'Positioning Method': 'วิธีการระบุตำแหน่ง',
      'Driving Speed': 'ความเร็วขับ',
      'Climbing Angle': 'มุมปีน',
      'Power Output': 'กำลังขับออก',
      'Operating Temperature Range': 'ช่วงอุณหภูมิใช้งาน',
      'Continuous Endurance': 'ระยะเวลาบินต่อเนื่อง',
      'Core Maneuverability': 'ความคล่องตัวหลัก',
      'Minimum Take-Off Taxi Distance': 'ระยะทางแท็กซี่บินขึ้นขั้นต่ำ',
      'Logistics & Support Delivery': 'การส่งมอบโลจิสติกส์และสนับสนุน',
      'Recovery/Safety Function': 'ฟังก์ชันร่มชู/ความปลอดภัย',
      'Multi-UAV Collaboration': 'การประสานงานหลายอากาศยาน'
    };
    
    const translatedSpecs = {};
    for (const [key, value] of Object.entries(specs)) {
      const translatedKey = keyMap[key] || key;
      translatedSpecs[translatedKey] = value;
    }
    return translatedSpecs;
  };

  return {
    name: product.name,
    category: product.category,
    slug: product.slug,
    url: product.url,
    fullTitle: translateField(product.fullTitle),
    description: translateField(product.description),
    advantages: translateField(product.advantages),
    capabilities: translateField(product.capabilities),
    applications: translateField(product.applications),
    specs: translateSpecsKeys(product.specs),
    specCount: product.specCount,
    hasChinese: false
  };
});

// 写入文件
fs.writeFileSync('products_th.json', JSON.stringify(thData, null, 2), 'utf8');
console.log('泰语翻译文件已生成: products_th.json');
console.log('产品数量:', thData.length);
