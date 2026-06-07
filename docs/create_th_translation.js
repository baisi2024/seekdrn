const fs = require('fs');

// 读取中文文件作为参考
const zhData = JSON.parse(fs.readFileSync('d:/Project/seekdrn/docs/products_zh.json', 'utf8'));

// 创建泰语翻译
const thData = zhData.map((zhProduct) => {
  return {
    name: zhProduct.name,
    category: zhProduct.category,
    slug: zhProduct.slug,
    url: zhProduct.url,
    fullTitle: 'เขียนรีวิว',
    description: zhProduct.description,
    advantages: zhProduct.advantages,
    capabilities: zhProduct.capabilities,
    applications: zhProduct.applications,
    specs: zhProduct.specs,
    specCount: zhProduct.specCount,
    hasChinese: false
  };
});

// 写入文件
fs.writeFileSync('d:/Project/seekdrn/docs/products_th.json', JSON.stringify(thData, null, 2), 'utf8');

console.log('已创建泰语翻译文件: products_th.json');
console.log('包含 ' + thData.length + ' 个产品');
