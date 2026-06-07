const fs = require('fs');
const path = require('path');
const https = require('https');

// 读取文件
const sourcePath = path.join(__dirname, 'docs', 'products_en.json');
const targetPath = path.join(__dirname, 'docs', 'products_th.json');
const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 使用MyMemory API进行翻译
async function translateToThai(text, retries = 3) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  // 如果文本太长，分段翻译
  if (text.length > 500) {
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

    const translatedChunks = [];
    for (const chunk of chunks) {
      const translated = await translateToThai(chunk, retries);
      translatedChunks.push(translated);
      await delay(1000);
    }

    return translatedChunks.join(' ');
  }

  for (let i = 0; i < retries; i++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.mymemory.translated.net',
          path: '/get?q=' + encodeURIComponent(text) + '&langpair=en|th',
          method: 'GET',
          timeout: 15000
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed && parsed.responseData && parsed.responseData.translatedText) {
                resolve(parsed.responseData.translatedText);
              } else {
                resolve(text);
              }
            } catch (error) {
              resolve(text);
            }
          });
        });

        req.on('error', (error) => reject(error));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
        req.end();
      });

      return result;
    } catch (error) {
      console.error(`  ⚠️  Retry ${i + 1}/${retries}: ${error.message}`);
      if (i < retries - 1) {
        await delay(2000 * (i + 1));
      }
    }
  }

  return text;
}

// 主处理函数
async function processProducts() {
  console.log(`Total products: ${sourceData.length}\n`);

  const targetData = [];

  for (let i = 0; i < sourceData.length; i++) {
    const product = sourceData[i];
    console.log(`[${i + 1}/${sourceData.length}] ${product.name}`);

    const translatedProduct = { ...product };

    try {
      // 翻译 description
      if (product.description) {
        console.log('  → description');
        translatedProduct.description = await translateToThai(product.description);
        await delay(1000);
      }

      // 翻译 advantages
      if (product.advantages) {
        console.log('  → advantages');
        translatedProduct.advantages = await translateToThai(product.advantages);
        await delay(1000);
      }

      // 翻译 capabilities
      if (product.capabilities) {
        console.log('  → capabilities');
        translatedProduct.capabilities = await translateToThai(product.capabilities);
        await delay(1000);
      }

      // 翻译 applications
      if (product.applications) {
        console.log('  → applications');
        translatedProduct.applications = await translateToThai(product.applications);
        await delay(1000);
      }

      // 翻译 specs 的值
      if (product.specs) {
        console.log('  → specs');
        translatedProduct.specs = {};
        const keys = Object.keys(product.specs);
        for (const key of keys) {
          translatedProduct.specs[key] = await translateToThai(product.specs[key]);
          await delay(500);
        }
      }

      console.log('  ✓ Done\n');
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }

    targetData.push(translatedProduct);

    // 每2个产品保存一次
    if ((i + 1) % 2 === 0) {
      console.log(`💾 Saving (${i + 1}/${sourceData.length})...\n`);
      fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
    }
  }

  // 最终保存
  fs.writeFileSync(targetPath, JSON.stringify(targetData, null, 2), 'utf8');
  console.log('\n✅ Completed!');
}

// 运行
processProducts().catch(console.error);
