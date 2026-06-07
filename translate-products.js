const fs = require('fs');
const path = require('path');
const https = require('https');

// 读取JSON文件
const filePath = path.join(__dirname, 'docs', 'products_th.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 分段翻译函数
async function translateChunk(text) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'translate.googleapis.com',
      path: '/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=' + encodeURIComponent(text),
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result && result[0] && result[0][0] && result[0][0][0]) {
            resolve(result[0][0][0]);
          } else {
            resolve(text);
          }
        } catch (error) {
          resolve(text);
        }
      });
    });

    req.on('error', () => resolve(text));
    req.on('timeout', () => {
      req.destroy();
      resolve(text);
    });

    req.end();
  });
}

// 智能分段翻译（将长文本分成多个部分）
async function translateToThai(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  // 如果文本较短，直接翻译
  if (text.length < 500) {
    return await translateChunk(text);
  }

  // 如果文本较长，分段翻译
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length < 500) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk);

  // 翻译每个分段
  const translatedChunks = [];
  for (const chunk of chunks) {
    const translated = await translateChunk(chunk);
    translatedChunks.push(translated);
    await delay(800);
  }

  return translatedChunks.join(' ');
}

// 主处理函数
async function processProducts() {
  console.log(`Total products to process: ${data.length}\n`);

  for (let i = 0; i < data.length; i++) {
    const product = data[i];
    console.log(`[${i + 1}/${data.length}] Processing: ${product.name}`);

    try {
      // 翻译 description
      if (product.description && product.description.trim()) {
        console.log('  → Translating description...');
        product.description = await translateToThai(product.description);
        await delay(500);
      }

      // 翻译 advantages
      if (product.advantages && product.advantages.trim()) {
        console.log('  → Translating advantages...');
        product.advantages = await translateToThai(product.advantages);
        await delay(500);
      }

      // 翻译 capabilities
      if (product.capabilities && product.capabilities.trim()) {
        console.log('  → Translating capabilities...');
        product.capabilities = await translateToThai(product.capabilities);
        await delay(500);
      }

      // 翻译 applications
      if (product.applications && product.applications.trim()) {
        console.log('  → Translating applications...');
        product.applications = await translateToThai(product.applications);
        await delay(500);
      }

      // 翻译 specs 的值
      if (product.specs) {
        console.log('  → Translating specs...');
        const keys = Object.keys(product.specs);
        for (const key of keys) {
          if (product.specs[key] && product.specs[key].trim()) {
            product.specs[key] = await translateToThai(product.specs[key]);
            await delay(300);
          }
        }
      }

      console.log('  ✓ Completed\n');

      // 每处理2个产品保存一次
      if ((i + 1) % 2 === 0) {
        console.log(`💾 Saving progress (${i + 1}/${data.length})...\n`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
  }

  // 最终保存
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('\n✅ Translation completed and saved!');
}

// 运行
processProducts().catch(console.error);
