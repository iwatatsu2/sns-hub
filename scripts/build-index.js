const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'data', 'generated');
const files = fs.readdirSync(dir);
const index = {};

for (const f of files) {
  const m = f.match(/^(topic-\d+)-(note|reel|slides)\.json$/);
  if (!m) continue;
  const [, id, type] = m;
  if (!index[id]) index[id] = { note: null, reel: null, slides: null };
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  index[id][type] = data;
}

const outPath = path.join(__dirname, '..', 'data', 'generated-index.json');
fs.writeFileSync(outPath, JSON.stringify(index, null, 2));
console.log('Generated index with topics:', Object.keys(index).join(', '));
console.log('Size:', (fs.statSync(outPath).size / 1024).toFixed(0) + 'KB');
