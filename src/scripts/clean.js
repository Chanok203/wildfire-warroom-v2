const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../../dist');
if (!fs.existsSync(distPath)) process.exit(0);

for (const item of fs.readdirSync(distPath)) {
  if (item === 'media') continue;
  fs.rmSync(path.join(distPath, item), { recursive: true, force: true });
}
console.log('Cleaned dist/ (kept dist/media)');